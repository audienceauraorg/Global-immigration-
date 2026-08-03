'use client'
import { useState, useRef } from 'react'
import { Upload, CheckCircle2, Clock, XCircle, FileText, AlertTriangle } from 'lucide-react'
import { uploadDocument } from '@/lib/actions/documents'
import { toast } from 'sonner'
import type { Document } from '@/types/database'

const STATUS_CONFIG = {
  not_submitted:  { label: 'Not uploaded',         icon: FileText,     iconColor: 'rgba(11,28,58,0.3)',  badge: { bg: '#EEF0F6', text: 'rgba(11,28,58,0.4)' } },
  pending_review: { label: 'Pending review',       icon: Clock,        iconColor: '#f59e0b',             badge: { bg: '#fffbeb', text: '#b45309' } },
  approved:       { label: 'Approved',             icon: CheckCircle2, iconColor: '#10b981',             badge: { bg: '#ecfdf5', text: '#065f46' } },
  rejected:       { label: 'Rejected — re-upload', icon: XCircle,      iconColor: '#ef4444',             badge: { bg: '#fef2f2', text: '#991b1b' } },
}

interface DocUploadRowProps {
  docName: string
  caseId: string
  document?: Document
}

export function DocUploadRow({ docName, caseId, document }: DocUploadRowProps) {
  const [uploading, setUploading]   = useState(false)
  const [currentDoc, setCurrentDoc] = useState(document)
  const fileRef                      = useRef<HTMLInputElement>(null)

  const status   = currentDoc?.status ?? 'not_submitted'
  const config   = STATUS_CONFIG[status]
  const Icon     = config.icon
  const approved = status === 'approved'

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docName', docName)
      formData.append('caseId', caseId)
      const result = await uploadDocument(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Document uploaded successfully')
        setCurrentDoc(result.document ?? undefined)
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex items-start gap-3.5 py-4 transition-all duration-200">
      {/* Status icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: config.badge.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: config.iconColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-navy leading-tight">{docName}</p>

        {currentDoc?.file_name && (
          <p className="text-[11.5px] text-navy/40 mt-0.5 truncate">{currentDoc.file_name}</p>
        )}

        {status === 'rejected' && currentDoc?.rejection_note && (
          <div
            className="mt-2 flex items-start gap-2 p-2.5 rounded-lg"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-red-700">{currentDoc.rejection_note}</p>
          </div>
        )}
      </div>

      {/* Right: badge + upload */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ background: config.badge.bg, color: config.badge.text }}
        >
          {config.label}
        </span>

        {!approved && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: uploading
                  ? 'rgba(11,28,58,0.06)'
                  : 'linear-gradient(135deg, #C9A84C, #e8c76a)',
                color: uploading ? 'rgba(11,28,58,0.4)' : '#0B1C3A',
                cursor: uploading ? 'wait' : 'pointer',
              }}
            >
              <Upload className="w-3 h-3" />
              {uploading ? 'Uploading…' : status === 'rejected' ? 'Re-upload' : 'Upload'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
