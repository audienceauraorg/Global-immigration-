export const dynamic = 'force-dynamic'
import { connectDB } from '@/lib/mongodb'
import { Client, Case, CaseDocument } from '@/lib/db/models'
import { Users, FileText, AlertTriangle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { stageBadgeVariant, formatDate, daysUntil } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  await connectDB()

  const [clients, cases, documents] = await Promise.all([
    Client.find().lean(),
    Case.find().lean(),
    CaseDocument.find().lean(),
  ])

  const totalClients = clients.length
  const activeCases  = cases.filter(c => c.stage !== 'Closed')
  const pendingDocs  = documents.filter(d => d.status === 'pending_review')

  const now = Date.now()
  const upcomingDeadlines = cases.filter(c => {
    if (!c.importantDate) return false
    const days = Math.ceil((new Date(c.importantDate).getTime() - now) / 86400000)
    return days >= 0 && days <= 7
  })

  const staleCases = cases.filter(c => {
    const daysSince = Math.floor((now - new Date(c.updatedAt).getTime()) / 86400000)
    return daysSince >= 14 && c.stage !== 'Closed'
  })

  const stageGroups = activeCases.reduce<Record<string, number>>((acc, c) => {
    acc[c.stage] = (acc[c.stage] ?? 0) + 1
    return acc
  }, {})

  // Build client map for name lookups
  const clientMap = clients.reduce<Record<string, string>>((acc, c) => {
    acc[c._id.toString()] = c.name
    return acc
  }, {})

  const statCards = [
    { label: 'Total Clients',        value: totalClients,            icon: Users,          color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Active Cases',         value: activeCases.length,      icon: FileText,        color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Docs Pending Review',  value: pendingDocs.length,      icon: AlertTriangle,   color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Deadlines This Week',  value: upcomingDeadlines.length, icon: Calendar,       color: 'text-red-600',    bg: 'bg-red-50' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-navy/60 mt-1">Overview of all cases and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-navy/60 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-navy mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by stage */}
        <Card>
          <CardHeader><CardTitle>Cases by Stage</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stageGroups).length === 0 && (
                <p className="text-navy/40 text-sm">No active cases</p>
              )}
              {Object.entries(stageGroups).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <Badge variant={stageBadgeVariant(stage)}>{stage}</Badge>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-navy/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stageGroups))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-navy w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card>
          <CardHeader><CardTitle>Needs Attention</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staleCases.length === 0 && upcomingDeadlines.length === 0 && (
                <p className="text-navy/40 text-sm">Everything looks good ✓</p>
              )}
              {upcomingDeadlines.map(c => {
                const days = daysUntil(c.importantDate?.toISOString())
                const clientName = clientMap[c.clientId.toString()] ?? 'Unknown'
                return (
                  <Link key={c._id.toString()} href={`/admin/clients`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{clientName}</p>
                      <p className="text-xs text-red-500">
                        {days === 0 ? 'Deadline today' : `Deadline in ${days} day${days !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </Link>
                )
              })}
              {staleCases.slice(0, 5).map(c => {
                const clientName = clientMap[c.clientId.toString()] ?? 'Unknown'
                return (
                  <Link key={c._id.toString()} href="/admin/clients"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy/5 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{clientName}</p>
                      <p className="text-xs text-amber-600">No activity in 14+ days</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
