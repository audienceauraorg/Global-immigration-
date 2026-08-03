import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F7F4' }}>
      <SiteHeader variant="public" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
