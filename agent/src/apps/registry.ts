/**
 * Whitelisted applications the agent may launch or close.
 *
 * `launch` is passed to execFile via `cmd /c start` (no shell string
 * interpolation of user input – keys are validated against this registry
 * first). `processName` is used with taskkill for close_application.
 */
export interface AppDefinition {
  /** Human-friendly name shown to the user. */
  label: string;
  /** Command/target understood by `start` on Windows. */
  windowsTarget: string;
  /** Image name for taskkill. Omit for apps that shouldn't be closable. */
  processName?: string;
}

export const APP_REGISTRY: Record<string, AppDefinition> = {
  spotify: { label: 'Spotify', windowsTarget: 'spotify:', processName: 'Spotify.exe' },
  vscode: { label: 'Visual Studio Code', windowsTarget: 'code', processName: 'Code.exe' },
  outlook: { label: 'Outlook', windowsTarget: 'outlook', processName: 'OUTLOOK.EXE' },
  steam: { label: 'Steam', windowsTarget: 'steam:', processName: 'steam.exe' },
  discord: { label: 'Discord', windowsTarget: 'discord:', processName: 'Discord.exe' },
  chrome: { label: 'Google Chrome', windowsTarget: 'chrome', processName: 'chrome.exe' },
  edge: { label: 'Microsoft Edge', windowsTarget: 'msedge', processName: 'msedge.exe' },
  explorer: { label: 'Stifinder', windowsTarget: 'explorer' },
  notepad: { label: 'Notesblok', windowsTarget: 'notepad', processName: 'notepad.exe' },
  calculator: { label: 'Lommeregner', windowsTarget: 'calc' },
};

export function getApp(key: string): AppDefinition | null {
  return APP_REGISTRY[key.toLowerCase()] ?? null;
}
