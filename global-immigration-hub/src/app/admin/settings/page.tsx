'use client'
import { useState, useEffect } from 'react'
import { Save, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface SettingsData {
  siteName: string
  siteTagline: string
  rcicNumber: string
  contactEmail: string
  emailFromName: string
  emailFromAddr: string
  maxUploadMb: number
  selfRegister: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'Global Immigration Hub',
    siteTagline: 'Your trusted immigration partner',
    rcicNumber: '',
    contactEmail: '',
    emailFromName: 'Global Immigration Hub',
    emailFromAddr: '',
    maxUploadMb: 10,
    selfRegister: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data) setSettings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) { toast.success('Settings saved') }
    else { toast.error('Failed to save settings') }
    setSaving(false)
  }

  function update(key: keyof SettingsData, value: any) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="flex items-center justify-center h-48 text-navy/40">Loading settings…</div>

  const field = (label: string, key: keyof SettingsData, description?: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-navy mb-1">{label}</label>
      {description && <p className="text-xs text-navy/50 mb-2">{description}</p>}
      <Input
        type={type}
        value={(settings[key] as string | number) ?? ''}
        onChange={e => update(key, type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </div>
  )

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-navy" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy">Settings</h1>
          <p className="text-navy/60 mt-0.5">Manage site-wide configuration</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Name and tagline shown across the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field('Site name', 'siteName', 'Shown in page titles and emails')}
            {field('Site tagline', 'siteTagline', 'Shown on the login and portal header')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Regulatory information shown in client portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field('RCIC number', 'rcicNumber', 'Displayed in the client portal footer')}
            {field('Contact email', 'contactEmail', 'Displayed in the client portal footer')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Configure outgoing notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {field('From name', 'emailFromName', 'Sender name on notification emails')}
            {field('From address', 'emailFromAddr', 'Must match your verified Resend domain')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Uploads</CardTitle></CardHeader>
          <CardContent>
            {field('Max upload size (MB)', 'maxUploadMb', 'Max file size clients can upload', 'number')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Registration</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-navy">Allow self-registration</p>
                <p className="text-xs text-navy/50 mt-0.5">Clients can create accounts themselves</p>
              </div>
              <button
                role="switch"
                aria-checked={settings.selfRegister}
                onClick={() => update('selfRegister', !settings.selfRegister)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.selfRegister ? 'bg-gold' : 'bg-navy/20'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  settings.selfRegister ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
