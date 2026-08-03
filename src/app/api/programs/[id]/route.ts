import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Program } from '@/lib/db/models'
import { auth } from '@/auth'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['admin', 'staff'].includes(session.user.role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { id } = await params
  await connectDB()
  await Program.findByIdAndDelete(id)
  return new NextResponse(null, { status: 204 })
}
