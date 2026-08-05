import { NextRequest, NextResponse } from 'next/server'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/db/models'
import { sendRaw, getAdminEmails } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, inquiry } = body

    if (!name || !email || !inquiry) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    const settings = await SiteSettings.findOne().lean()
    const siteName = settings?.siteName ?? 'Global Immigration Hub'

    const adminEmails = await getAdminEmails()

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0B1C3A;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C9A84C;margin:0;font-size:18px;">New Site Inquiry — ${siteName}</h2>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 12px;font-weight:700;color:#555;width:140px;border-bottom:1px solid #eee;">Name</td>
              <td style="padding:10px 12px;border-bottom:1px solid #eee;">${name}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Email</td>
              <td style="padding:10px 12px;border-bottom:1px solid #eee;">
                <a href="mailto:${email}" style="color:#0084ff;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Phone</td>
              <td style="padding:10px 12px;border-bottom:1px solid #eee;">${phone || '—'}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 12px;font-weight:700;color:#555;">Inquiry</td>
              <td style="padding:10px 12px;font-weight:600;color:#0B1C3A;">${inquiry}</td>
            </tr>
          </table>
          <p style="font-size:13px;color:#888;margin:16px 0 0;">
            Reply directly to this email to contact the prospect.
          </p>
        </div>
      </div>
    `

    await sendRaw({
      to:      adminEmails,
      replyTo: email,
      subject: `New Inquiry: ${inquiry} — ${name}`,
      html,
    })

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (err) {
    console.error('[inquiry]', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500, headers: CORS })
  }
}
