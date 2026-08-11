import { auth } from '@/auth'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import PublicPortalSidebar from '@/components/PublicPortalSidebar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const isLoggedIn = !!session?.user
  const role = session?.user?.role ?? 'client'

  // Only show the portal sidebar for regular clients (not admin/staff who have their own dashboard)
  const showSidebar = isLoggedIn && role === 'client'

  const fullName = session?.user?.name ?? 'Client'
  const email    = session?.user?.email ?? ''
  const initials = fullName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7F4' }}>
      <SiteHeader variant="public" />
      <div className="flex flex-1 min-h-0">
        {showSidebar && (
          <PublicPortalSidebar user={{ name: fullName, email, initials }} />
        )}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SiteFooter />
    </div>
  )
}
