import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Program } from '@/lib/db/models'
import { auth } from '@/auth'

export async function GET() {
  await connectDB()
  const programs = await Program.find().sort({ country: 1, name: 1 }).lean()
  return NextResponse.json(programs.map(p => ({ ...p, _id: p._id.toString() })))
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !['admin', 'staff'].includes(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { country, name, checklist } = await request.json()
  if (!country || !name || !checklist?.length) {
    return NextResponse.json({ error: 'country, name and checklist are required' }, { status: 400 })
  }

  await connectDB()
  const program = await Program.create({ country, name, checklist })
  return NextResponse.json({ ...program.toObject(), _id: program._id.toString() }, { status: 201 })
}
