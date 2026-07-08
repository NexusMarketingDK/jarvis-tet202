import type { SupabaseClient } from '@supabase/supabase-js';
import { AGENT_VERSION, detectPlatform, type AgentConfig } from './config';

/**
 * Registers (or re-registers) this machine as a device row scoped to the
 * signed-in user. Devices are matched on name, so restarting the agent
 * reuses the same row.
 */
export async function registerDevice(
  supabase: SupabaseClient,
  userId: string,
  config: AgentConfig,
): Promise<string> {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from('devices')
    .select('id')
    .eq('user_id', userId)
    .eq('name', config.DEVICE_NAME)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('devices')
      .update({ status: 'online', agent_version: AGENT_VERSION, last_seen_at: now })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: created, error } = await supabase
    .from('devices')
    .insert({
      user_id: userId,
      name: config.DEVICE_NAME,
      platform: detectPlatform(),
      status: 'online',
      agent_version: AGENT_VERSION,
      last_seen_at: now,
    })
    .select('id')
    .single();

  if (error || !created) {
    throw new Error(`Could not register device: ${error?.message}`);
  }
  return created.id;
}

export async function markOnline(supabase: SupabaseClient, deviceId: string) {
  await supabase
    .from('devices')
    .update({ status: 'online', last_seen_at: new Date().toISOString() })
    .eq('id', deviceId);
}

export async function markOffline(supabase: SupabaseClient, deviceId: string) {
  await supabase.from('devices').update({ status: 'offline' }).eq('id', deviceId);
}
