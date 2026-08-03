'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, CreditCard, Clock, UserCircle } from 'lucide-react'

const NAV = [
  { label: 'Overview',  href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Documents', href: '/dashboard/documents',  icon: FileText },
  { label: 'Fees',      href: '/dashboard/fees',       icon: CreditCard },
  { label: 'Activity',  href: '/dashboard/activity',   icon: Clock },
  { label: 'Profile',   href: '/dashboard/profile',    icon: UserCircle },
]

export default function PortalMobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: '#0B1C3A',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-all"
            style={{ color: active ? '#C9A84C' : 'rgba(255,255,255,0.38)' }}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
