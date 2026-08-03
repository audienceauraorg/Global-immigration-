import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader variant="public" />

      {/* Dark hero-style section containing the form */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden py-14 px-4"
        style={{ background: 'linear-gradient(135deg, #071428 0%, #0B1C3A 60%, #0f2650 100%)' }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-[-15%] right-[-8%] w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
        />
        <div
          className="absolute bottom-[-15%] left-[-8%] w-80 h-80 rounded-full opacity-8 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
        />

        {/* Form content */}
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
