'use client'
import { useEffect, useState } from 'react'

const INQUIRY_OPTIONS = [
  'Study Permit / Study Visa',
  'Work Permit',
  'Express Entry / PR Application',
  'Spousal & Family Sponsorship',
  'Visitor Visa / TRV',
  'SINP / Provincial Nominee Program',
  'General Inquiry',
]

const SESSION_KEY = 'gih_entry_popup_shown'

export default function SiteEntryPopup() {
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [inquiry, setInquiry] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return
    const t = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, inquiry }),
      })
    } catch {
      // Non-fatal
    }
    setDone(true)
    sessionStorage.setItem(SESSION_KEY, '1')
    setTimeout(() => setVisible(false), 3000)
  }

  if (!visible) return null

  return (
    /* Overlay */
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        fontFamily: 'var(--font-poppins, Poppins, system-ui, sans-serif)',
      }}
    >
      {/* Card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          background: '#fff', borderRadius: '20px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#0B1C3A,#163060)',
          padding: '24px 24px 20px',
          position: 'relative',
        }}>
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position: 'absolute', top: '14px', right: '16px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontSize: '24px', lineHeight: 1,
            }}
          >
            ×
          </button>
          <div style={{
            display: 'inline-block',
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '12px', color: '#C9A84C', fontWeight: 600,
            marginBottom: '10px', letterSpacing: '0.04em',
          }}>
            FREE CONSULTATION
          </div>
          <h2 style={{
            color: '#fff', margin: '0 0 6px',
            fontSize: '22px', fontWeight: 700, lineHeight: 1.2,
          }}>
            Start Your Canada Immigration Journey
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '14px' }}>
            Tell us about your goals — we&apos;ll reach out to guide you.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {!done ? (
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#444', marginBottom: '5px' }}>
                  Full Name <span style={{ color: '#d33' }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  maxLength={80}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e0e0e0', fontSize: '14px',
                    outline: 'none', fontFamily: 'inherit', color: '#222',
                    background: '#fafafa',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#444', marginBottom: '5px' }}>
                  Email Address <span style={{ color: '#d33' }}>*</span>
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. maria@email.com"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e0e0e0', fontSize: '14px',
                    outline: 'none', fontFamily: 'inherit', color: '#222',
                    background: '#fafafa',
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#444', marginBottom: '5px' }}>
                  Phone <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. +1 306 123 4567"
                  maxLength={30}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e0e0e0', fontSize: '14px',
                    outline: 'none', fontFamily: 'inherit', color: '#222',
                    background: '#fafafa',
                  }}
                />
              </div>

              {/* Inquiry */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#444', marginBottom: '5px' }}>
                  I&apos;m interested in <span style={{ color: '#d33' }}>*</span>
                </label>
                <select
                  required
                  value={inquiry}
                  onChange={e => setInquiry(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e0e0e0', fontSize: '14px',
                    background: '#fafafa', color: inquiry ? '#222' : '#999',
                    outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <option value="" disabled>Select a program…</option>
                  {INQUIRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ color: '#222' }}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', padding: '13px',
                  background: submitting
                    ? '#aaa'
                    : 'linear-gradient(135deg,#C9A84C,#e0ba5c)',
                  color: '#0B1C3A', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.02em',
                }}
              >
                {submitting ? 'Sending…' : 'Get Free Consultation'}
              </button>

              <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: '10px 0 0' }}>
                No commitment. We&apos;ll contact you within 24 hours.
              </p>
            </form>
          ) : (
            /* Success */
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#C9A84C,#e0ba5c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#0B1C3A">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3 style={{ color: '#0B1C3A', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                Thank You, {name.split(' ')[0]}!
              </h3>
              <p style={{ color: '#666', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                We&apos;ve received your inquiry about <strong>{inquiry}</strong>.<br/>
                Our team will reach out to you shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
