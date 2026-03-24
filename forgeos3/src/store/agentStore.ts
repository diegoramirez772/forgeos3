import { create } from 'zustand'
import type { Agent } from '../types/agent'
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

  fetchAgents: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<{ data: Agent[] }>('/api/agents')
      set({ agents: data.data, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch agents'
      set({ error: message, loading: false })
    }
  },

  createAgent: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post<{ data: Agent }>('/api/agents', payload)
      set((s) => ({ agents: [data.data, ...s.agents], loading: false }))
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
