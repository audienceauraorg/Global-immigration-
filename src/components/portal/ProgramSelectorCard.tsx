'use client'
import { useState, useEffect } from 'react'
import { FolderOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { selectClientProgram } from '@/lib/actions/cases'
import { toast } from 'sonner'

interface Program { _id: string; country: string; name: string; checklist: string[] }

export function ProgramSelectorCard() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/programs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPrograms(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleStartProgram() {
    if (!selectedId) return toast.error('Please select an immigration program')
    setSubmitting(true)
    const res = await selectClientProgram(selectedId)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Program selected! Your checklist is ready.')
      window.location.reload()
    }
    setSubmitting(false)
  }

  const selectedProg = programs.find(p => p._id === selectedId)

  return (
    <Card className="max-w-2xl mx-auto border-gold/40 shadow-xl">
      <CardHeader className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #0B1C3A, #1a3560)' }}>
          <FolderOpen className="w-7 h-7" style={{ color: '#C9A84C' }} />
        </div>
        <CardTitle className="text-xl font-bold text-navy">Select Your Immigration Program</CardTitle>
        <CardDescription>
          Choose the immigration pathway you are applying for to initialize your document checklist and case timeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {loading ? (
          <div className="py-8 text-center text-navy/40 text-sm">Loading available programs…</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-2">Immigration Pathway</label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-navy/20 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold bg-white"
              >
                <option value="">Choose a program...</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.country} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProg && (
              <div className="p-4 rounded-xl bg-navy/5 border border-navy/10 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/20 text-amber-800">
                    {selectedProg.country}
                  </span>
                  <span className="text-xs text-navy/50">{selectedProg.checklist.length} Required Documents</span>
                </div>
                <p className="font-semibold text-navy text-sm">{selectedProg.name}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-navy/60">Checklist Overview:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {selectedProg.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-navy/80 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartProgram}
              disabled={submitting || !selectedId}
              className="w-full h-11 text-sm font-bold bg-gold text-navy hover:bg-gold/90 transition-all shadow-md"
            >
              {submitting ? 'Initializing Case…' : 'Start Application Checklist'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
