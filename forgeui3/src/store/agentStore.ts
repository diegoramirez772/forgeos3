import { create } from 'zustand'
import type { Message, GovernanceEvent, Domain } from '../types'

interface AgentState {
  domain:      Domain | null
  messages:    Message[]
  govEvents:   GovernanceEvent[]
  running:     boolean
  runId:       string | null
  lang:        'ESP' | 'ENG' | 'NHN'

  setDomain:   (d: Domain) => void
  setLang:     (l: 'ESP' | 'ENG' | 'NHN') => void
  addMessage:  (m: Message) => void
  updateLast:  (content: string, thoughts?: string, artifacts?: Message['artifacts']) => void
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
  lang:      'ESP',

  setDomain:   (domain)  => set({ domain }),
  setLang:     (lang)    => set({ lang }),
  addMessage:  (m)       => set(s => ({ messages:  [...s.messages,  m] })),
  updateLast:  (content: string, thoughts?: string, artifacts?: Message['artifacts']) => set(s => {
    const msgs = [...s.messages]
    const lastIdx = msgs.length - 1
    if (lastIdx >= 0) {
      msgs[lastIdx] = { 
        ...msgs[lastIdx], 
        content, 
        loading: false,
        ...(thoughts !== undefined ? { thoughts } : {}),
        ...(artifacts !== undefined ? { artifacts } : {}),
      }
    }
    return { messages: msgs }
  }),
  addGovEvent: (e)       => set(s => ({ govEvents: [...s.govEvents, e] })),
  setRunning:  (running) => set({ running }),
  setRunId:    (runId)   => set({ runId }),
  clear:       ()        => set({ messages: [], govEvents: [], runId: null, running: false }),
}))
