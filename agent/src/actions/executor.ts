import { parseAction, type JarvisAction } from '@jarvis/shared';
import { logger } from '../logging/logger';
import {
  handleCloseApplication,
  handleLaunchApplication,
  handleListApplications,
} from './handlers/applications';
import { handleOpenUrl } from './handlers/openUrl';
import { handleGetSystemInfo } from './handlers/systemInfo';

export interface ExecutionResult {
  status: 'success' | 'error' | 'rejected';
  output?: string;
  error?: string;
}

type Handler = (action: JarvisAction) => Promise<string>;

/**
 * Maps every whitelisted action to its handler. TypeScript enforces that
 * this map is exhaustive: adding an action to the shared schema without a
 * handler here is a compile error.
 */
const HANDLERS: { [K in JarvisAction['action']]: Handler } = {
  open_url: (a) => handleOpenUrl(a as Extract<JarvisAction, { action: 'open_url' }>),
  launch_application: (a) =>
    handleLaunchApplication(a as Extract<JarvisAction, { action: 'launch_application' }>),
  close_application: (a) =>
    handleCloseApplication(a as Extract<JarvisAction, { action: 'close_application' }>),
  list_applications: () => handleListApplications(),
  get_system_info: () => handleGetSystemInfo(),
};

/**
 * Validates and executes an incoming action. The payload is re-validated
 * here even though the server already validated it – the agent trusts
 * nothing that arrives over the network.
 */
export async function executeAction(rawAction: unknown): Promise<ExecutionResult> {
  const action = parseAction(rawAction);
  if (!action) {
    logger.warn('Rejected non-whitelisted or malformed action', { rawAction });
    return { status: 'rejected', error: 'Action is not whitelisted or payload is invalid' };
  }

  logger.info(`Executing action: ${action.action}`, { action });
  try {
    const output = await HANDLERS[action.action](action);
    return { status: 'success', output };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Action failed: ${action.action}`, { error: message });
    return { status: 'error', error: message };
  }
}
