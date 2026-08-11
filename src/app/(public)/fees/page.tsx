import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import {
  PROGRAM_KEYS,
  OFFICIAL_FEES,
  AGENCY_FEES,
  PROGRAM_DOCUMENTS,
  CONSULTATION_FEE,
  fmt,
  type ProgramKey,
} from '@/lib/fees'
import { auth } from '@/auth'

export const metadata = {
  title: 'Fee Schedule | Global Immigration Hub',
  description:
    'Transparent pricing for every Canadian immigration program — official IRCC government fees, agency service fees, and consultation pricing.',
}

export default async function FeesPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  const dashboardHref = session?.user?.role === 'client' ? '/dashboard' : '/admin/dashboard'

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="bg-navy py-16 px-4 text-center">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-gold/70 mb-3">
          Transparent Pricing
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
          Immigration Fee Schedule
        </h1>
        <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          All official IRCC government fees and our professional service rates in one place.
          No surprises, no hidden charges — all fees are in Canadian dollars.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/#contact"
            className="px-6 py-3 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#C9A84C,#e8c76a)' }}
          >
            Book a Consultation →
          </Link>
          <Link
            href={isLoggedIn ? dashboardHref : '/signup'}
            className="px-6 py-3 rounded-xl text-sm font-bold border transition-colors"
            style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C' }}
          >
            {isLoggedIn ? 'My Dashboard' : 'Enroll Now'}
          </Link>
        </div>
      </section>

      {/* ── Consultation fee strip ──────────────────────────────── */}
      <div className="bg-amber-50 border-b-2 border-amber-200 py-4 px-4 text-center">
        <span className="text-sm font-bold text-navy">
          Initial Consultation Fee: ${CONSULTATION_FEE} CAD&ensp;·&ensp;
        </span>
        <span className="text-sm text-amber-800">
          Your agent will contact you regarding payment arrangements.
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-16">

        {/* ── Service tier cards ──────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-navy">Choose Your Service Level</h2>
            <p className="text-navy/50 text-sm mt-2 max-w-lg mx-auto">
              Our agency fee varies based on how much support you want from our team.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">

            {/* Full Handling */}
            <div
              className="rounded-2xl p-7 relative"
              style={{ background: '#0B1C3A' }}
            >
              <span
                className="absolute -top-3 left-5 text-[10px] font-black px-3 py-1 rounded-full"
                style={{ background: '#C9A84C', color: '#0B1C3A' }}
              >
                RECOMMENDED
              </span>
              <h3 className="text-gold font-bold text-lg mb-3 mt-1">Full Agent Handling</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                Your dedicated RCIC manages the entire process — collecting documents, completing
                all forms, communicating with IRCC, and tracking your application to completion.
              </p>
              <ul className="space-y-2">
                {[
                  'Document collection & review',
                  'All forms prepared by our team',
                  'IRCC submission & correspondence',
                  'Status updates throughout',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Filing Only */}
            <div className="rounded-2xl p-7 border-2 border-navy/10 bg-white">
              <h3 className="text-navy font-bold text-lg mb-3">Agency-Assisted Filing</h3>
              <p className="text-navy/60 text-sm leading-relaxed mb-4">
                You gather and organize your own documents. Our agent then reviews everything,
                completes all official forms, and submits your application to IRCC on your behalf.
              </p>
              <ul className="space-y-2">
                {[
                  'Document checklist provided',
                  'All forms prepared by our team',
                  'IRCC submission & correspondence',
                  'Status updates throughout',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-navy/60">
                    <CheckCircle2 className="w-4 h-4 text-navy/30 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Fee comparison table ────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-navy">Fee Comparison by Program</h2>
            <p className="text-navy/50 text-sm mt-2">
              Official IRCC fees are paid directly to the Government of Canada — not to us.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-navy text-left">
                  <th className="px-5 py-4 text-gold font-bold text-xs uppercase tracking-wider rounded-tl-2xl w-[30%]">
                    Program
                  </th>
                  <th className="px-5 py-4 text-white/70 font-semibold text-xs uppercase tracking-wider">
                    Official Fee (IRCC)
                  </th>
                  <th className="px-5 py-4 text-white/70 font-semibold text-xs uppercase tracking-wider">
                    Agency — Filing Only
                  </th>
                  <th className="px-5 py-4 text-gold font-bold text-xs uppercase tracking-wider rounded-tr-2xl">
                    Agency — Full Handling ★
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROGRAM_KEYS.map((key: ProgramKey, i) => {
                  const official = OFFICIAL_FEES[key]
                  const agency   = AGENCY_FEES[key]
                  return (
                    <tr
                      key={key}
                      className="hover:bg-slate-50 transition-colors"
                      style={{ background: i % 2 === 0 ? '#fff' : '#fafbfc' }}
                    >
                      <td className="px-5 py-4 font-bold text-navy">{key}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {fmt(official.total)}
                        {official.note && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{official.note}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="font-semibold text-navy">{fmt(agency.filingOnly)}</span>
                        {official.total > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Total: {fmt(official.total + agency.filingOnly)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 bg-amber-50">
                        <span className="font-bold text-navy">{fmt(agency.fullHandling)}</span>
                        {official.total > 0 && (
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Total: {fmt(official.total + agency.fullHandling)}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-4 text-[12px] text-slate-400 rounded-b-2xl"
                    style={{ background: '#f8fafc' }}
                  >
                    ★ Full Agent Handling is our recommended service level.
                    Official fees are paid directly to IRCC and are not collected by Global Immigration Hub.
                    Fees may vary based on family size and application complexity. Sourced from ircc.canada.ca as of 2025.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Required documents ──────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-navy">Required Documents by Program</h2>
            <p className="text-navy/50 text-sm mt-2 max-w-lg mx-auto">
              Typical documents required for each program. Your consultant will provide a personalised checklist.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAM_KEYS.map((key: ProgramKey) => (
              <div
                key={key}
                className="bg-white rounded-2xl p-6 border border-slate-200"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                <h3 className="font-bold text-navy text-[14px] mb-4 pb-3 border-b border-slate-100">
                  {key}
                </h3>
                <ul className="space-y-2">
                  {PROGRAM_DOCUMENTS[key].map((doc, j) => (
                    <li key={j} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                      <span className="text-gold font-bold flex-shrink-0 mt-0.5">›</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl px-8 py-12 text-center"
          style={{ background: 'linear-gradient(135deg,#0B1C3A,#1a3560)' }}
        >
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
            Book a ${CONSULTATION_FEE} CAD consultation with a licensed RCIC. Your agent will be in touch to confirm and arrange payment.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/#contact"
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#e8c76a)' }}
            >
              Book a Consultation →
            </Link>
            <Link
              href={isLoggedIn ? dashboardHref : '/signup'}
              className="px-7 py-3.5 rounded-xl text-sm font-bold border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)' }}
            >
              {isLoggedIn ? 'My Dashboard' : 'Enroll Now'}
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
