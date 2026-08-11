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
          left: '16px',
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
              <svg viewBox="0 0 32 32" width="22" height="22" fill="#fff">
                <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.352.635 4.645 1.84 6.664L2.667 29.333l6.84-1.794A13.277 13.277 0 0 0 16.003 29.333c7.364 0 13.33-5.97 13.33-13.333 0-7.364-5.966-13.333-13.33-13.333zm0 24.182a11.016 11.016 0 0 1-5.617-1.539l-.402-.24-4.06 1.065 1.083-3.954-.263-.415A11.016 11.016 0 0 1 4.984 16c0-6.076 4.943-11.015 11.019-11.015 6.074 0 11.015 4.94 11.015 11.015 0 6.073-4.94 11.015-11.015 11.015v-.166zm6.047-8.25c-.33-.165-1.955-.965-2.258-1.074-.303-.11-.524-.165-.745.165-.22.33-.854 1.074-.046 1.298.303.22.745.33 1.239.55.495.22.99.385 1.404.275.413-.11.855-.44 1.156-.826.303-.385.44-.826.303-1.074-.138-.247-.44-.358-.799-.523z"/>
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
              <svg viewBox="0 0 32 32" width="16" height="16" fill="#fff">
                <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.352.635 4.645 1.84 6.664L2.667 29.333l6.84-1.794A13.277 13.277 0 0 0 16.003 29.333c7.364 0 13.33-5.97 13.33-13.333 0-7.364-5.966-13.333-13.33-13.333zm6.047 16.182c-.33-.165-1.955-.965-2.258-1.074-.303-.11-.524-.165-.745.165-.22.33-.854 1.074-.046 1.298.303.22.745.33 1.239.55.495.22.99.385 1.404.275.413-.11.855-.44 1.156-.826.303-.385.44-.826.303-1.074-.138-.247-.44-.358-.799-.523z"/>
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
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999,
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
          <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
            <path d="M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.352.635 4.645 1.84 6.664L2.667 29.333l6.84-1.794A13.277 13.277 0 0 0 16.003 29.333c7.364 0 13.33-5.97 13.33-13.333 0-7.364-5.966-13.333-13.33-13.333zm0 24.182a11.016 11.016 0 0 1-5.617-1.539l-.402-.24-4.06 1.065 1.083-3.954-.263-.415A11.016 11.016 0 0 1 4.984 16c0-6.076 4.943-11.015 11.019-11.015 6.074 0 11.015 4.94 11.015 11.015 0 6.073-4.94 11.015-11.015 11.015v-.166zm6.047-8.25c-.33-.165-1.955-.965-2.258-1.074-.303-.11-.524-.165-.745.165-.22.33-.854 1.074-.046 1.298.303.22.745.33 1.239.55.495.22.99.385 1.404.275.413-.11.855-.44 1.156-.826.303-.385.44-.826.303-1.074-.138-.247-.44-.358-.799-.523-.358-.165-.551-.247-.854-.385z"/>
          </svg>
        )}
      </button>
    </>
  )
}
