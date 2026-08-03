import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings, User } from '@/lib/db/models'
import { sendRaw } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, country, position } = body

    if (!name || !email || !phone || !position) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const settings = await SiteSettings.findOne().lean()
    const siteName = settings?.siteName ?? 'Global Immigration Hub'

    const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminEmails: string[] = staff.map((u: any) => u.email).filter(Boolean)
    if (adminEmails.length === 0) {
      adminEmails.push(process.env.SMTP_FROM_ADDR ?? 'globalimmigrationhub.ca@gmail.com')
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0B1C3A;margin-bottom:4px;">New Job Interest — ${siteName}</h2>
        <p style="color:#666;font-size:14px;margin-top:0;">Someone has expressed interest in a position.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px 12px;font-weight:700;color:#555;width:120px;border-bottom:1px solid #eee;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${phone}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Country</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${country || '—'}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:700;color:#555;">Position</td><td style="padding:8px 12px;">${position}</td></tr>
        </table>
        <p style="font-size:13px;color:#888;margin-top:16px;">Reply directly to this email to contact the applicant.</p>
      </div>
    `

    await sendRaw({
      to:      adminEmails,
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
