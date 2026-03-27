export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          admin_token: string
          slug: string
          title: string
          description: string
          survey_url: string
          estimated_minutes: number
          budget_cents: number
          donation_per_completion_cents: number
          verification_method: string
          completion_code: string | null
          verification_url: string | null
          locked_charity_id: string | null
          status: string
          donation_confirmed: boolean
          donation_proof_url: string | null
          target_audience: string | null
          creator_name: string | null
          is_public: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          admin_token?: string
          slug: string
          title: string
          description: string
          survey_url: string
          estimated_minutes: number
          budget_cents?: number
          donation_per_completion_cents?: number
          verification_method?: string
          completion_code?: string | null
          verification_url?: string | null
          locked_charity_id?: string | null
          status?: string
          donation_confirmed?: boolean
          donation_proof_url?: string | null
          target_audience?: string | null
          is_public?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          admin_token?: string
          slug?: string
          title?: string
          description?: string
          survey_url?: string
          estimated_minutes?: number
          budget_cents?: number
          donation_per_completion_cents?: number
          verification_method?: string
          completion_code?: string | null
          verification_url?: string | null
          locked_charity_id?: string | null
          status?: string
          donation_confirmed?: boolean
          donation_proof_url?: string | null
          target_audience?: string | null
          is_public?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaigns_locked_charity_id_fkey'
            columns: ['locked_charity_id']
            isOneToOne: false
            referencedRelation: 'charities'
            referencedColumns: ['id']
          },
        ]
      }
      completions: {
        Row: {
          id: string
          campaign_id: string
          ip_hash: string
          verification_type: string
          screenshot_url: string | null
          code_entered: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          ip_hash: string
          verification_type: string
          screenshot_url?: string | null
          code_entered?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          ip_hash?: string
          verification_type?: string
          screenshot_url?: string | null
          code_entered?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'completions_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      charities: {
        Row: {
          id: string
          name: string
          description: string | null
          website_url: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          page_path: string
          visitor_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          page_path: string
          visitor_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          page_path?: string
          visitor_hash?: string
          created_at?: string
        }
        Relationships: []
      }
      betterplace_charities: {
        Row: {
          id: string
          betterplace_id: number
          name: string
          description: string | null
          city: string | null
          country: string | null
          logo_url: string | null
          website_url: string | null
          betterplace_url: string | null
          tax_deductible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          betterplace_id: number
          name: string
          description?: string | null
          city?: string | null
          country?: string | null
          logo_url?: string | null
          website_url?: string | null
          betterplace_url?: string | null
          tax_deductible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          betterplace_id?: number
          name?: string
          description?: string | null
          city?: string | null
          country?: string | null
          logo_url?: string | null
          website_url?: string | null
          betterplace_url?: string | null
          tax_deductible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
