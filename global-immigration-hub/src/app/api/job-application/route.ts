import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings, User } from '@/lib/db/models'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, position } = body

    if (!name || !email || !phone || !position) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    const resend = getResend()
    if (!resend) {
      // No email configured — still return success so the UX isn't broken
      console.warn('[job-application] RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ ok: true })
    }

    await connectDB()
    const settings = await SiteSettings.findOne().lean()
    const fromName = settings?.emailFromName ?? 'Global Immigration Hub'
    const fromAddr = settings?.emailFromAddr ?? 'onboarding@resend.dev'
    const siteName = settings?.siteName ?? 'Global Immigration Hub'

    // Get admin/staff emails to notify
    const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
    const adminEmails: string[] = staff.map((u: any) => u.email).filter(Boolean)
    if (adminEmails.length === 0) adminEmails.push(fromAddr)

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0B1C3A;margin-bottom:4px;">New Job Interest — ${siteName}</h2>
        <p style="color:#666;font-size:14px;margin-top:0;">Someone has expressed interest in a position.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:10px 12px;font-weight:700;color:#555;width:160px;border-bottom:1px solid #eee;">Name</td><td style="padding:10px 12px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Email</td><td style="padding:10px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:10px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Phone</td><td style="padding:10px 12px;border-bottom:1px solid #eee;">${phone}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:10px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Country</td><td style="padding:10px 12px;border-bottom:1px solid #eee;">${country || '—'}</td></tr>
          <tr><td style="padding:10px 12px;font-weight:700;color:#555;">Position</td><td style="padding:10px 12px;">${position}</td></tr>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#888;">Reply directly to this email to contact the applicant.</p>
      </div>
    `

    await resend.emails.send({
      from: `${fromName} <${fromAddr}>`,
      to: adminEmails,
      replyTo: email,
      subject: `Job Interest: ${position} — ${name} (${country || 'Unknown'})`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[job-application]', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
