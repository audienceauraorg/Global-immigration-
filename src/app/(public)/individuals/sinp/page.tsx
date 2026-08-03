import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function SINPPage() {
  return (
    <>
      <PageHero
        title="SINP – Saskatchewan Immigration Nominee Program"
        subtitle="A provincial nomination pathway designed for skilled workers who want to make Saskatchewan their permanent home."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Individuals', href: '/individuals' },
          { label: 'SINP', href: '/individuals/sinp' },
        ]}
        tag="Provincial Nominee Program"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">What is the SINP?</h2>
                <p className="text-navy/65 leading-relaxed mb-4">
                  The provincial program of nomination offers an alternative route to immigrate to Canada on the basis of
                  the skill set required by the nominating province. The Saskatchewan Immigrant Nominee Program (SINP)
                  offers you a way to immigrate to Canada as a permanent resident.
                </p>
                <p className="text-navy/65 leading-relaxed">
                  Through the SINP, Saskatchewan invites residency applications from non-Canadians who want to make
                  Saskatchewan their home, and nominates successful applicants to the federal government so they can gain
                  permanent residency in Canada.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-navy mb-5">How Does It Work?</h2>
                <div className="space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Provincial Nomination',
                      desc: 'Saskatchewan nominates candidates who meet the province\'s criteria — based on skills, education, job offers, or other factors.',
                    },
                    {
                      step: '02',
                      title: 'Federal Application',
                      desc: 'Nominated candidates then apply to Immigration, Refugees and Citizenship Canada (IRCC) for permanent residence.',
                    },
                    {
                      step: '03',
                      title: 'Permanent Residency',
                      desc: 'Successful applicants receive Canadian permanent residency and can live and work anywhere in Canada.',
                    },
                  ].map(item => (
                    <div
                      key={item.step}
                      className="flex gap-5 p-5 rounded-2xl border"
                      style={{ borderColor: 'rgba(11,28,58,0.08)', background: '#F8F7F4' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)', color: '#071428' }}
                      >
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-navy font-semibold mb-1">{item.title}</h3>
                        <p className="text-navy/60 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-navy mb-5">Key Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Faster pathway to permanent residency',
                    'No Express Entry pool requirement for some streams',
                    'Pathway for workers already in Saskatchewan',
                    'Employment offer can strengthen your application',
                    'Eligible for federal permanent residence after nomination',
                    'Family members can accompany you',
                  ].map(benefit => (
                    <div key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-navy/70 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-7 border-l-4"
                style={{ borderColor: '#C9A84C', background: 'rgba(201,168,76,0.05)' }}
              >
                <p className="text-navy/70 text-base leading-relaxed italic">
                  &ldquo;We will help you choose the correct admission category and prepare all the necessary documents
                  to ensure your speedy and successful admission into Canada.&rdquo;
                </p>
                <p className="text-gold text-sm font-semibold mt-3">— Global Immigration Hub</p>
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
                  Ready to apply for the SINP?
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">
                  Create your client account and our team will walk you through every step of the SINP application
                  process.
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
                    { label: 'International Skilled Worker', href: '/individuals/international-skilled-worker' },
                    { label: 'Work Permits', href: '/individuals/work-permits' },
                    { label: 'Express Entry / PR', href: '/individuals' },
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
