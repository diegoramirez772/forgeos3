import type { Domain } from '../types'

export interface AgentRunOptions {
  domain:    Domain
  agentId:   string
  agentName: string
  input:     string
  onToken:   (chunk: string) => void
  onGovEvent:(event: { toolName: string; decision: string; reason?: string }) => void
  onDone:    (output: string) => void
  onError:   (msg: string) => void
}

const AGENT_BASE = import.meta.env.VITE_AGENT_URL || 'http://localhost:4000'

export async function runAgent(opts: AgentRunOptions) {
  const { domain, agentId, agentName, input, onToken, onGovEvent, onDone, onError } = opts

  try {
    const response = await fetch(`${AGENT_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, agentId, agentName, input })
    })

    if (!response.ok) {
      throw new Error(`Agent Server Error: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No readable stream')
    
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!line.startsWith('event: ')) continue
        
        const eventType = line.slice(7).trim()
        const dataLine = lines[++i]
        
        if (!dataLine || !dataLine.startsWith('data: ')) continue
        
        const rawData = dataLine.slice(6).trim()
        if (!rawData) continue
        
        try {
          const evtData = JSON.parse(rawData)
          
          if (eventType === 'token') {
            onToken(evtData.text || '')
          } else if (eventType === 'gov_event') {
            onGovEvent(evtData)
          } else if (eventType === 'error') {
            onError(evtData.message || 'Unknown stream error')
          } else if (eventType === 'done') {
            onDone(evtData.fullOutput || '')
          }
        } catch (e) {
          console.error("Failed to parse SSE data", rawData, e)
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Connection to Agent Server lost')
  }
}
