// Run once to seed the database:
//   node scripts/seed.mjs
//
// Set MONGODB_URI and MONGODB_DB in your environment first.

import { MongoClient } from 'mongodb'
import { createHash } from 'crypto'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://globalimmigrationhubca_db_user:Talktome123@cluster0.6bazsz6.mongodb.net'
const MONGODB_DB  = process.env.MONGODB_DB  || 'global_immigration_hub'

async function hashPassword(password) {
  // Simple seed — in production always use bcrypt via the app signup
  // This uses a placeholder; run via: npm run seed
  const { default: bcrypt } = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

const PROGRAMS = [
  {
    country: 'Canada',
    name: 'SINP – Occupations In-Demand',
    checklist: [
      'Valid Passport (all pages)',
      'IELTS/CELPIP Language Test Results',
      'Educational Credential Assessment (ECA)',
      'Proof of Work Experience (reference letters, T4s)',
      'Job Offer Letter (if applicable)',
      'Proof of Settlement Funds',
      'Police Certificate (Canada + country of residence)',
      'Medical Exam Results (IMM 1017B)',
      'Completed IMM 0008 Application Forms',
      'Two Passport-Sized Photos',
    ],
  },
  {
    country: 'Canada',
    name: 'SINP – Saskatchewan Experience Category',
    checklist: [
      'Valid Passport (all pages)',
      'Employment Contract or Letter from SK Employer',
      'Proof of 6+ Months SK Work Experience (pay stubs, T4s)',
      'IELTS/CELPIP Language Test Results',
      'Educational Credential Assessment (ECA) if applicable',
      'Police Certificate (Canada + country of residence)',
      'Medical Exam Results',
      'Proof of Settlement Funds',
      'Two Passport-Sized Photos',
    ],
  },
  {
    country: 'Canada',
    name: 'ISWC – International Skilled Worker (Canadian Experience)',
    checklist: [
      'Valid Passport (all pages)',
      'Canadian Work Permit (copy)',
      'IELTS/CELPIP Language Test Results (CLB 7+)',
      'Proof of 1 Year Canadian Skilled Work Experience',
      'Employment Letter from Canadian Employer',
      'Notice of Assessment (CRA)',
      'Police Certificate',
      'Medical Exam Results',
      'Two Passport-Sized Photos',
    ],
  },
  {
    country: 'Canada',
    name: 'Spousal / Common-Law Sponsorship',
    checklist: [
      "Sponsor Proof of Canadian Citizenship or PR",
      'Sponsor Proof of Income (NOA, T4, pay stubs)',
      'Marriage Certificate (notarized) or Proof of Common-Law',
      'Joint Financial Documents (bank accounts, lease, bills)',
      'Relationship Photos (chronological)',
      'Communication Evidence (messages, call logs)',
      'IMM 1344 – Sponsorship Application',
      'IMM 0008 – Generic Application Form',
      'Both Passports (all pages)',
      'Police Certificate (both parties)',
      'Medical Exam (sponsored person)',
      'Two Passport-Sized Photos (each)',
    ],
  },
  {
    country: 'Canada',
    name: 'Open Work Permit – Post-Graduate (PGWP)',
    checklist: [
      'Valid Passport',
      'Graduation Letter / Transcripts from Canadian Institution',
      'Study Permit (copy)',
      'Proof of Full-Time Study Completion',
      'IMM 1295 – Work Permit Application',
      'Two Passport-Sized Photos',
      'IRCC Fee Payment Receipt',
    ],
  },
  {
    country: 'Canada',
    name: 'Permanent Residence – Express Entry (FSW)',
    checklist: [
      'Valid Passport (all pages)',
      'IELTS General Training Results (CLB 7+)',
      'Educational Credential Assessment (ECA – WES)',
      'Proof of Skilled Work Experience (reference letters, pay stubs)',
      'Police Certificate (all countries of residence 6+ months)',
      'Medical Exam (IMM 1017B, authorized panel physician)',
      'Proof of Settlement Funds',
      'Job Offer (LMIA-exempt or LMIA-supported, if applicable)',
      'Express Entry Profile Number & ITA Letter',
      'Two Passport-Sized Photos',
      'IMM 0008, IMM 5669, IMM 5406 Forms',
    ],
  },
  {
    country: 'Canada',
    name: 'Study Permit',
    checklist: [
      'Valid Passport',
      'Letter of Acceptance from Canadian DLI',
      'Proof of Financial Support (tuition + living costs)',
      'Bank Statements (last 6 months)',
      'Study Plan / Purpose of Study Letter',
      'Police Certificate',
      'IMM 1294 – Study Permit Application',
      'Quebec CAQ (if studying in Quebec)',
      'Biometrics (if required)',
      'Two Passport-Sized Photos',
    ],
  },
]

async function seed() {
  console.log('Connecting to MongoDB…')
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)

  // ── Programs ─────────────────────────────────────────────────────────────
  const programsCol = db.collection('programs')
  const existingPrograms = await programsCol.countDocuments()

  if (existingPrograms === 0) {
    await programsCol.insertMany(PROGRAMS.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    })))
    console.log(`✓ Inserted ${PROGRAMS.length} programs`)
  } else {
    console.log(`  Programs already seeded (${existingPrograms} found) — skipping`)
  }

  // ── Site settings ─────────────────────────────────────────────────────────
  const settingsCol = db.collection('sitesettings')
  const existingSettings = await settingsCol.countDocuments()
  if (existingSettings === 0) {
    await settingsCol.insertOne({
      siteName: 'Global Immigration Hub',
      siteTagline: 'Your trusted immigration partner',
      rcicNumber: '',
      contactEmail: '',
      emailFromName: 'Global Immigration Hub',
      emailFromAddr: '',
      maxUploadMb: 10,
      selfRegister: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log('✓ Site settings initialized')
  } else {
    console.log('  Site settings already exist — skipping')
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  const usersCol = db.collection('users')
  const existingAdmin = await usersCol.findOne({ role: 'admin' })

  if (!existingAdmin) {
    const password = await hashPassword('Admin123!')
    await usersCol.insertOne({
      name: 'Admin',
      email: 'admin@globalimmigrationhub.ca',
      password,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log('✓ Admin user created')
    console.log('  Email:    admin@globalimmigrationhub.ca')
    console.log('  Password: Admin123!')
    console.log('  ⚠️  Change this password immediately after first login!')
  } else {
    console.log('  Admin user already exists — skipping')
  }

  await client.close()
  console.log('\n✅ Seed complete!')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
