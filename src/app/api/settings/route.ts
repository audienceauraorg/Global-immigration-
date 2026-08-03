import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/db/models'
import { auth } from '@/auth'

export async function GET() {
  await connectDB()
  let settings = await SiteSettings.findOne().lean()
  if (!settings) {
    settings = await SiteSettings.create({})
    settings = settings.toObject()
  }
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const body = await request.json()
  await connectDB()

  const updated = await SiteSettings.findOneAndUpdate(
    {},
    { $set: body },
    { new: true, upsert: true }
  )

  return NextResponse.json(updated)
}
