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

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#eef0f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f4;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#fff;padding:24px 40px 20px;border-radius:12px 12px 0 0;text-align:center;border-bottom:4px solid #C9A84C;">
    <img src="https://www.immigrationdepot.online/wp-content/uploads/2020/06/logo_dark-300x82.png" alt="The Immigration Depot" width="180" style="height:auto;display:block;margin:0 auto;">
  </td></tr>
  <tr><td style="background:#0B1C3A;padding:22px 40px;">
    <p style="margin:0 0 3px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:700;color:#C9A84C;">New Site Inquiry</p>
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 40px;">
    <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Inquiry Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:28px;">
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:120px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Name</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${name}</td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Email</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;border-bottom:1px solid #f1f5f9;"><a href="mailto:${email}" style="color:#0B1C3A;text-decoration:none;font-weight:500;">${email}</a></td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Phone</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${phone || '—'}</td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;background:#fafbfc;">Inquiry</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#0B1C3A;">${inquiry}</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="mailto:${email}" style="display:inline-block;background:#0B1C3A;color:#C9A84C;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:6px;letter-spacing:0.3px;">Reply to ${name}</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:18px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:11px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; Site inquiry notification</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

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
