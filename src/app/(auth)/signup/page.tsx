'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Globe, Mail, Lock, User, Phone, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react'
import { signUp } from '@/lib/actions/auth'

const IMMIGRATION_PROGRAMS = [
  'Express Entry',
  'Family Sponsorship',
  'Study Permit',
  'Work Permit',
  'Permanent Residency',
  'Citizenship Application',
  'Refugee & Asylum',
  'Other',
]

export default function SignUpPage() {
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form     = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm  = (form.elements.namedItem('confirm_password') as HTMLInputElement).value

    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const result = await signUp(new FormData(form))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in w-full">
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-7">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
        >
          <Globe className="w-7 h-7 text-slate-950" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
        <p className="text-white/50 text-sm mt-1">Select your program and enroll today</p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {error && (
          <div
            className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(220,50,50,0.15)', border: '1px solid rgba(220,50,50,0.3)' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Full name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Smith"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Program */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Immigration Program</label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <select
                name="program_type"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer"
                style={{ background: '#0d1f3c', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <option value="">Choose a program (optional)…</option>
                {IMMIGRATION_PROGRAMS.map(p => (
                  <option key={p} value={p} style={{ background: '#0d1f3c', color: 'white' }}>{p}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-white/30 mt-1">You can also select your program after signing up.</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="confirm_password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat password"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-950 transition-all hover:opacity-90 disabled:opacity-60 mt-1 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
          >
            {loading ? 'Creating Account…' : 'Complete Enrollment →'}
          </button>
        </form>

        {/* Success note */}
        <div className="mt-4 flex items-start gap-2.5 px-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/35 leading-relaxed">
            Free to create — a consultant will review your enrollment and reach out within 1 business day.
          </p>
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 text-center">
          <p className="text-sm text-white/50">
            Already enrolled?{' '}
            <Link href="/login" className="text-gold hover:text-yellow-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
