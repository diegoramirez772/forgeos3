import { create } from 'zustand'
import type { Message, GovernanceEvent, Domain } from '../types'

interface AgentState {
  domain:      Domain | null
  messages:    Message[]
  govEvents:   GovernanceEvent[]
  running:     boolean
  runId:       string | null

  setDomain:   (d: Domain) => void
  addMessage:  (m: Message) => void
  updateLast:  (content: string) => void
  addGovEvent: (e: GovernanceEvent) => void
  setRunning:  (v: boolean) => void
  setRunId:    (id: string | null) => void
  clear:       () => void
}

export const useAgentStore = create<AgentState>((set) => ({
  domain:    null,
  messages:  [],
  govEvents: [],
  running:   false,
  runId:     null,

  setDomain:   (domain)  => set({ domain }),
  addMessage:  (m)       => set(s => ({ messages:  [...s.messages,  m] })),
  updateLast:  (content) => set(s => {
    const msgs = [...s.messages]
    const last = msgs[msgs.length - 1]
    if (last) msgs[msgs.length - 1] = { ...last, content, loading: false }
    return { messages: msgs }
  }),
  addGovEvent: (e)       => set(s => ({ govEvents: [...s.govEvents, e] })),
  setRunning:  (running) => set({ running }),
  setRunId:    (runId)   => set({ runId }),
  clear:       ()        => set({ messages: [], govEvents: [], runId: null, running: false }),
}))
