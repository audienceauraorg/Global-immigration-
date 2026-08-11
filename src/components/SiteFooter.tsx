import Link from 'next/link'
import { Globe, Mail, ExternalLink } from 'lucide-react'
import { getSiteSettings } from '@/lib/settings'
import { auth } from '@/auth'

const programs = [
  { label: 'SINP – Occupations In-Demand', href: '/#programs' },
  { label: 'Saskatchewan Experience', href: '/#programs' },
  { label: 'Express Entry / PR', href: '/#programs' },
  { label: 'Spousal Sponsorship', href: '/#programs' },
  { label: 'Work Permits', href: '/#programs' },
  { label: 'Study Permits', href: '/#programs' },
]

const staticQuickLinks = [
  { label: 'Individuals', href: '/#programs' },
  { label: 'Employers', href: '/#employers' },
  { label: 'Services', href: '/#services' },
  { label: 'Fee Schedule', href: '/fees' },
  { label: 'Our Team', href: '/#team' },
  { label: 'Contact Us', href: '/#contact' },
  { label: 'Privacy Policy', href: '/privacy' },
]

export default async function SiteFooter() {
  const [settings, session] = await Promise.all([getSiteSettings(), auth()])

  const isLoggedIn = !!session?.user
  const role = session?.user?.role ?? 'client'
  const dashboardHref = role === 'client' ? '/dashboard' : '/admin/dashboard'

  const siteName     = settings?.siteName ?? 'Global Immigration Hub'
  const siteTagline  = settings?.siteTagline ?? 'Your trusted immigration partner'
  const rcicNumber   = settings?.rcicNumber
  const contactEmail = settings?.contactEmail

  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Brand column */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
            >
              <Globe className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">{siteName}</p>
              <p className="text-gold text-[10px] font-medium tracking-wider uppercase">Immigration Consultants</p>
            </div>
          </div>
          <p className="text-white/50 text-sm leading-relaxed mb-5">{siteTagline}</p>

          {/* CICC badge */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/30 bg-gold/10 mb-4">
            <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            <span className="text-gold text-xs font-semibold">CICC Regulated</span>
          </div>

          {rcicNumber && (
            <p className="text-white/40 text-xs mt-1">RCIC Registration: {rcicNumber}</p>
          )}
        </div>

        {/* Programs column */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Immigration Programs</h4>
          <ul className="space-y-2.5">
            {programs.map(p => (
              <li key={p.label}>
                <Link
                  href={p.href}
                  className="text-white/50 text-sm hover:text-gold transition-colors"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links column */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {staticQuickLinks.map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-white/50 text-sm hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={isLoggedIn ? dashboardHref : '/login'}
                className="text-white/50 text-sm hover:text-gold transition-colors"
              >
                {isLoggedIn ? 'My Dashboard' : 'Client Portal'}
              </Link>
            </li>
            {!isLoggedIn && (
              <li>
                <Link href="/signup" className="text-white/50 text-sm hover:text-gold transition-colors">
                  Enroll Now
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Get in Touch</h4>
          <div className="space-y-4">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Email Us</p>
                  <p className="text-white/70 text-sm group-hover:text-white transition-colors break-all">{contactEmail}</p>
                </div>
              </a>
            )}

            <div className="pt-2">
              <p className="text-white/40 text-xs mb-3">Schedule a Consultation</p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-navy transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
              >
                Book a Consult
              </Link>
            </div>

            <div className="pt-2">
              <p className="text-white/40 text-xs mb-3">Follow Us</p>
              <a
                href="https://web.facebook.com/immigrationandrelocation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lower bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>
            © {year} {siteName}. All rights reserved.
            {rcicNumber && ` · RCIC: ${rcicNumber}`}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link
              href={isLoggedIn ? dashboardHref : '/signup'}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-navy transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)', fontSize: '11px' }}
            >
              {isLoggedIn ? 'Dashboard →' : 'Enroll Now →'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
