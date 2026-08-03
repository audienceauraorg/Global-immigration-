export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/mongodb'
import { ActivityLog, CaseDocument, Case, Client, Program } from '@/lib/db/models'
import { Bell, Clock, FileText, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function NotificationsPage() {
  await connectDB()

  const now = new Date()

  const [activityRaw, pendingDocsRaw, deadlinesRaw] = await Promise.all([
    ActivityLog.find().sort({ createdAt: -1 }).limit(50).lean(),
    CaseDocument.find({ status: 'pending_review' }).sort({ uploadedAt: -1 }).lean(),
    Case.find({
      importantDate: { $gte: now },
      stage: { $ne: 'Closed' },
    }).sort({ importantDate: 1 }).limit(10).lean(),
  ])

  // Build lookup maps
  const caseIds = [
    ...activityRaw.map(a => a.caseId.toString()),
    ...pendingDocsRaw.map(d => d.caseId.toString()),
    ...deadlinesRaw.map(c => c._id.toString()),
  ]
  const cases = await Case.find({ _id: { $in: [...new Set(caseIds)] } }).lean()
  const clientIds = cases.map(c => c.clientId)
  const programIds = cases.map(c => c.programId)

  const [clientsRaw, programsRaw] = await Promise.all([
    Client.find({ _id: { $in: clientIds } }).lean(),
    Program.find({ _id: { $in: programIds } }).lean(),
  ])

  const caseMap = cases.reduce<Record<string, any>>((acc, c) => {
    acc[c._id.toString()] = c
    return acc
  }, {})
  const clientMap = clientsRaw.reduce<Record<string, string>>((acc, c) => {
    acc[c._id.toString()] = c.name
    return acc
  }, {})
  const programMap = programsRaw.reduce<Record<string, string>>((acc, p) => {
    acc[p._id.toString()] = p.name
    return acc
  }, {})

  const activity   = activityRaw.map(a => ({ ...a, _id: a._id.toString(), caseId: a.caseId.toString() }))
  const pendingDocs = pendingDocsRaw.map(d => ({ ...d, _id: d._id.toString(), caseId: d.caseId.toString() }))
  const deadlines  = deadlinesRaw.map(c => ({ ...c, _id: c._id.toString(), clientId: c.clientId.toString(), programId: c.programId.toString() }))

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">Notifications</h1>
          <p className="text-navy/60 mt-0.5">Activity feed and pending actions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending document reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Pending Document Reviews
              {pendingDocs.length > 0 && (
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {pendingDocs.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDocs.length === 0 ? (
              <p className="text-navy/40 text-sm">No documents pending review</p>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map(doc => {
                  const c = caseMap[doc.caseId]
                  const clientName = c ? clientMap[c.clientId.toString()] : 'Unknown'
                  return (
                    <div key={doc._id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-navy">{clientName}</p>
                        <p className="text-xs text-navy/60">{doc.name}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Submitted {formatDate(doc.uploadedAt?.toISOString())}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p className="text-navy/40 text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {deadlines.map(c => {
                  const days = Math.ceil((new Date(c.importantDate).getTime() - Date.now()) / 86400000)
                  const clientName = clientMap[c.clientId] ?? 'Unknown'
                  const programName = programMap[c.programId] ?? c.programSnapshot?.name ?? ''
                  return (
                    <div key={c._id} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                      <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy">{clientName}</p>
                        <p className="text-xs text-navy/60">{programName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-red-600">{days === 0 ? 'Today' : `${days}d`}</p>
                        <p className="text-xs text-navy/50">{formatDate(c.importantDate?.toISOString())}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-navy/40 text-sm">No activity yet</p>
            ) : (
              <div className="space-y-1">
                {activity.map(log => {
                  const c = caseMap[log.caseId]
                  const clientName = c ? clientMap[c.clientId.toString()] : 'System'
                  return (
                    <div key={log._id} className="flex items-start gap-4 py-3 border-b border-navy/5 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-navy">{clientName}</span>
                          {!log.visibleToClient && (
                            <span className="text-xs text-navy/30">🔒 internal</span>
                          )}
                        </div>
                        <p className="text-sm text-navy/60">{log.description}</p>
                      </div>
                      <p className="text-xs text-navy/40 flex-shrink-0">{formatDate(log.createdAt.toISOString())}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
