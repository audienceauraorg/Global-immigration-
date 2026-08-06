import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Case, ActivityLog, SiteSettings, CaseFee } from '@/lib/db/models'
import { OFFICIAL_FEES, AGENCY_FEES, CONSULTATION_FEE, fmt, type ProgramKey } from '@/lib/fees'
import { sendRaw, getAdminEmails } from '@/lib/email'

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
    const adminEmails = await getAdminEmails()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    await sendRaw({
      to:      adminEmails,
      subject: `Service Tier Selected — ${session.user.name ?? session.user.email} (${tierLabel})`,
      html: `<!DOCTYPE html>
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
    <p style="margin:0 0 3px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:700;color:#C9A84C;">Service Tier Selected</p>
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; ${new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 40px;">
    <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Client &amp; Program</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:24px;">
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Client</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${session.user.name ?? '—'}<br><span style="color:#64748b;font-size:12px;">${session.user.email}</span></td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Program</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#0B1C3A;border-bottom:1px solid #f1f5f9;">${programName ?? '—'}</td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;background:#fafbfc;">Service Tier</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#0B1C3A;">${tierLabel}</td></tr>
    </table>
    <p style="margin:0 0 10px;font-family:'Poppins',Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#C9A84C;">Fee Breakdown</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;margin-bottom:28px;">
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;width:130px;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Official Fee</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${fmt(officialFee)}</td></tr>
      <tr><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;background:#fafbfc;">Agency Fee</td><td style="padding:11px 14px;font-family:'Poppins',Arial,sans-serif;color:#1e293b;border-bottom:1px solid #f1f5f9;">${fmt(agencyFee)}</td></tr>
      <tr><td style="padding:12px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#0B1C3A;background:#fffbeb;">Est. Total</td><td style="padding:12px 14px;font-family:'Poppins',Arial,sans-serif;font-weight:700;color:#b45309;font-size:14px;background:#fffbeb;">${totalLabel}</td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${appUrl}/admin/clients" style="display:inline-block;background:#0B1C3A;color:#C9A84C;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:6px;letter-spacing:0.3px;">View Client in Dashboard</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:18px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:11px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; Service tier notification</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
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
