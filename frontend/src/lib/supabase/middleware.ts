import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = ['/login', '/auth'];

/**
 * Refreshes the Supabase session cookie and guards authenticated routes.
 *
 * The whole body is defensive: a misconfigured deployment (missing env vars)
 * or a transient Supabase outage must never turn every request into a
 * `MIDDLEWARE_INVOCATION_FAILED` 500. In those cases we simply let the request
 * through and let the page/route handle the unauthenticated state.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    // Env vars not configured for this deployment – don't crash the edge
    // middleware; serve the request so the misconfiguration is visible in-app.
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    // The root `/` is the public marketing landing page; everything else in
    // PUBLIC_PATHS is matched by prefix.
    const isPublic = pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!user && !isPublic && !pathname.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (user && pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // Never let an auth/network error take down every route.
    return response;
  }
}
