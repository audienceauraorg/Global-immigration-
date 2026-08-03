'use server'
import { connectDB } from '@/lib/mongodb'
import { CaseDocument, ActivityLog, Case, Client, SiteSettings } from '@/lib/db/models'
import { auth } from '@/auth'
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb'
import { clientPromise } from '@/lib/mongodb'
import { revalidatePath } from 'next/cache'
import { notifyAdminDocumentSubmitted } from '@/lib/email'

const ALLOWED_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

const MAGIC_BYTES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
}

function checkMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const bytes = new Uint8Array(buffer)
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false
  return signatures.some(sig => sig.every((byte, i) => bytes[i] === byte))
}

async function getGridFSBucket(): Promise<GridFSBucket> {
  const mongo = await clientPromise
  const db = mongo.db(process.env.MONGODB_DB ?? 'global_immigration_hub')
  return new GridFSBucket(db, { bucketName: 'case_documents' })
}

export async function uploadDocument(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const file     = formData.get('file') as File
  const docName  = formData.get('docName') as string
  const caseId   = formData.get('caseId') as string

  if (!file || !docName || !caseId) return { error: 'Missing required fields' }

  await connectDB()

  // Check max upload size from settings
  const settings = await SiteSettings.findOne().lean()
  const maxMb = settings?.maxUploadMb ?? 10
  if (file.size > maxMb * 1024 * 1024) {
    return { error: `File too large. Maximum size is ${maxMb}MB.` }
  }

  // Validate MIME type
  const mimeType = file.type
  if (!ALLOWED_MIME[mimeType]) {
    return { error: 'Invalid file type. Only PDF, JPG, and PNG are accepted.' }
  }

  // Validate magic bytes
  const buffer = await file.arrayBuffer()
  if (!checkMagicBytes(buffer, mimeType)) {
    return { error: 'File content does not match its extension.' }
  }

  // Verify client owns this case
  const client = await Client.findOne({ userId: session.user.id }).lean()
  if (!client) return { error: 'No client record found for your account.' }

  const activeCase = await Case.findOne({ _id: caseId, clientId: client._id }).lean()
  if (!activeCase) return { error: 'Case not found.' }

  // Find existing document slot
  const existingDoc = await CaseDocument.findOne({ caseId, name: docName })

  // If there was a previous file, delete it from GridFS
  const bucket = await getGridFSBucket()
  if (existingDoc?.fileId) {
    try { await bucket.delete(new ObjectId(existingDoc.fileId.toString())) } catch { /* ignore */ }
  }

  // Upload to GridFS
  const bytes = Buffer.from(buffer)
  const uploadStream = bucket.openUploadStream(`${caseId}/${docName}`, {
    metadata: {
      caseId,
      docName,
      uploadedBy: session.user.id,
      mimeType,
    },
    contentType: mimeType,
  })

  await new Promise<void>((resolve, reject) => {
    uploadStream.on('finish', resolve)
    uploadStream.on('error', reject)
    uploadStream.end(bytes)
  })

  const fileId = uploadStream.id

  // Upsert document record
  const docData = {
    caseId,
    name: docName,
    status: 'pending_review' as const,
    fileId,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    version: (existingDoc?.version ?? 0) + 1,
    uploadedBy: 'client' as const,
    uploadedAt: new Date(),
    rejectionNote: undefined,
  }

  let document
  if (existingDoc) {
    document = await CaseDocument.findByIdAndUpdate(existingDoc._id, docData, { new: true })
  } else {
    document = await CaseDocument.create(docData)
  }

  await ActivityLog.create({
    caseId,
    description: `${docName} submitted for review`,
    visibleToClient: true,
    createdBy: session.user.id,
  })

  await Case.findByIdAndUpdate(caseId, { updatedAt: new Date() })

  // Notify admin(s) — non-blocking, never throws
  void notifyAdminDocumentSubmitted({
    clientName:  client.name,
    clientEmail: client.email,
    docName,
    caseId,
    programName: activeCase.programSnapshot?.name ?? '',
  })

  revalidatePath('/dashboard')
  return { success: true, document: JSON.parse(JSON.stringify(document)) }
}

export async function getSignedDownloadUrl(fileId: string) {
  // We serve files through /api/files/[id] which validates session
  return { url: `/api/files/${fileId}` }
}

export async function adminUploadDocument(formData: FormData) {
  const session = await auth()
  if (!session?.user || !['admin', 'staff'].includes(session.user.role)) {
    return { error: 'Unauthorized' }
  }

  const file    = formData.get('file') as File
  const docName = formData.get('docName') as string
  const caseId  = formData.get('caseId') as string
  const docId   = formData.get('docId') as string | null

  if (!file || !docName || !caseId) return { error: 'Missing required fields' }

  const mimeType = file.type
  if (!ALLOWED_MIME[mimeType]) return { error: 'Invalid file type' }

  const bucket = await getGridFSBucket()

  // Delete old file if replacing
  if (docId) {
    const existingDoc = await CaseDocument.findById(docId).lean()
    if (existingDoc?.fileId) {
      try { await bucket.delete(new ObjectId(existingDoc.fileId.toString())) } catch { /* ignore */ }
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadStream = bucket.openUploadStream(`admin/${caseId}/${docName}`, {
    metadata: { caseId, docName, uploadedBy: 'admin', mimeType },
    contentType: mimeType,
  })

  await new Promise<void>((resolve, reject) => {
    uploadStream.on('finish', resolve)
    uploadStream.on('error', reject)
    uploadStream.end(buffer)
  })

  const fileId = uploadStream.id
  const docData = {
    caseId,
    name: docName,
    status: 'approved' as const,
    fileId,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    uploadedBy: 'admin' as const,
    uploadedAt: new Date(),
    reviewedAt: new Date(),
  }

  if (docId) {
    await CaseDocument.findByIdAndUpdate(docId, docData)
  } else {
    await CaseDocument.create({ ...docData, version: 1 })
  }

  await ActivityLog.create({
    caseId,
    description: `${docName} uploaded by admin`,
    visibleToClient: false,
    createdBy: session.user.id,
  })

  await Case.findByIdAndUpdate(caseId, { updatedAt: new Date() })
  revalidatePath('/admin/clients')
  return { success: true }
}
