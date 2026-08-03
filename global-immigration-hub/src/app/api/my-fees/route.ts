import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Client, Case, CaseFee } from '@/lib/db/models'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const client = await Client.findOne({ userId: session.user.id }).lean()
  if (!client) return NextResponse.json([])

  const activeCase = await Case.findOne({ clientId: client._id })
    .sort({ createdAt: -1 })
    .lean()
  if (!activeCase) return NextResponse.json([])

  const fees = await CaseFee.find({ caseId: activeCase._id })
    .sort({ category: 1, createdAt: 1 })
    .lean()

  return NextResponse.json(fees)
}
