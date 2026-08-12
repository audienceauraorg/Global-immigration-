'use client'
import { useState } from 'react'

const WHATSAPP_NUMBER = '12368799173'

const INQUIRY_OPTIONS = [
  'Study Permit / Study Visa',
  'Work Permit',
  'Express Entry / PR Application',
  'Spousal & Family Sponsorship',
  'Visitor Visa / TRV',
  'SINP / Provincial Nominee Program',
  'General Inquiry',
]

export default function WhatsAppButton() {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [inquiry, setInquiry] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    // Send email notification to admin
    try {
      await fetch('/api/chat-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, inquiry, message, source: 'whatsapp' }),
      })
    } catch {
      // Fire and forget — still open WhatsApp even if email fails
    }

    // Build pre-filled WhatsApp message
    const parts: string[] = []
    if (name.trim()) parts.push(`Hi, my name is ${name.trim()}.`)
    parts.push(`I'm inquiring about: ${inquiry}.`)
    if (message.trim()) parts.push(message.trim())

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(parts.join(' '))}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')

    setOpen(false)
    setName('')
    setPhone('')
    setInquiry('')
    setMessage('')
    setSending(false)
  }

  return (
    <>
      {/* Popup */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '92px',
          right: '16px',
          zIndex: 9998,
          width: '300px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(37,211,102,0.12)',
          overflow: 'hidden',
          fontFamily: 'var(--font-poppins, Poppins, system-ui, sans-serif)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#25D366,#128C7E)',
            padding: '14px 16px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* WhatsApp icon */}
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>
                  WhatsApp Us
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '3px' }}>
                  We typically reply within minutes
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: '22px', lineHeight: 1,
                padding: '0 0 0 10px', marginTop: '-1px', opacity: 0.85,
              }}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '16px' }}>

            {/* Name */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                Your Name{' '}
                <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Maria"
                maxLength={60}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #e0e0e0', fontSize: '14px',
                  outline: 'none', fontFamily: 'inherit', color: '#222',
                  background: '#fafafa',
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                Phone / WhatsApp Number{' '}
                <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +1 234 567 8900"
                maxLength={20}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #e0e0e0', fontSize: '14px',
                  outline: 'none', fontFamily: 'inherit', color: '#222',
                  background: '#fafafa',
                }}
              />
            </div>

            {/* Inquiry topic */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                I&apos;m inquiring about&hellip;{' '}
                <span style={{ color: '#d33', fontSize: '11px' }}>*</span>
              </label>
              <select
                required
                value={inquiry}
                onChange={e => setInquiry(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #e0e0e0', fontSize: '13px',
                  background: '#fafafa', color: inquiry ? '#222' : '#999',
                  outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                }}
              >
                <option value="" disabled>Select a topic…</option>
                {INQUIRY_OPTIONS.map(opt => (
                  <option key={opt} value={opt} style={{ color: '#222' }}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '5px' }}>
                Brief Message{' '}
                <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Any additional details…"
                rows={2}
                maxLength={300}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: '8px',
                  border: '1.5px solid #e0e0e0', fontSize: '13px',
                  outline: 'none', fontFamily: 'inherit', color: '#222',
                  background: '#fafafa', resize: 'none',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%', padding: '11px',
                background: sending ? '#aaa' : 'linear-gradient(135deg,#25D366,#128C7E)',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              {sending ? 'Opening WhatsApp…' : 'Chat on WhatsApp'}
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close' : 'Chat with us on WhatsApp'}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#25D366,#128C7E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37,211,102,0.45)',
          border: 'none', cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 22px rgba(37,211,102,0.55)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(37,211,102,0.45)'
        }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        )}
      </button>
    </>
  )
}
