'use server'
import { connectDB } from '@/lib/mongodb'
import { Case, CaseDocument, ActivityLog, Client, Program, CaseFee } from '@/lib/db/models'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import type { CaseStage } from '@/lib/db/models'
import { notifyClientStageUpdated, notifyClientDocumentStatus } from '@/lib/email'
import { CONSULTATION_FEE } from '@/lib/fees'

export async function selectClientProgram(programId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await connectDB()

  let client = await Client.findOne({ userId: session.user.id })
  if (!client) {
    client = await Client.create({
      userId: session.user.id,
      name: session.user.name ?? 'Client',
      email: session.user.email ?? '',
      accountStatus: 'active',
    })
  }

  const program = await Program.findById(programId).lean()
  if (!program) return { error: 'Program not found' }

  // Create new active case
  const newCase = await Case.create({
    clientId: client._id,
    programId: program._id,
    programSnapshot: {
      name:      program.name,
      country:   program.country,
      checklist: program.checklist,
    },
    stage: 'Intake',
  })

  if (program.checklist && program.checklist.length > 0) {
    await CaseDocument.insertMany(
      program.checklist.map((docName: string) => ({
        caseId: newCase._id,
        name: docName,
        status: 'not_submitted',
      }))
    )
  }

  await ActivityLog.create({
    caseId: newCase._id,
    description: `Selected immigration program: ${program.name}`,
    visibleToClient: true,
    createdBy: session.user.id,
  })

  await CaseFee.create({
    caseId: newCase._id,
    label: 'Consultation Fee',
    amount: CONSULTATION_FEE,
    category: 'consultation',
    status: 'unpaid',
    tag: 'consultation',
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCaseStage(caseId: string, newStage: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  const updatedCase = await Case.findByIdAndUpdate(
    caseId,
    { stage: newStage as CaseStage, updatedAt: new Date() },
    { new: true }
  ).lean()

  await ActivityLog.create({
    caseId,
    description: `Application stage updated to: ${newStage}`,
    visibleToClient: true,
    createdBy: session.user.id,
  })

  // Notify client — non-blocking, never throws
  if (updatedCase) {
    const client = await Client.findById(updatedCase.clientId).lean()
    if (client?.email) {
      void notifyClientStageUpdated({
        clientEmail: client.email,
        clientName:  client.name,
        newStage,
        programName: updatedCase.programSnapshot?.name ?? '',
        country:     updatedCase.programSnapshot?.country ?? '',
      })
    }
  }

  revalidatePath('/admin/clients')
  return { success: true }
}

export async function resetDocumentStatus(docId: string, caseId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  const doc = await CaseDocument.findById(docId).lean()

  await CaseDocument.findByIdAndUpdate(docId, {
    status: 'not_submitted',
    reviewedAt: undefined,
    rejectionNote: undefined,
  })

  await ActivityLog.create({
    caseId,
    description: `${doc?.name ?? 'Document'} rejection cleared — awaiting resubmission`,
    visibleToClient: true,
    createdBy: session.user.id,
  })

  await Case.findByIdAndUpdate(caseId, { updatedAt: new Date() })
  revalidatePath('/admin/clients')
  return { success: true }
}

export async function updateDocumentStatus(
  docId: string,
  caseId: string,
  status: 'approved' | 'rejected',
  rejectionNote?: string
) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  const doc = await CaseDocument.findById(docId).lean()

  await CaseDocument.findByIdAndUpdate(docId, {
    status,
    reviewedAt: new Date(),
    rejectionNote: rejectionNote ?? undefined,
  })

  const actionText = status === 'approved' ? 'approved' : 'rejected'
  const noteText   = rejectionNote ? ` — ${rejectionNote}` : ''
  await ActivityLog.create({
    caseId,
    description: `${doc?.name ?? 'Document'} ${actionText}${noteText}`,
    visibleToClient: true,
    createdBy: session.user.id,
  })

  const activeCase = await Case.findById(caseId).lean()
  await Case.findByIdAndUpdate(caseId, { updatedAt: new Date() })

  // Notify client — non-blocking, never throws
  if (activeCase) {
    const client = await Client.findById(activeCase.clientId).lean()
    if (client?.email) {
      void notifyClientDocumentStatus({
        clientEmail:   client.email,
        clientName:    client.name,
        docName:       doc?.name ?? 'Document',
        status,
        rejectionNote: rejectionNote ?? undefined,
        programName:   activeCase.programSnapshot?.name ?? '',
      })
    }
  }

  revalidatePath('/admin/clients')
  return { success: true }
}

export async function addCaseNote(caseId: string, note: string, visibleToClient: boolean) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  await ActivityLog.create({
    caseId,
    description: note,
    visibleToClient,
    createdBy: session.user.id,
  })

  await Case.findByIdAndUpdate(caseId, { updatedAt: new Date() })
  revalidatePath('/admin/clients')
  return { success: true }
}

export async function updateImportantDate(caseId: string, date: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  await Case.findByIdAndUpdate(caseId, {
    importantDate: date ? new Date(date) : undefined,
    updatedAt: new Date(),
  })

  revalidatePath('/admin/clients')
  return { success: true }
}

export async function getMyCase() {
  const session = await auth()
  if (!session?.user?.id) return null

  await connectDB()
  const client = await Client.findOne({ userId: session.user.id }).lean()
  if (!client) return null

  const activeCase = await Case.findOne({ clientId: client._id }).sort({ openedAt: -1 }).lean()
  if (!activeCase) return null

  const [docs, logs] = await Promise.all([
    CaseDocument.find({ caseId: activeCase._id }).sort({ createdAt: 1 }).lean(),
    ActivityLog.find({ caseId: activeCase._id, visibleToClient: true }).sort({ createdAt: -1 }).lean(),
  ])

  return {
    ...activeCase,
    _id: activeCase._id.toString(),
    clientId: activeCase.clientId.toString(),
    programId: activeCase.programId.toString(),
    programs: activeCase.programSnapshot,
    documents: docs.map(d => ({
      ...d,
      _id: d._id.toString(),
      caseId: d.caseId.toString(),
      fileId: d.fileId?.toString(),
      uploadedAt: d.uploadedAt?.toISOString(),
      reviewedAt: d.reviewedAt?.toISOString(),
      createdAt: d.createdAt.toISOString(),
    })),
    activity_log: logs.map(l => ({
      ...l,
      _id: l._id.toString(),
      caseId: l.caseId.toString(),
      createdAt: l.createdAt.toISOString(),
    })),
  }
}
