import { create } from 'zustand'
import type { Agent, DomainProfileConfig, ToolPack, PolicyPreset } from '../types/agent'
import api from '../lib/api'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  loading: boolean
  error: string | null
  
  // Real-time agent server status
  isLive: boolean
  lastSeen: Date | null
  checkHealth: () => Promise<void>
  
  // Dynamic Config
  domainProfiles: DomainProfileConfig[]
  toolPacks: ToolPack[]
  policyPresets: PolicyPreset[]
  fetchConfig: () => Promise<void>

  fetchAgents: () => Promise<void>
  createAgent: (payload: Omit<Agent, 'id' | 'createdAt'>) => Promise<void>
  setSelectedAgent: (agent: Agent | null) => void
  addAgent: (agent: Agent) => void
  clearError: () => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,
  loading: false,
  error: null,

  isLive: false,
  lastSeen: null,

  domainProfiles: [],
  toolPacks: [],
  policyPresets: [],

  checkHealth: async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)
      const agentUrl = import.meta.env.VITE_AGENT_URL || 'http://localhost:4000'
      const res = await fetch(`${agentUrl}/api/health`, { signal: controller.signal })
      clearTimeout(timeoutId)
      
      if (res.ok) {
        set({ isLive: true, lastSeen: new Date() })
      } else {
        set({ isLive: false })
      }
    } catch {
      set({ isLive: false })
    }
  },

  fetchConfig: async () => {
    try {
      const [dRes, tRes, pRes] = await Promise.all([
        api.get<any[]>('/api/dashboard/domain-profiles'),
        api.get<any[]>('/api/dashboard/tool-packs'),
        api.get<any[]>('/api/dashboard/policy-presets'),
      ])

      const domainProfiles: DomainProfileConfig[] = dRes.data.map(d => ({
        id: d.id,
        key: d.key,
        name: d.name,
        description: d.description,
        icon: d.icon,
        color: d.color,
        riskMode: d.risk_mode,
      }))

      const toolPacks: ToolPack[] = tRes.data.map(tp => ({
        id: tp.id,
        name: tp.name,
        description: tp.description,
        domain: tp.domain,
        tools: (tp.tools || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          sensitivity: t.sensitivity,
          requiresApproval: t.requires_approval,
        })),
      }))

      const policyPresets: PolicyPreset[] = pRes.data.map(p => ({
        id: p.id,
        name: p.name,
        level: p.level,
        description: p.description,
        strictness: p.strictness,
      }))

      set({ domainProfiles, toolPacks, policyPresets })
    } catch (err) {
      console.error('Failed to fetch dynamic config:', err)
    }
  },

  fetchAgents: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<{ data: any[] }>('/api/agents')
      const agents: Agent[] = data.data.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        runtime: a.runtime,
        domainProfile: a.domain_profile,
        toolPackId: a.tool_pack_id,
        policyPresetId: a.policy_preset_id,
        riskMode: a.risk_mode,
        requiresApprovalFor: a.requires_approval_for || [],
        status: a.status,
        createdAt: a.created_at,
      }))
      set({ agents, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch agents'
      set({ error: message, loading: false })
    }
  },

  createAgent: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post<{ data: any }>('/api/agents', payload)
      const a = data.data
      const agent: Agent = {
        id: a.id,
        name: a.name,
        description: a.description,
        runtime: a.runtime,
        domainProfile: a.domain_profile,
        toolPackId: a.tool_pack_id,
        policyPresetId: a.policy_preset_id,
        riskMode: a.risk_mode,
        requiresApprovalFor: a.requires_approval_for || [],
        status: a.status,
        createdAt: a.created_at,
      }
      set((s) => ({ agents: [agent, ...s.agents], loading: false }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create agent'
      set({ error: message, loading: false })
      throw err
    }
  },

  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),

  clearError: () => set({ error: null }),
}))
