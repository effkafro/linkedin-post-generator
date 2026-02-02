import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in localStorage-only mode.')
  console.log('Missing credentials:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  })
}

function createSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

export const isSupabaseConfigured = !!supabase

// Type guard for use in components
export function getSupabase(): SupabaseClient<Database> | null {
  return supabase
}
