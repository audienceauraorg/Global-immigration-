'use server'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/auth'
import { AuthError } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import { User, Client, Case, Program, CaseDocument, ActivityLog, CaseFee } from '@/lib/db/models'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { notifyAdminNewClient, notifyClientWelcome } from '@/lib/email'
import { CONSULTATION_FEE } from '@/lib/fees'

// 30-day max-age matches the default NextAuth session duration
const GIH_UI_COOKIE = {
  name: 'gih_ui',
  opts: {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  },
}

export async function signUp(formData: FormData) {
  const name        = (formData.get('full_name') as string)?.trim()
  const email       = (formData.get('email') as string)?.toLowerCase().trim()
  const password    = formData.get('password') as string
  const phone       = (formData.get('phone') as string)?.trim()
  const programType = (formData.get('program_type') as string)?.trim()

  if (!name || !email || !password) return { error: 'Name, email, and password are required' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters' }

  await connectDB()

  const existingUser = await User.findOne({ email })
  if (existingUser) return { error: 'An account with that email already exists' }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, password: hashed, role: 'client', phone: phone || undefined })

  // Find or create Client record
  let client = await Client.findOne({ email })
  if (client) {
    client.userId = user._id
    client.accountStatus = 'active'
    if (phone) client.phone = phone
    await client.save()
  } else {
    client = await Client.create({
      userId: user._id,
      name,
      email,
      phone: phone || undefined,
      accountStatus: 'active',
    })
  }

  // If client picked a program, try to match an existing Program record and init their case
  if (programType) {
    const program = await Program.findOne({
      name: { $regex: new RegExp(`^${programType}$`, 'i') },
    }).lean()
    if (program) {
      const existingCase = await Case.findOne({ clientId: client._id, programId: program._id })
      if (!existingCase) {
        const newCase = await Case.create({
          clientId: client._id,
          programId: program._id,
          programSnapshot: {
            name:      program.name,
            country:   program.country,
            checklist: program.checklist,
          },
          stage: 'Intake',
        })

        if (program.checklist && program.checklist.length > 0) {
          await CaseDocument.insertMany(
            program.checklist.map((docName: string) => ({
              caseId: newCase._id,
              name: docName,
              status: 'not_submitted',
            }))
          )
        }

        await ActivityLog.create({
          caseId: newCase._id,
          description: `Enrolled in ${program.name} via online registration`,
          visibleToClient: true,
          createdBy: user._id,
        })

        await CaseFee.create({
          caseId: newCase._id,
          label: 'Consultation Fee',
          amount: CONSULTATION_FEE,
          category: 'consultation',
          status: 'unpaid',
          tag: 'consultation',
        })
      }
    }
  }

  // Program name for notification emails — use the selected label directly
  const programName = programType || 'Not selected'

  // Notify admin(s) about new self-registration — non-blocking, never throws
  void notifyAdminNewClient({
    clientName:  name,
    clientEmail: email,
    programName,
    clientId:    client._id.toString(),
    source:      'self-registered',
  })

  // Send welcome email to the new client with portal login link — non-blocking
  void notifyClientWelcome({
    clientName:  name,
    clientEmail: email,
    programName,
  })

  // Sign in immediately after registration
  try {
    await nextAuthSignIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) {
      // Auth failed right after creating the account — send to login instead
      redirect('/login?registered=1')
    }
    throw error
  }

  // Set a plain (non-httponly) cookie so static pages can detect login state
  ;(await cookies()).set(GIH_UI_COOKIE.name, '1', GIH_UI_COOKIE.opts)

  // Send new users through the onboarding wizard (program + service tier selection)
  redirect('/dashboard/onboarding')
}

export async function signIn(formData: FormData) {
  const email    = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string

  try {
    await nextAuthSignIn('credentials', { email, password, redirect: false })
  } catch (error) {
    // Only catch real auth failures — re-throw everything else
    // (Next.js uses thrown errors for redirects internally; swallowing them breaks navigation)
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password' }
    }
    throw error
  }

  // Set a plain (non-httponly) cookie so static pages can detect login state
  ;(await cookies()).set(GIH_UI_COOKIE.name, '1', GIH_UI_COOKIE.opts)

  // Redirect based on role
  await connectDB()
  const user = await User.findOne({ email }).lean()
  const role = (user as any)?.role ?? 'client'
  redirect(role === 'client' ? '/dashboard' : '/admin/dashboard')
}

export async function signOut() {
  // Clear the UI indicator cookie before NextAuth redirects
  ;(await cookies()).delete({ name: GIH_UI_COOKIE.name, path: '/' })
  await nextAuthSignOut({ redirectTo: '/login' })
}

export async function getSession() {
  return auth()
}

export async function getProfile() {
  const session = await auth()
  if (!session?.user?.id) return null

  await connectDB()
  const user = await User.findById(session.user.id).lean()
  if (!user) return null

  return {
    id:    user._id.toString(),
    name:  user.name,
    email: user.email,
    role:  user.role,
    phone: user.phone,
  }
}
