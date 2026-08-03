'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, FolderOpen, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Program { _id: string; country: string; name: string; checklist: string[] }

const COUNTRIES = ['Canada', 'United Kingdom', 'Germany', 'Australia', 'United States', 'Other']

export default function ProgramsPage() {
  const [programs, setPrograms]       = useState<Program[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [country, setCountry]         = useState('Canada')
  const [name, setName]               = useState('')
  const [checklistItems, setChecklist] = useState<string[]>([''])
  const [saving, setSaving]           = useState(false)

  useEffect(() => { loadPrograms() }, [])

  async function loadPrograms() {
    const res = await fetch('/api/programs')
    const data = await res.json()
    setPrograms(data ?? [])
    setLoading(false)
  }

  function addItem() { setChecklist(p => [...p, '']) }
  function removeItem(i: number) { setChecklist(p => p.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, val: string) { setChecklist(p => p.map((v, idx) => idx === i ? val : v)) }

  async function handleSave() {
    const checklist = checklistItems.filter(s => s.trim())
    if (!name.trim()) return toast.error('Program name is required')
    if (checklist.length === 0) return toast.error('Add at least one document')
    setSaving(true)
    const res = await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, name: name.trim(), checklist }),
    })
    if (res.ok) {
      toast.success('Program created')
      setShowForm(false); setName(''); setCountry('Canada'); setChecklist([''])
      loadPrograms()
    } else {
      const err = await res.json()
      toast.error(err.error ?? 'Failed to create program')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this program? Existing cases will not be affected.')) return
    const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Program deleted'); loadPrograms() }
    else toast.error('Failed to delete program')
  }

  const grouped = programs.reduce<Record<string, Program[]>>((acc, p) => {
    if (!acc[p.country]) acc[p.country] = []
    acc[p.country].push(p)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Programs</h1>
          <p className="text-navy/60 mt-1">Manage immigration programs and document checklists</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Program
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-gold/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New Program</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-navy/40 hover:text-navy transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white">
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Program name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Express Entry FSW" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-navy">Required documents</label>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add item</Button>
              </div>
              <div className="space-y-2">
                {checklistItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-navy/30 flex-shrink-0" />
                    <Input value={item} onChange={e => updateItem(i, e.target.value)} placeholder={`Document ${i + 1}`} />
                    <button onClick={() => removeItem(i)} className="text-navy/30 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Program'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-navy/40">Loading programs…</div>
      ) : Object.entries(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-navy/40">
          <FolderOpen className="w-12 h-12 mb-3" />
          <p>No programs yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([countryName, progs]) => (
            <div key={countryName}>
              <h2 className="text-sm font-semibold text-navy/50 uppercase tracking-wider mb-3">{countryName}</h2>
              <div className="grid gap-4">
                {progs.map(prog => (
                  <Card key={prog._id}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-navy">{prog.name}</h3>
                          <p className="text-xs text-navy/50 mt-1">{prog.checklist.length} required documents</p>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {prog.checklist.map((doc: string) => (
                              <span key={doc} className="px-2 py-1 text-xs rounded-md bg-navy/5 text-navy/70">{doc}</span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(prog._id)} className="text-navy/30 hover:text-red-500 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
