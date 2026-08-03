'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Globe, Mail, Lock, AlertCircle } from 'lucide-react'
import { signIn } from '@/lib/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in w-full">
      {/* Logo mark */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
        >
          <Globe className="w-7 h-7 text-slate-950" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/50 text-sm mt-1">Sign in to your portal or staff dashboard</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  '--tw-ring-color': '#C9A84C',
                } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  '--tw-ring-color': '#C9A84C',
                } as React.CSSProperties}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-950 transition-all hover:opacity-90 disabled:opacity-60 mt-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #e8c76a)' }}
          >
            {loading ? 'Signing in…' : 'Sign in to Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-sm text-white/50">
            New client?{' '}
            <Link href="/signup" className="text-gold hover:text-yellow-300 font-semibold transition-colors">
              Enroll Now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
