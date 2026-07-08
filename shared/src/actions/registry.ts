import type { JarvisActionType } from './schemas';

export type ActionRiskLevel = 'low' | 'medium' | 'high';

export interface ActionMetadata {
  /** Shown in UI and used in the Claude tool description. */
  description: string;
  riskLevel: ActionRiskLevel;
  /** High-risk actions must be confirmed by the user in the UI before dispatch. */
  requiresConfirmation: boolean;
}

/**
 * Whitelist of every action Jarvis supports, with its risk profile.
 * The server refuses to dispatch – and the agent refuses to execute –
 * anything not present here.
 */
export const ACTION_REGISTRY: Record<JarvisActionType, ActionMetadata> = {
  open_url: {
    description: 'Open a http(s) URL in the default browser on the user’s PC',
    riskLevel: 'low',
    requiresConfirmation: false,
  },
  launch_application: {
    description: 'Launch a whitelisted application (e.g. spotify, vscode, chrome)',
    riskLevel: 'low',
    requiresConfirmation: false,
  },
  close_application: {
    description: 'Close a whitelisted application (may lose unsaved work)',
    riskLevel: 'medium',
    requiresConfirmation: true,
  },
  list_applications: {
    description: 'List applications available on the user’s PC',
    riskLevel: 'low',
    requiresConfirmation: false,
  },
  get_system_info: {
    description: 'Read CPU, RAM, OS and network information from the user’s PC',
    riskLevel: 'low',
    requiresConfirmation: false,
  },
};

export function isKnownAction(action: string): action is JarvisActionType {
  return action in ACTION_REGISTRY;
}
