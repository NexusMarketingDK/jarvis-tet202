import { GlassCard } from '@/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/server';

const STATUS_STYLES: Record<string, string> = {
  success: 'text-emerald-300',
  error: 'text-red-400',
  rejected: 'text-red-400',
  dispatched: 'text-arc',
  pending: 'text-slate-400',
};

export default async function ActivityPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('id, action_type, payload, status, output, error, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Aktivitetslog</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fuldt revisionsspor: alle handlinger Jarvis har sendt til dine enheder.
        </p>
      </header>

      <GlassCard>
        {(logs ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Ingen handlinger endnu.</p>
        ) : (
          <ul className="divide-y divide-line">
            {(logs ?? []).map((log) => (
              <li key={log.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-slate-200">{log.action_type}</span>
                  <span className={`text-xs ${STATUS_STYLES[log.status] ?? 'text-slate-400'}`}>
                    {log.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString('da-DK')}
                </p>
                {log.error && <p className="mt-1 text-xs text-red-400">{log.error}</p>}
                {log.output && (
                  <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background/60 p-2 font-mono text-xs text-slate-400">
                    {log.output}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
