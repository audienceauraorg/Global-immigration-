import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { Client, Case } from '@/lib/db/models'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const client = await Client.findOne({ userId: session.user.id }).lean()
    if (!client) return NextResponse.json(null)

    const activeCase = await Case.findOne({ clientId: client._id })
      .sort({ openedAt: -1 })
      .lean()

    return NextResponse.json(activeCase ?? null)
  } catch (err) {
    console.error('[my-case]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
