'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, Users, AlertTriangle, Clock, ChevronRight, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { stageBadgeVariant, formatDate } from '@/lib/utils'
import { createClient_action } from '@/lib/actions/clients'
import { toast } from 'sonner'
import Link from 'next/link'

interface Program { _id: string; country: string; name: string; checklist: string[] }

export default function ClientsPage() {
  const [clients, setClients]   = useState<any[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [clientsRes, programsRes] = await Promise.all([
      fetch('/api/admin/clients').then(r => r.json()),
      fetch('/api/programs').then(r => r.json()),
    ])
    setClients(clientsRes ?? [])
    setPrograms(programsRes ?? [])
    setLoading(false)
  }

  async function handleAddClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const result = await createClient_action(new FormData(e.currentTarget))
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Client created successfully')
      setShowAdd(false)
      loadData()
    }
    setSaving(false)
  }

  const STAGES = ['Intake', 'Docs Collection', 'Review', 'Submitted', 'Decision', 'Closed']

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    const latestCase = c.cases?.[0]
    const matchStage = !stageFilter || latestCase?.stage === stageFilter
    return matchSearch && matchStage
  })

  function getFlags(client: any) {
    const latestCase = client.cases?.[0]
    if (!latestCase) return []
    const flags: { label: string; color: 'danger' | 'warning' | 'outline' }[] = []
    if (latestCase.documents?.some((d: any) => d.status === 'rejected'))
      flags.push({ label: 'Rejected doc', color: 'danger' })
    if (latestCase.documents?.some((d: any) => d.status === 'not_submitted'))
      flags.push({ label: 'Missing docs', color: 'warning' })
    if (latestCase.importantDate) {
      const days = Math.ceil((new Date(latestCase.importantDate).getTime() - Date.now()) / 86400000)
      if (days >= 0 && days <= 7) flags.push({ label: `Deadline in ${days}d`, color: 'danger' })
    }
    const daysSince = Math.floor((Date.now() - new Date(latestCase.updatedAt).getTime()) / 86400000)
    if (daysSince >= 14 && latestCase.stage !== 'Closed')
      flags.push({ label: 'Stale 14d+', color: 'outline' })
    return flags
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Clients</h1>
          <p className="text-navy/60 mt-1">{clients.length} total client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
          <Input placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white">
          <option value="">All stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || stageFilter) && (
          <button onClick={() => { setSearch(''); setStageFilter('') }}
            className="text-navy/40 hover:text-navy transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-navy/40">Loading clients…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-navy/40">
          <Users className="w-12 h-12 mb-3" />
          <p>{search || stageFilter ? 'No clients match your search' : 'No clients yet. Add your first one!'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(client => {
            const latestCase = client.cases?.[0]
            const flags = getFlags(client)
            const pendingCount = latestCase?.documents?.filter((d: any) => d.status === 'pending_review').length ?? 0
            return (
              <Link key={client._id} href={`/admin/clients/${client._id}`}>
                <Card className="hover:shadow-md hover:border-navy/20 transition-all duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #0B1C3A, #1a3560)', color: '#C9A84C' }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-navy">{client.name}</p>
                          {flags.map(f => <Badge key={f.label} variant={f.color} className="text-xs">{f.label}</Badge>)}
                        </div>
                        <p className="text-sm text-navy/50">{client.email}</p>
                      </div>
                      {latestCase && (
                        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-navy/40 mb-1">{latestCase.programSnapshot?.country}</p>
                            <p className="text-sm font-medium text-navy truncate max-w-40">{latestCase.programSnapshot?.name}</p>
                          </div>
                          <Badge variant={stageBadgeVariant(latestCase.stage)}>{latestCase.stage}</Badge>
                          {pendingCount > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs font-medium">{pendingCount}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-navy/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{formatDate(latestCase.updatedAt)}</span>
                          </div>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-navy/30 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Full name *</label>
              <Input name="name" required placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Email *</label>
              <Input name="email" type="email" required placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Phone</label>
              <Input name="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Program *</label>
              <select name="program_id" required
                className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white">
                <option value="">Select a program…</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>{p.country} — {p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create client'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
