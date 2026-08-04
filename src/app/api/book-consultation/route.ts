import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings, User, ConsultationBooking } from '@/lib/db/models'
import {
  OFFICIAL_FEES,
  AGENCY_FEES,
  CONSULTATION_FEE,
  fmt,
  type ProgramKey,
} from '@/lib/fees'
import { sendRaw } from '@/lib/email'

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
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
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
    const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminEmails: string[] = staff.map((u: any) => u.email).filter(Boolean)
    if (adminEmails.length === 0) {
      adminEmails.push(process.env.SMTP_FROM_ADDR ?? 'info@immigrationdepot.online')
    }

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
    const html = `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#0B1C3A;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="color:#C9A84C;margin:0;font-size:18px;">New Consultation Request — ${siteName}</h2>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">

          <h3 style="color:#0B1C3A;margin:0 0 12px;">Contact Details</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 12px;font-weight:700;color:#555;width:160px;border-bottom:1px solid #eee;">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${phone}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Preferred Date</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${dateLabel}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Preferred Time</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${timeLabel}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;vertical-align:top;border-bottom:1px solid #eee;">Description</td><td style="padding:8px 12px;white-space:pre-wrap;border-bottom:1px solid #eee;">${message || '—'}</td></tr>
          </table>

          <h3 style="color:#0B1C3A;margin:0 0 12px;">Program &amp; Service</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 12px;font-weight:700;color:#555;width:160px;border-bottom:1px solid #eee;">Program</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${topic}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Service Tier</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${tierLabel}</td></tr>
            ${officialEntry ? `<tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Official Fee</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${fmt(officialEntry.total)}${officialEntry.note ? ` <span style="color:#888;font-size:12px;">(${officialEntry.note})</span>` : ''}</td></tr>` : ''}
            ${agencyFeeAmt != null ? `<tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Agency Fee</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${fmt(agencyFeeAmt)}</td></tr>` : ''}
            ${totalFee != null ? `<tr><td style="padding:8px 12px;font-weight:700;color:#0B1C3A;border-bottom:1px solid #eee;">Estimated Total</td><td style="padding:8px 12px;font-weight:700;color:#0B1C3A;border-bottom:1px solid #eee;">${fmt(totalFee)}</td></tr>` : ''}
          </table>

          <h3 style="color:#0B1C3A;margin:0 0 12px;">Consultation Fee ($${CONSULTATION_FEE} CAD)</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 12px;font-weight:700;color:#555;width:160px;border-bottom:1px solid #eee;">Payment Method</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${payLabel}</td></tr>
            ${receiptBase64 ? `<tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;">Receipt</td><td style="padding:8px 12px;color:#166534;font-weight:600;">Attached to this email ✓</td></tr>` : ''}
          </table>

          <p style="font-size:13px;color:#888;margin:0;">Reply directly to this email to contact the prospect.<br>Booking ID: ${booking._id}</p>
        </div>
      </div>
    `

    // ── Build attachments (receipt if provided) ───────────────────────────────
    const attachments: Array<{ filename: string; content: Buffer }> = []
    if (receiptBase64 && receiptMimeType) {
      const ext = receiptFileName?.split('.').pop() ?? (receiptMimeType.includes('pdf') ? 'pdf' : 'jpg')
      attachments.push({
        filename: receiptFileName ?? `receipt.${ext}`,
        content:  Buffer.from(receiptBase64, 'base64'),
      })
    }

    await sendRaw({
      to:          adminEmails,
      replyTo:     email,
      subject:     `Consultation Request: ${topic} — ${name}${paymentMethod === 'pay_now' ? ' [Receipt Attached]' : ''}`,
      html,
      ...(attachments.length > 0 && { attachments }),
    })

    return NextResponse.json({ ok: true, bookingId: booking._id })
  } catch (err) {
    console.error('[book-consultation]', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
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
