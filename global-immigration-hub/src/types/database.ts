export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: number
          site_name: string
          site_tagline: string
          rcic_number: string | null
          contact_email: string | null
          email_from_name: string
          email_from_addr: string | null
          max_upload_mb: number
          self_register: boolean
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['site_settings']['Row']>
        Update: Partial<Database['public']['Tables']['site_settings']['Row']>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          role: 'admin' | 'staff' | 'client'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          profile_id: string | null
          name: string
          email: string
          phone: string | null
          notes: string | null
          account_status: 'pending' | 'invited' | 'active'
          created_at: string
        }
        Insert: {
          name: string
          email: string
          phone?: string | null
          profile_id?: string | null
          notes?: string | null
          account_status?: 'pending' | 'invited' | 'active'
        }
        Update: Partial<Database['public']['Tables']['clients']['Row']>
        Relationships: []
      }
      programs: {
        Row: {
          id: string
          country: string
          name: string
          checklist: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['programs']['Row']>
        Relationships: []
      }
      cases: {
        Row: {
          id: string
          client_id: string
          program_id: string
          checklist: string[]
          stage: 'Intake' | 'Docs Collection' | 'Review' | 'Submitted' | 'Decision' | 'Closed'
          assigned_to: string | null
          important_date: string | null
          opened_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          program_id: string
          checklist?: string[]
          stage?: 'Intake' | 'Docs Collection' | 'Review' | 'Submitted' | 'Decision' | 'Closed'
          assigned_to?: string | null
          important_date?: string | null
        }
        Update: Partial<Database['public']['Tables']['cases']['Row']>
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          case_id: string
          name: string
          status: 'not_submitted' | 'pending_review' | 'approved' | 'rejected'
          storage_path: string | null
          file_name: string | null
          file_size: number | null
          version: number
          uploaded_by: 'client' | 'admin' | null
          uploaded_at: string | null
          reviewed_at: string | null
          rejection_note: string | null
          is_scanned: boolean
          is_infected: boolean
          created_at: string
        }
        Insert: {
          case_id: string
          name: string
          status?: 'not_submitted' | 'pending_review' | 'approved' | 'rejected'
          storage_path?: string | null
          file_name?: string | null
          file_size?: number | null
          version?: number
          uploaded_by?: 'client' | 'admin' | null
          uploaded_at?: string | null
          reviewed_at?: string | null
          rejection_note?: string | null
          is_scanned?: boolean
          is_infected?: boolean
        }
        Update: Partial<Database['public']['Tables']['documents']['Row']>
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          case_id: string
          description: string
          visible_to_client: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          case_id: string
          description: string
          visible_to_client?: boolean
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['activity_log']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Shorthand types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Program = Database['public']['Tables']['programs']['Row']
export type Case = Database['public']['Tables']['cases']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']
export type SiteSettings = Database['public']['Tables']['site_settings']['Row']

// Extended joined types
export type ClientWithCase = Client & { cases: Case[] }
export type CaseWithDetails = Case & {
  clients: Client
  programs: Program
  documents: Document[]
  activity_log: ActivityLog[]
  profiles?: Profile
}
export type CaseWithClient = Case & { clients: Client; programs: Program }
