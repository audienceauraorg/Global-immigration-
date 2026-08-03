'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useTransition } from 'react'
import { CheckCircle2, Star, FileText, CreditCard, AlertCircle, Loader2, Clock, MinusCircle } from 'lucide-react'
import {
  PROGRAM_KEYS,
  OFFICIAL_FEES,
  AGENCY_FEES,
  PROGRAM_DOCUMENTS,
  fmt,
  type ProgramKey,
} from '@/lib/fees'

interface CaseData {
  _id: string
  programSnapshot?: { name?: string; country?: string }
  serviceTier?: 'full_handling' | 'filing_only'
  officialFee?: number
  agencyFee?: number
}

interface FeeItem {
  _id: string
  label: string
  amount: number
  category: 'government' | 'agency' | 'consultation' | 'other'
  status: 'unpaid' | 'paid' | 'waived'
  paidAt?: string
  note?: string
}

export default function FeesPage() {
  const [caseData, setCaseData]   = useState<CaseData | null>(null)
  const [fees, setFees]           = useState<FeeItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [tier, setTier]           = useState<'full_handling' | 'filing_only'>('full_handling')
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isPending, startTransition] = useTransition()

  function loadFees() {
    fetch('/api/my-fees')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFees(data) })
      .catch(() => {})
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/my-case').then(r => r.json()).catch(() => null),
      fetch('/api/my-fees').then(r => r.json()).catch(() => []),
    ]).then(([caseRes, feesRes]) => {
      if (caseRes && caseRes._id) {
        setCaseData(caseRes)
        if (caseRes.serviceTier) setTier(caseRes.serviceTier)
      }
      if (Array.isArray(feesRes)) setFees(feesRes)
    }).finally(() => setLoading(false))
  }, [])

  const programName = (caseData?.programSnapshot?.name ?? '') as ProgramKey
  const isKnownProgram = PROGRAM_KEYS.includes(programName as ProgramKey)
  const official   = isKnownProgram ? OFFICIAL_FEES[programName] : null
  const agency     = isKnownProgram ? AGENCY_FEES[programName]   : null
  const docs       = isKnownProgram ? PROGRAM_DOCUMENTS[programName] : []

  const agencyFee  = agency ? (tier === 'full_handling' ? agency.fullHandling : agency.filingOnly) : 0
  const total      = (official?.total ?? 0) + agencyFee

  // After save, reload fees (tier change re-seeds them)
  function handleSaveWithReload(caseId: string, newTier: 'full_handling' | 'filing_only') {
    setSaved(false)
    setSaveError('')
    startTransition(() => {
      fetch('/api/service-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, tier: newTier }),
      })
        .then(r => r.json())
        .then(res => {
          if (res.ok) {
            setSaved(true)
            setCaseData(prev => prev ? { ...prev, serviceTier: newTier, officialFee: res.officialFee, agencyFee: res.agencyFee } : prev)
            loadFees()
          } else {
            setSaveError(res.error ?? 'Failed to save. Please try again.')
          }
        })
        .catch(() => setSaveError('Network error. Please try again.'))
    })
  }

  function handleSave() {
    if (!caseData?._id) return
    handleSaveWithReload(caseData._id, tier)
  }

  const tierChanged = caseData?.serviceTier !== tier

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-gold" /> Fees &amp; Services
        </h1>
        <p className="text-navy/50 mt-1 text-sm">
          Review your program fees, choose a service level, and track payment status.
        </p>
      </div>

      {/* ── Loading / no case ── */}
      {loading ? (
        <div className="rounded-xl p-8 bg-white border border-slate-200 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-navy/30" />
          <p className="text-navy/50 text-sm">Loading your fee information…</p>
        </div>
      ) : !caseData && (
        <div className="rounded-xl p-6 bg-white border border-slate-200 text-center">
          <p className="text-navy/60 text-sm">No active application found. Once you&apos;re enrolled in a program, your fee breakdown will appear here.</p>
        </div>
      )}

      {caseData && (
        <>
          {/* ── Program & fee summary ── */}
          {isKnownProgram && official && agency && (
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="bg-navy px-5 py-4">
                <h2 className="text-gold font-bold text-base">{programName}</h2>
                <p className="text-white/60 text-xs mt-0.5">{caseData.programSnapshot?.country}</p>
              </div>
              <div className="p-5 space-y-3">
                {/* Official fee breakdown */}
                <div>
                  <p className="text-xs font-semibold text-navy/50 uppercase tracking-wide mb-2">Government Fees (IRCC)</p>
                  <div className="space-y-1">
                    {official.breakdown.map((line, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-600">{line.split(' — ')[0]}</span>
                        <span className="font-medium text-navy">{line.split(' — ')[1] ?? ''}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold text-navy pt-1 border-t border-slate-100 mt-1">
                      <span>Official Total</span>
                      <span>{fmt(official.total)}</span>
                    </div>
                  </div>
                  {official.note && (
                    <p className="text-xs text-slate-500 mt-1">{official.note}</p>
                  )}
                </div>

                {/* Agency fee */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Agency fee ({tier === 'full_handling' ? 'Full Handling' : 'Filing Only'})</span>
                    <span className="font-medium text-navy">{fmt(agencyFee)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-base font-bold text-navy bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <span>Estimated Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Service tier selector ── */}
          <div className="rounded-xl bg-white border border-slate-200 p-5">
            <h2 className="font-bold text-navy text-base mb-4">Choose Your Service Level</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Full Handling */}
              <button
                type="button"
                onClick={() => { setTier('full_handling'); setSaved(false) }}
                className={`text-left rounded-xl p-4 border-2 transition-all ${
                  tier === 'full_handling'
                    ? 'border-navy bg-navy'
                    : 'border-slate-200 bg-white hover:border-navy/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Star className={`w-4 h-4 ${tier === 'full_handling' ? 'text-gold' : 'text-slate-400'}`} />
                  <span className={`font-bold text-sm ${tier === 'full_handling' ? 'text-gold' : 'text-navy'}`}>
                    Full Agent Handling
                  </span>
                  <span className="bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded-full">RECOMMENDED</span>
                </div>
                <p className={`text-xs leading-relaxed ${tier === 'full_handling' ? 'text-white/70' : 'text-slate-500'}`}>
                  We manage everything — document collection, forms, IRCC communication &amp; tracking.
                </p>
                {agency && (
                  <p className={`text-xs font-bold mt-2 ${tier === 'full_handling' ? 'text-gold' : 'text-navy'}`}>
                    Agency fee: {fmt(agency.fullHandling)}
                  </p>
                )}
              </button>

              {/* Filing Only */}
              <button
                type="button"
                onClick={() => { setTier('filing_only'); setSaved(false) }}
                className={`text-left rounded-xl p-4 border-2 transition-all ${
                  tier === 'filing_only'
                    ? 'border-navy bg-slate-50'
                    : 'border-slate-200 bg-white hover:border-navy/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className={`w-4 h-4 ${tier === 'filing_only' ? 'text-navy' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm text-navy">Agency-Assisted Filing</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You gather documents; we complete all official forms and file your application.
                </p>
                {agency && (
                  <p className="text-xs font-bold text-navy mt-2">
                    Agency fee: {fmt(agency.filingOnly)}
                  </p>
                )}
              </button>
            </div>

            {/* Save button */}
            {saved && (
              <div className="flex items-center gap-2 text-green-700 text-sm mb-3">
                <CheckCircle2 className="w-4 h-4" /> Selection saved. Your agent has been notified.
              </div>
            )}
            {saveError && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                <AlertCircle className="w-4 h-4" /> {saveError}
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isPending || !tierChanged}
              className="w-full py-3 rounded-xl text-sm font-bold text-navy transition-all hover:opacity-90 disabled:opacity-50 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
            >
              {isPending ? 'Saving…' : tierChanged ? 'Save Selection →' : 'Selection Saved ✓'}
            </button>
          </div>

          {/* ── Payment checklist ── */}
          {fees.length > 0 && (
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-navy px-5 py-4 flex items-center justify-between">
                <h2 className="text-gold font-bold text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Payment Checklist
                </h2>
                <div className="text-right">
                  <p className="text-[11px] text-white/50 uppercase tracking-wide">Paid</p>
                  <p className="text-sm font-bold text-white">
                    {fees.filter(f => f.status === 'paid').length} / {fees.length}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {(() => {
                const paidCount = fees.filter(f => f.status === 'paid').length
                const pct = fees.length > 0 ? Math.round((paidCount / fees.length) * 100) : 0
                return (
                  <div className="w-full h-1.5" style={{ background: '#EEF0F6' }}>
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#C9A84C,#e8c76a)',
                      }}
                    />
                  </div>
                )
              })()}

              {/* Fee rows */}
              <div className="divide-y divide-slate-100">
                {fees.map(fee => {
                  const isPaid   = fee.status === 'paid'
                  const isWaived = fee.status === 'waived'
                  const catLabel = fee.category === 'government'
                    ? 'Govt (IRCC)'
                    : fee.category === 'agency'
                    ? 'Agency'
                    : fee.category === 'consultation'
                    ? 'Consultation'
                    : 'Other'
                  const catColor = fee.category === 'government'
                    ? '#6366f1'
                    : fee.category === 'agency'
                    ? '#0B1C3A'
                    : fee.category === 'consultation'
                    ? '#C9A84C'
                    : '#6b7280'

                  return (
                    <div
                      key={fee._id}
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{ opacity: isWaived ? 0.5 : 1 }}
                    >
                      {/* Status icon */}
                      {isPaid ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                      ) : isWaived ? (
                        <MinusCircle className="w-5 h-5 flex-shrink-0 text-slate-400" />
                      ) : (
                        <Clock className="w-5 h-5 flex-shrink-0 text-amber-400" />
                      )}

                      {/* Label + category */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isPaid ? 'text-slate-400 line-through' : 'text-navy'}`}>
                          {fee.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${catColor}18`, color: catColor }}
                          >
                            {catLabel}
                          </span>
                          {fee.paidAt && (
                            <span className="text-[11px] text-slate-400">
                              Paid {new Date(fee.paidAt).toLocaleDateString('en-CA')}
                            </span>
                          )}
                          {fee.note && (
                            <span className="text-[11px] text-slate-400 truncate">{fee.note}</span>
                          )}
                        </div>
                      </div>

                      {/* Amount + status */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${isPaid ? 'text-emerald-600' : 'text-navy'}`}>
                          {fmt(fee.amount)}
                        </p>
                        <p className={`text-[11px] font-semibold mt-0.5 ${
                          isPaid ? 'text-emerald-500' : isWaived ? 'text-slate-400' : 'text-amber-500'
                        }`}>
                          {isPaid ? 'Paid' : isWaived ? 'Waived' : 'Unpaid'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer totals */}
              <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 space-y-1.5">
                {(() => {
                  const paidTotal   = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0)
                  const unpaidTotal = fees.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0)
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Paid so far</span>
                        <span className="font-bold text-emerald-600">{fmt(paidTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Still owing</span>
                        <span className="font-bold text-navy">{fmt(unpaidTotal)}</span>
                      </div>
                    </>
                  )
                })()}
                <p className="text-[11px] text-slate-400 pt-1">
                  Government fees are paid directly to IRCC — not to Global Immigration Hub.
                  Agency and consultation fees are paid to us.
                </p>
              </div>
            </div>
          )}

          {/* ── Required documents ── */}
          {docs.length > 0 && (
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <h2 className="font-bold text-navy text-base mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" /> Required Documents — {programName}
              </h2>
              <ul className="space-y-2">
                {docs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-4">
                Upload your documents under the <a href="/dashboard/documents" className="underline text-navy font-medium">Documents</a> tab.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
