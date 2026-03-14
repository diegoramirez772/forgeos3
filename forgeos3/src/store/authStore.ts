import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800))
    set({ user: { id: 'u-1', name: email.split('@')[0], email }, isAuthenticated: true })
  },
  signup: async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 1000))
    set({ user: { id: 'u-1', name, email }, isAuthenticated: true })
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))
