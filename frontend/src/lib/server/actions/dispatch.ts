import {
  ACTION_REGISTRY,
  deviceChannel,
  parseAction,
  REALTIME_EVENTS,
  type ActionRequestMessage,
  type JarvisAction,
} from '@jarvis/shared';
import { createServiceClient } from '@/lib/supabase/server';

export interface DispatchResult {
  ok: boolean;
  requestId?: string;
  error?: string;
}

/**
 * Validates and dispatches a device action:
 *  1. Re-validate against the shared whitelist (never trust the caller).
 *  2. Check the user's global kill switch (settings.actions_enabled).
 *  3. Persist a pending activity log (audit trail).
 *  4. Broadcast to the device's realtime channel.
 *
 * The agent re-validates independently, so a compromised server route
 * still cannot make it run non-whitelisted actions.
 */
export async function dispatchAction(params: {
  userId: string;
  deviceId: string;
  action: unknown;
}): Promise<DispatchResult> {
  const action = parseAction(params.action);
  if (!action) {
    return { ok: false, error: 'Action rejected: not in whitelist or invalid payload' };
  }

  const supabase = createServiceClient();

  const { data: settings } = await supabase
    .from('settings')
    .select('actions_enabled')
    .eq('user_id', params.userId)
    .single();
  if (settings && !settings.actions_enabled) {
    return { ok: false, error: 'Device actions are disabled in settings' };
  }

  const { data: device } = await supabase
    .from('devices')
    .select('id')
    .eq('id', params.deviceId)
    .eq('user_id', params.userId)
    .single();
  if (!device) {
    return { ok: false, error: 'Unknown device' };
  }

  const { data: log, error: logError } = await supabase
    .from('activity_logs')
    .insert({
      user_id: params.userId,
      device_id: params.deviceId,
      action_type: action.action,
      payload: action,
      status: 'pending',
    })
    .select('id')
    .single();
  if (logError || !log) {
    return { ok: false, error: 'Could not create activity log' };
  }

  const message: ActionRequestMessage = {
    requestId: log.id,
    userId: params.userId,
    action,
    issuedAt: new Date().toISOString(),
  };

  const channel = supabase.channel(deviceChannel(params.deviceId));
  const sendResult = await channel.send({
    type: 'broadcast',
    event: REALTIME_EVENTS.actionRequest,
    payload: message,
  });
  await supabase.removeChannel(channel);

  if (sendResult !== 'ok') {
    await supabase
      .from('activity_logs')
      .update({ status: 'error', error: 'Broadcast failed' })
      .eq('id', log.id);
    return { ok: false, error: 'Could not reach the device channel' };
  }

  await supabase.from('activity_logs').update({ status: 'dispatched' }).eq('id', log.id);
  return { ok: true, requestId: log.id };
}

export function actionRequiresConfirmation(action: JarvisAction): boolean {
  return ACTION_REGISTRY[action.action].requiresConfirmation;
}
