// ─── Fee configuration for Global Immigration Hub ─────────────────────────────
// All monetary values are in CAD.
// Official government fees sourced from IRCC (ircc.canada.ca) as of 2025.

export const CONSULTATION_FEE = 35

/** E-transfer recipient for consultation fee payments */
export const ETRANSFER_EMAIL =
  process.env.ETRANSFER_EMAIL ?? process.env.CONTACT_EMAIL ?? 'globalimmigrationhub.ca@gmail.com'

// ─── Program keys ─────────────────────────────────────────────────────────────
export type ProgramKey =
  | 'Express Entry'
  | 'Family Sponsorship'
  | 'Study Permit'
  | 'Work Permit'
  | 'Permanent Residency'
  | 'Citizenship Application'
  | 'Refugee & Asylum'
  | 'Other'

export const PROGRAM_KEYS: ProgramKey[] = [
  'Express Entry',
  'Family Sponsorship',
  'Study Permit',
  'Work Permit',
  'Permanent Residency',
  'Citizenship Application',
  'Refugee & Asylum',
  'Other',
]

// ─── Official IRCC government fees ────────────────────────────────────────────
export interface OfficialFeeEntry {
  /** Total official fee per principal adult applicant (CAD) */
  total: number
  /** Human-readable note if fee is variable */
  note?: string
  /** Line-by-line breakdown */
  breakdown: string[]
}

export const OFFICIAL_FEES: Record<ProgramKey, OfficialFeeEntry> = {
  'Express Entry': {
    total: 1_450,
    breakdown: [
      'Processing fee — $850',
      'Right of Permanent Residence (RPRF) — $515',
      'Biometrics — $85',
    ],
  },
  'Family Sponsorship': {
    total: 1_165,
    breakdown: [
      'Sponsorship fee — $75',
      'Principal applicant processing — $490',
      'Right of Permanent Residence (RPRF) — $515',
      'Biometrics — $85',
    ],
  },
  'Study Permit': {
    total: 235,
    breakdown: [
      'Study permit processing — $150',
      'Biometrics — $85',
    ],
  },
  'Work Permit': {
    total: 240,
    breakdown: [
      'Work permit processing — $155',
      'Biometrics — $85',
    ],
  },
  'Permanent Residency': {
    total: 1_450,
    breakdown: [
      'Processing fee — $850',
      'Right of Permanent Residence (RPRF) — $515',
      'Biometrics — $85',
    ],
  },
  'Citizenship Application': {
    total: 630,
    breakdown: [
      'Adult citizenship processing — $630',
    ],
  },
  'Refugee & Asylum': {
    total: 0,
    note: '$0 for in-Canada claims; $550 for Humanitarian & Compassionate applications',
    breakdown: [
      'In-Canada refugee protection claim — $0',
      'Humanitarian & Compassionate (H&C) — $550',
    ],
  },
  'Other': {
    total: 0,
    note: 'Varies — contact us for a quote',
    breakdown: [
      'Fee depends on specific application type',
    ],
  },
}

// ─── Agency service fees ───────────────────────────────────────────────────────
export interface AgencyFeeEntry {
  /** Client gathers all documents; agency handles forms, filing, and communication */
  fullHandling: number
  /** Agency assists with forms and filing only; client gathers their own documents */
  filingOnly: number
}

export const AGENCY_FEES: Record<ProgramKey, AgencyFeeEntry> = {
  'Express Entry':          { fullHandling: 2_500, filingOnly: 1_200 },
  'Family Sponsorship':     { fullHandling: 1_800, filingOnly: 900  },
  'Study Permit':           { fullHandling: 900,   filingOnly: 450  },
  'Work Permit':            { fullHandling: 900,   filingOnly: 450  },
  'Permanent Residency':    { fullHandling: 2_500, filingOnly: 1_200 },
  'Citizenship Application':{ fullHandling: 1_200, filingOnly: 600  },
  'Refugee & Asylum':       { fullHandling: 2_000, filingOnly: 1_000 },
  'Other':                  { fullHandling: 1_500, filingOnly: 750  },
}

// ─── Required documents per program ───────────────────────────────────────────
export const PROGRAM_DOCUMENTS: Record<ProgramKey, string[]> = {
  'Express Entry': [
    'Valid passport (all pages)',
    'Educational Credential Assessment (ECA) from a designated organization',
    'IELTS / CELPIP (English) or TEF / TCF (French) language test results',
    'Work experience reference letters (on company letterhead)',
    'Pay stubs and T4 slips (last 2 years)',
    'Bank statements — proof of funds (last 6 months)',
    'Police clearance certificates (all countries lived in for 6+ months)',
    'Medical exam results from IRCC-approved physician',
    'Proof of Canadian job offer (if applicable)',
  ],
  'Family Sponsorship': [
    'Valid passport — sponsor and applicant',
    'Proof of Canadian citizenship or permanent residence (sponsor)',
    'Marriage or common-law partnership certificate',
    'Proof of genuine relationship (photos, communication records, joint assets)',
    'Sponsor income proof: NOA, T4 slips, employment letter',
    'Police clearance certificates (all countries)',
    'Medical exam results (applicant)',
    'Biometrics',
    'Sponsor\'s IMM 1344 sponsorship undertaking form',
  ],
  'Study Permit': [
    'Valid passport',
    'Acceptance letter from a Designated Learning Institution (DLI)',
    'Bank statements — proof of funds (minimum $10,000 CAD per year)',
    'Statement of Purpose / Study plan letter',
    'Proof of ties to home country (employment, property, family)',
    'Biometrics',
    'English/French proficiency results (if required by institution)',
    'Transcripts and academic records',
  ],
  'Work Permit': [
    'Valid passport',
    'Job offer letter / employment contract',
    'Labour Market Impact Assessment (LMIA) — if required',
    'Employer\'s LMIA approval letter (if applicable)',
    'Educational credentials and transcripts',
    'Proof of relevant work experience',
    'Biometrics',
    'Copy of current immigration status in Canada (if already in Canada)',
  ],
  'Permanent Residency': [
    'Valid passport (all pages)',
    'Educational Credential Assessment (ECA)',
    'Language test results (IELTS / CELPIP / TEF / TCF)',
    'Work experience reference letters',
    'Pay stubs and T4 slips (last 2 years)',
    'Bank statements — proof of funds',
    'Police clearance certificates',
    'Medical exam results',
    'Provincial Nomination Certificate (if applying via PNP)',
    'Job offer letter (if applicable)',
  ],
  'Citizenship Application': [
    'Permanent Resident (PR) card',
    'Proof of physical presence — travel history for last 5 years',
    'Passport(s) covering last 5 years (all pages)',
    'Language test results (CLB 4+ in English or French)',
    'Notice of Assessment (NOA) — tax compliance for 3 out of 5 years',
    'CIT 0002 — Application for Canadian Citizenship form',
    'Two photos meeting IRCC specifications',
    'Police clearance (if outside Canada during the 4-year window)',
  ],
  'Refugee & Asylum': [
    'Identity documents (passport if available)',
    'Evidence of persecution (letters, articles, official records)',
    'Basis of Claim (BOC) form',
    'Police records or military/government documents from country of origin',
    'Medical records (if persecution involves harm or illness)',
    'Proof of membership in a persecuted group (if applicable)',
    'Witness statements or supporting affidavits',
  ],
  'Other': [
    'Valid passport',
    'Identity and status documents',
    'Case-specific supporting documents — your consultant will advise',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmt(amount: number): string {
  return amount === 0 ? '$0' : `$${amount.toLocaleString('en-CA')} CAD`
}

export function getTotals(program: ProgramKey, tier: 'fullHandling' | 'filingOnly') {
  const official = OFFICIAL_FEES[program]?.total ?? 0
  const agency   = AGENCY_FEES[program]?.[tier] ?? 0
  return { official, agency, total: official + agency }
}
