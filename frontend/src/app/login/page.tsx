'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (authError) {
        setError(authError.message);
        return;
      }

      // With "Confirm email" enabled in Supabase, signUp returns no session –
      // the user must confirm via email first. Tell them instead of silently
      // bouncing back to the login screen.
      if (!data.session) {
        setNotice(
          mode === 'signup'
            ? 'Konto oprettet. Tjek din email for at bekræfte, og log derefter ind.'
            : 'Din email er ikke bekræftet endnu. Tjek din indbakke.',
        );
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(
        'Kunne ikke kontakte Supabase. Er NEXT_PUBLIC_SUPABASE_URL og ANON_KEY sat for dette deploy?',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-2xl p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-arc/40 bg-arc-soft animate-pulseGlow">
            <span className="text-2xl font-semibold text-arc">J</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Jarvis</h1>
          <p className="mt-1 text-sm text-slate-400">Din personlige AI-assistent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none transition focus:border-arc/60 focus:shadow-glow"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-400">
              Adgangskode
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none transition focus:border-arc/60 focus:shadow-glow"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && (
            <p className="rounded-lg border border-arc/30 bg-arc-soft/50 px-3 py-2 text-sm text-arc">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-arc/90 py-2 text-sm font-medium text-slate-950 transition hover:bg-arc disabled:opacity-50"
          >
            {loading ? 'Et øjeblik…' : mode === 'login' ? 'Log ind' : 'Opret konto'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-4 w-full text-center text-sm text-slate-400 transition hover:text-arc"
        >
          {mode === 'login' ? 'Ny her? Opret en konto' : 'Har du en konto? Log ind'}
        </button>
      </motion.div>
    </main>
  );
}
