import Link from 'next/link'
import PageHero from '@/components/PageHero'
import { ArrowRight, CheckCircle, Heart } from 'lucide-react'

const eligibilityItems = [
  'The person you want to sponsor is a member of the family class.',
  'You are 18 years of age or older.',
  'You are a Canadian citizen or permanent resident.',
  'You reside in Canada (or intend to reside in Canada upon their arrival).',
  'You sign an undertaking promising to provide for the basic requirements of the person being sponsored.',
  'Both you and the person being sponsored sign an agreement confirming you understand your mutual obligations.',
]

const partnerTypes = [
  {
    title: 'Spouse',
    desc: 'Legally married to the sponsor in a marriage recognized by both the country where it took place and under Canadian law.',
  },
  {
    title: 'Common-Law Partner',
    desc: 'Has cohabited with the sponsor in a conjugal relationship for at least one continuous year.',
  },
  {
    title: 'Conjugal Partner',
    desc: 'Has maintained a conjugal relationship with the sponsor for at least one year but cannot cohabit due to exceptional circumstances.',
  },
]

export default function SpousalSponsorshipPage() {
  return (
    <>
      <PageHero
        title="Spousal & Partner Sponsorship"
        subtitle="Keep your family together. Sponsor your spouse, common-law partner, or conjugal partner to become a permanent resident of Canada."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Individuals', href: '/individuals' },
          { label: 'Spousal Sponsorship', href: '/individuals/spousal-sponsorship' },
        ]}
        tag="Family Class Sponsorship"
      />

      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">

              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">Overview</h2>
                <p className="text-navy/65 leading-relaxed mb-4">
                  Global Immigration Hub specializes in processing Family Class Sponsorship for spouses, common-law, and
                  conjugal partners. If your spouse or partner lives outside of Canada — or if you recently married
                  someone outside of Canada — you may be eligible to sponsor them to immigrate to Canada as a permanent
                  resident.
                </p>
                <p className="text-navy/65 leading-relaxed">
                  This is one of the most emotionally significant immigration files we handle. Our team works with
                  professionalism, care, and discretion to reunite families as quickly as possible.
                </p>
              </div>

              {/* Who can be sponsored */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-5">Who Can Be Sponsored?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {partnerTypes.map(pt => (
                    <div
                      key={pt.title}
                      className="rounded-2xl p-5 border text-center"
                      style={{ borderColor: 'rgba(11,28,58,0.08)', background: '#F8F7F4' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
                      >
                        <Heart className="w-4 h-4 text-navy" />
                      </div>
                      <h3 className="text-navy font-bold text-sm mb-2">{pt.title}</h3>
                      <p className="text-navy/55 text-xs leading-relaxed">{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-5">Eligibility Requirements for Sponsors</h2>
                <p className="text-navy/65 text-sm leading-relaxed mb-5">
                  To sponsor a spouse or partner to Canada, you must meet all of the following criteria:
                </p>
                <div className="space-y-3">
                  {eligibilityItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: 'rgba(11,28,58,0.06)', background: '#F8F7F4' }}>
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-navy/70 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-7 border-l-4"
                style={{ borderColor: '#C9A84C', background: 'rgba(201,168,76,0.05)' }}
              >
                <h3 className="text-navy font-bold mb-2">Important Note</h3>
                <p className="text-navy/65 text-sm leading-relaxed">
                  If you are a Canadian citizen living outside of Canada, you may still be eligible to sponsor your
                  spouse or common-law partner — provided you demonstrate your intent to reside in Canada once they
                  become a permanent resident.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div
                className="rounded-2xl p-7 sticky top-24"
                style={{ background: 'linear-gradient(135deg, #0B1C3A, #0f2650)' }}
              >
                <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-3">Reunite Your Family</p>
                <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                  Start the sponsorship process today
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">
                  Our team handles every form, document, and deadline so you can focus on what matters — being together.
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
