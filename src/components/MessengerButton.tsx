'use client'
import { useState } from 'react'

const INQUIRY_OPTIONS = [
  'Study Permit / Study Visa',
  'Work Permit',
  'Express Entry / PR Application',
  'Spousal & Family Sponsorship',
  'Visitor Visa / TRV',
  'SINP / Provincial Nominee Program',
  'General Inquiry',
]

const MESSENGER_URL = 'https://m.me/327884021233501'

export default function MessengerButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [inquiry, setInquiry] = useState('')
  const [sent, setSent] = useState(false)

  function handleChat(e: React.FormEvent) {
    e.preventDefault()
    const namePart = name.trim() ? `Hi! My name is ${name.trim()}.` : 'Hi!'
    const topic = inquiry || 'General Inquiry'
    const msg = `${namePart} I'm inquiring about ${topic}. Can you help me?`
    navigator.clipboard?.writeText(msg).catch(() => {})
    setSent(true)
    window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer')
    setTimeout(() => {
      setSent(false)
      setOpen(false)
    }, 3000)
  }

  return (
    <>
      {/* Popup form */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '92px', right: '24px', zIndex: 9998,
          width: '288px', background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,132,255,0.12)',
          overflow: 'hidden',
          fontFamily: 'var(--font-poppins, Poppins, system-ui, sans-serif)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#0084ff,#00c6ff)',
            padding: '14px 16px 12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Chat with Us</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '2px' }}>
                We typically reply within minutes
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: '22px', lineHeight: 1,
                padding: '0 0 0 8px', marginTop: '-2px', opacity: 0.85,
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          {!sent ? (
            <form onSubmit={handleChat} style={{ padding: '16px' }}>
              {/* Name field */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 600,
                  color: '#555', marginBottom: '5px',
                }}>
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

              {/* Inquiry select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '12px', fontWeight: 600,
                  color: '#555', marginBottom: '5px',
                }}>
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
                    appearance: 'auto',
                  }}
                >
                  <option value="" disabled>Select a topic…</option>
                  {INQUIRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ color: '#222' }}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  width: '100%', padding: '11px',
                  background: 'linear-gradient(135deg,#0084ff,#00c6ff)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.02em',
                }}
              >
                Start Chat on Messenger
              </button>
              <p style={{
                fontSize: '11px', color: '#aaa', textAlign: 'center',
                margin: '8px 0 0',
              }}>
                Your message will be copied — paste it to begin.
              </p>
            </form>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#0084ff,#00c6ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, color: '#0084ff', fontSize: '15px', marginBottom: '4px' }}>
                Message Copied!
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Paste it in Messenger to start your conversation.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat form' : 'Chat with us on Messenger'}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#0084ff,#00c6ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,132,255,0.45)',
          border: 'none', cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 22px rgba(0,132,255,0.55)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,132,255,0.45)'
        }}
      >
        {open ? (
          /* X icon when open */
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        ) : (
          /* Messenger icon */
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.377 5.504 3.538 7.24V22l3.332-1.83c.89.246 1.833.378 2.13.378 5.522 0 10-4.144 10-9.305C21 6.145 17.523 2 12 2zm1.008 12.535-2.548-2.718-4.976 2.718 5.474-5.813 2.612 2.718 4.91-2.718-5.472 5.813z"/>
          </svg>
        )}
      </button>
    </>
  )
}
