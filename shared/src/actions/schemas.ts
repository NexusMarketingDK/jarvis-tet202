import { z } from 'zod';

/**
 * Jarvis Action Schemas (V1)
 *
 * Claude never executes anything. It only emits one of these structured
 * actions, which the server validates against this whitelist and forwards
 * to the local agent. The agent re-validates before executing.
 *
 * Adding a new action:
 *  1. Define its schema here.
 *  2. Add it to `actionSchema` (discriminated union).
 *  3. Register metadata in `./registry.ts`.
 *  4. Implement a handler in `agent/src/actions/handlers/`.
 */

export const openUrlSchema = z.object({
  action: z.literal('open_url'),
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith('https://') || u.startsWith('http://'), {
      message: 'Only http(s) URLs are allowed',
    }),
});

export const launchApplicationSchema = z.object({
  action: z.literal('launch_application'),
  application: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, 'Application must be a registry key, not a path or command'),
});

export const closeApplicationSchema = z.object({
  action: z.literal('close_application'),
  application: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_-]+$/i, 'Application must be a registry key, not a path or command'),
});

export const listApplicationsSchema = z.object({
  action: z.literal('list_applications'),
});

export const getSystemInfoSchema = z.object({
  action: z.literal('get_system_info'),
});

export const actionSchema = z.discriminatedUnion('action', [
  openUrlSchema,
  launchApplicationSchema,
  closeApplicationSchema,
  listApplicationsSchema,
  getSystemInfoSchema,
]);

export type JarvisAction = z.infer<typeof actionSchema>;
export type JarvisActionType = JarvisAction['action'];

/**
 * Parse untrusted input (e.g. Claude tool output or a realtime message)
 * into a validated action. Returns null instead of throwing so callers
 * are forced to handle the rejection path explicitly.
 */
export function parseAction(input: unknown): JarvisAction | null {
  const result = actionSchema.safeParse(input);
  return result.success ? result.data : null;
}
