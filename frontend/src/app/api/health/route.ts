export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health – deployment diagnostics.
 *
 * Reports which required environment variables are present (booleans only –
 * never the values), so a misconfigured deployment can be diagnosed from the
 * browser without access to server logs. Safe to expose: it leaks no secrets.
 */
export async function GET() {
  const present = (key: string) => Boolean(process.env[key]);

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: present('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: present('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: present('SUPABASE_SERVICE_ROLE_KEY'),
    ANTHROPIC_API_KEY: present('ANTHROPIC_API_KEY'),
    JARVIS_ENCRYPTION_KEY: present('JARVIS_ENCRYPTION_KEY'),
  };

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'JARVIS_ENCRYPTION_KEY',
  ] as const;
  const missing = required.filter((key) => !present(key));

  return Response.json(
    {
      ok: missing.length === 0,
      missing,
      env,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    },
    { status: missing.length === 0 ? 200 : 503 },
  );
}
