import { create } from 'zustand'
import type { Agent } from '../types/agent'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  setSelectedAgent: (agent: Agent | null) => void
  addAgent: (agent: Agent) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [
    { id: 'ag-1', name: 'HealthAgent Alpha', description: 'Patient intake and documentation', runtime: 'openclaw', domainProfile: 'health', toolPackId: 'tp-health', policyPresetId: 'pp-strict', riskMode: 'safe', requiresApprovalFor: ['diagnose', 'write_record'], status: 'active', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ag-2', name: 'GovBot Prime', description: 'Public request routing and classification', runtime: 'openclaw', domainProfile: 'gov', toolPackId: 'tp-gov', policyPresetId: 'pp-medium', riskMode: 'safe', requiresApprovalFor: ['write_external', 'publish'], status: 'active', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'ag-3', name: 'MarketingAgent', description: 'Content pipeline automation', runtime: 'openclaw', domainProfile: 'marketing', toolPackId: 'tp-marketing', policyPresetId: 'pp-low', riskMode: 'normal', requiresApprovalFor: ['publish'], status: 'active', createdAt: new Date(Date.now() - 259200000).toISOString() },
  ],
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),
}))
