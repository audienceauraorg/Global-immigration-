import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { createElement } from 'react'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings, User } from '@/lib/db/models'
import { StageUpdatedEmail } from '@/emails/StageUpdatedEmail'
import { DocumentStatusEmail } from '@/emails/DocumentStatusEmail'
import { DocumentSubmittedEmail } from '@/emails/DocumentSubmittedEmail'
import { NewClientEmail } from '@/emails/NewClientEmail'
import { WelcomeEmail } from '@/emails/WelcomeEmail'

// ─── SMTP transporter (lazy, module-level cached) ─────────────────────────────

let _transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: false,
    auth: { user, pass },
  })
  return _transporter
}

// ─── Settings + admin recipients ──────────────────────────────────────────────

interface EmailSettings {
  fromName: string
  fromAddr: string
  siteName: string
  appUrl: string
}

async function getEmailSettings(): Promise<EmailSettings> {
  await connectDB()
  const settings = await SiteSettings.findOne().lean()
  return {
    fromName: settings?.emailFromName ?? 'Global Immigration Hub',
    fromAddr: process.env.SMTP_FROM_ADDR ?? (settings?.contactEmail ?? 'globalimmigrationhub.ca@gmail.com'),
    siteName: settings?.siteName ?? 'Global Immigration Hub',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  }
}

async function getAdminEmails(): Promise<string[]> {
  await connectDB()
  const settings = await SiteSettings.findOne().lean()
  // Prefer the explicit contact email from settings
  if (settings?.contactEmail) return [settings.contactEmail]
  // Fall back to all admin/staff user accounts
  const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('email').lean()
  return staff.map(u => u.email).filter(Boolean)
}

// ─── Core send helper ─────────────────────────────────────────────────────────

async function send(opts: {
  to: string | string[]
  subject: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
}) {
  const transporter = getTransporter()
  if (!transporter) return // credentials not set — skip silently

  const { fromName, fromAddr } = await getEmailSettings()
  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to]
  if (recipients.length === 0) return

  try {
    const html = await render(createElement(opts.template, opts.props))
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to: recipients.join(', '),
      subject: opts.subject,
      html,
    })
  } catch (err) {
    // Email is non-fatal — log but never throw
    console.error('[email] Failed to send "%s":', opts.subject, err)
  }
}

// ─── Notification functions ───────────────────────────────────────────────────

/** Notify admin(s) that a client uploaded a document and it needs review. */
export async function notifyAdminDocumentSubmitted(params: {
  clientName: string
  clientEmail: string
  docName: string
  caseId: string
  programName: string
}) {
  const [adminEmails, cfg] = await Promise.all([getAdminEmails(), getEmailSettings()])
  await send({
    to: adminEmails,
    subject: `Document submitted — ${params.clientName}`,
    template: DocumentSubmittedEmail,
    props: { ...params, adminUrl: `${cfg.appUrl}/admin/clients`, siteName: cfg.siteName },
  })
}

/** Notify admin(s) that a new client account was created (self-registration or admin-created). */
export async function notifyAdminNewClient(params: {
  clientName: string
  clientEmail: string
  programName: string
  clientId: string
  source: 'self-registered' | 'admin-created'
}) {
  const [adminEmails, cfg] = await Promise.all([getAdminEmails(), getEmailSettings()])
  await send({
    to: adminEmails,
    subject: `New client — ${params.clientName}`,
    template: NewClientEmail,
    props: { ...params, adminUrl: `${cfg.appUrl}/admin/clients/${params.clientId}`, siteName: cfg.siteName },
  })
}

/** Notify client that their application stage was updated. */
export async function notifyClientStageUpdated(params: {
  clientEmail: string
  clientName: string
  newStage: string
  programName: string
  country: string
}) {
  const cfg = await getEmailSettings()
  await send({
    to: params.clientEmail,
    subject: `Your application has been updated — ${params.newStage}`,
    template: StageUpdatedEmail,
    props: { ...params, portalUrl: `${cfg.appUrl}/dashboard`, siteName: cfg.siteName },
  })
}

/** Send enrollment confirmation + portal login link to a newly registered client. */
export async function notifyClientWelcome(params: {
  clientEmail: string
  clientName: string
  programName: string
}) {
  const cfg = await getEmailSettings()
  await send({
    to: params.clientEmail,
    subject: `Welcome to ${cfg.siteName} — your portal is ready`,
    template: WelcomeEmail,
    props: { ...params, portalUrl: `${cfg.appUrl}/dashboard`, siteName: cfg.siteName },
  })
}

/** Notify client that a document was approved or rejected. */
export async function notifyClientDocumentStatus(params: {
  clientEmail: string
  clientName: string
  docName: string
  status: 'approved' | 'rejected'
  rejectionNote?: string
  programName: string
}) {
  const cfg = await getEmailSettings()
  const subject = params.status === 'approved'
    ? `Document approved — ${params.docName}`
    : `Action required — ${params.docName}`
  await send({
    to: params.clientEmail,
    subject,
    template: DocumentStatusEmail,
    props: { ...params, portalUrl: `${cfg.appUrl}/dashboard`, siteName: cfg.siteName },
  })
}
