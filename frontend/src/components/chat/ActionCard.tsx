'use client';

import { useState } from 'react';
import { Cpu, Check, ShieldAlert } from 'lucide-react';
import { ACTION_REGISTRY, type JarvisAction } from '@jarvis/shared';
import { createClient } from '@/lib/supabase/client';

type ConfirmState = 'idle' | 'sending' | 'sent' | 'failed';

/**
 * Shows a device action proposed by Jarvis. Low-risk actions were already
 * dispatched by the server; high-risk actions render a confirm button that
 * dispatches via POST /api/actions.
 */
export function ActionCard({
  action,
  requiresConfirmation,
}: {
  action: JarvisAction;
  requiresConfirmation: boolean;
}) {
  const [state, setState] = useState<ConfirmState>('idle');
  const meta = ACTION_REGISTRY[action.action];

  async function confirm() {
    setState('sending');
    const supabase = createClient();
    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('status', 'online')
      .order('last_seen_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!device) {
      setState('failed');
      return;
    }

    const response = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: device.id, action }),
    });
    setState(response.ok ? 'sent' : 'failed');
  }

  return (
    <div className="mt-3 rounded-xl border border-arc/30 bg-arc-soft/50 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-arc">
        <Cpu size={14} />
        Enhedshandling
      </div>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-background/60 p-2 font-mono text-xs text-slate-300">
        {JSON.stringify(action, null, 2)}
      </pre>
      <p className="mt-2 text-xs text-slate-400">{meta.description}</p>

      {requiresConfirmation && state !== 'sent' && (
        <button
          onClick={confirm}
          disabled={state === 'sending'}
          className="mt-2 flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-50"
        >
          <ShieldAlert size={14} />
          {state === 'sending' ? 'Sender…' : 'Godkend og udfør'}
        </button>
      )}
      {state === 'sent' && (
        <p className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
          <Check size={14} /> Sendt til din enhed
        </p>
      )}
      {state === 'failed' && (
        <p className="mt-2 text-xs text-red-400">Kunne ikke sende – er agenten online?</p>
      )}
    </div>
  );
}
