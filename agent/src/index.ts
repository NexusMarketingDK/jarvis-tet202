import { createClient } from '@supabase/supabase-js';
import { AGENT_VERSION, loadConfig } from './config';
import { markOffline, markOnline, registerDevice } from './device';
import { logger } from './logging/logger';
import { listenForActions } from './transport/realtime';

const HEARTBEAT_INTERVAL_MS = 60_000;

async function main() {
  const config = loadConfig();
  logger.info(`Jarvis agent v${AGENT_VERSION} starting…`);

  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: config.JARVIS_EMAIL,
    password: config.JARVIS_PASSWORD,
  });
  if (authError || !auth.user) {
    throw new Error(`Login failed: ${authError?.message ?? 'unknown error'}`);
  }
  logger.info(`Signed in as ${auth.user.email}`);

  const deviceId = await registerDevice(supabase, auth.user.id, config);
  logger.info(`Device registered: ${config.DEVICE_NAME} (${deviceId})`);

  listenForActions(supabase, deviceId, auth.user.id);

  const heartbeat = setInterval(() => {
    markOnline(supabase, deviceId).catch((error) =>
      logger.warn('Heartbeat failed', { error: String(error) }),
    );
  }, HEARTBEAT_INTERVAL_MS);

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, going offline…`);
    clearInterval(heartbeat);
    await markOffline(supabase, deviceId).catch(() => undefined);
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  logger.info('Jarvis agent is online and listening for actions. Press Ctrl+C to stop.');
}

main().catch((error) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
