export type GovDecision = 'allowed' | 'blocked' | 'approval_required'

export interface GovEvent {
  tool: string
  decision: GovDecision
}

export interface ParsedResponse {
  summary: string
  findings: string[]
  riskLevel: 'Bajo' | 'Medio' | 'Alto'
  recommendation: string
}

interface AgentHandlers {
  onToken: (text: string) => void
  onGovEvent: (event: GovEvent) => void
  onDone: () => void
  onError: (msg: string) => void
}

const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? 'http://localhost:4000'

export function callAgent(
  query: string,
  domain: string,
  agentName: string,
  runtime: string,
  handlers: AgentHandlers
) {
  const ctrl = new AbortController()

  const runAgent = async () => {
    try {
      // Step 1: Initialize run via POST
      const initRes = await fetch(`${AGENT_URL}/api/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          domain,
          agentName,
          runtime,
          mode: 'sentinel'
        }),
        signal: ctrl.signal
      })

      if (!initRes.ok) throw new Error(`Agent Init Failed: ${initRes.statusText}`)
      const { runId } = await initRes.json()

      // Step 2: Listen for events via SSE
      const es = new EventSource(`${AGENT_URL}/api/agent/stream/${runId}`)

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          
          if (data.type === 'token') {
            handlers.onToken(data.text)
          } else if (data.type === 'gov_event') {
            handlers.onGovEvent({
              tool: data.tool,
              decision: data.decision as GovDecision
            })
          } else if (data.type === 'done') {
            es.close()
            handlers.onDone()
          } else if (data.type === 'error') {
            es.close()
            handlers.onError(data.message)
          }
        } catch (err) {
          console.error('SSE Parse Error:', err)
        }
      }

      es.onerror = () => {
        es.close()
        handlers.onError('Connection to agent stream lost')
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handlers.onError(err.message)
      }
    }
  }

  runAgent()

  return () => {
    ctrl.abort()
  }
}

/**
 * Parses the agent's raw response into a structured format for the UI.
 * Expects Markdown-like sections or markers.
 */
export function parseAgentResponse(raw: string): ParsedResponse {
  const response: ParsedResponse = {
    summary: '',
    findings: [],
    riskLevel: 'Bajo',
    recommendation: ''
  }

  // Cleanup potential JSON wrapping if agent returns a stringified JSON
  let text = raw.trim()
  if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim()
  
  try {
    const data = JSON.parse(text)
    return {
      summary: data.summary || '',
      findings: Array.isArray(data.findings) ? data.findings : [],
      riskLevel: ['Bajo', 'Medio', 'Alto'].includes(data.riskLevel) ? data.riskLevel : 'Bajo',
      recommendation: data.recommendation || ''
    }
  } catch (e) {
    // Fallsback to manual parsing if not JSON
    const lines = text.split('\n')
    let currentSection = ''

    lines.forEach(line => {
      const l = line.trim()
      if (!l) return

      if (l.toLowerCase().includes('resumen:') || l.startsWith('### Resumen')) {
        currentSection = 'summary'
      } else if (l.toLowerCase().includes('hallazgos:') || l.startsWith('### Hallazgos')) {
        currentSection = 'findings'
      } else if (l.toLowerCase().includes('riesgo:') || l.startsWith('### Riesgo')) {
        currentSection = 'risk'
        if (l.toLowerCase().includes('alto')) response.riskLevel = 'Alto'
        else if (l.toLowerCase().includes('medio')) response.riskLevel = 'Medio'
      } else if (l.toLowerCase().includes('recomendación:') || l.startsWith('### Recomendación')) {
        currentSection = 'recommendation'
      } else {
        if (currentSection === 'summary') response.summary += (response.summary ? ' ' : '') + l
        else if (currentSection === 'findings') {
          const finding = l.replace(/^[-*•]\s+/, '')
          if (finding) response.findings.push(finding)
        }
        else if (currentSection === 'recommendation') response.recommendation += (response.recommendation ? ' ' : '') + l
      }
    })

    // Final cleanup if everything is empty
    if (!response.summary && text) response.summary = text.split('\n')[0]
    
    return response
  }
}
