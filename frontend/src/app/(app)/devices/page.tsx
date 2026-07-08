import { GlassCard } from '@/components/ui/GlassCard';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { createClient } from '@/lib/supabase/server';

export default async function DevicesPage() {
  const supabase = createClient();
  const { data: devices } = await supabase
    .from('devices')
    .select('id, name, platform, status, agent_version, last_seen_at')
    .order('last_seen_at', { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Enheder</h1>
        <p className="mt-1 text-sm text-slate-400">
          Computere hvor Jarvis-agenten er installeret. Se <code>agent/README.md</code> for
          installation.
        </p>
      </header>

      <GlassCard>
        {(devices ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">
            Ingen enheder endnu. Start agenten på din PC, så registrerer den sig selv her.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {(devices ?? []).map((device) => (
              <li key={device.id} className="flex items-center gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{device.name}</p>
                  <p className="text-xs text-slate-500">
                    {device.platform}
                    {device.agent_version ? ` · agent v${device.agent_version}` : ''}
                    {device.last_seen_at
                      ? ` · sidst set ${new Date(device.last_seen_at).toLocaleString('da-DK')}`
                      : ''}
                  </p>
                </div>
                <StatusIndicator online={device.status === 'online'} />
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
