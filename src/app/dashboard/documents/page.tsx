export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getMyCase } from '@/lib/actions/cases'
import { DocUploadRow } from '@/components/portal/DocUploadRow'
import { CheckCircle2, Clock, AlertTriangle, FileText, Upload } from 'lucide-react'

const GROUP_CONFIG = {
  rejected:      { label: 'Needs Resubmission', icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', order: 0 },
  not_submitted: { label: 'To Upload',           icon: Upload,        color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', order: 1 },
  pending_review:{ label: 'Awaiting Review',     icon: Clock,         color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', order: 2 },
  approved:      { label: 'Approved',            icon: CheckCircle2,  color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', order: 3 },
}

export default async function DocumentsPage() {
  const activeCase = await getMyCase()

  if (!activeCase) {
    redirect('/dashboard/onboarding')
  }

  const docs      = (activeCase as any).documents ?? []
  const totalDocs = docs.length
  const approved  = docs.filter((d: any) => d.status === 'approved').length
  const pct       = totalDocs > 0 ? Math.round((approved / totalDocs) * 100) : 0
  const caseId    = (activeCase as any)._id ?? (activeCase as any).id

  type DocStatus = 'rejected' | 'not_submitted' | 'pending_review' | 'approved'
  const groups = Object.entries(GROUP_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([status, cfg]) => ({
      status,
      cfg,
      docs: docs.filter((d: any) => d.status === status),
    }))
    .filter(g => g.docs.length > 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold text-navy">My Documents</h1>
        <p className="text-navy/50 text-[13px] mt-1">
          Upload each required document. We review and confirm every submission.
        </p>
      </div>

      {/* Progress summary */}
      {totalDocs > 0 && (
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-bold text-navy">Overall Progress</p>
              <p className="text-[12px] text-navy/40 mt-0.5">{approved} of {totalDocs} documents approved</p>
            </div>
            <span
              className="text-[24px] font-bold"
              style={{ color: pct === 100 ? '#10b981' : '#C9A84C' }}
            >
              {pct}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: '#EEF0F6' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? '#10b981'
                  : 'linear-gradient(90deg, #C9A84C, #e8c76a)',
              }}
            />
          </div>

          {/* Mini legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4">
            {Object.entries(GROUP_CONFIG).map(([status, cfg]) => {
              const count = docs.filter((d: any) => d.status === status).length
              if (count === 0) return null
              return (
                <span key={status} className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: cfg.color }}>
                  <cfg.icon className="w-3 h-3" />
                  {count} {cfg.label.toLowerCase()}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Document groups */}
      {totalDocs === 0 ? (
        <div
          className="bg-white rounded-2xl p-10 text-center"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
        >
          <FileText className="w-10 h-10 mx-auto mb-3 text-navy/20" />
          <p className="text-navy/50 text-sm">Your document checklist is being prepared by your consultant.</p>
        </div>
      ) : (
        groups.map(({ status, cfg, docs: groupDocs }) => {
          const Icon = cfg.icon
          return (
            <div
              key={status}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
            >
              {/* Group header */}
              <div
                className="flex items-center gap-2.5 px-5 py-3.5"
                style={{
                  background: cfg.bg,
                  borderBottom: `1px solid ${cfg.border}`,
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
                <span className="text-[13px] font-bold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                <span
                  className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.border, color: cfg.color }}
                >
                  {groupDocs.length}
                </span>
              </div>

              {/* Doc rows */}
              <div className="divide-y divide-navy/[0.06]">
                {groupDocs.map((doc: any) => (
                  <div key={doc._id ?? doc.id} className="px-5 py-1">
                    <DocUploadRow
                      docName={doc.name}
                      caseId={caseId}
                      document={doc}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
