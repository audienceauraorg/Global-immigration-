import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongodb'
import { CaseFee } from '@/lib/db/models'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if (!['admin', 'staff'].includes(session.user.role ?? '')) return null
  return session
}

/** PATCH /api/admin/fees/[id] — update status, note, or paidAt */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, note, label, amount } = await req.json()

  await connectDB()
  const fee = await CaseFee.findById(id)
  if (!fee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (status !== undefined) {
    fee.status = status
    fee.paidAt = status === 'paid' ? new Date() : undefined
  }
  if (note !== undefined)   fee.note   = note?.trim() || undefined
  if (label !== undefined)  fee.label  = label.trim()
  if (amount !== undefined) fee.amount = Number(amount)

  await fee.save()
  return NextResponse.json(fee)
}

/** DELETE /api/admin/fees/[id] — remove a fee */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  await CaseFee.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
