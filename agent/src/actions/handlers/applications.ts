import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { JarvisAction } from '@jarvis/shared';
import { APP_REGISTRY, getApp } from '../../apps/registry';

const execFileAsync = promisify(execFile);

function assertWindows() {
  if (process.platform !== 'win32') {
    throw new Error('Application control is only implemented for Windows in V1');
  }
}

export async function handleLaunchApplication(
  action: Extract<JarvisAction, { action: 'launch_application' }>,
): Promise<string> {
  const app = getApp(action.application);
  if (!app) {
    throw new Error(
      `"${action.application}" is not a whitelisted application. Available: ${Object.keys(APP_REGISTRY).join(', ')}`,
    );
  }
  assertWindows();
  await execFileAsync('cmd', ['/c', 'start', '', app.windowsTarget]);
  return `Startede ${app.label}`;
}

export async function handleCloseApplication(
  action: Extract<JarvisAction, { action: 'close_application' }>,
): Promise<string> {
  const app = getApp(action.application);
  if (!app) {
    throw new Error(`"${action.application}" is not a whitelisted application`);
  }
  if (!app.processName) {
    throw new Error(`${app.label} cannot be closed by Jarvis`);
  }
  assertWindows();
  await execFileAsync('taskkill', ['/IM', app.processName]);
  return `Lukkede ${app.label}`;
}

export async function handleListApplications(): Promise<string> {
  const lines = Object.entries(APP_REGISTRY).map(
    ([key, app]) => `- ${key}: ${app.label}${app.processName ? '' : ' (kan ikke lukkes)'}`,
  );
  return `Tilgængelige programmer:\n${lines.join('\n')}`;
}
