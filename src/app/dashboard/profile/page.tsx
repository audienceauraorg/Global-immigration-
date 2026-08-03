export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { User, SiteSettings } from '@/lib/db/models'
import { formatDate } from '@/lib/utils'
import { User as UserIcon, Mail, Phone, Shield, Calendar, BookOpen, MessageSquare } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  await connectDB()

  const [user, settings] = await Promise.all([
    User.findById(session?.user?.id).lean(),
    SiteSettings.findOne().lean(),
  ])

  const contactEmail = settings?.contactEmail ?? 'globalimmigrationhub.ca@gmail.com'

  const initials = (user?.name ?? 'C')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-navy">My Profile</h1>
        <p className="text-navy/50 text-[13px] mt-1">
          Your account details and contact information.
        </p>
      </div>

      {/* Profile card */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        {/* Banner */}
        <div
          className="h-20"
          style={{ background: 'linear-gradient(135deg, #0B1C3A 0%, #1a3560 100%)' }}
        />

        {/* Avatar + name */}
        <div className="px-6 pb-6">
          <div className="-mt-9 mb-4 flex items-end gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #C9A84C 0%, #e8c76a 100%)',
                color: '#0B1C3A',
                boxShadow: '0 0 0 4px white',
              }}
            >
              {initials}
            </div>
            <div className="pb-1">
              <p className="font-bold text-navy text-[16px]">{user?.name ?? 'Client'}</p>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#ecfdf5', color: '#10b981' }}
              >
                Active Client
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <InfoRow icon={Mail}     label="Email"          value={user?.email ?? '—'} />
            <InfoRow icon={Phone}    label="Phone"          value={user?.phone ?? 'Not provided'} />
            <InfoRow icon={Shield}   label="Role"           value="Client" />
            <InfoRow
              icon={Calendar}
              label="Member since"
              value={user?.createdAt ? formatDate(user.createdAt.toISOString()) : '—'}
            />
          </div>
        </div>
      </div>

      {/* Get help card */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        <h2 className="text-[15px] font-bold text-navy mb-4">Need Help?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <HelpItem
            icon={MessageSquare}
            title="Email Your Consultant"
            desc="Send us a message about your application."
            href={`mailto:${contactEmail}`}
            label="Send Email"
          />
          <HelpItem
            icon={BookOpen}
            title="Book a Consultation"
            desc="Schedule a phone call with our team."
            href="/book-consult/index.htm"
            label="Book Now"
            external
          />
        </div>
      </div>

      {/* Resources */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        <h2 className="text-[15px] font-bold text-navy mb-1">Useful Resources</h2>
        <p className="text-[12px] text-navy/40 mb-4">
          Guides and information to help you through the process.
        </p>
        <div className="space-y-2">
          {[
            { label: 'Fee Schedule & Pricing', href: '/dashboard/fees' },
            { label: 'Immigration FAQs',       href: '/our-services/faqs/index.htm' },
            { label: 'Glossary of Terms',      href: '/our-services/glossary-of-terms/index.htm' },
            { label: 'Immigration Programs',   href: '/individuals/our-expertise/index.htm' },
            { label: 'Required Documents Info',href: '/individuals/permanent-resident-process/index.htm' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-medium text-navy transition-all hover:bg-navy/[0.04]"
              style={{ border: '1px solid rgba(11,28,58,0.08)' }}
            >
              {label}
              <span className="text-navy/30">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(11,28,58,0.06)' }}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#EEF0F6' }}
      >
        <Icon className="w-4 h-4 text-navy/50" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-navy/40 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13.5px] font-semibold text-navy truncate">{value}</p>
      </div>
    </div>
  )
}

function HelpItem({
  icon: Icon, title, desc, href, label, external,
}: {
  icon: React.ElementType
  title: string
  desc: string
  href: string
  label: string
  external?: boolean
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: '#EEF0F6' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'white' }}
      >
        <Icon className="w-4 h-4 text-navy/60" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-navy">{title}</p>
        <p className="text-[11.5px] text-navy/50 mt-0.5">{desc}</p>
      </div>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="self-start text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: 'linear-gradient(135deg, #C9A84C, #e8c76a)',
          color: '#0B1C3A',
        }}
      >
        {label}
      </a>
    </div>
  )
}
