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
import { Resend } from 'resend'
import { createElement } from 'react'

// ─── Inline reminder email template (avoids a separate file for a simple alert) ──

function DeadlineReminderEmail({
  clientName,
  programName,
  daysUntil,
  importantDate,
  adminUrl,
  siteName,
}: {
  clientName: string
  programName: string
  daysUntil: number
  importantDate: string
  adminUrl: string
  siteName: string
}) {
  return createElement(
    'div',
    { style: { fontFamily: 'sans-serif', maxWidth: '560px', margin: '0 auto' } },
    createElement('h2', { style: { color: '#0B1C3A' } }, `${siteName} — Deadline Alert`),
    createElement(
      'p',
      null,
      `${clientName}'s case (${programName}) has an important date in `,
      createElement('strong', null, `${daysUntil} day${daysUntil === 1 ? '' : 's'}`),
      ` (${importantDate}).`
    ),
    createElement(
      'a',
      { href: adminUrl, style: { color: '#C9A84C' } },
      'Open client in dashboard →'
    )
  )
}

function StaleCaseEmail({
  clientName,
  programName,
  daysSinceActivity,
  adminUrl,
  siteName,
}: {
  clientName: string
  programName: string
  daysSinceActivity: number
  adminUrl: string
  siteName: string
}) {
  return createElement(
    'div',
    { style: { fontFamily: 'sans-serif', maxWidth: '560px', margin: '0 auto' } },
    createElement('h2', { style: { color: '#0B1C3A' } }, `${siteName} — Stale Case Alert`),
    createElement(
      'p',
      null,
      `${clientName}'s case (${programName}) has had no activity for `,
      createElement('strong', null, `${daysSinceActivity} days`),
      '.'
    ),
    createElement(
      'a',
      { href: adminUrl, style: { color: '#C9A84C' } },
      'Open client in dashboard →'
    )
  )
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Verify caller is authorised
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not set' })
  }

  await connectDB()

  const settings  = await SiteSettings.findOne().lean()
  const fromName  = settings?.emailFromName ?? 'Global Immigration Hub'
  const fromAddr  = settings?.emailFromAddr ?? 'onboarding@resend.dev'
  const siteName  = settings?.siteName      ?? 'Global Immigration Hub'
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Get admin emails
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

  const resend = new Resend(resendKey)
  const now    = new Date()
  const sent: string[] = []
  const errors: string[] = []

  async function sendAlert(subject: string, component: React.ReactElement) {
    try {
      await resend.emails.send({
        from:    `${fromName} <${fromAddr}>`,
        to:      adminEmails,
        subject,
        react:   component,
      })
      sent.push(subject)
    } catch (err) {
      errors.push(String(err))
    }
  }

  // ── 1. Deadline within 3 days ─────────────────────────────────────────────
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const urgentCases = await Case.find({
    importantDate: { $gte: now, $lte: threeDaysFromNow },
    stage:         { $nin: ['Closed'] },
  }).lean()

  for (const c of urgentCases) {
    const client     = await Client.findById(c.clientId).lean()
    const clientName = client?.name ?? 'Unknown client'
    const programName = c.programSnapshot?.name ?? 'Unknown program'
    const daysUntil   = Math.ceil((c.importantDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const dateStr     = c.importantDate!.toLocaleDateString('en-CA')

    await sendAlert(
      `Deadline in ${daysUntil}d — ${clientName}`,
      createElement(DeadlineReminderEmail, {
        clientName,
        programName,
        daysUntil,
        importantDate: dateStr,
        adminUrl: `${appUrl}/admin/clients/${c.clientId.toString()}`,
        siteName,
      })
    )
  }

  // ── 2. Stale cases (no activity for 14+ days) ─────────────────────────────
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const staleCases = await Case.find({
    updatedAt: { $lte: fourteenDaysAgo },
    stage:     { $nin: ['Closed'] },
  }).lean()

  for (const c of staleCases) {
    // Double-check: look at ActivityLog too
    const lastLog = await ActivityLog.findOne({ caseId: c._id }).sort({ createdAt: -1 }).lean()
    const lastActivity = lastLog?.createdAt ?? c.openedAt
    if (lastActivity > fourteenDaysAgo) continue   // has recent activity, skip

    const client     = await Client.findById(c.clientId).lean()
    const clientName = client?.name ?? 'Unknown client'
    const programName = c.programSnapshot?.name ?? 'Unknown program'
    const daysSince   = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    await sendAlert(
      `Stale case (${daysSince}d) — ${clientName}`,
      createElement(StaleCaseEmail, {
        clientName,
        programName,
        daysSinceActivity: daysSince,
        adminUrl: `${appUrl}/admin/clients/${c.clientId.toString()}`,
        siteName,
      })
    )
  }

  return NextResponse.json({
    ok:     true,
    sent:   sent.length,
    errors: errors.length,
    details: { sent, errors },
  })
}
