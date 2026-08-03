import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { ArrowRight, CheckCircle, Briefcase, Globe, Zap } from 'lucide-react'

const subcategories = [
  {
    icon: Briefcase,
    title: 'Employment Offer',
    desc: 'For skilled workers who have a valid job offer for a skilled occupation in Saskatchewan and meet the SINP eligibility criteria for this sub-category.',
    points: [
      'Must have a genuine job offer from a Saskatchewan employer',
      'Occupation must be classified as skilled (NOC 0, A, or B)',
      'Employer may need to complete recruitment efforts',
      'Work permit may be obtained while application is processed',
    ],
  },
  {
    icon: Globe,
    title: 'In-Demand Occupations',
    desc: 'For skilled workers who do not have a job offer in Saskatchewan but are highly skilled in an occupation that is in demand in the province.',
    points: [
      'No job offer required — occupation must be in-demand in Saskatchewan',
      'Must meet minimum education and language requirements',
      'Points-based assessment system',
      'Strong candidates may receive an invitation to apply',
    ],
  },
  {
    icon: Zap,
    title: 'Saskatchewan Express Entry',
    desc: 'For skilled workers already in the federal IRCC Express Entry pool who want to receive a provincial nomination from Saskatchewan to boost their CRS score.',
    points: [
      'Must have an active Express Entry profile',
      'Provincial nomination adds 600 points to your CRS score',
      'Virtually guarantees an Invitation to Apply (ITA)',
      'Must intend to live and work in Saskatchewan',
    ],
  },
]

export default function InternationalSkilledWorkerPage() {
  return (
    <>
      <PageHero
        title="International Skilled Worker Category"
        subtitle="Three pathways for skilled workers who want to live and work in Saskatchewan — with or without a job offer."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Individuals', href: '/individuals' },
          { label: 'International Skilled Worker', href: '/individuals/international-skilled-worker' },
        ]}
        tag="SINP – Skilled Worker"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">Overview</h2>
                <p className="text-navy/65 leading-relaxed mb-4">
                  Under the International Skilled Worker Category, the SINP can nominate skilled workers who want to
                  live and work in Saskatchewan. You&apos;ll need to meet the SINP criteria and have factors that will
                  help you settle successfully in the province.
                </p>
                <p className="text-navy/65 leading-relaxed">
                  Key settlement factors considered include education, skilled work experience, and English or French
                  language ability. There are three sub-categories depending on your situation.
                </p>
              </div>

              <div className="space-y-6">
                {subcategories.map(sub => (
                  <div
                    key={sub.title}
                    className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: 'rgba(11,28,58,0.08)' }}
                  >
                    <div className="flex items-center gap-4 p-6 border-b" style={{ borderColor: 'rgba(11,28,58,0.06)', background: '#F8F7F4' }}>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                      >
                        <sub.icon className="w-5 h-5 text-navy" />
                      </div>
                      <h3 className="text-navy font-bold text-lg">{sub.title}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-navy/65 text-sm leading-relaxed mb-5">{sub.desc}</p>
                      <div className="space-y-2.5">
                        {sub.points.map(pt => (
                          <div key={pt} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                            <span className="text-navy/70 text-sm">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-7 border-l-4"
                style={{ borderColor: '#C9A84C', background: 'rgba(201,168,76,0.05)' }}
              >
                <h3 className="text-navy font-bold mb-2">Not sure which sub-category applies to you?</h3>
                <p className="text-navy/65 text-sm leading-relaxed mb-4">
                  Our CICC-regulated consultants will assess your profile, review your work history and education, and
                  identify which sub-category gives you the best chance of success.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:opacity-80 transition-opacity"
                >
                  Start a free assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div
                className="rounded-2xl p-7 sticky top-24"
                style={{ background: 'linear-gradient(135deg, #0B1C3A, #0f2650)' }}
              >
                <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-3">Get Started</p>
                <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                  Ready to apply?
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">
                  Create your client account and we&apos;ll assess which sub-category best fits your profile.
                </p>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90 mb-3"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                >
                  Start My Application
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  Book a Free Consultation
                </Link>
              </div>

              <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: 'rgba(11,28,58,0.08)' }}>
                <h4 className="text-navy font-semibold text-sm mb-3">Related Programs</h4>
                <div className="space-y-2">
                  {[
                    { label: 'SINP Overview', href: '/individuals/sinp' },
                    { label: 'Work Permits', href: '/individuals/work-permits' },
                    { label: 'Study in Canada', href: '/individuals/study-in-canada' },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between py-2 text-sm text-navy/70 hover:text-gold transition-colors border-b last:border-0"
                      style={{ borderColor: 'rgba(11,28,58,0.06)' }}
                    >
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
