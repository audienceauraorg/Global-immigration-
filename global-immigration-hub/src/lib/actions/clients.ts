'use server'
import { connectDB } from '@/lib/mongodb'
import { Client, Program, Case, CaseDocument, ActivityLog } from '@/lib/db/models'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { notifyAdminNewClient } from '@/lib/email'

export async function getClients() {
  await connectDB()
  const clients = await Client.find().sort({ createdAt: -1 }).lean()

  // Get latest case for each client
  const clientIds = clients.map(c => c._id)
  const cases = await Case.find({ clientId: { $in: clientIds } })
    .sort({ openedAt: -1 })
    .lean()

  // Get document counts per case
  const caseIds = cases.map(c => c._id)
  const docs = await CaseDocument.find({ caseId: { $in: caseIds } }).lean()

  const docsByCaseId = docs.reduce<Record<string, typeof docs>>((acc, d) => {
    const key = d.caseId.toString()
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  const casesByClientId = cases.reduce<Record<string, typeof cases>>((acc, c) => {
    const key = c.clientId.toString()
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return clients.map(client => ({
    ...client,
    _id: client._id.toString(),
    userId: client.userId?.toString(),
    cases: (casesByClientId[client._id.toString()] ?? []).map(c => ({
      ...c,
      _id: c._id.toString(),
      clientId: c.clientId.toString(),
      programId: c.programId.toString(),
      documents: docsByCaseId[c._id.toString()] ?? [],
    })),
  }))
}

export async function getClientDetail(clientId: string) {
  await connectDB()
  const client = await Client.findById(clientId).lean()
  if (!client) return null

  const cases = await Case.find({ clientId }).sort({ openedAt: -1 }).lean()

  const caseIds = cases.map(c => c._id)
  const [docs, logs] = await Promise.all([
    CaseDocument.find({ caseId: { $in: caseIds } }).sort({ createdAt: 1 }).lean(),
    ActivityLog.find({ caseId: { $in: caseIds } }).sort({ createdAt: -1 }).lean(),
  ])

  const docsByCaseId = docs.reduce<Record<string, typeof docs>>((acc, d) => {
    const key = d.caseId.toString()
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  const logsByCaseId = logs.reduce<Record<string, typeof logs>>((acc, l) => {
    const key = l.caseId.toString()
    if (!acc[key]) acc[key] = []
    acc[key].push(l)
    return acc
  }, {})

  return {
    ...client,
    _id: client._id.toString(),
    userId: client.userId?.toString(),
    cases: cases.map(c => ({
      ...c,
      _id: c._id.toString(),
      clientId: c.clientId.toString(),
      programId: c.programId.toString(),
      documents: (docsByCaseId[c._id.toString()] ?? []).map(d => ({
        ...d,
        _id: d._id.toString(),
        caseId: d.caseId.toString(),
        fileId: d.fileId?.toString(),
      })),
      activity_log: (logsByCaseId[c._id.toString()] ?? []).map(l => ({
        ...l,
        _id: l._id.toString(),
        caseId: l.caseId.toString(),
        createdBy: l.createdBy?.toString(),
      })),
    })),
  }
}

export async function createClient_action(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  const name       = (formData.get('name') as string)?.trim()
  const email      = (formData.get('email') as string)?.toLowerCase().trim()
  const phone      = formData.get('phone') as string
  const programId  = formData.get('program_id') as string

  if (!name || !email || !programId) return { error: 'Name, email and program are required' }

  await connectDB()

  // Get program
  const program = await Program.findById(programId).lean()
  if (!program) return { error: 'Program not found' }

  // Check for duplicate email
  const existingClient = await Client.findOne({ email })
  if (existingClient) return { error: 'A client with that email already exists' }

  const client = await Client.create({
    name,
    email,
    phone: phone || undefined,
    accountStatus: 'active',
  })

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

  // Pre-populate document slots
  if (program.checklist.length > 0) {
    await CaseDocument.insertMany(
      program.checklist.map((docName: string) => ({
        caseId: newCase._id,
        name: docName,
        status: 'not_submitted',
      }))
    )
  }

  // Log
  await ActivityLog.create({
    caseId: newCase._id,
    description: 'Case opened',
    visibleToClient: true,
    createdBy: session.user.id,
  })

  // Notify admin(s) — non-blocking, never throws
  void notifyAdminNewClient({
    clientName:  name,
    clientEmail: email,
    programName: program.name,
    clientId:    client._id.toString(),
    source:      'admin-created',
  })

  revalidatePath('/admin/clients')
  return { success: true, clientId: client._id.toString() }
}

export async function updateClientNotes(clientId: string, notes: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  await Client.findByIdAndUpdate(clientId, { notes })
  revalidatePath(`/admin/clients/${clientId}`)
  return { success: true }
}

export async function linkClientProfile(clientId: string, userId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }

  await connectDB()
  await Client.findByIdAndUpdate(clientId, { userId, accountStatus: 'active' })
  revalidatePath(`/admin/clients/${clientId}`)
  return { success: true }
}
