import { NextRequest, NextResponse } from 'next/server'

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

export function middleware(request: NextRequest) {
  // On Vercel, static files are in public/ — rewrite extensionless paths to
  // their *.htm equivalents so Vercel's CDN can serve them.
  // Locally, server.js already handles this, so skip middleware.
  if (!process.env.VERCEL) return NextResponse.next()

  const pathname = request.nextUrl.pathname

  // Let Next.js handle its own routes
  if (isNextRoute(pathname)) return NextResponse.next()

  // Paths with a file extension are already exact file requests (images, CSS, JS…)
  if (/\.[^/]+$/.test(pathname)) return NextResponse.next()

  // Rewrite directory-style paths to their index.htm equivalent
  const normalized = pathname.endsWith('/') ? pathname : pathname + '/'
  const target = normalized + 'index.htm'

  const url = request.nextUrl.clone()
  url.pathname = target
  return NextResponse.rewrite(url)
}

export const config = {
  // Run on all paths except Next.js internals and static file extensions
  matcher: ['/((?!_next/static|_next/image).*)'],
}
