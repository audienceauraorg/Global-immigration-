import Link from 'next/link'
import { auth } from '@/auth'
import { getSiteSettings } from '@/lib/settings'
import MobileMenu from './MobileMenu'
import { signOut } from '@/lib/actions/auth'

interface SiteHeaderProps {
  /** 'public' = marketing site nav; 'portal' = client portal header */
  variant?: 'public' | 'portal'
}

const publicNavLinks = [
  { label: 'Individuals', href: '/#programs' },
  { label: 'Employers', href: '/#employers' },
  { label: 'Services', href: '/#services' },
  { label: 'Fee Schedule', href: '/fees' },
  { label: 'Our Team', href: '/#team' },
  { label: 'Contact', href: '/#contact' },
]

export default async function SiteHeader({ variant = 'public' }: SiteHeaderProps) {
  const [session, settings] = await Promise.all([
    auth(),
    getSiteSettings(),
  ])

  const siteName     = settings?.siteName ?? 'Global Immigration Hub'
  const contactEmail = settings?.contactEmail
  const isLoggedIn = !!session?.user
  const role       = session?.user?.role ?? 'client'
  const userName   = session?.user?.name ?? null

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-lg">
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-gold/80">
            CICC Regulated Immigration Consultants
          </span>
          <div className="flex items-center gap-4">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="text-white/50 text-xs hover:text-white/80 transition-colors hidden sm:block"
              >
                {contactEmail}
              </a>
            )}
            <a
              href="https://web.facebook.com/immigrationandrelocation"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-85">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wp-content/uploads/2020/06/logo_transparent.png"
            alt={siteName}
            className="h-12 w-auto"
          />
        </Link>

        {/* ── PUBLIC VARIANT: full nav ── */}
        {variant === 'public' && (
          <>
            <div className="hidden lg:flex items-center gap-0.5">
              {publicNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {isLoggedIn ? (
                <>
                  <span className="text-white/50 text-sm hidden xl:block">{userName}</span>
                  <Link
                    href={role === 'client' ? '/dashboard' : '/admin/dashboard'}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-navy transition-colors hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                  >
                    {role === 'client' ? 'My Dashboard' : 'Dashboard'}
                  </Link>
                  <form action={signOut}>
                    <button type="submit" className="px-3 py-2 text-white/50 hover:text-white text-sm transition-colors">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-navy transition-colors hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                >
                  Login
                </Link>
              )}
            </div>
          </>
        )}

        {/* ── PORTAL VARIANT: compact right side ── */}
        {variant === 'portal' && (
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/"
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
            >
              ← Main Site
            </Link>
            <span className="text-white/20 text-sm">|</span>
            {userName && (
              <span className="text-white/70 text-sm font-medium">{userName}</span>
            )}
            <form action={signOut}>
              <button type="submit" className="text-white/50 hover:text-white text-sm transition-colors">
                Sign out
              </button>
            </form>
          </div>
        )}

        {/* Mobile hamburger */}
        <MobileMenu
          isLoggedIn={isLoggedIn}
          role={role}
          userName={userName}
          siteName={siteName}
          variant={variant}
        />
      </nav>
    </header>
  )
}
