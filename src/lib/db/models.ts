import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string          // bcrypt hash
  role: 'admin' | 'staff' | 'client'
  phone?: string
  emailVerified?: Date
  image?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['admin', 'staff', 'client'], default: 'client' },
  phone:         { type: String },
  emailVerified: { type: Date },
  image:         { type: String },
}, { timestamps: true })

// ─── SiteSettings ─────────────────────────────────────────────────────────────
export interface ISiteSettings extends Document {
  siteName: string
  siteTagline: string
  rcicNumber?: string
  contactEmail?: string
  emailFromName: string
  emailFromAddr?: string
  maxUploadMb: number
  selfRegister: boolean
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  siteName:     { type: String, default: 'Global Immigration Hub' },
  siteTagline:  { type: String, default: 'Your trusted immigration partner' },
  rcicNumber:   { type: String },
  contactEmail: { type: String },
  emailFromName: { type: String, default: 'Global Immigration Hub' },
  emailFromAddr: { type: String },
  maxUploadMb:  { type: Number, default: 10 },
  selfRegister: { type: Boolean, default: true },
}, { timestamps: true })

// ─── Program ──────────────────────────────────────────────────────────────────
export interface IProgram extends Document {
  _id: Types.ObjectId
  country: string
  name: string
  checklist: string[]
  createdAt: Date
}

const ProgramSchema = new Schema<IProgram>({
  country:   { type: String, required: true },
  name:      { type: String, required: true },
  checklist: [{ type: String }],
}, { timestamps: true })

// ─── Client ───────────────────────────────────────────────────────────────────
export interface IClient extends Document {
  _id: Types.ObjectId
  userId?: Types.ObjectId    // linked auth user (optional until they sign up)
  name: string
  email: string
  phone?: string
  notes?: string
  accountStatus: 'pending' | 'invited' | 'active'
  createdAt: Date
}

const ClientSchema = new Schema<IClient>({
  userId:        { type: Schema.Types.ObjectId, ref: 'User' },
  name:          { type: String, required: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:         { type: String },
  notes:         { type: String },
  accountStatus: { type: String, enum: ['pending', 'invited', 'active'], default: 'active' },
}, { timestamps: true })

// ─── Case ─────────────────────────────────────────────────────────────────────
export type CaseStage = 'Intake' | 'Docs Collection' | 'Review' | 'Submitted' | 'Decision' | 'Closed'
export type ServiceTier = 'full_handling' | 'filing_only'

export interface ICase extends Document {
  _id: Types.ObjectId
  clientId: Types.ObjectId
  programId: Types.ObjectId
  programSnapshot: { name: string; country: string; checklist: string[] }
  stage: CaseStage
  assignedTo?: Types.ObjectId
  importantDate?: Date
  // Service & payment fields
  serviceTier?: ServiceTier
  officialFee?: number
  agencyFee?: number
  serviceTierSetAt?: Date
  openedAt: Date
  updatedAt: Date
}

const CaseSchema = new Schema<ICase>({
  clientId:        { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  programId:       { type: Schema.Types.ObjectId, ref: 'Program', required: true },
  programSnapshot: {
    name:      { type: String },
    country:   { type: String },
    checklist: [{ type: String }],
  },
  stage:            { type: String, enum: ['Intake','Docs Collection','Review','Submitted','Decision','Closed'], default: 'Intake' },
  assignedTo:       { type: Schema.Types.ObjectId, ref: 'User' },
  importantDate:    { type: Date },
  serviceTier:      { type: String, enum: ['full_handling', 'filing_only'] },
  officialFee:      { type: Number },
  agencyFee:        { type: Number },
  serviceTierSetAt: { type: Date },
}, { timestamps: true })

// ─── Document ─────────────────────────────────────────────────────────────────
export type DocStatus = 'not_submitted' | 'pending_review' | 'approved' | 'rejected'

export interface IDocument extends Document {
  _id: Types.ObjectId
  caseId: Types.ObjectId
  name: string
  status: DocStatus
  fileId?: Types.ObjectId    // GridFS file ID
  fileName?: string
  fileSize?: number
  mimeType?: string
  version: number
  uploadedBy?: 'client' | 'admin'
  uploadedAt?: Date
  reviewedAt?: Date
  rejectionNote?: string
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>({
  caseId:        { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  name:          { type: String, required: true },
  status:        { type: String, enum: ['not_submitted','pending_review','approved','rejected'], default: 'not_submitted' },
  fileId:        { type: Schema.Types.ObjectId },
  fileName:      { type: String },
  fileSize:      { type: Number },
  mimeType:      { type: String },
  version:       { type: Number, default: 1 },
  uploadedBy:    { type: String, enum: ['client','admin'] },
  uploadedAt:    { type: Date },
  reviewedAt:    { type: Date },
  rejectionNote: { type: String },
}, { timestamps: true })

// ─── ActivityLog ──────────────────────────────────────────────────────────────
export interface IActivityLog extends Document {
  _id: Types.ObjectId
  caseId: Types.ObjectId
  description: string
  visibleToClient: boolean
  createdBy?: Types.ObjectId
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>({
  caseId:          { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  description:     { type: String, required: true },
  visibleToClient: { type: Boolean, default: false },
  createdBy:       { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// ─── ConsultationBooking ───────────────────────────────────────────────────────
export interface IConsultationBooking extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  phone: string
  preferredDate?: string
  preferredTime?: string
  topic: string
  message?: string
  serviceTier?: ServiceTier
  consultationFee: number
  paymentMethod: 'pay_now' | 'pay_later'
  paymentStatus: 'pending' | 'received'
  receiptEmailed: boolean       // true when receipt was forwarded via Resend attachment
  receiptFileName?: string
  createdAt: Date
}

const ConsultationBookingSchema = new Schema<IConsultationBooking>({
  name:           { type: String, required: true },
  email:          { type: String, required: true, lowercase: true, trim: true },
  phone:          { type: String, required: true },
  preferredDate:  { type: String },
  preferredTime:  { type: String },
  topic:          { type: String, required: true },
  message:        { type: String },
  serviceTier:    { type: String, enum: ['full_handling', 'filing_only'] },
  consultationFee:{ type: Number, default: 30 },
  paymentMethod:  { type: String, enum: ['pay_now', 'pay_later'], default: 'pay_later' },
  paymentStatus:  { type: String, enum: ['pending', 'received'], default: 'pending' },
  receiptEmailed: { type: Boolean, default: false },
  receiptFileName:{ type: String },
}, { timestamps: true })

// ─── CaseFee ──────────────────────────────────────────────────────────────────
export type FeeCategory = 'government' | 'agency' | 'consultation' | 'other'
export type FeeStatus   = 'unpaid' | 'paid' | 'waived'

export interface ICaseFee extends Document {
  _id: Types.ObjectId
  caseId: Types.ObjectId
  label: string
  amount: number
  category: FeeCategory
  status: FeeStatus
  paidAt?: Date
  note?: string
  /** Stable key used for upsert — prevents duplicate seeding (e.g. 'consultation', 'agency', 'ircc_0') */
  tag?: string
  createdAt: Date
  updatedAt: Date
}

const CaseFeeSchema = new Schema<ICaseFee>({
  caseId:   { type: Schema.Types.ObjectId, ref: 'Case', required: true },
  label:    { type: String, required: true },
  amount:   { type: Number, required: true },
  category: { type: String, enum: ['government', 'agency', 'consultation', 'other'], default: 'other' },
  status:   { type: String, enum: ['unpaid', 'paid', 'waived'], default: 'unpaid' },
  paidAt:   { type: Date },
  note:     { type: String },
  tag:      { type: String },
}, { timestamps: true })

CaseFeeSchema.index({ caseId: 1, tag: 1 }, { unique: false, sparse: true })

// ─── Compound indexes for common query patterns ────────────────────────────────
// Client — looked up by linked user id on every dashboard load
ClientSchema.index({ userId: 1 })

// Case — filtered by client; sorted by openedAt for "most recent case" queries
CaseSchema.index({ clientId: 1, openedAt: -1 })

// Document — filtered by caseId; also sorted by createdAt for display
DocumentSchema.index({ caseId: 1, createdAt: 1 })

// ActivityLog — filtered by caseId + visibility; sorted newest-first
ActivityLogSchema.index({ caseId: 1, visibleToClient: 1, createdAt: -1 })

// Program — sorted by country + name on the public listing
ProgramSchema.index({ country: 1, name: 1 })

// ─── Model exports (safe for hot-reload) ─────────────────────────────────────
function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema)
}

export const User                 = getModel<IUser>('User', UserSchema)
export const SiteSettings         = getModel<ISiteSettings>('SiteSettings', SiteSettingsSchema)
export const Program              = getModel<IProgram>('Program', ProgramSchema)
export const Client               = getModel<IClient>('Client', ClientSchema)
export const Case                 = getModel<ICase>('Case', CaseSchema)
export const CaseDocument         = getModel<IDocument>('Document', DocumentSchema)
export const ActivityLog          = getModel<IActivityLog>('ActivityLog', ActivityLogSchema)
export const ConsultationBooking  = getModel<IConsultationBooking>('ConsultationBooking', ConsultationBookingSchema)
export const CaseFee              = getModel<ICaseFee>('CaseFee', CaseFeeSchema)
