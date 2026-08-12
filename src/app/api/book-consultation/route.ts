import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings, ConsultationBooking } from '@/lib/db/models'
import {
  OFFICIAL_FEES,
  AGENCY_FEES,
  CONSULTATION_FEE,
  fmt,
  type ProgramKey,
} from '@/lib/fees'
import { sendRaw, getAdminEmails } from '@/lib/email'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, phone,
      preferredDate, preferredTime,
      topic, message,
      serviceTier,
      paymentMethod,
      receiptBase64, receiptMimeType, receiptFileName,
    } = body

    if (!name || !email || !phone || !topic) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400, headers: CORS_HEADERS })
    }

    await connectDB()
    const settings  = await SiteSettings.findOne().lean()
    const siteName  = settings?.siteName ?? 'Global Immigration Hub'

    // ── Store booking record ──────────────────────────────────────────────────
    const booking = await ConsultationBooking.create({
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      topic,
      message,
      serviceTier:     serviceTier || null,
      consultationFee: CONSULTATION_FEE,
      paymentMethod:   paymentMethod === 'pay_now' ? 'pay_now' : 'pay_later',
      paymentStatus:   paymentMethod === 'pay_now' && receiptBase64 ? 'received' : 'pending',
      receiptEmailed:  !!(paymentMethod === 'pay_now' && receiptBase64),
      receiptFileName: receiptFileName || null,
    })

    // ── Get admin recipients ──────────────────────────────────────────────────
    const adminEmails = await getAdminEmails()

    // ── Build fee context ─────────────────────────────────────────────────────
    const programKey    = topic as ProgramKey
    const officialEntry = OFFICIAL_FEES[programKey]
    const agencyEntry   = AGENCY_FEES[programKey]

    const dateLabel = preferredDate
      ? new Date(preferredDate).toLocaleDateString('en-CA', { dateStyle: 'long' })
      : '—'
    const timeLabel = preferredTime
      ? new Date(`1970-01-01T${preferredTime}`).toLocaleTimeString('en-CA', {
          hour: '2-digit', minute: '2-digit', hour12: true,
        })
      : '—'

    const tierLabel =
      serviceTier === 'full_handling' ? 'Full Agent Handling' :
      serviceTier === 'filing_only'   ? 'Agency-Assisted Filing' :
      'Not selected'

    const agencyFeeAmt =
      serviceTier === 'full_handling' ? agencyEntry?.fullHandling :
      serviceTier === 'filing_only'   ? agencyEntry?.filingOnly  :
      null

    const totalFee =
      agencyFeeAmt != null && officialEntry
        ? officialEntry.total + agencyFeeAmt
        : null

    const payLabel = paymentMethod === 'pay_now' ? 'Paying now — receipt submitted' : 'Will pay when contacted'

    // ── Build admin HTML email ────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#eef0f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f4;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr>
    <td style="background:#fff;padding:24px 40px 20px;border-radius:12px 12px 0 0;text-align:center;border-bottom:4px solid #C9A84C;">
      <img src="https://www.immigrationdepot.online/wp-content/uploads/2020/06/logo_dark-300x82.png" alt="The Immigration Depot" width="180" style="height:auto;display:block;margin:0 auto;">
    </td>
  </tr>

  <tr>
    <td style="background:#0B1C3A;padding:22px 40px;">
      <p style="margin:0 0 3px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:700;color:#C9A84C;">New Consultation Request</p>
      <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </td>
  </tr>

  <tr>
    <td style="background:#fff;padding:32px 40px;">

      ${receiptBase64 ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:8px;padding:12px 16px;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;color:#15803d;">&#10003; Payment receipt attached &mdash; review below</td></tr></table>` : ''}

      <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Contact Details</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:24px;">
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Name</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${name}</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Email</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;border-bottom:1px solid #f1f5f9;"><a href="mailto:${email}" style="color:#0B1C3A;text-decoration:none;font-weight:500;">${email}</a></td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Phone</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${phone}</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Date</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${dateLabel}</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${message ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Time</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${message ? '1px solid #f1f5f9' : 'none'};">${timeLabel}</td></tr>
        ${message ? `<tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;background:#fafbfc;vertical-align:top;">Notes</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;white-space:pre-wrap;">${message}</td></tr>` : ''}
      </table>

      <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Program &amp; Service</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:24px;">
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Program</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#0B1C3A;border-bottom:1px solid #f1f5f9;">${topic}</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${officialEntry || agencyFeeAmt != null ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Service Tier</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${officialEntry || agencyFeeAmt != null ? '1px solid #f1f5f9' : 'none'};">${tierLabel}</td></tr>
        ${officialEntry ? `<tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${agencyFeeAmt != null ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Official Fee</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${agencyFeeAmt != null ? '1px solid #f1f5f9' : 'none'};">${fmt(officialEntry.total)}${officialEntry.note ? ` <span style="color:#94a3b8;font-size:11px;">(${officialEntry.note})</span>` : ''}</td></tr>` : ''}
        ${agencyFeeAmt != null ? `<tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${totalFee != null ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Agency Fee</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${totalFee != null ? '1px solid #f1f5f9' : 'none'};">${fmt(agencyFeeAmt)}</td></tr>` : ''}
        ${totalFee != null ? `<tr><td style="padding:12px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#0B1C3A;background:#fffbeb;">Est. Total</td><td style="padding:12px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#b45309;font-size:14px;background:#fffbeb;">${fmt(totalFee)}</td></tr>` : ''}
      </table>

      <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Consultation Fee</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:28px;">
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Amount</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#0B1C3A;border-bottom:1px solid #f1f5f9;">$${CONSULTATION_FEE} CAD</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${receiptBase64 ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Payment</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${receiptBase64 ? '1px solid #f1f5f9' : 'none'};">${payLabel}</td></tr>
        ${receiptBase64 ? `<tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;background:#fafbfc;">Receipt</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#15803d;">Attached &#10003;</td></tr>` : ''}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <a href="mailto:${email}" style="display:inline-block;background:#0B1C3A;color:#C9A84C;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:6px;letter-spacing:0.3px;">Reply to ${name}</a>
      </td></tr></table>

    </td>
  </tr>

  <tr>
    <td style="background:#f8fafc;padding:18px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr><td align="center">
        <a href="https://wa.me/12368799173" style="display:inline-block;background:#25D366;color:#fff;font-family:'Poppins',Arial,sans-serif;font-size:12px;font-weight:600;text-decoration:none;padding:7px 16px;border-radius:20px;">WhatsApp: +1 (236) 879-9173</a>
      </td></tr></table>
      <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:11px;color:#94a3b8;">Booking ID: ${booking._id} &nbsp;&middot;&nbsp; ${siteName}</p>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>`

    // ── Build attachments (receipt if provided) ───────────────────────────────
    const attachments: Array<{ filename: string; content: Buffer }> = []
    if (receiptBase64 && receiptMimeType) {
      const ext = receiptFileName?.split('.').pop() ?? (receiptMimeType.includes('pdf') ? 'pdf' : 'jpg')
      attachments.push({
        filename: receiptFileName ?? `receipt.${ext}`,
        content:  Buffer.from(receiptBase64, 'base64'),
      })
    }

    // ── Email admin ───────────────────────────────────────────────────────────
    await sendRaw({
      to:          adminEmails,
      replyTo:     email,
      subject:     `Consultation Request: ${topic} — ${name}${paymentMethod === 'pay_now' ? ' [Receipt Attached]' : ''}`,
      html,
      ...(attachments.length > 0 && { attachments }),
    })

    // ── Confirmation email to client ──────────────────────────────────────────
    const clientHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background:#eef0f4;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f4;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr>
    <td style="background:#fff;padding:24px 40px 20px;border-radius:12px 12px 0 0;text-align:center;border-bottom:4px solid #C9A84C;">
      <img src="https://www.immigrationdepot.online/wp-content/uploads/2020/06/logo_dark-300x82.png" alt="The Immigration Depot" width="180" style="height:auto;display:block;margin:0 auto;">
    </td>
  </tr>

  <tr>
    <td style="background:#0B1C3A;padding:22px 40px;">
      <p style="margin:0 0 3px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:700;color:#C9A84C;">Request Received!</p>
      <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#94a3b8;">Our team will be in touch within 1 business day</p>
    </td>
  </tr>

  <tr>
    <td style="background:#fff;padding:32px 40px;">

      <p style="margin:0 0 24px;font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#374151;line-height:1.75;">
        Hi <strong style="color:#0B1C3A;">${name}</strong>, thank you for reaching out to <strong style="color:#0B1C3A;">${siteName}</strong>. One of our licensed immigration consultants will review your information and contact you shortly to confirm your appointment and discuss next steps.
      </p>

      <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Booking Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:24px;">
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Program</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#0B1C3A;border-bottom:1px solid #f1f5f9;">${topic}</td></tr>
        <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:${preferredDate ? '1px solid #f1f5f9' : 'none'};background:#fafbfc;">Service Level</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:${preferredDate ? '1px solid #f1f5f9' : 'none'};">${tierLabel}</td></tr>
        ${preferredDate ? `<tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;background:#fafbfc;">Preferred Date</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;">${dateLabel}${timeLabel !== '—' ? ' at ' + timeLabel : ''}</td></tr>` : ''}
      </table>

      <p style="margin:0 0 14px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">What Happens Next</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td width="32" valign="top" style="padding-bottom:10px;">
            <table cellpadding="0" cellspacing="0"><tr><td style="width:26px;height:26px;background:#0B1C3A;border-radius:50%;text-align:center;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;color:#C9A84C;line-height:26px;">1</td></tr></table>
          </td>
          <td style="padding-left:10px;padding-bottom:10px;padding-top:4px;font-family:'Poppins',Arial,sans-serif;font-size:13px;color:#374151;vertical-align:top;">Request received &amp; logged in our system</td>
        </tr>
        <tr>
          <td width="32" valign="top" style="padding-bottom:10px;">
            <table cellpadding="0" cellspacing="0"><tr><td style="width:26px;height:26px;background:#0B1C3A;border-radius:50%;text-align:center;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;color:#C9A84C;line-height:26px;">2</td></tr></table>
          </td>
          <td style="padding-left:10px;padding-bottom:10px;padding-top:4px;font-family:'Poppins',Arial,sans-serif;font-size:13px;color:#374151;vertical-align:top;">Consultant reviews your case details</td>
        </tr>
        <tr>
          <td width="32" valign="top">
            <table cellpadding="0" cellspacing="0"><tr><td style="width:26px;height:26px;background:#0B1C3A;border-radius:50%;text-align:center;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;color:#C9A84C;line-height:26px;">3</td></tr></table>
          </td>
          <td style="padding-left:10px;padding-top:4px;font-family:'Poppins',Arial,sans-serif;font-size:13px;color:#374151;vertical-align:top;">We contact you to confirm your appointment</td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#fffbeb;border:1.5px solid #fde68a;border-left:4px solid #C9A84C;border-radius:8px;padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:700;color:#0B1C3A;">Consultation fee: $${CONSULTATION_FEE} CAD</p>
            <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#64748b;">Our team will contact you to arrange payment when confirming your appointment.</p>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <tr>
    <td style="background:#f8fafc;padding:20px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr><td align="center">
        <a href="https://wa.me/12368799173" style="display:inline-block;background:#25D366;color:#fff;font-family:'Poppins',Arial,sans-serif;font-size:12px;font-weight:600;text-decoration:none;padding:7px 16px;border-radius:20px;">WhatsApp: +1 (236) 879-9173</a>
      </td></tr></table>
      <p style="margin:0 0 4px;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#64748b;">Questions? Reply to this email or write to <a href="mailto:${adminEmails[0]}" style="color:#0B1C3A;text-decoration:none;font-weight:500;">${adminEmails[0]}</a></p>
      <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} ${siteName} &nbsp;&middot;&nbsp; All rights reserved</p>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>`
    await sendRaw({
      to:      email,
      subject: `We received your consultation request — ${siteName}`,
      html:    clientHtml,
    })

    return NextResponse.json({ ok: true, bookingId: booking._id }, { headers: CORS_HEADERS })
  } catch (err) {
    console.error('[book-consultation]', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500, headers: CORS_HEADERS })
  }
}

// ── Admin: list all consultation bookings ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { auth } = await import('@/auth')
    const session = await auth()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || !['admin', 'staff'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const url    = new URL(req.url)
    const status = url.searchParams.get('status')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {}
    if (status) filter.paymentStatus = status

    const bookings = await ConsultationBooking.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    return NextResponse.json(bookings)
  } catch (err) {
    console.error('[book-consultation GET]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
