export interface StartRunInput  { agentId: string; input: string }
export interface ToolIntent     { runId: string; toolName: string; input: Record<string, unknown> }
export interface ToolDecision   { decision: 'allowed' | 'blocked' | 'approval_required'; reason?: string }
export interface ToolResult     { runId: string; toolName: string; output: Record<string, unknown>; durationMs: number }
export interface RunResult      { runId: string; status: 'finished' | 'blocked'; output?: string }

// ⚠️ Cambia esta URL cuando Diego te pase la suya
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Error en ${path}: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const openclawAdapter = {

  async startRun(input: StartRunInput): Promise<{ runId: string }> {
    return post<{ runId: string }>('/api/runs/start', input)
  },

  async beforeToolCall(intent: ToolIntent): Promise<ToolDecision> {
    return post<ToolDecision>('/api/tools/evaluate', intent)
  },

  async afterToolCall(result: ToolResult): Promise<void> {
    await post<void>('/api/tools/log', result)
  },

  async finishRun(result: RunResult): Promise<void> {
    await post<void>('/api/runs/finish', result)
  },
}