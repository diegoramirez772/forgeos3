import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  name: string
  email: string
}

export type DurangoProfile = 'salud' | 'agro' | 'gobierno'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  activeProfile: DurangoProfile
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  setProfile: (profile: DurangoProfile) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('forgeos3_token'),
  isAuthenticated: !!localStorage.getItem('forgeos3_token'),
  loading: false,
  error: null,
  activeProfile: (localStorage.getItem('forgeos3_profile') as DurangoProfile) ?? 'gobierno',

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user || !data.session) throw new Error('Invalid login response')
      
      const token = data.session.access_token
      const userObj = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
      }

      localStorage.setItem('forgeos3_token', token)
      set({ user: userObj, token, isAuthenticated: true, loading: false })
    } catch (err: any) {
      const message = err.message || 'Invalid credentials'
      set({ error: message, loading: false })
      throw err
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      })
      if (error) throw error

      if (!data.user || !data.session) {
        throw new Error('Please check your email to confirm registration.')
      }

      const token = data.session.access_token
      const userObj = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
      }

      localStorage.setItem('forgeos3_token', token)
      set({ user: userObj, token, isAuthenticated: true, loading: false })
    } catch (err: any) {
      const message = err.message || 'Something went wrong'
      set({ error: message, loading: false })
      throw err
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('forgeos3_token')
    set({ user: null, token: null, isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
  setProfile: (profile: DurangoProfile) => {
    localStorage.setItem('forgeos3_profile', profile)
    set({ activeProfile: profile })
  },
}))
