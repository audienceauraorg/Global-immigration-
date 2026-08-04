'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface MobileMenuProps {
  isLoggedIn: boolean
  role: string
  userName?: string | null
  siteName: string
  variant: 'public' | 'portal'
}

const publicNavLinks = [
  { label: 'Individuals', href: '/#programs' },
  { label: 'Employers', href: '/#employers' },
  { label: 'Services', href: '/#services' },
  { label: 'Fee Schedule', href: '/fees' },
  { label: 'Our Team', href: '/#team' },
  { label: 'Contact', href: '/#contact' },
]

export default function MobileMenu({ isLoggedIn, role, userName, siteName, variant }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        className="w-10 h-10 flex items-center justify-center rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Panel */}
          <div
            className="absolute top-0 right-0 h-full w-72 flex flex-col shadow-2xl"
            style={{ background: '#0B1C3A' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                  <Globe className="w-4 h-4 text-navy" />
                </div>
                <span className="text-white font-bold text-sm">{siteName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {variant === 'public' && (
                <>
                  {publicNavLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    {isLoggedIn ? (
                      <>
                        {userName && (
                          <p className="px-4 text-xs text-white/40 mb-2">Signed in as {userName}</p>
                        )}
                        <Link
                          href={role === 'client' ? '/dashboard' : '/admin/dashboard'}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center w-full px-4 py-3 rounded-xl bg-gold text-navy text-sm font-bold transition-colors hover:bg-yellow-400"
                        >
                          {role === 'client' ? 'My Dashboard' : 'Dashboard'}
                        </Link>
                        <form action={signOut} className="w-full">
                          <button type="submit" className="w-full px-4 py-2.5 text-white/50 hover:text-white text-sm transition-colors">
                            Sign out
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </>
              )}

              {variant === 'portal' && (
                <>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    ← Back to Main Site
                  </Link>
                  {userName && (
                    <p className="px-4 py-2 text-xs text-white/40">Signed in as {userName}</p>
                  )}
                  <form action={signOut} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
