export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'
import PortalSidebar from '@/components/portal/PortalSidebar'
import PortalMobileNav from '@/components/portal/PortalMobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()])

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'admin' || session.user.role === 'staff') {
    redirect('/admin/dashboard')
  }

  const siteName = (settings?.siteName as string | undefined) ?? 'Global Immigration Hub'

  const fullName = session.user.name ?? 'Client'
  const email    = session.user.email ?? ''
  const initials = fullName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#EEF0F6' }}>
      {/* Fixed sidebar — desktop only */}
      <PortalSidebar siteName={siteName} user={{ name: fullName, email, initials }} />

      {/* Scrollable main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Mobile top header — hidden on desktop */}
        <header
          className="lg:hidden flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{
            background: '#0B1C3A',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#e8c76a)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1C3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-[12px] font-bold leading-tight">{siteName}</p>
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: '#C9A84C' }}>
                Client Portal
              </p>
            </div>
          </div>
          {/* User avatar chip */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#C9A84C,#e8c76a)',
                color: '#0B1C3A',
              }}
            >
              {initials}
            </div>
            <span className="text-[11.5px] font-semibold text-white/70 hidden sm:block">
              {fullName.split(' ')[0]}
            </span>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-8 pb-28 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Bottom tab bar — mobile only */}
      <PortalMobileNav />
    </div>
  )
}
