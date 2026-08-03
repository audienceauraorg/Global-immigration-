import { auth } from '@/auth'
import { NextResponse, type NextRequest } from 'next/server'

// Routes handled by Next.js — everything else is the static WordPress site
const NEXT_PREFIXES = [
  '/_next',
  '/api',
  '/auth',
  '/login',
  '/signup',
  '/dashboard',
  '/admin',
  '/fees',
  '/favicon.ico',
]

function isNextRoute(pathname: string) {
  return NEXT_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  )
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // On Vercel the static WordPress site lives in public/.
  // Locally, server.js handles all of this before Next.js sees the request.
  if (process.env.VERCEL && !isNextRoute(pathname)) {
    if (/\.[^/]+$/.test(pathname)) {
      // Path has a file extension (CSS, JS, images, fonts…) → static asset in
      // public/, serve it directly without any auth check.
      return NextResponse.next()
    }
    // Extensionless directory-style path → rewrite to its index.htm equivalent.
    const normalized = pathname.endsWith('/') ? pathname : pathname + '/'
    const url = request.nextUrl.clone()
    url.pathname = normalized + 'index.htm'
    return NextResponse.rewrite(url)
  }

  // ── Auth proxy for Next.js-handled routes ─────────────────────────────────
  const session = await auth()

  // Public auth paths — always allow
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/unauthorized')
  ) {
    return NextResponse.next()
  }

  // Not logged in → redirect to login
  if (!session?.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const role = session.user.role ?? 'client'

  // Admin routes — clients bounced to portal
  if (pathname.startsWith('/admin') && !['admin', 'staff'].includes(role)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Portal routes — staff/admin sent to admin dashboard
  if (pathname.startsWith('/dashboard') && ['admin', 'staff'].includes(role)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/files|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
