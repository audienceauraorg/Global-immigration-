'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Clock, UserCircle, CreditCard } from 'lucide-react'

const NAV = [
  { label: 'Overview',      href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Documents',     href: '/dashboard/documents',  icon: FileText },
  { label: 'Fees & Services', href: '/dashboard/fees',    icon: CreditCard },
  { label: 'Activity',      href: '/dashboard/activity',   icon: Clock },
  { label: 'Profile',       href: '/dashboard/profile',    icon: UserCircle },
]

export default function PortalNavLinks() {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      <p
        className="px-3 mb-4 text-[10px] font-bold tracking-[0.12em] uppercase"
        style={{ color: 'rgba(255,255,255,0.28)' }}
      >
        My Application
      </p>
      {NAV.map(({ label, href, icon: Icon }) => {
        // Exact match for root dashboard; prefix match for sub-pages
        const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150"
            style={
              active
                ? {
                    background: 'linear-gradient(135deg, #C9A84C 0%, #e8c76a 100%)',
                    color: '#0B1C3A',
                    boxShadow: '0 2px 8px rgba(201,168,76,0.35)',
                  }
                : { color: 'rgba(255,255,255,0.55)' }
            }
            onMouseEnter={e => {
              if (!active) {
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLElement).style.color = '#fff'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                ;(e.currentTarget as HTMLElement).style.background = ''
                ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
              }
            }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
