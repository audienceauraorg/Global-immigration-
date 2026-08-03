import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Case, ActivityLog, SiteSettings, User, CaseFee } from '@/lib/db/models'
import { OFFICIAL_FEES, AGENCY_FEES, CONSULTATION_FEE, fmt, type ProgramKey } from '@/lib/fees'
import { sendRaw } from '@/lib/email'

/** Parse a breakdown line like 'Processing fee — $850' into { label, amount } */
function parseBreakdownLine(line: string): { label: string; amount: number } {
  const parts = line.split(' — ')
  const label = parts[0]?.trim() ?? line
  const amountStr = (parts[1] ?? '').replace(/[$,]/g, '').trim()
  const amount = parseInt(amountStr, 10) || 0
  return { label, amount }
}

/**
 * Upsert a fee item by (caseId, tag). Updates amount but preserves existing paid status.
 */
async function upsertFee(caseId: string, tag: string, data: {
  label: string; amount: number; category: 'government' | 'agency' | 'consultation' | 'other'
}) {
  await CaseFee.findOneAndUpdate(
    { caseId, tag },
    {
      $setOnInsert: { status: 'unpaid', createdAt: new Date() },
      $set: { label: data.label, amount: data.amount, category: data.category, tag },
    },
    { upsert: true, new: true }
  )
}


export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { caseId, tier } = body as { caseId: string; tier: 'full_handling' | 'filing_only' }

    if (!caseId || !['full_handling', 'filing_only'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await connectDB()
    const caseDoc = await Case.findById(caseId)
    if (!caseDoc) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Derive fees from program name
    const programName = caseDoc.programSnapshot?.name as ProgramKey
    const officialFee = OFFICIAL_FEES[programName]?.total ?? 0
    const agencyFee   = tier === 'full_handling'
      ? (AGENCY_FEES[programName]?.fullHandling ?? 0)
      : (AGENCY_FEES[programName]?.filingOnly   ?? 0)

    caseDoc.serviceTier      = tier
    caseDoc.officialFee      = officialFee
    caseDoc.agencyFee        = agencyFee
    caseDoc.serviceTierSetAt = new Date()
    await caseDoc.save()

    const tierLabel  = tier === 'full_handling' ? 'Full Agent Handling' : 'Agency-Assisted Filing'
    const totalLabel = fmt(officialFee + agencyFee)

    // ── Seed / update fee line items ──────────────────────────────────────────
    const officialEntry = OFFICIAL_FEES[programName]
    if (officialEntry) {
      for (let i = 0; i < officialEntry.breakdown.length; i++) {
        const { label, amount } = parseBreakdownLine(officialEntry.breakdown[i])
        await upsertFee(caseId, `ircc_${i}`, { label, amount, category: 'government' })
      }
    }

    await upsertFee(caseId, 'agency', {
      label: `Agency Fee — ${tierLabel}`,
      amount: agencyFee,
      category: 'agency',
    })

    await upsertFee(caseId, 'consultation', {
      label: 'Consultation Fee',
      amount: CONSULTATION_FEE,
      category: 'consultation',
    })

    // Activity log
    await ActivityLog.create({
      caseId: caseDoc._id,
      description: `Service tier selected: ${tierLabel} (Estimated total: ${totalLabel})`,
      visibleToClient: true,
    })

    // Notify admin
    const settings    = await SiteSettings.findOne().lean()
    const siteName    = settings?.siteName ?? 'Global Immigration Hub'
    const staff       = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminEmails = staff.map((u: any) => u.email).filter(Boolean) as string[]
    if (adminEmails.length === 0) {
      adminEmails.push(process.env.SMTP_FROM_ADDR ?? 'globalimmigrationhub.ca@gmail.com')
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    await sendRaw({
      to:      adminEmails,
      subject: `Service Tier Selected — ${session.user.name ?? session.user.email} (${tierLabel})`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#0B1C3A;padding:18px 22px;border-radius:8px 8px 0 0;">
            <h2 style="color:#C9A84C;margin:0;font-size:16px;">Service Tier Selected — ${siteName}</h2>
          </div>
          <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:22px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 12px;font-weight:700;color:#555;width:160px;border-bottom:1px solid #eee;">Client</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${session.user.name ?? '—'} (${session.user.email})</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Program</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${programName ?? '—'}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Service Tier</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700;color:#0B1C3A;">${tierLabel}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Official Fee</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${fmt(officialFee)}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:700;color:#555;border-bottom:1px solid #eee;">Agency Fee</td><td style="padding:8px 12px;border-bottom:1px solid #eee;">${fmt(agencyFee)}</td></tr>
              <tr style="background:#fffbeb;"><td style="padding:8px 12px;font-weight:700;color:#0B1C3A;">Estimated Total</td><td style="padding:8px 12px;font-weight:700;color:#0B1C3A;">${totalLabel}</td></tr>
            </table>
            <p style="margin:18px 0 0;font-size:13px;">
              <a href="${appUrl}/admin/clients" style="color:#0B1C3A;font-weight:700;">View client in admin panel →</a>
            </p>
          </div>
        </div>
      `,
    }).catch((err: unknown) => console.error('[service-tier] email error:', err))

    return NextResponse.json({
      ok: true,
      serviceTier: tier,
      officialFee,
      agencyFee,
      total: officialFee + agencyFee,
    })
  } catch (err) {
    console.error('[service-tier]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
