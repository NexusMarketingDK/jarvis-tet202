import { z } from 'zod';
import { actionSchema } from '../actions/schemas';

/**
 * Realtime protocol between the cloud (Vercel functions) and the local agent.
 *
 * Transport: Supabase Realtime broadcast channels. Each device has its own
 * channel; the server broadcasts `action_request`, the agent answers with
 * `action_result`. Vercel cannot hold long-lived sockets, so results are
 * also persisted to `activity_logs`, which the frontend subscribes to.
 */

export const DEVICE_CHANNEL_PREFIX = 'device:';

export function deviceChannel(deviceId: string): string {
  return `${DEVICE_CHANNEL_PREFIX}${deviceId}`;
}

export const REALTIME_EVENTS = {
  actionRequest: 'action_request',
  actionResult: 'action_result',
  agentStatus: 'agent_status',
} as const;

export const actionRequestMessageSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  action: actionSchema,
  issuedAt: z.string().datetime(),
});

export type ActionRequestMessage = z.infer<typeof actionRequestMessageSchema>;

export const actionResultMessageSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['success', 'error', 'rejected']),
  /** Human-readable output (e.g. app list, system info) – never structured secrets. */
  output: z.string().max(20_000).optional(),
  error: z.string().max(2_000).optional(),
  completedAt: z.string().datetime(),
});

export type ActionResultMessage = z.infer<typeof actionResultMessageSchema>;

export const agentStatusMessageSchema = z.object({
  deviceId: z.string().uuid(),
  status: z.enum(['online', 'offline']),
  agentVersion: z.string(),
  reportedAt: z.string().datetime(),
});

export type AgentStatusMessage = z.infer<typeof agentStatusMessageSchema>;
