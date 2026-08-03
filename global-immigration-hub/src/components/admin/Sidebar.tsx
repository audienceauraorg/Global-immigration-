'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FolderOpen, Settings, LogOut, Globe, Bell, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/actions/auth'

const navItems = [
  { href: '/admin/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/clients',        label: 'Clients',       icon: Users },
  { href: '/admin/programs',       label: 'Programs',      icon: FolderOpen },
  { href: '/admin/consultations',  label: 'Consultations', icon: CalendarCheck },
  { href: '/admin/notifications',  label: 'Notifications', icon: Bell },
  { href: '/admin/settings',       label: 'Settings',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-navy flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-navy" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Global Immigration</p>
            <p className="text-gold text-xs font-medium">Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gold text-navy shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
