import axios from 'axios'
import type { Domain } from '../types'
import { startRun, evaluateTool, logTool, finishRun, requestApproval, pollApproval } from './forgeosClient'

const CLAUDE_BASE = 'https://api.anthropic.com/v1'

const SYSTEM_PROMPTS: Record<Domain, string> = {
  healthtech: `You are HealthAgent Alpha, a clinical documentation assistant governed by ForgeOS3.
You help healthcare professionals summarize patient intake forms, generate follow-up checklists, and support clinical workflows.
You are precise, empathetic, and always prioritize patient safety.
When you need to use a tool, announce it clearly: "Using tool: [toolName]"
Available tools: summarize, checklist, write_record, diagnose
NEVER make up medical facts. If unsure, say so clearly.`,

  agrotech: `You are AgroBot Prime, a precision agriculture assistant governed by ForgeOS3.
You help farmers analyze crop health, predict yields, and recommend field treatments.
You use IoT sensor data and agronomic knowledge to give actionable recommendations.
When you need to use a tool, announce it clearly: "Using tool: [toolName]"
Available tools: analyze_crop, predict_yield, apply_treatment, write_report
Be data-driven and practical. Always mention if a treatment requires human approval.`,

  fintech: `You are FinAgent, a financial analysis assistant governed by ForgeOS3.
You help analysts detect fraud, analyze transactions, and generate compliance reports.
You are precise, cautious with financial data, and always flag suspicious activity.
When you need to use a tool, announce it clearly: "Using tool: [toolName]"
Available tools: analyze, detect_fraud, generate_report, execute_transfer
NEVER execute transfers without explicit user confirmation. Always flag high-risk operations.`,
}

const TOOL_KEYWORDS: Record<Domain, Record<string, string[]>> = {
  healthtech: {
    summarize:    ['summarize', 'summary', 'intake', 'resume', 'resumen'],
    checklist:    ['checklist', 'follow-up', 'followup', 'lista', 'steps'],
    diagnose:     ['diagnose', 'diagnosis', 'diagnostic', 'condition', 'disease'],
    write_record: ['write', 'record', 'update', 'save', 'expediente'],
  },
  agrotech: {
    analyze_crop:    ['analyze', 'sensor', 'health', 'crop', 'field', 'campo'],
    predict_yield:   ['predict', 'yield', 'harvest', 'cosecha', 'rendimiento'],
    apply_treatment: ['treatment', 'apply', 'pesticide', 'fertilizer', 'tratamiento'],
    write_report:    ['report', 'registry', 'write', 'reporte', 'registro'],
  },
  fintech: {
    analyze:          ['analyze', 'transactions', 'pattern', 'account', 'cuenta'],
    detect_fraud:     ['fraud', 'suspicious', 'flag', 'fraude', 'sospechoso'],
    generate_report:  ['report', 'compliance', 'reporte', 'generate'],
    execute_transfer: ['transfer', 'transferencia', 'execute', 'send', 'move'],
  },
}

function detectTools(content: string, domain: Domain): string[] {
  const lower = content.toLowerCase()
  const tools: string[] = []
  for (const [tool, keywords] of Object.entries(TOOL_KEYWORDS[domain])) {
    if (keywords.some(k => lower.includes(k))) tools.push(tool)
  }
  return tools
}

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

export async function runAgent(opts: AgentRunOptions) {
  const { domain, agentId, agentName, input, onToken, onGovEvent, onDone, onError } = opts

  let runId: string | null = null
  let fullOutput = ''

  try {
    // 1. Start ForgeOS3 run
    const run = await startRun(agentId, agentName, domain, input)
    runId = run.id

    // 2. Call Claude streaming
    const response = await fetch(`${CLAUDE_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system:     SYSTEM_PROMPTS[domain],
        messages:   [{ role: 'user', content: input }],
        stream:     true,
      }),
    })

    if (!response.ok || !response.body) {
      throw new Error('Claude API error')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue
        try {
          const evt = JSON.parse(raw)
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            fullOutput += evt.delta.text
            onToken(evt.delta.text)
          }
        } catch { /* ignore parse errors */ }
      }
    }

    // 3. Detect tools from response and evaluate each
    const detectedTools = detectTools(fullOutput, domain)

    for (const toolName of detectedTools) {
      const start = Date.now()
      const evalResult = await evaluateTool(runId, toolName, domain, { input })

      onGovEvent({
        toolName,
        decision: evalResult.decision,
        reason:   evalResult.reason,
      })

      if (evalResult.decision === 'allowed') {
        await logTool(evalResult.toolEventId, { output: 'executed' }, Date.now() - start)
      } else if (evalResult.decision === 'approval_required') {
        // Request approval and wait
        const approval = await requestApproval(
          runId, agentId, agentName, domain, toolName,
          { input },
          `Tool "${toolName}" requires human approval in ${domain} domain`
        )

        // Poll for resolution
        let status: string = 'pending'
        let attempts = 0
        while (status === 'pending' && attempts < 20) {
          await new Promise(r => setTimeout(r, 3000))
          status = await pollApproval(approval.id)
          attempts++
        }

        if (status === 'rejected') {
          onToken(`\n\n⚠️ Action blocked — human reviewer rejected the ${toolName} operation.`)
        }
      }
      // blocked — already logged by ForgeOS3, just show governance event
    }

    // 4. Finish run
    await finishRun(runId, 'finished', fullOutput)
    onDone(fullOutput)

  } catch (err) {
    if (runId) await finishRun(runId, 'blocked').catch(() => {})
    onError(err instanceof Error ? err.message : 'Unknown error')
  }
}
