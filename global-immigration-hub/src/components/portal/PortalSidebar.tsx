import Link from 'next/link'
import { ArrowLeft, LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import PortalNavLinks from './PortalNavLinks'

interface PortalSidebarProps {
  siteName: string
  user: { name: string; email: string; initials: string }
}

export default function PortalSidebar({ siteName, user }: PortalSidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col w-60 flex-shrink-0"
      style={{
        background: '#0B1C3A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/wp-content/uploads/2020/06/logo_transparent.png"
          alt={siteName}
          className="h-10 w-auto flex-shrink-0"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <PortalNavLinks />
      </nav>

      {/* Secondary links */}
      <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="pt-3 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors text-white/40 hover:text-white/70"
          >
            <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
            Main Site
          </Link>
          <form action={signOut} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors text-left text-white/40 hover:text-white/70"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Sign out
            </button>
          </form>
        </div>
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
            <p className="text-[12.5px] font-semibold text-white truncate leading-tight">{user.name}</p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
