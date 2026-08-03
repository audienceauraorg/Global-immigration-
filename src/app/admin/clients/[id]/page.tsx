'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, XCircle, Upload, Download, Clock,
  Calendar, FileText, MessageSquare, Lock, Eye, User, Phone, Mail,
  CreditCard, Plus, Trash2, MinusCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StageDropdown } from '@/components/admin/StageDropdown'
import { stageBadgeVariant, formatDate, daysUntil } from '@/lib/utils'
import { updateDocumentStatus, resetDocumentStatus, addCaseNote, updateImportantDate } from '@/lib/actions/cases'
import { getSignedDownloadUrl, adminUploadDocument } from '@/lib/actions/documents'
import { getClientDetail } from '@/lib/actions/clients'
import { toast } from 'sonner'
import Link from 'next/link'
import { fmt } from '@/lib/fees'

interface FeeItem {
  _id: string
  label: string
  amount: number
  category: 'government' | 'agency' | 'consultation' | 'other'
  status: 'unpaid' | 'paid' | 'waived'
  paidAt?: string
  note?: string
}

const DOC_STATUS_CONFIG = {
  not_submitted:  { label: 'Not submitted',  variant: 'outline'  as const, icon: FileText },
  pending_review: { label: 'Pending review', variant: 'warning'  as const, icon: Clock },
  approved:       { label: 'Approved',       variant: 'success'  as const, icon: CheckCircle2 },
  rejected:       { label: 'Rejected',       variant: 'danger'   as const, icon: XCircle },
}

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.id as string

  const [data, setData]               = useState<any>(null)
  const [loading, setLoading]         = useState(true)
  const [rejectDoc, setRejectDoc]     = useState<any>(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [note, setNote]               = useState('')
  const [noteVisible, setNoteVisible] = useState(false)
  const [savingNote, setSavingNote]   = useState(false)
  const [importantDate, setImportantDate] = useState('')

  // Fee management
  const [fees, setFees]               = useState<FeeItem[]>([])
  const [addFeeOpen, setAddFeeOpen]   = useState(false)
  const [newFeeLabel, setNewFeeLabel] = useState('')
  const [newFeeAmount, setNewFeeAmount] = useState('')
  const [newFeeCategory, setNewFeeCategory] = useState<FeeItem['category']>('other')
  const [newFeeNote, setNewFeeNote]   = useState('')
  const [savingFee, setSavingFee]     = useState(false)

  useEffect(() => { loadData() }, [clientId])

  async function loadData() {
    const client = await getClientDetail(clientId)
    setData(client)
    const caseDate = client?.cases?.[0]?.importantDate
    if (caseDate) setImportantDate(new Date(caseDate).toISOString().split('T')[0])
    setLoading(false)
  }

  async function loadFees(caseId: string) {
    const res = await fetch(`/api/admin/fees?caseId=${caseId}`)
    if (res.ok) {
      const data = await res.json()
      setFees(Array.isArray(data) ? data : [])
    }
  }

  useEffect(() => {
    if (data?.cases?.[0]?._id) loadFees(data.cases[0]._id)
  }, [data])

  async function handleFeeStatus(feeId: string, status: FeeItem['status']) {
    const res = await fetch(`/api/admin/fees/${feeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(status === 'paid' ? 'Marked as paid' : status === 'waived' ? 'Marked as waived' : 'Marked as unpaid')
      setFees(prev => prev.map(f => f._id === feeId
        ? { ...f, status, paidAt: status === 'paid' ? new Date().toISOString() : undefined }
        : f
      ))
    } else {
      toast.error('Failed to update fee')
    }
  }

  async function handleDeleteFee(feeId: string) {
    const res = await fetch(`/api/admin/fees/${feeId}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Fee removed')
      setFees(prev => prev.filter(f => f._id !== feeId))
    } else {
      toast.error('Failed to remove fee')
    }
  }

  async function handleAddFee(caseId: string) {
    if (!newFeeLabel.trim() || !newFeeAmount) return
    setSavingFee(true)
    const res = await fetch('/api/admin/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId,
        label: newFeeLabel.trim(),
        amount: parseFloat(newFeeAmount),
        category: newFeeCategory,
        note: newFeeNote.trim() || undefined,
      }),
    })
    if (res.ok) {
      const newFee = await res.json()
      setFees(prev => [...prev, newFee])
      setNewFeeLabel(''); setNewFeeAmount(''); setNewFeeNote(''); setNewFeeCategory('other')
      setAddFeeOpen(false)
      toast.success('Fee added')
    } else {
      toast.error('Failed to add fee')
    }
    setSavingFee(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-navy/40">Loading…</div>
  if (!data) return <div className="text-navy/60">Client not found.</div>

  const activeCase = data.cases?.[0]
  const docs: any[] = activeCase?.documents ?? []
  const logs = [...(activeCase?.activity_log ?? [])].sort(
    (a, b) => new Date(b.createdAt ?? b.created_at).getTime() - new Date(a.createdAt ?? a.created_at).getTime()
  )
  const days = daysUntil(activeCase?.importantDate)

  async function handleApprove(doc: any) {
    const r = await updateDocumentStatus(doc._id, activeCase._id, 'approved')
    if (r?.error) toast.error(r.error)
    else { toast.success('Document approved'); loadData() }
  }

  async function handleReject() {
    if (!rejectDoc) return
    const r = await updateDocumentStatus(rejectDoc._id, activeCase._id, 'rejected', rejectNote)
    if (r?.error) toast.error(r.error)
    else { toast.success('Document rejected'); setRejectDoc(null); setRejectNote(''); loadData() }
  }

  async function handleDownload(doc: any) {
    if (!doc.fileId) return
    const r = await getSignedDownloadUrl(doc.fileId)
    if (r.error) toast.error(r.error)
    else window.open(r.url, '_blank')
  }

  async function handleAdminUpload(doc: any, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('docName', doc.name)
    formData.append('caseId', activeCase._id)
    formData.append('docId', doc._id)
    const r = await adminUploadDocument(formData)
    if (r?.error) toast.error(r.error)
    else { toast.success('File uploaded'); loadData() }
  }

  async function handleAddNote() {
    if (!note.trim()) return
    setSavingNote(true)
    const r = await addCaseNote(activeCase._id, note, noteVisible)
    if (r?.error) toast.error(r.error)
    else { toast.success('Note added'); setNote(''); loadData() }
    setSavingNote(false)
  }

  async function handleDateChange(val: string) {
    setImportantDate(val)
    const r = await updateImportantDate(activeCase._id, val)
    if (r?.error) toast.error(r.error)
    else toast.success('Date updated')
  }

  return (
    <div className="animate-fade-in">
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to clients
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Client card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0B1C3A, #1a3560)', color: '#C9A84C' }}>
                  {data.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-bold text-navy text-lg leading-tight">{data.name}</h1>
                  <Badge variant={data.accountStatus === 'active' ? 'success' : 'warning'} className="text-xs">
                    {data.accountStatus}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-navy/70">
                  <Mail className="w-4 h-4 text-navy/40" />
                  <a href={`mailto:${data.email}`} className="hover:text-navy transition-colors">{data.email}</a>
                </div>
                {data.phone && (
                  <div className="flex items-center gap-2 text-sm text-navy/70">
                    <Phone className="w-4 h-4 text-navy/40" /> {data.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Case metadata */}
          {activeCase && (
            <Card>
              <CardHeader><CardTitle className="text-base">Case</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="text-xs font-medium text-navy/50 uppercase tracking-wider mb-1">Program</p>
                  <p className="text-sm font-semibold text-navy">
                    {activeCase.programSnapshot?.country} — {activeCase.programSnapshot?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-navy/50 uppercase tracking-wider mb-1.5">Stage</p>
                  <StageDropdown caseId={activeCase._id} currentStage={activeCase.stage} />
                </div>
                <div>
                  <p className="text-xs font-medium text-navy/50 uppercase tracking-wider mb-1.5">Important date</p>
                  <input type="date" value={importantDate} onChange={e => handleDateChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white" />
                  {days !== null && (
                    <p className={`text-xs mt-1 font-medium ${days <= 3 ? 'text-red-500' : 'text-navy/50'}`}>
                      {days === 0 ? 'Today' : days > 0 ? `${days} days away` : `${Math.abs(days)} days ago`}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-navy/50 uppercase tracking-wider mb-1">Opened</p>
                  <p className="text-sm text-navy">{formatDate(activeCase.openedAt ?? activeCase.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add note */}
          {activeCase && (
            <Card>
              <CardHeader><CardTitle className="text-base">Add Note</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Write a note…" rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-navy/20 text-sm text-navy placeholder-navy/40 focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
                <div className="flex items-center justify-between">
                  <button onClick={() => setNoteVisible(!noteVisible)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${noteVisible ? 'text-emerald-600' : 'text-navy/40'}`}>
                    {noteVisible ? <Eye className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {noteVisible ? 'Visible to client' : 'Internal only'}
                  </button>
                  <Button size="sm" onClick={handleAddNote} disabled={savingNote || !note.trim()}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    {savingNote ? 'Saving…' : 'Add note'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column — docs + timeline */}
        <div className="lg:col-span-2 space-y-6">
          {activeCase && (
            <Card>
              <CardHeader><CardTitle>Document Checklist</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {docs.length === 0 ? (
                  <p className="text-navy/40 text-sm">No documents on this case yet.</p>
                ) : docs.map(doc => {
                  const config = DOC_STATUS_CONFIG[doc.status as keyof typeof DOC_STATUS_CONFIG]
                  const StatusIcon = config?.icon ?? FileText
                  return (
                    <div key={doc._id} className={`p-4 rounded-xl border transition-all ${
                      doc.status === 'approved'       ? 'border-emerald-200 bg-emerald-50/50' :
                      doc.status === 'rejected'       ? 'border-red-200 bg-red-50/30' :
                      doc.status === 'pending_review' ? 'border-amber-200 bg-amber-50/30' :
                      'border-navy/10 bg-white'
                    }`}>
                      <div className="flex items-start gap-3">
                        <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          doc.status === 'approved'       ? 'text-emerald-500' :
                          doc.status === 'rejected'       ? 'text-red-500' :
                          doc.status === 'pending_review' ? 'text-amber-500' : 'text-navy/30'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-navy">{doc.name}</p>
                            {config && <Badge variant={config.variant}>{config.label}</Badge>}
                            {doc.uploadedBy === 'admin' && <Badge variant="default" className="text-xs">Admin upload</Badge>}
                          </div>
                          {doc.fileName && <p className="text-xs text-navy/50 mt-0.5">{doc.fileName}</p>}
                          {doc.status === 'rejected' && doc.rejectionNote && (
                            <p className="text-xs text-red-600 mt-1.5 italic">"{doc.rejectionNote}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {doc.fileId && (
                            <button onClick={() => handleDownload(doc)} className="text-navy/40 hover:text-navy transition-colors" title="Download">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {/* Approve — only for pending review */}
                          {doc.status === 'pending_review' && (
                            <Button size="sm" variant="success" onClick={() => handleApprove(doc)}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </Button>
                          )}
                          {/* Reject — available for any non-rejected document */}
                          {doc.status !== 'rejected' && (
                            <Button size="sm" variant="destructive" onClick={() => { setRejectDoc(doc); setRejectNote('') }}>
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          )}
                          {/* Reset — clear rejection and return to not_submitted */}
                          {doc.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                const r = await resetDocumentStatus(doc._id, activeCase._id)
                                if (r?.error) toast.error(r.error)
                                else { toast.success('Rejection cleared — client can resubmit'); loadData() }
                              }}
                            >
                              Clear Rejection
                            </Button>
                          )}
                          <label className="cursor-pointer text-navy/40 hover:text-navy transition-colors" title="Upload on behalf">
                            <Upload className="w-4 h-4" />
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleAdminUpload(doc, f) }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Fee Checklist */}
          {activeCase && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gold" /> Fee Checklist
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setAddFeeOpen(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Fee
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                {fees.length === 0 ? (
                  <p className="text-navy/40 text-sm">
                    No fee items yet. They are seeded automatically when the client selects their service tier.
                  </p>
                ) : (
                  <>
                    {/* Summary row */}
                    <div className="flex gap-4 mb-4 text-sm">
                      <span className="text-slate-500">
                        Paid: <strong className="text-emerald-600">
                          {fmt(fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0))}
                        </strong>
                      </span>
                      <span className="text-slate-500">
                        Owing: <strong className="text-navy">
                          {fmt(fees.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0))}
                        </strong>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {fees.map(fee => {
                        const catColor = fee.category === 'government' ? '#6366f1'
                          : fee.category === 'agency' ? '#0B1C3A'
                          : fee.category === 'consultation' ? '#C9A84C'
                          : '#6b7280'
                        const catLabel = fee.category === 'government' ? 'Govt'
                          : fee.category === 'agency' ? 'Agency'
                          : fee.category === 'consultation' ? 'Consult'
                          : 'Other'

                        return (
                          <div
                            key={fee._id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              fee.status === 'paid'   ? 'border-emerald-200 bg-emerald-50/40' :
                              fee.status === 'waived' ? 'border-slate-200 bg-slate-50/60 opacity-60' :
                              'border-navy/10 bg-white'
                            }`}
                          >
                            {/* Status toggle */}
                            <button
                              title={fee.status === 'paid' ? 'Click to mark unpaid' : 'Click to mark paid'}
                              onClick={() => handleFeeStatus(fee._id, fee.status === 'paid' ? 'unpaid' : 'paid')}
                              className="flex-shrink-0"
                            >
                              {fee.status === 'paid' ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-emerald-600" />
                              ) : fee.status === 'waived' ? (
                                <MinusCircle className="w-5 h-5 text-slate-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-400 hover:text-amber-500" />
                              )}
                            </button>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-medium ${fee.status === 'paid' ? 'text-slate-400 line-through' : 'text-navy'}`}>
                                  {fee.label}
                                </p>
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ background: `${catColor}18`, color: catColor }}
                                >
                                  {catLabel}
                                </span>
                              </div>
                              {fee.paidAt && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Paid {new Date(fee.paidAt).toLocaleDateString('en-CA')}
                                </p>
                              )}
                              {fee.note && (
                                <p className="text-[11px] text-slate-400 mt-0.5 italic">{fee.note}</p>
                              )}
                            </div>

                            {/* Amount */}
                            <p className={`text-sm font-bold flex-shrink-0 ${fee.status === 'paid' ? 'text-emerald-600' : 'text-navy'}`}>
                              {fmt(fee.amount)}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {fee.status !== 'waived' && (
                                <button
                                  title="Mark as waived"
                                  onClick={() => handleFeeStatus(fee._id, 'waived')}
                                  className="text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                title="Delete fee"
                                onClick={() => handleDeleteFee(fee._id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {activeCase && (
            <Card>
              <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-navy/40 text-sm">No activity yet.</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-navy/10" />
                    <div className="space-y-4">
                      {logs.map((log, i) => (
                        <div key={log._id ?? i} className="flex items-start gap-4 pl-7 relative">
                          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: '#C9A84C', background: 'white' }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A84C' }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-navy">{log.description}</p>
                              {!(log.visibleToClient ?? log.visible_to_client) && (
                                <Lock className="w-3 h-3 text-navy/30 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-navy/40 mt-0.5">
                              {formatDate(log.createdAt ?? log.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Fee dialog */}
      <Dialog open={addFeeOpen} onOpenChange={setAddFeeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fee Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Label *</label>
              <input
                value={newFeeLabel}
                onChange={e => setNewFeeLabel(e.target.value)}
                placeholder="e.g. Medical Exam Fee"
                className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Amount (CAD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFeeAmount}
                  onChange={e => setNewFeeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Category</label>
                <select
                  value={newFeeCategory}
                  onChange={e => setNewFeeCategory(e.target.value as FeeItem['category'])}
                  className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                >
                  <option value="government">Government (IRCC)</option>
                  <option value="agency">Agency</option>
                  <option value="consultation">Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Note (optional)</label>
              <input
                value={newFeeNote}
                onChange={e => setNewFeeNote(e.target.value)}
                placeholder="e.g. Paid via Interac e-transfer"
                className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setAddFeeOpen(false)}>Cancel</Button>
              <Button
                onClick={() => handleAddFee(activeCase._id)}
                disabled={savingFee || !newFeeLabel.trim() || !newFeeAmount}
              >
                {savingFee ? 'Adding…' : 'Add Fee'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectDoc} onOpenChange={open => { if (!open) setRejectDoc(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Document</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-navy/70">
              Rejecting: <strong>{rejectDoc?.name}</strong>. The client will see your note and can re-upload.
            </p>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Reason *</label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                placeholder="e.g. Document is blurry — please re-scan and upload a clear copy"
                rows={3} className="w-full px-3 py-2.5 rounded-lg border border-navy/20 text-sm text-navy placeholder-navy/40 focus:outline-none focus:ring-2 focus:ring-gold resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRejectDoc(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectNote.trim()}>Reject document</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
