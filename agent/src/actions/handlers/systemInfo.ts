import os from 'node:os';

const GB = 1024 ** 3;

/** Reads basic system information. Read-only, no shell involved. */
export async function handleGetSystemInfo(): Promise<string> {
  const cpus = os.cpus();
  const uptimeHours = (os.uptime() / 3600).toFixed(1);

  return [
    `OS: ${os.type()} ${os.release()} (${os.arch()})`,
    `Hostname: ${os.hostname()}`,
    `CPU: ${cpus[0]?.model ?? 'ukendt'} (${cpus.length} kerner)`,
    `RAM: ${((os.totalmem() - os.freemem()) / GB).toFixed(1)} / ${(os.totalmem() / GB).toFixed(1)} GB i brug`,
    `Oppetid: ${uptimeHours} timer`,
  ].join('\n');
}
