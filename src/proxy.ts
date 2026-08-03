import { auth } from '@/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const pathname = request.nextUrl.pathname

  // Public auth paths
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/api/auth') || pathname.startsWith('/unauthorized')) {
    return NextResponse.next()
  }

  // Not logged in → redirect to login
  if (!session?.user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const role = session.user.role ?? 'client'

  // Root path redirect by role
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = role === 'client' ? '/dashboard' : '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin routes — clients bounced to portal
  if (pathname.startsWith('/admin') && !['admin', 'staff'].includes(role)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Portal routes — staff/admin sent to dashboard
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
