import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { JarvisAction } from '@jarvis/shared';

const execFileAsync = promisify(execFile);

/**
 * Opens an http(s) URL in the default browser. The URL was validated by the
 * shared schema (http/https only), and we pass it as an argument – never
 * through shell string interpolation.
 */
export async function handleOpenUrl(
  action: Extract<JarvisAction, { action: 'open_url' }>,
): Promise<string> {
  const url = new URL(action.url); // throws on malformed input – belt and braces
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Only http(s) URLs are allowed');
  }

  switch (process.platform) {
    case 'win32':
      // `start` treats the first quoted arg as a window title, hence "".
      await execFileAsync('cmd', ['/c', 'start', '', url.href]);
      break;
    case 'darwin':
      await execFileAsync('open', [url.href]);
      break;
    default:
      await execFileAsync('xdg-open', [url.href]);
  }
  return `Åbnede ${url.href}`;
}
