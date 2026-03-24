import { create } from 'zustand'
import type { Run } from '../types/run'
import type { ApprovalRequest } from '../types/approval'
import api from '../lib/api'

export interface EmergencyAlert {
  id: number
  toolName: string
  reason: string
}

interface RunState {
  runs: Run[]
  selectedRun: Run | null
  approvals: ApprovalRequest[]
  loading: boolean
  loadingApprovals: boolean
  error: string | null
  emergencyAlerts: EmergencyAlert[]
  fetchRuns: () => Promise<void>
  fetchApprovals: () => Promise<void>
  setSelectedRun: (run: Run | null) => void
  resolveApproval: (id: string, decision: 'approved' | 'rejected') => void
  clearError: () => void
  pushAlert: (toolName: string, reason: string) => void
  dismissAlert: (id: number) => void
}

let _alertIdCounter = 0

export const useRunStore = create<RunState>((set, get) => ({
  runs: [],
  selectedRun: null,
  approvals: [],
  loading: false,
  loadingApprovals: false,
  error: null,
  emergencyAlerts: [],

  fetchRuns: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<{ data: Run[] }>('/api/runs')
      const runs = data.data
      const current = get().selectedRun
      set({
        runs,
        selectedRun: current ? runs.find(r => r.id === current.id) ?? runs[0] ?? null : runs[0] ?? null,
        loading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch runs'
      set({ error: message, loading: false })
    }
  },

  fetchApprovals: async () => {
    set({ loadingApprovals: true, error: null })
    try {
      const { data } = await api.get<{ data: ApprovalRequest[] }>('/api/approvals')
      set({ approvals: data.data, loadingApprovals: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch approvals'
      set({ error: message, loadingApprovals: false })
    }
  },

  setSelectedRun: (run) => set({ selectedRun: run }),

  resolveApproval: (id, decision) => set((s) => ({
    approvals: s.approvals.map(a =>
      a.id === id
        ? { ...a, status: decision, reviewedBy: 'admin@forgeos3.dev', reviewedAt: new Date().toISOString() }
        : a
    ),
  })),

  clearError: () => set({ error: null }),

  pushAlert: (toolName, reason) => {
    const id = ++_alertIdCounter
    set(s => ({ emergencyAlerts: [...s.emergencyAlerts, { id, toolName, reason }] }))
    setTimeout(() => get().dismissAlert(id), 6000)
  },

  dismissAlert: (id) =>
    set(s => ({ emergencyAlerts: s.emergencyAlerts.filter(a => a.id !== id) })),
}))
