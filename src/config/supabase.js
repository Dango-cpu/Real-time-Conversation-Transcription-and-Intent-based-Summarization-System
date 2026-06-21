import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL?.trim()
const anonKey = process.env.SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

export const databaseStatus = () => ({
  connected: isSupabaseConfigured,
  mode: isSupabaseConfigured ? 'supabase' : 'mock',
  message: isSupabaseConfigured
    ? 'Supabase is configured.'
    : 'Database is not connected. The application is using mock data.'
})
