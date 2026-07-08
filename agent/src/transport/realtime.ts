import type { SupabaseClient } from '@supabase/supabase-js';
import {
  actionRequestMessageSchema,
  deviceChannel,
  REALTIME_EVENTS,
  type ActionResultMessage,
} from '@jarvis/shared';
import { executeAction } from '../actions/executor';
import { logger } from '../logging/logger';

/**
 * Subscribes to this device's broadcast channel and executes incoming
 * action requests. Results are written back to `activity_logs` (the
 * frontend's source of truth) and broadcast for any live listeners.
 */
export function listenForActions(supabase: SupabaseClient, deviceId: string, userId: string) {
  const channel = supabase.channel(deviceChannel(deviceId));

  channel.on('broadcast', { event: REALTIME_EVENTS.actionRequest }, async ({ payload }) => {
    const parsed = actionRequestMessageSchema.safeParse(payload);
    if (!parsed.success) {
      logger.warn('Ignored malformed action request', { payload });
      return;
    }
    const request = parsed.data;
    if (request.userId !== userId) {
      logger.warn('Ignored action request for another user', { requestId: request.requestId });
      return;
    }

    const result = await executeAction(request.action);

    const { error: updateError } = await supabase
      .from('activity_logs')
      .update({
        status: result.status,
        output: result.output ?? null,
        error: result.error ?? null,
      })
      .eq('id', request.requestId);
    if (updateError) {
      logger.error('Could not persist action result', { error: updateError.message });
    }

    const resultMessage: ActionResultMessage = {
      requestId: request.requestId,
      status: result.status,
      output: result.output,
      error: result.error,
      completedAt: new Date().toISOString(),
    };
    await channel.send({
      type: 'broadcast',
      event: REALTIME_EVENTS.actionResult,
      payload: resultMessage,
    });
  });

  channel.subscribe((status) => {
    logger.info(`Realtime channel status: ${status}`);
  });

  return channel;
}
