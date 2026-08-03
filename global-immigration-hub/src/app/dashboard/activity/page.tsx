export const dynamic = 'force-dynamic'
import { getMyCase } from '@/lib/actions/cases'
import { formatDate } from '@/lib/utils'
import { Clock, CheckCircle2, AlertTriangle, FileText, Globe, ArrowUpRight } from 'lucide-react'

function getLogIcon(description: string) {
  const d = description.toLowerCase()
  if (d.includes('approved'))         return { icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' }
  if (d.includes('rejected') || d.includes('resubmit')) return { icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' }
  if (d.includes('stage') || d.includes('updated'))     return { icon: ArrowUpRight,  color: '#6366f1', bg: '#eef2ff' }
  if (d.includes('document') || d.includes('upload'))   return { icon: FileText,      color: '#C9A84C', bg: '#fffbeb' }
  if (d.includes('selected') || d.includes('program'))  return { icon: Globe,         color: '#0B1C3A', bg: '#EEF0F6' }
  return { icon: Clock, color: 'rgba(11,28,58,0.4)', bg: '#EEF0F6' }
}

export default async function ActivityPage() {
  const activeCase = await getMyCase()
  const logs = [...((activeCase as any)?.activity_log ?? [])]
    .filter((l: any) => l.visibleToClient ?? l.visible_to_client)
    .sort((a: any, b: any) =>
      new Date(b.createdAt ?? b.created_at).getTime() -
      new Date(a.createdAt ?? a.created_at).getTime()
    )

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-navy">Activity Timeline</h1>
        <p className="text-navy/50 text-[13px] mt-1">
          Every update and action on your file, in order.
        </p>
      </div>

      {/* Timeline */}
      <div
        className="bg-white rounded-2xl p-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
      >
        {logs.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-10 h-10 mx-auto mb-3 text-navy/20" />
            <p className="text-navy/40 text-sm">No activity yet. Updates will appear here as your application progresses.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical connector */}
            <div
              className="absolute left-[19px] top-6 bottom-6"
              style={{ width: 2, background: 'rgba(11,28,58,0.07)', borderRadius: 1 }}
            />

            <div className="space-y-0">
              {logs.map((log: any, i: number) => {
                const { icon: Icon, color, bg } = getLogIcon(log.description)
                const date = new Date(log.createdAt ?? log.created_at)
                const isToday =
                  new Date().toDateString() === date.toDateString()
                const timeStr = date.toLocaleTimeString('en-CA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={log._id ?? log.id}
                    className="relative flex items-start gap-4 pb-6 last:pb-0"
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                      style={{ background: bg, border: `1.5px solid ${color}22` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1.5 min-w-0">
                      <p className="text-[13.5px] font-medium text-navy leading-snug">
                        {log.description}
                      </p>
                      <p className="text-[11.5px] text-navy/35 mt-1">
                        {isToday ? `Today at ${timeStr}` : `${formatDate(log.createdAt ?? log.created_at)} at ${timeStr}`}
                      </p>
                    </div>

                    {/* Latest badge */}
                    {i === 0 && (
                      <span
                        className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                        style={{ background: '#ecfdf5', color: '#10b981' }}
                      >
                        Latest
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
