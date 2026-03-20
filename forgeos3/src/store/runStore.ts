import { create } from 'zustand'
import type { Run } from '../types/run'
import type { ApprovalRequest } from '../types/approval'
import api from '../lib/api'

interface RunState {
  runs: Run[]
  selectedRun: Run | null
  approvals: ApprovalRequest[]
  loading: boolean
  loadingApprovals: boolean
  error: string | null
  fetchRuns: () => Promise<void>
  fetchApprovals: () => Promise<void>
  setSelectedRun: (run: Run | null) => void
  resolveApproval: (id: string, decision: 'approved' | 'rejected') => void
  clearError: () => void
}

export const useRunStore = create<RunState>((set, get) => ({
  runs: [],
  selectedRun: null,
  approvals: [],
  loading: false,
  loadingApprovals: false,
  error: null,

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
}))
