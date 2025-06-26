import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          registration_number: string
          make?: string
          model?: string
          year?: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          registration_number: string
          make?: string
          model?: string
          year?: number
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          registration_number?: string
          make?: string
          model?: string
          year?: number
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      car_permissions: {
        Row: {
          id: string
          car_id: string
          user_id: string
          role: 'owner' | 'contributor' | 'viewer' | 'holder' | 'buyer' | 'inspector' | 'mechanic' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          user_id: string
          role: 'owner' | 'contributor' | 'viewer' | 'holder' | 'buyer' | 'inspector' | 'mechanic' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          user_id?: string
          role?: 'owner' | 'contributor' | 'viewer' | 'holder' | 'buyer' | 'inspector' | 'mechanic' | 'other'
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          car_id: string
          section: string
          item_key: string
          status: 'ok' | 'warning' | 'issue' | null
          comment?: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          car_id: string
          section: string
          item_key: string
          status?: 'ok' | 'warning' | 'issue' | null
          comment?: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          car_id?: string
          section?: string
          item_key?: string
          status?: 'ok' | 'warning' | 'issue' | null
          comment?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          car_id: string
          type: string
          date: string
          mileage?: number
          notes?: string
          cost?: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          car_id: string
          type: string
          date: string
          mileage?: number
          notes?: string
          cost?: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          car_id?: string
          type?: string
          date?: string
          mileage?: number
          notes?: string
          cost?: number
          created_at?: string
          created_by?: string
        }
      }
      suggested_maintenance: {
        Row: {
          id: string
          car_id: string
          type: string
          due_date?: string
          due_mileage?: number
          status: 'pending' | 'completed' | 'overdue'
          notes?: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          car_id: string
          type: string
          due_date?: string
          due_mileage?: number
          status: 'pending' | 'completed' | 'overdue'
          notes?: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          car_id?: string
          type?: string
          due_date?: string
          due_mileage?: number
          status?: 'pending' | 'completed' | 'overdue'
          notes?: string
          created_at?: string
          created_by?: string
        }
      }
      media: {
        Row: {
          id: string
          car_id: string
          checklist_item_id?: string
          maintenance_record_id?: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          car_id: string
          checklist_item_id?: string
          maintenance_record_id?: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          car_id?: string
          checklist_item_id?: string
          maintenance_record_id?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
          created_by?: string
        }
      }
      approvals: {
        Row: {
          id: string
          car_id: string
          type: 'buyer' | 'seller'
          signature?: string
          comment?: string
          approved_at?: string
          approved_by?: string
          created_at: string
        }
        Insert: {
          id?: string
          car_id: string
          type: 'buyer' | 'seller'
          signature?: string
          comment?: string
          approved_at?: string
          approved_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          car_id?: string
          type?: 'buyer' | 'seller'
          signature?: string
          comment?: string
          approved_at?: string
          approved_by?: string
          created_at?: string
        }
      }
    }
  }
}