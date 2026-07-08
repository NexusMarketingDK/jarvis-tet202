import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: profile }, { data: devices }, { data: recentActivity }, { count: memoryCount }] =
    await Promise.all([
      supabase.from('profiles').select('full_name').maybeSingle(),
      supabase.from('devices').select('id, name, status, last_seen_at'),
      supabase
        .from('activity_logs')
        .select('id, action_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('memories').select('id', { count: 'exact', head: true }),
    ]);

  const greetingName = profile?.full_name || 'chef';
  const onlineDevices = (devices ?? []).filter((d) => d.status === 'online');

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Godt at se dig, {greetingName}.
        </h1>
        <p className="mt-1 text-sm text-slate-400">Jarvis er klar. Hvad skal vi lave i dag?</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard title="Agent">
          <StatusIndicator
            online={onlineDevices.length > 0}
            label={
              onlineDevices.length > 0
                ? `${onlineDevices.length} enhed(er) online`
                : 'Ingen enheder online'
            }
          />
          <p className="mt-3 text-xs text-slate-500">
            Start Jarvis-agenten på din PC for at kunne åbne programmer og hjemmesider.
          </p>
        </GlassCard>

        <GlassCard title="Hukommelse">
          <p className="text-3xl font-semibold text-arc">{memoryCount ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">gemte minder om dig og dine projekter</p>
        </GlassCard>

        <GlassCard title="Hurtig start">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm text-arc transition hover:gap-3"
          >
            Åbn chatten <ArrowRight size={15} />
          </Link>
        </GlassCard>
      </div>

      <GlassCard title="Seneste aktivitet">
        {(recentActivity ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">Ingen handlinger udført endnu.</p>
        ) : (
          <ul className="space-y-2">
            {(recentActivity ?? []).map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-300">{log.action_type}</span>
                <span
                  className={
                    log.status === 'success'
                      ? 'text-emerald-300'
                      : log.status === 'error' || log.status === 'rejected'
                        ? 'text-red-400'
                        : 'text-slate-400'
                  }
                >
                  {log.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
