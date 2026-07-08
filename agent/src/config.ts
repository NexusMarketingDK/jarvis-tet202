import 'dotenv/config';
import { z } from 'zod';
import os from 'node:os';

export const AGENT_VERSION = '0.1.0';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  JARVIS_EMAIL: z.string().email(),
  JARVIS_PASSWORD: z.string().min(1),
  DEVICE_NAME: z.string().min(1).default(os.hostname()),
});

export type AgentConfig = z.infer<typeof envSchema>;

export function loadConfig(): AgentConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Missing/invalid environment variables: ${missing} (see .env.example)`);
  }
  return result.data;
}

export function detectPlatform(): 'windows' | 'mac' | 'linux' {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'mac';
    default:
      return 'linux';
  }
}
