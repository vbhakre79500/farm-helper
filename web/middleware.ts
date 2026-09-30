import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_EXACT = ['/', '/login', '/signup', '/about', '/how-it-works'];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/risk-map',
  '/forecast',
  '/climate-signals',
  '/advisories',
  '/history',
  '/alerts',
  '/settings',
  '/officer',
  '/admin',
];

interface VerifiedSession {
  userId: string;
  email: string;
  role: 'farmer' | 'officer' | 'admin';
}

// In-memory verification cache for sub-millisecond edge/server responses
const sessionCache = new Map<string, { session: VerifiedSession; expiresAt: number }>();

function extractAccessToken(request: NextRequest): string | null {
  // 1. Direct monsoon_access_token cookie
  const directToken = request.cookies.get('monsoon_access_token')?.value;
  if (directToken && directToken.length > 20 && directToken !== 'local-session-token') {
    return directToken;
  }

  // 2. Direct sb-access-token cookie
  const sbToken = request.cookies.get('sb-access-token')?.value;
  if (sbToken && sbToken.length > 20) {
    return sbToken;
  }

  // 3. monsoon_session cookie (JSON encoded)
  const sessionCookie = request.cookies.get('monsoon_session')?.value;
  if (sessionCookie) {
    try {
      const decoded = decodeURIComponent(sessionCookie);
      const parsed = JSON.parse(decoded);
      if (parsed.token && parsed.token !== 'local-session-token' && parsed.token.length > 20) {
        return parsed.token;
      }
    } catch {
      if (sessionCookie.length > 20 && !sessionCookie.startsWith('{')) {
        return sessionCookie;
      }
    }
  }

  // 4. Supabase SSR auth token cookies (sb-*-auth-token)
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes('-auth-token')) {
      try {
        const decoded = decodeURIComponent(cookie.value);
        const parsed = JSON.parse(decoded);
        if (parsed.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {}
    }
  }

  return null;
}

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

async function verifySupabaseSession(token: string): Promise<VerifiedSession | null> {
  const now = Date.now();
  const cached = sessionCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.session;
  }

  const jwtPayload = parseJwtPayload(token);
  if (!jwtPayload) {
    return null;
  }

  // Check token expiration
  if (jwtPayload.exp && jwtPayload.exp * 1000 < now) {
    sessionCache.delete(token);
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  try {
    // Cryptographic verification with Supabase Auth engine
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!userRes.ok) {
      sessionCache.delete(token);
      return null;
    }

    const userData = await userRes.json();
    if (!userData?.id) {
      return null;
    }

    // Determine authoritative role from Supabase user
    let role: 'farmer' | 'officer' | 'admin' = 'farmer';
    const rawRole = userData.user_metadata?.role || userData.app_metadata?.role || jwtPayload.user_metadata?.role;
    if (rawRole) {
      const lower = String(rawRole).toLowerCase();
      if (lower === 'admin' || lower === 'officer' || lower === 'farmer') {
        role = lower;
      }
    }

    const verified: VerifiedSession = {
      userId: userData.id,
      email: userData.email || '',
      role,
    };

    // Cache valid session for 60 seconds
    sessionCache.set(token, {
      session: verified,
      expiresAt: now + 60000,
    });

    return verified;
  } catch (e) {
    console.error('Session verification notice:', e);
    // Fallback: If network to Supabase auth experienced a timeout, verify issuer and payload
    const projectHost = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0];
    if (
      jwtPayload.aud === 'authenticated' &&
      jwtPayload.iss &&
      jwtPayload.iss.includes(projectHost) &&
      jwtPayload.sub &&
      jwtPayload.exp * 1000 > now
    ) {
      let role: 'farmer' | 'officer' | 'admin' = 'farmer';
      const rawRole = jwtPayload.user_metadata?.role;
      if (rawRole) {
        const lower = String(rawRole).toLowerCase();
        if (lower === 'admin' || lower === 'officer' || lower === 'farmer') {
          role = lower;
        }
      }
      return {
        userId: jwtPayload.sub,
        email: jwtPayload.email || '',
        role,
      };
    }
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static assets and internal next requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files like favicon.ico, images
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_EXACT.some(
    (pub) => pathname === pub || pathname.startsWith(pub + '/')
  );
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Extract access token from cookies
  const token = extractAccessToken(request);
  const session = token ? await verifySupabaseSession(token) : null;
  const isAuthenticated = Boolean(session);
  const userRole = session?.role || null;

  // 2. Unauthenticated access to protected routes -> redirect to /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated user trying to access /login or /signup -> redirect to /dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Role-based route enforcement for authenticated users
  if (isAuthenticated && userRole) {
    // /admin route: strictly accessible only to ADMIN
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(dashboardUrl);
    }

    // /officer route: accessible only to OFFICER or ADMIN
    if (pathname.startsWith('/officer') && userRole !== 'officer' && userRole !== 'admin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'officer_required');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
