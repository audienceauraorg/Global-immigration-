'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Globe, CheckCircle2, Star, FileText,
  CreditCard, ChevronRight, ArrowRight,
} from 'lucide-react'
import { selectClientProgram } from '@/lib/actions/cases'
import {
  OFFICIAL_FEES, AGENCY_FEES, PROGRAM_KEYS, fmt,
  type ProgramKey,
} from '@/lib/fees'

interface Program {
  _id: string
  name: string
  country: string
  checklist: string[]
}

interface CaseData {
  _id: string
  programSnapshot?: { name?: string; country?: string }
  serviceTier?: 'full_handling' | 'filing_only'
}

const STEPS = [
  { n: 1, label: 'Program'      },
  { n: 2, label: 'Service Level' },
  { n: 3, label: 'Confirm'      },
]

export default function OnboardingPage() {
  const router = useRouter()

  const [step,            setStep]            = useState<1 | 2 | 3>(1)
  const [programs,        setPrograms]        = useState<Program[]>([])
  const [selectedProg,    setSelectedProg]    = useState<Program | null>(null)
  const [caseData,        setCaseData]        = useState<CaseData | null>(null)
  const [tier,            setTier]            = useState<'full_handling' | 'filing_only'>('full_handling')
  const [initialLoading,  setInitialLoading]  = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')
  const [,                startTransition]    = useTransition()

  /* ── Bootstrap: check existing case + load programs ─────────── */
  useEffect(() => {
    Promise.all([
      fetch('/api/my-case').then(r => r.json()).catch(() => null),
      fetch('/api/programs').then(r => r.json()).catch(() => []),
    ]).then(([caseRes, programsRes]) => {
      setPrograms(Array.isArray(programsRes) ? programsRes : [])

      if (caseRes?._id) {
        setCaseData(caseRes)
        if (caseRes.serviceTier) {
          // Already fully onboarded — go straight to dashboard
          router.replace('/dashboard')
          return
        }
        // Has a case but hasn't chosen a tier yet — skip program step
        setStep(2)
      }
    }).finally(() => setInitialLoading(false))
  }, [router])

  /* ── Step 1: select program ──────────────────────────────────── */
  async function handleProgramNext() {
    if (!selectedProg) return
    setSaving(true)
    setError('')
    startTransition(async () => {
      const result = await selectClientProgram(selectedProg._id)
      if (result?.error) {
        setError(result.error)
        setSaving(false)
        return
      }
      // Re-fetch the now-created case
      const caseRes = await fetch('/api/my-case').then(r => r.json()).catch(() => null)
      if (caseRes?._id) setCaseData(caseRes)
      setSaving(false)
      setStep(2)
    })
  }

  /* ── Step 2: select service tier ─────────────────────────────── */
  async function handleTierNext() {
    if (!caseData?._id) return
    setSaving(true)
    setError('')
    const res = await fetch('/api/service-tier', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ caseId: caseData._id, tier }),
    }).then(r => r.json()).catch(() => ({ ok: false, error: 'Network error' }))

    setSaving(false)
    if (!res.ok) {
      setError(res.error ?? 'Failed to save. Please try again.')
      return
    }
    setCaseData(prev => prev ? { ...prev, serviceTier: tier } : prev)
    setStep(3)
  }

  /* ── Derived fee data ────────────────────────────────────────── */
  const programName    = (caseData?.programSnapshot?.name ?? '') as ProgramKey
  const isKnownProgram = PROGRAM_KEYS.includes(programName)
  const official       = isKnownProgram ? OFFICIAL_FEES[programName] : null
  const agency         = isKnownProgram ? AGENCY_FEES[programName]   : null
  const agencyFee      = agency ? (tier === 'full_handling' ? agency.fullHandling : agency.filingOnly) : 0
  const total          = (official?.total ?? 0) + agencyFee

  /* ── Initial loading ─────────────────────────────────────────── */
  if (initialLoading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        <p className="text-sm font-medium" style={{ color: 'rgba(11,28,58,0.45)' }}>
          Setting up your account…
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-6 space-y-6 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#e8c76a)' }}
        >
          <Globe className="w-6 h-6" style={{ color: '#0B1C3A' }} />
        </div>
        <h1 className="text-[22px] font-bold text-navy">Welcome to Your Portal</h1>
        <p className="text-navy/50 text-sm mt-1">
          Complete two quick steps so we can tailor your experience.
        </p>
      </div>

      {/* ── Step indicator ───────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map(({ n, label }, i) => {
          const done    = step > n
          const current = step === n
          return (
            <div key={n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: done
                      ? '#10b981'
                      : current
                        ? 'linear-gradient(135deg,#C9A84C,#e8c76a)'
                        : 'rgba(11,28,58,0.1)',
                    color: done || current ? '#fff' : 'rgba(11,28,58,0.35)',
                  }}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                </div>
                <span
                  className="text-[10.5px] font-semibold mt-1 tracking-wide"
                  style={{ color: current ? '#0B1C3A' : 'rgba(11,28,58,0.35)' }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-16 h-px mx-2 mb-5 transition-all"
                  style={{ background: step > n + 1 ? '#10b981' : step > n ? '#C9A84C' : 'rgba(11,28,58,0.1)' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ── STEP 1: Choose immigration program ───────────────────── */}
      {step === 1 && (
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid rgba(11,28,58,0.06)' }}
          >
            <h2 className="font-bold text-navy text-[16px]">Select Your Immigration Program</h2>
            <p className="text-navy/50 text-[12.5px] mt-0.5">
              Choose the program that best matches your immigration goal.
            </p>
          </div>
          <div className="p-5">
            {programs.length === 0 ? (
              <p className="text-navy/40 text-sm text-center py-4">
                No programs available yet. Please contact us.
              </p>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {programs.map(prog => {
                  const selected = selectedProg?._id === prog._id
                  return (
                    <button
                      key={prog._id}
                      type="button"
                      onClick={() => setSelectedProg(prog)}
                      className="w-full text-left rounded-xl px-4 py-3.5 transition-all border-2"
                      style={{
                        background:   selected ? 'rgba(201,168,76,0.06)' : '#fff',
                        borderColor:  selected ? '#C9A84C' : 'rgba(11,28,58,0.08)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-[13.5px] font-semibold leading-tight"
                            style={{ color: selected ? '#0B1C3A' : 'rgba(11,28,58,0.8)' }}
                          >
                            {prog.name}
                          </p>
                          <p className="text-[11.5px] text-navy/40 mt-0.5">{prog.country}</p>
                        </div>
                        {selected && (
                          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {error && (
              <p className="text-red-600 text-xs mt-3">{error}</p>
            )}

            <button
              onClick={handleProgramNext}
              disabled={!selectedProg || saving}
              className="mt-5 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg,#C9A84C,#e8c76a)',
                color: '#0B1C3A',
              }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Choose service tier ───────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Program context pill */}
          {caseData?.programSnapshot?.name && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-navy"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}
            >
              <Globe className="w-4 h-4 flex-shrink-0" style={{ color: '#C9A84C' }} />
              {caseData.programSnapshot.name}
              {caseData.programSnapshot.country && (
                <span className="text-navy/40 text-xs ml-1">— {caseData.programSnapshot.country}</span>
              )}
            </div>
          )}

          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            <div
              className="px-6 py-4"
              style={{ borderBottom: '1px solid rgba(11,28,58,0.06)' }}
            >
              <h2 className="font-bold text-navy text-[16px]">Choose Your Service Level</h2>
              <p className="text-navy/50 text-[12.5px] mt-0.5">
                How much support do you want from our team?
              </p>
            </div>
            <div className="p-5 space-y-4">

              {/* Tier cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Handling */}
                <button
                  type="button"
                  onClick={() => setTier('full_handling')}
                  className="text-left rounded-xl p-4 border-2 transition-all relative"
                  style={{
                    background:  tier === 'full_handling' ? '#0B1C3A' : '#fff',
                    borderColor: tier === 'full_handling' ? '#0B1C3A' : 'rgba(11,28,58,0.1)',
                  }}
                >
                  {/* Recommended badge */}
                  <span
                    className="absolute -top-2.5 left-3 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: '#C9A84C', color: '#0B1C3A' }}
                  >
                    RECOMMENDED
                  </span>
                  <div className="flex items-center gap-2 mb-2 mt-1">
                    <Star
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: tier === 'full_handling' ? '#C9A84C' : '#94a3b8' }}
                    />
                    <span
                      className="font-bold text-sm"
                      style={{ color: tier === 'full_handling' ? '#C9A84C' : '#0B1C3A' }}
                    >
                      Full Agent Handling
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: tier === 'full_handling' ? 'rgba(255,255,255,0.65)' : 'rgba(11,28,58,0.5)' }}
                  >
                    We manage everything — document collection, forms, IRCC filings and all government communication.
                  </p>
                  {agency && (
                    <p
                      className="text-sm font-bold mt-3"
                      style={{ color: tier === 'full_handling' ? '#C9A84C' : '#0B1C3A' }}
                    >
                      Agency fee: {fmt(agency.fullHandling)}
                    </p>
                  )}
                </button>

                {/* Filing Only */}
                <button
                  type="button"
                  onClick={() => setTier('filing_only')}
                  className="text-left rounded-xl p-4 border-2 transition-all"
                  style={{
                    background:  tier === 'filing_only' ? '#f8f9fc' : '#fff',
                    borderColor: tier === 'filing_only' ? '#0B1C3A' : 'rgba(11,28,58,0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: tier === 'filing_only' ? '#0B1C3A' : '#94a3b8' }}
                    />
                    <span className="font-bold text-sm text-navy">Agency-Assisted Filing</span>
                  </div>
                  <p className="text-xs text-navy/50 leading-relaxed">
                    You gather your own documents; we handle all official forms, review, and submission to IRCC.
                  </p>
                  {agency && (
                    <p className="text-sm font-bold text-navy mt-3">
                      Agency fee: {fmt(agency.filingOnly)}
                    </p>
                  )}
                </button>
              </div>

              {/* Fee summary strip */}
              {official && (
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  <div>
                    <p className="text-[11px] font-semibold text-navy/50 uppercase tracking-wide">
                      Estimated Total
                    </p>
                    <p className="text-[11px] text-navy/40 mt-0.5">
                      IRCC {fmt(official.total)} + Agency {fmt(agencyFee)}
                    </p>
                  </div>
                  <p className="text-[18px] font-black text-navy">{fmt(total)}</p>
                </div>
              )}

              {/* Consultation fee note */}
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
              >
                <CreditCard className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  <strong>$30 CAD consultation fee</strong> applies separately — payable via e-transfer or when your agent contacts you.
                </p>
              </div>

              {error && (
                <p className="text-red-600 text-xs">{error}</p>
              )}

              <button
                onClick={handleTierNext}
                disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg,#C9A84C,#e8c76a)',
                  color: '#0B1C3A',
                }}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <>Confirm Selection <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirmation ─────────────────────────────────── */}
      {step === 3 && (
        <div
          className="bg-white rounded-2xl overflow-hidden text-center"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          {/* Gold header band */}
          <div
            className="px-6 py-8"
            style={{ background: 'linear-gradient(135deg,#0B1C3A,#1a3560)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#C9A84C,#e8c76a)' }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: '#0B1C3A' }} />
            </div>
            <h2 className="text-[20px] font-bold text-white">You&apos;re All Set!</h2>
            <p className="text-white/55 text-[13px] mt-1.5">
              Your preferences have been saved and your consultant has been notified.
            </p>
          </div>

          <div className="px-6 py-6 space-y-3">
            {/* Summary rows */}
            <div
              className="flex items-center justify-between text-sm py-3"
              style={{ borderBottom: '1px solid rgba(11,28,58,0.06)' }}
            >
              <span className="text-navy/50 font-medium">Program</span>
              <span className="font-semibold text-navy">
                {caseData?.programSnapshot?.name ?? '—'}
              </span>
            </div>
            <div
              className="flex items-center justify-between text-sm py-3"
              style={{ borderBottom: '1px solid rgba(11,28,58,0.06)' }}
            >
              <span className="text-navy/50 font-medium">Service Level</span>
              <span className="font-semibold text-navy">
                {tier === 'full_handling' ? 'Full Agent Handling' : 'Agency-Assisted Filing'}
              </span>
            </div>
            {official && (
              <div className="flex items-center justify-between text-sm py-3">
                <span className="text-navy/50 font-medium">Est. Total</span>
                <span className="font-bold text-navy text-[15px]">{fmt(total)}</span>
              </div>
            )}

            <div
              className="rounded-xl px-4 py-3 text-left"
              style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}
            >
              <p className="text-[12.5px] font-semibold text-green-800">
                Your consultant has been notified and will be in touch shortly to guide you through the next steps.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#C9A84C,#e8c76a)',
                color: '#0B1C3A',
              }}
            >
              Go to My Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
