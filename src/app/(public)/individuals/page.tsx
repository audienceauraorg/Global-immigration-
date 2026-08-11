import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { ArrowRight, MapPin, Globe, Briefcase, Heart, GraduationCap, ChevronRight } from 'lucide-react'
import { auth } from '@/auth'

const programs = [
  {
    icon: MapPin,
    tag: 'Provincial Nominee',
    title: 'SINP – Saskatchewan',
    desc: 'The Saskatchewan Immigrant Nominee Program offers a direct pathway to permanent residency for skilled workers who want to make Saskatchewan their home.',
    href: '/individuals/sinp',
  },
  {
    icon: Globe,
    tag: 'Skilled Worker',
    title: 'International Skilled Worker',
    desc: 'Nominate skilled workers through employment offers, in-demand occupations, or Saskatchewan Express Entry for those already in the IRCC pool.',
    href: '/individuals/international-skilled-worker',
  },
  {
    icon: Heart,
    tag: 'Family Class',
    title: 'Spousal Sponsorship',
    desc: 'Sponsor your spouse, common-law partner, or conjugal partner to immigrate to Canada as a permanent resident.',
    href: '/individuals/spousal-sponsorship',
  },
  {
    icon: Briefcase,
    tag: 'Temporary',
    title: 'Work Permits',
    desc: 'Open, closed, and post-graduate work permits for foreign nationals — whether applying from inside or outside Canada.',
    href: '/individuals/work-permits',
  },
  {
    icon: GraduationCap,
    tag: 'Study',
    title: 'Study in Canada',
    desc: 'International study permits with pathways to post-graduate work and permanent residency. Canada offers world-class education with strong supports.',
    href: '/individuals/study-in-canada',
  },
]

export default async function IndividualsPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const dashboardHref = session?.user?.role === 'client' ? '/dashboard' : '/admin/dashboard'

  return (
    <>
      <PageHero
        title="Immigration Services for Individuals"
        subtitle="From permanent residency to study permits — we guide you through the right Canadian immigration pathway for your unique situation."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Individuals', href: '/individuals' },
        ]}
        tag="For Individuals & Families"
      />

      {/* Intro section */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-navy text-xs font-semibold tracking-wider uppercase">Our Expertise</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-5 leading-tight">
                Committed to Your Success — Every File, Every Time
              </h2>
              <p className="text-navy/65 leading-relaxed mb-4">
                Canada accepts over 220,000 individuals in various immigration categories every year. Because of the
                complex forms, documents, and procedures that must be completed in full, having a professional who is
                knowledgeable in Immigration Law is essential.
              </p>
              <p className="text-navy/65 leading-relaxed mb-4">
                Global Immigration Hub has a very high success rate. We will help you choose the correct admission
                category into Canada, then prepare all the necessary documents to ensure your speedy and successful
                admission. You can trust that your file will be handled with professionalism, integrity, and the
                utmost discretion.
              </p>
              <p className="text-navy/65 leading-relaxed mb-8">
                The end result will be an application that is accurate, on time, and will get you great results.
              </p>
              <Link
                href={isLoggedIn ? dashboardHref : '/signup'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
              >
                {isLoggedIn ? 'Go to My Dashboard' : 'Start Your Application'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Sidebar CTA */}
            <div>
              <div
                className="rounded-2xl p-7 sticky top-24"
                style={{ background: 'linear-gradient(135deg, #0B1C3A, #0f2650)' }}
              >
                <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-3">Free Consultation</p>
                <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                  Not sure which program is right for you?
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">
                  Book a free consultation with a CICC-regulated consultant. We will assess your situation and
                  recommend the best pathway.
                </p>
                <Link
                  href={isLoggedIn ? dashboardHref : '/signup'}
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90 mb-3"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                >
                  {isLoggedIn ? 'My Dashboard' : 'Enroll Now'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs grid */}
      <section className="py-14 sm:py-20" style={{ background: '#F8F7F4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">Explore Our Programs</h2>
            <p className="text-navy/50 text-base max-w-xl mx-auto">
              Select a program below to learn more about eligibility, the process, and how we can help.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map(prog => (
              <Link
                key={prog.title}
                href={prog.href}
                className="group bg-white rounded-2xl p-7 border transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'rgba(11,28,58,0.08)' }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(11,28,58,0.06)' }}
                  >
                    <prog.icon className="w-5 h-5 text-navy" />
                  </div>
                  <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                    {prog.tag}
                  </span>
                </div>
                <h3 className="text-navy font-bold text-lg mb-2 group-hover:text-gold transition-colors">
                  {prog.title}
                </h3>
                <p className="text-navy/55 text-sm leading-relaxed mb-4">{prog.desc}</p>
                <div className="flex items-center gap-1.5 text-gold text-sm font-semibold">
                  Learn more
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
