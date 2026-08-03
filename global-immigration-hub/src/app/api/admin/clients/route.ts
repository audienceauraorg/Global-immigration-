import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Client, Case, CaseDocument } from '@/lib/db/models'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['admin', 'staff'].includes(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  await connectDB()

  const clients = await Client.find().sort({ createdAt: -1 }).lean()
  const clientIds = clients.map(c => c._id)

  const cases = await Case.find({ clientId: { $in: clientIds } })
    .sort({ createdAt: -1 }).lean()

  const caseIds = cases.map(c => c._id)
  const docs = await CaseDocument.find({ caseId: { $in: caseIds } }).lean()

  const docsByCaseId = docs.reduce<Record<string, any[]>>((acc, d) => {
    const k = d.caseId.toString()
    if (!acc[k]) acc[k] = []
    acc[k].push({ ...d, _id: d._id.toString(), caseId: k, fileId: d.fileId?.toString() })
    return acc
  }, {})

  const casesByClientId = cases.reduce<Record<string, any[]>>((acc, c) => {
    const k = c.clientId.toString()
    if (!acc[k]) acc[k] = []
    acc[k].push({
      ...c,
      _id: c._id.toString(),
      clientId: k,
      programId: c.programId.toString(),
      importantDate: c.importantDate?.toISOString(),
      updatedAt: (c as any).updatedAt?.toISOString(),
      openedAt: (c as any).createdAt?.toISOString(),
      documents: docsByCaseId[c._id.toString()] ?? [],
    })
    return acc
  }, {})

  const result = clients.map(c => ({
    ...c,
    _id: c._id.toString(),
    userId: c.userId?.toString(),
    createdAt: (c as any).createdAt?.toISOString(),
    cases: casesByClientId[c._id.toString()] ?? [],
  }))

  return NextResponse.json(result)
}
