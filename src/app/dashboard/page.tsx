export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getMyCase } from '@/lib/actions/cases'
import { StageTracker } from '@/components/portal/StageTracker'
import { DocUploadRow } from '@/components/portal/DocUploadRow'
import {
  CheckCircle2, Clock, AlertTriangle, Calendar,
  FileText, ArrowRight, Zap,
} from 'lucide-react'
import { formatDate, daysUntil } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  const activeCase = await getMyCase()
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  /* ── No case: send through onboarding wizard ────────────────── */
  if (!activeCase) {
    redirect('/dashboard/onboarding')
  }

  const docs        = (activeCase as any).documents ?? []
  const logs        = [...((activeCase as any).activity_log ?? [])]
    .filter((l: any) => l.visibleToClient ?? l.visible_to_client)
    .sort((a: any, b: any) =>
      new Date(b.createdAt ?? b.created_at).getTime() -
      new Date(a.createdAt ?? a.created_at).getTime()
    )
    .slice(0, 4)

  const approvedCount  = docs.filter((d: any) => d.status === 'approved').length
  const pendingCount   = docs.filter((d: any) => d.status === 'pending_review').length
  const rejectedCount  = docs.filter((d: any) => d.status === 'rejected').length
  const notSubmitted   = docs.filter((d: any) => d.status === 'not_submitted').length
  const totalCount     = docs.length
  const progressPct    = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0
  const needsAction    = rejectedCount + notSubmitted

  const importantDate = (activeCase as any).importantDate ?? (activeCase as any).important_date
  const days          = daysUntil(importantDate)
  const program       = (activeCase as any).programs ?? (activeCase as any).programSnapshot

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome hero ─────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden px-7 py-6"
        style={{
          background: 'linear-gradient(135deg, #0B1C3A 0%, #122347 60%, #1a3560 100%)',
        }}
      >
        {/* Decorative rings */}
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
          style={{ border: '2px solid #C9A84C' }}
        />
        <div
          className="absolute -right-4 -top-4 w-28 h-28 rounded-full opacity-10"
          style={{ border: '2px solid #C9A84C' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: 'rgba(201,168,76,0.8)' }}>
              Client Portal
            </p>
            <h1 className="text-[22px] font-bold text-white leading-tight">
              Good to see you, {firstName}
            </h1>
            {program && (
              <p className="mt-1.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {program.country} &mdash; {program.name}
              </p>
            )}
          </div>

          {/* Stage badge */}
          <div
            className="flex-shrink-0 self-start sm:self-center px-4 py-2 rounded-xl border font-semibold text-sm"
            style={{
              background: 'rgba(201,168,76,0.12)',
              borderColor: 'rgba(201,168,76,0.3)',
              color: '#C9A84C',
            }}
          >
            {(activeCase as any).stage}
          </div>
        </div>
      </div>

      {/* ── Quick stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Documents',
            value: totalCount,
            icon: FileText,
            color: '#6366f1',
            bg: '#eef2ff',
          },
          {
            label: 'Approved',
            value: approvedCount,
            icon: CheckCircle2,
            color: '#10b981',
            bg: '#ecfdf5',
          },
          {
            label: 'Pending Review',
            value: pendingCount,
            icon: Clock,
            color: '#f59e0b',
            bg: '#fffbeb',
          },
          {
            label: 'Need Action',
            value: needsAction,
            icon: AlertTriangle,
            color: needsAction > 0 ? '#ef4444' : '#10b981',
            bg: needsAction > 0 ? '#fef2f2' : '#ecfdf5',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-2.5"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-navy leading-none">{value}</p>
              <p className="text-[11px] text-navy/40 mt-1 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Application stage ────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-navy">Application Progress</h2>
          <span className="text-[11px] text-navy/40 font-medium">
            Step {['Intake','Docs Collection','Review','Submitted','Decision','Closed'].indexOf((activeCase as any).stage) + 1} of 6
          </span>
        </div>
        <StageTracker currentStage={(activeCase as any).stage} />

        {/* Doc progress bar */}
        {totalCount > 0 && (
          <div className="mt-6 pt-5 border-t border-navy/8">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[12.5px] font-semibold text-navy/60">Document completion</p>
              <p className="text-[12.5px] font-bold text-navy">{progressPct}%</p>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#EEF0F6' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? '#10b981'
                    : 'linear-gradient(90deg, #C9A84C, #e8c76a)',
                }}
              />
            </div>
            <p className="mt-2 text-[11.5px] text-navy/40">
              {approvedCount} of {totalCount} documents approved
            </p>
          </div>
        )}
      </div>

      {/* ── Important date ───────────────────────────────────────── */}
      {importantDate && (
        <div
          className="bg-white rounded-2xl p-5 flex items-center gap-4"
          style={{
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            borderLeft: `4px solid ${days !== null && days <= 7 ? '#ef4444' : '#C9A84C'}`,
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: days !== null && days <= 7 ? '#fef2f2' : '#fffbeb' }}
          >
            <Calendar
              className="w-5 h-5"
              style={{ color: days !== null && days <= 7 ? '#ef4444' : '#C9A84C' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-navy/40">Important Date</p>
            <p className="text-[15px] font-bold text-navy mt-0.5">{formatDate(importantDate)}</p>
            {days !== null && (
              <p
                className="text-[12px] font-medium mt-0.5"
                style={{ color: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : 'rgba(11,28,58,0.45)' }}
              >
                {days === 0 ? 'Today!' : days > 0 ? `${days} days from now` : `${Math.abs(days)} days ago`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Rejected docs alert ──────────────────────────────────── */}
      {rejectedCount > 0 && (
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-red-800">
              {rejectedCount} document{rejectedCount > 1 ? 's' : ''} need{rejectedCount === 1 ? 's' : ''} resubmission
            </p>
            <p className="text-[12px] text-red-600 mt-0.5">
              Please upload revised copies as soon as possible to avoid delays.
            </p>
          </div>
          <Link
            href="/dashboard/documents"
            className="flex-shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-red-700 hover:text-red-900 transition-colors"
          >
            Fix now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── Quick-action: docs to upload ────────────────────────── */}
      {notSubmitted > 0 && rejectedCount === 0 && (
        <Link
          href="/dashboard/documents"
          className="flex items-center gap-4 bg-white rounded-2xl p-5 transition-all hover:shadow-md group"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
          >
            <Zap className="w-5 h-5 text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-bold text-navy">
              {notSubmitted} document{notSubmitted > 1 ? 's' : ''} still to upload
            </p>
            <p className="text-[12px] text-navy/40 mt-0.5">
              Uploading all required documents speeds up your application.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-navy/30 group-hover:text-navy/60 transition-colors flex-shrink-0" />
        </Link>
      )}

      {/* ── Recent activity ──────────────────────────────────────── */}
      {logs.length > 0 && (
        <div
          className="bg-white rounded-2xl p-6"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-navy">Recent Activity</h2>
            <Link
              href="/dashboard/activity"
              className="text-[12px] font-semibold flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: '#C9A84C' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {logs.map((log: any, i: number) => (
              <div key={log._id ?? log.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0 mt-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: i === 0 ? '#C9A84C' : 'rgba(11,28,58,0.2)' }}
                  />
                  {i < logs.length - 1 && (
                    <div className="w-px flex-1 mt-1 min-h-[16px]" style={{ background: 'rgba(11,28,58,0.08)' }} />
                  )}
                </div>
                <div className="pb-2 min-w-0 flex-1">
                  <p className="text-[13px] text-navy leading-snug">{log.description}</p>
                  <p className="text-[11px] text-navy/35 mt-0.5">
                    {formatDate(log.createdAt ?? log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
