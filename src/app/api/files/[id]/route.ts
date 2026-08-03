import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { CaseDocument, Client, Case } from '@/lib/db/models'
import { clientPromise } from '@/lib/mongodb'
import { GridFSBucket, ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  await connectDB()

  // Find the document record
  const doc = await CaseDocument.findOne({ fileId: new ObjectId(id) }).lean()
  if (!doc) return new NextResponse('Not found', { status: 404 })

  // Authorization: client can only access their own files
  if (session.user.role === 'client') {
    const client = await Client.findOne({ userId: session.user.id }).lean()
    if (!client) return new NextResponse('Forbidden', { status: 403 })

    const activeCase = await Case.findOne({
      _id: doc.caseId,
      clientId: client._id,
    }).lean()
    if (!activeCase) return new NextResponse('Forbidden', { status: 403 })
  }

  // Stream from GridFS
  const mongo = await clientPromise
  const db = mongo.db(process.env.MONGODB_DB ?? 'global_immigration_hub')
  const bucket = new GridFSBucket(db, { bucketName: 'case_documents' })

  try {
    const downloadStream = bucket.openDownloadStream(new ObjectId(id))

    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      downloadStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      downloadStream.on('end', resolve)
      downloadStream.on('error', reject)
    })

    const fileBuffer = Buffer.concat(chunks)
    const mimeType = doc.mimeType ?? 'application/octet-stream'
    const fileName = doc.fileName ?? 'document'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return new NextResponse('File not found', { status: 404 })
  }
}
