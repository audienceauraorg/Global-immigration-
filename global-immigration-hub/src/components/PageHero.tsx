import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href: string
}

interface PageHeroProps {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  tag?: string
}

export default function PageHero({ title, subtitle, breadcrumbs, tag }: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden py-14 sm:py-20"
      style={{ background: 'linear-gradient(135deg, #071428 0%, #0B1C3A 60%, #0f2650 100%)' }}
    >
      {/* Decorative orb */}
      <div
        className="absolute top-[-20%] right-[-8%] w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 mb-5 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/25" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-white/50 text-sm">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-white/50 text-sm hover:text-white/80 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {tag && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-wider uppercase">{tag}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/55 text-lg max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', height: '40px', width: '100%' }}>
          <path d="M0 40L1440 40L1440 15C1200 40 960 5 720 15C480 25 240 5 0 15L0 40Z" fill="#F8F7F4" />
        </svg>
      </div>
    </section>
  )
}
