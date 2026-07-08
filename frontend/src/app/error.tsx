'use client';

/**
 * Root error boundary. Replaces Next.js' raw "Application error: a server-side
 * exception has occurred" screen with a branded, actionable message.
 *
 * The most common cause in a fresh deployment is missing environment
 * variables, so we detect the build-time-inlined NEXT_PUBLIC_* values and
 * point the user at the exact remedy.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-lg rounded-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-arc/40 bg-arc-soft">
          <span className="text-lg font-semibold text-arc">J</span>
        </div>
        <h1 className="text-lg font-semibold text-white">Jarvis kunne ikke indlæse siden</h1>

        {supabaseConfigured ? (
          <p className="mt-2 text-sm text-slate-400">
            Der opstod en uventet fejl. Prøv igen – hvis den bliver ved, så tjek{' '}
            <code className="text-arc">/api/health</code> og server-loggen.
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm text-slate-400">
            <p>
              Det ser ud til, at appens miljøvariabler ikke er sat for dette deploy. Sæt disse i
              Vercel (Production) og kør <strong>Redeploy</strong>:
            </p>
            <ul className="mx-auto inline-block text-left font-mono text-xs text-slate-300">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
              <li>ANTHROPIC_API_KEY</li>
              <li>JARVIS_ENCRYPTION_KEY</li>
            </ul>
          </div>
        )}

        <button
          onClick={reset}
          className="mt-5 rounded-lg bg-arc/90 px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-arc"
        >
          Prøv igen
        </button>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-slate-600">Digest: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
