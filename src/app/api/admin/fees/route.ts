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

/** GET /api/admin/fees?caseId=xxx — list all fees for a case */
export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseId = req.nextUrl.searchParams.get('caseId')
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 })

  await connectDB()
  const fees = await CaseFee.find({ caseId }).sort({ category: 1, createdAt: 1 }).lean()
  return NextResponse.json(fees)
}

/** POST /api/admin/fees — add a fee line item */
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { caseId, label, amount, category, note } = await req.json()
  if (!caseId || !label || amount == null) {
    return NextResponse.json({ error: 'caseId, label, and amount are required' }, { status: 400 })
  }

  await connectDB()
  const fee = await CaseFee.create({
    caseId,
    label: label.trim(),
    amount: Number(amount),
    category: category ?? 'other',
    status: 'unpaid',
    note: note?.trim() || undefined,
  })
  return NextResponse.json(fee, { status: 201 })
}
