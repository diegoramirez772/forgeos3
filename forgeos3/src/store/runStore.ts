import { create } from 'zustand'
import type { Run } from '../types/run'
import type { ApprovalRequest } from '../types/approval'
import { MOCK_RUNS, MOCK_APPROVALS } from '../lib/constants'

interface RunState {
  runs: Run[]
  selectedRun: Run | null
  approvals: ApprovalRequest[]
  setSelectedRun: (run: Run | null) => void
  resolveApproval: (id: string, decision: 'approved' | 'rejected') => void
}

export const useRunStore = create<RunState>((set) => ({
  runs: MOCK_RUNS,
  selectedRun: MOCK_RUNS[1],
  approvals: MOCK_APPROVALS,
  setSelectedRun: (run) => set({ selectedRun: run }),
  resolveApproval: (id, decision) => set((s) => ({
    approvals: s.approvals.map(a => a.id === id ? { ...a, status: decision, reviewedBy: 'admin@forgeos3.dev', reviewedAt: new Date().toISOString() } : a)
  })),
}))
