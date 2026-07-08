import type Anthropic from '@anthropic-ai/sdk';
import { ACTION_REGISTRY } from '@jarvis/shared';

/**
 * Claude tool definitions. Claude proposes actions through tools; it never
 * executes anything itself. The input schema mirrors the shared Zod
 * whitelist, and every tool result is validated server-side regardless.
 */
export const jarvisTools: Anthropic.Tool[] = [
  {
    name: 'execute_device_action',
    description:
      'Send a whitelisted action to the user’s local agent (their Windows PC). ' +
      'Available actions: ' +
      Object.entries(ACTION_REGISTRY)
        .map(([name, meta]) => `${name} (${meta.description})`)
        .join('; '),
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: Object.keys(ACTION_REGISTRY),
          description: 'The whitelisted action type',
        },
        url: {
          type: 'string',
          description: 'For open_url: the http(s) URL to open',
        },
        application: {
          type: 'string',
          description:
            'For launch_application/close_application: application key, e.g. spotify, vscode, chrome, edge, outlook, steam, discord, explorer',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'save_memory',
    description:
      'Save a long-term memory about the user (name, preferences, projects, workflows, favorites, facts).',
    input_schema: {
      type: 'object' as const,
      properties: {
        category: {
          type: 'string',
          enum: ['identity', 'preference', 'project', 'workflow', 'favorite', 'fact'],
        },
        key: { type: 'string', description: 'Short identifier, e.g. "name" or "favorite_music"' },
        value: { type: 'string', description: 'The content to remember' },
        importance: { type: 'integer', minimum: 1, maximum: 5 },
      },
      required: ['category', 'key', 'value'],
    },
  },
];
