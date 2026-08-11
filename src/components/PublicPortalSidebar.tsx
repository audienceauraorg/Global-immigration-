'use client'
import Link from 'next/link'
import { LayoutDashboard, FileText, CreditCard, Clock, UserCircle, ArrowRight, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface PublicPortalSidebarProps {
  user: { name: string; email: string; initials: string }
}

const navItems = [
  { label: 'Overview',       href: '/dashboard',            icon: LayoutDashboard },
  { label: 'Documents',      href: '/dashboard/documents',   icon: FileText },
  { label: 'Fees & Services',href: '/dashboard/fees',        icon: CreditCard },
  { label: 'Activity',       href: '/dashboard/activity',    icon: Clock },
  { label: 'Profile',        href: '/dashboard/profile',     icon: UserCircle },
]

export default function PublicPortalSidebar({ user }: PublicPortalSidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen"
      style={{
        background: '#0B1C3A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Link href="/" title="Back to main site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wp-content/uploads/2020/06/logo_transparent.png"
            alt="Global Immigration Hub"
            className="h-9 w-auto"
          />
        </Link>
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-2">
        <p
          className="text-[10px] font-bold tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          My Portal
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = ''
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
            }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div
        className="px-3 pb-3 space-y-0.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="pt-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #e8c76a 100%)',
              color: '#0B1C3A',
            }}
          >
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            Go to Dashboard
          </Link>
        </div>
        <form action={signOut} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
            }}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            Sign out
          </button>
        </form>
      </div>

      {/* User chip */}
      <div
        className="px-4 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #C9A84C 0%, #e8c76a 100%)',
              color: '#0B1C3A',
            }}
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{user.name}</p>
            <p className="text-[10.5px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
