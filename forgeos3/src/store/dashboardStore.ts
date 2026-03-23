import { create } from 'zustand'
import api from '../lib/api'

interface SecurityPulse {
  totalValueProtected: number
  safetyScore: number
  shieldStatus: 'Active' | 'Elite' | 'Warning'
  lastAttackBlocked: string
}

interface DashboardState {
  stats: {
    totalRuns: number
    activeAgents: number
    pendingApprovals: number
    totalBlocked: number
    totalAllowed: number
    avgRiskScore: number
    securityPulse: SecurityPulse
  } | null
  loading: boolean
  error: string | null
  fetchStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/api/dashboard/stats')
      set({ stats: data, loading: false })
    } catch (err) {
      set({ error: 'Failed to load dashboard metrics', loading: false })
    }
  }
}))
