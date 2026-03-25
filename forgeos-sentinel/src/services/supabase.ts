import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://immfediupemrfpeybslu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbWZlZGl1cGVtcmZwZXlic2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjUyNTYsImV4cCI6MjA4OTEwMTI1Nn0.8o3O9qyJn_yKwIqzl2R_7V5E6zBXX_JRJ_5aX4pMdZo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SentinelQuery {
  id?: string
  query: string
  domain: string
  summary: string
  risk_level: string
  raw_response: string
  created_at?: string
}

export async function saveQuery(q: SentinelQuery) {
  const { data, error } = await supabase
    .from('sentinel_queries')
    .insert([q])
    .select()

  if (error) {
    console.error('Supabase Save Error:', error)
    return null
  }
  return data?.[0] as SentinelQuery
}

export async function getRecentQueries(limit = 5) {
  const { data, error } = await supabase
    .from('sentinel_queries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Supabase Fetch Error:', error)
    return []
  }
  return data as SentinelQuery[]
}
