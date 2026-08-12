/**
 * GET /api/cron/reminders
 *
 * Time-based alert emails for:
 *   1. Cases with an importantDate within the next 3 days (deadline alert → admin)
 *   2. Cases with no activity for 14+ days (stale case alert → admin)
 *
 * Protect with CRON_SECRET so only an authorised scheduler can call this.
 * Vercel Cron: add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * *" }] }
 * And set CRON_SECRET in Vercel environment variables.
 *
 * Manual test: GET /api/cron/reminders  (with Authorization: Bearer <CRON_SECRET>)
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Case, Client, SiteSettings, User, ActivityLog } from '@/lib/db/models'
import { sendRaw } from '@/lib/email'

// ─── Email HTML builders ──────────────────────────────────────────────────────

function emailShell(titleLine: string, subtitle: string, body: string, siteName: string) {
  return `<!DOCTYPE html>
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
    <p style="margin:0 0 3px;font-family:'Poppins',Arial,sans-serif;font-size:18px;font-weight:700;color:#C9A84C;">${titleLine}</p>
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:12px;color:#94a3b8;">${subtitle}</p>
  </td></tr>
  <tr><td style="background:#fff;padding:32px 40px;">${body}</td></tr>
  <tr><td style="background:#f8fafc;padding:18px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;"><tr><td align="center">
      <a href="https://wa.me/12368799173" style="display:inline-block;background:#25D366;color:#fff;font-family:'Poppins',Arial,sans-serif;font-size:12px;font-weight:600;text-decoration:none;padding:7px 16px;border-radius:20px;">WhatsApp: +1 (236) 879-9173</a>
    </td></tr></table>
    <p style="margin:0;font-family:'Poppins',Arial,sans-serif;font-size:11px;color:#94a3b8;">${siteName} &nbsp;&middot;&nbsp; Automated reminder</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function deadlineHtml(clientName: string, programName: string, daysUntil: number, importantDate: string, adminUrl: string, siteName: string) {
  return emailShell(
    'Upcoming Deadline Alert',
    `${siteName} &nbsp;&middot;&nbsp; Case management`,
    `<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #fde68a;border-left:4px solid #C9A84C;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 6px;font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#1e293b;line-height:1.6;">
          <strong style="color:#0B1C3A;">${clientName}</strong>'s case (<em>${programName}</em>) has an important date in
          <strong style="color:#b45309;">${daysUntil} day${daysUntil === 1 ? '' : 's'}</strong> — on <strong>${importantDate}</strong>.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${adminUrl}" style="display:inline-block;background:#0B1C3A;color:#C9A84C;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:6px;letter-spacing:0.3px;">Open Client in Dashboard</a>
    </td></tr></table>`,
    siteName
  )
}

function staleHtml(clientName: string, programName: string, daysSinceActivity: number, adminUrl: string, siteName: string) {
  return emailShell(
    'Stale Case Alert',
    `${siteName} &nbsp;&middot;&nbsp; Case management`,
    `<table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #fecaca;border-left:4px solid #ef4444;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 6px;font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#1e293b;line-height:1.6;">
          <strong style="color:#0B1C3A;">${clientName}</strong>'s case (<em>${programName}</em>) has had no activity for
          <strong style="color:#dc2626;">${daysSinceActivity} days</strong>. Consider following up with the client.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${adminUrl}" style="display:inline-block;background:#0B1C3A;color:#C9A84C;font-family:'Poppins',Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:6px;letter-spacing:0.3px;">Open Client in Dashboard</a>
    </td></tr></table>`,
    siteName
  )
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Verify caller is authorised
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  await connectDB()

  const settings  = await SiteSettings.findOne().lean()
  const siteName  = settings?.siteName ?? 'Global Immigration Hub'
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let adminEmails: string[] = []
  if (settings?.contactEmail) {
    adminEmails = [settings.contactEmail]
  } else {
    const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
    adminEmails = staff.map(u => u.email).filter(Boolean)
  }

  if (adminEmails.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No admin emails configured' })
  }

  const now    = new Date()
  const sent: string[] = []
  const errors: string[] = []

  async function sendAlert(subject: string, html: string) {
    try {
      await sendRaw({ to: adminEmails, subject, html })
      sent.push(subject)
    } catch (err) {
      errors.push(String(err))
    }
  }

  // ── 1. Deadline within 3 days ─────────────────────────────────────────────
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const urgentCases = await Case.find({
    importantDate: { $gte: now, $lte: threeDaysFromNow },
    stage: { $nin: ['Closed'] },
  }).lean()

  for (const c of urgentCases) {
    const client      = await Client.findById(c.clientId).lean()
    const clientName  = client?.name ?? 'Unknown client'
    const programName = c.programSnapshot?.name ?? 'Unknown program'
    const daysUntil   = Math.ceil((c.importantDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const dateStr     = c.importantDate!.toLocaleDateString('en-CA')

    await sendAlert(
      `Deadline in ${daysUntil}d — ${clientName}`,
      deadlineHtml(clientName, programName, daysUntil, dateStr, `${appUrl}/admin/clients/${c.clientId.toString()}`, siteName)
    )
  }

  // ── 2. Stale cases (no activity for 14+ days) ─────────────────────────────
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const staleCases = await Case.find({
    updatedAt: { $lte: fourteenDaysAgo },
    stage: { $nin: ['Closed'] },
  }).lean()

  for (const c of staleCases) {
    const lastLog      = await ActivityLog.findOne({ caseId: c._id }).sort({ createdAt: -1 }).lean()
    const lastActivity = lastLog?.createdAt ?? c.openedAt
    if (lastActivity > fourteenDaysAgo) continue

    const client      = await Client.findById(c.clientId).lean()
    const clientName  = client?.name ?? 'Unknown client'
    const programName = c.programSnapshot?.name ?? 'Unknown program'
    const daysSince   = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    await sendAlert(
      `Stale case (${daysSince}d) — ${clientName}`,
      staleHtml(clientName, programName, daysSince, `${appUrl}/admin/clients/${c.clientId.toString()}`, siteName)
    )
  }

  return NextResponse.json({ ok: true, sent: sent.length, errors: errors.length, details: { sent, errors } })
}
