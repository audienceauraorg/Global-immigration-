'use client'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateCaseStage } from '@/lib/actions/cases'
import { toast } from 'sonner'

const STAGES = ['Intake', 'Docs Collection', 'Review', 'Submitted', 'Decision', 'Closed'] as const

interface StageDropdownProps {
  caseId: string
  currentStage: string
}

export function StageDropdown({ caseId, currentStage }: StageDropdownProps) {
  const [stage, setStage] = useState(currentStage)
  const [loading, setLoading] = useState(false)

  async function handleChange(newStage: string) {
    if (newStage === stage) return
    setLoading(true)
    const result = await updateCaseStage(caseId, newStage)
    if (result?.error) {
      toast.error('Failed to update stage')
    } else {
      setStage(newStage)
      toast.success(`Stage updated to ${newStage}`)
    }
    setLoading(false)
  }

  return (
    <Select value={stage} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map(s => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
