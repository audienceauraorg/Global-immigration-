import { NextResponse } from 'next/server'

// With NextAuth credentials provider, no OAuth callback is needed.
// This route is kept as a safety redirect.
export async function GET() {
  return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
}
