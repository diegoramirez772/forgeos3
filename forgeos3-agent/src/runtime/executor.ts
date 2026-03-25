import Anthropic from "@anthropic-ai/sdk"
import { TOOLS, TOOL_HANDLERS } from "../tools/registry"
import {
  startRun, beforeToolCall, afterToolCall,
  requestApproval, evaluateLoop, finishRun, log, c
} from "../adapter/openclawAdapter"

interface ExecuteOptions {
  agentId:    string
  agentName:  string
  domain:     string
  input:      string
  onToken:    (text: string) => void
  onGovEvent: (event: any)   => void
  mode?:      string
}

// ── TAREA 6: Personalidad adaptativa por dominio ─────────────────────────────
const DOMAIN_PERSONALITY: Record<string, { tone: string; system: string }> = {
  healthtech: {
    tone: "clinical",
    system: `You are a clinical AI assistant governed by ForgeOS3.
Speak with precision and medical rigor. Prioritize patient privacy at all times.
Always explain your reasoning step by step before using any tool.
If a tool is blocked, suggest a safe legal alternative.
Language: formal, technical, empathetic.`,
  },
  agrotech: {
    tone: "field",
    system: `Eres un asistente agrónomo gobernado por ForgeOS3.
Habla de forma práctica y directa, como un técnico de campo en Durango, México.
Usa terminología agrícola local cuando aplique. Prioriza la seguridad del cultivo.
Siempre explica tu plan paso a paso antes de ejecutar herramientas.
Si una herramienta es bloqueada, propón una alternativa segura y legal.`,
  },
  fintech: {
    tone: "compliance",
    system: `You are a financial compliance AI governed by ForgeOS3.
Speak with regulatory precision. Flag any high-risk action explicitly.
Always reason step by step before executing financial tools.
If a tool is blocked by policy, explain why and propose a compliant alternative.
Language: formal, precise, risk-aware.`,
  },
}

export class AgentExecutor {
  private anthropic: Anthropic

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  async execute(options: ExecuteOptions) {
    const { agentId, agentName, domain, input, onToken, onGovEvent } = options
    let runId: string | null = null
    let loopCount = 0
    const maxLoops = 5

    // ── TAREA 8: Memoria de contexto ────────────────────────────────────────
    const memory: { tool: string; result: any }[] = []

    // ── TAREA 1: Chain of Thought — plan interno antes de actuar ─────────────
    const personality = DOMAIN_PERSONALITY[domain] || DOMAIN_PERSONALITY.agrotech
    let systemPrompt = `${personality.system}

IMPORTANT RULES:
1. Before calling ANY tool, write a brief internal plan: "My plan: 1)... 2)... 3)..."
2. After each tool result, briefly evaluate: "Result analysis: ..."
3. Use previous tool results stored in memory to avoid redundant calls.
4. If blocked by policy, immediately explain why and suggest a safe alternative.
5. Never loop the same tool more than twice in a row.`

    if (options.mode === 'sentinel') {
      systemPrompt += `\n\nSENTINEL MODE: 
Your FINAL response MUST be a structured JSON object (NOT in markdown blocks, just raw JSON text) with these keys: 
- "summary": A concise overview of the analysis.
- "findings": An array of key strings discovered.
- "riskLevel": One of "Bajo", "Medio", "Alto".
- "recommendation": A clear action for the farmer.
Example: {"summary": "Alert found...", "findings": ["Evidence of larvae"], "riskLevel": "Alto", "recommendation": "Treat immediately"}`
    }

    // ── TAREA 7: Validación de entradas con Zod ──────────────────────────────
    // (aplicada en registry.ts en cada handler)

    try {
      const run = await startRun(agentId, domain, input)
      runId = run.id

      // Contexto inicial con memoria
      let messages: any[] = [{
        role: "user",
        content: `${input}\n\n[Context memory: ${JSON.stringify(memory)}]`
      }]

      while (loopCount < maxLoops) {
        loopCount++

        // ── TAREA 2: Riesgo dinámico — evaluar loop antes de cada iteración ──
        if (loopCount > 1) {
          const { action, score } = await evaluateLoop(runId!)
          if (action === "safe_mode" || action === "kill") {
            onToken(`\n\n🛑 Loop Guard activated (score: ${score}/100) — run terminated safely.`)
            await finishRun(runId!, "safe_mode", `Loop guard triggered at iteration ${loopCount}`)
            return
          }
        }

        const response = await this.anthropic.messages.create({
          model:      "claude-3-haiku-20240307",
          max_tokens: 1024,
          system:     systemPrompt,
          messages,
          tools:      TOOLS[domain] as any,
          stream:     true,
        })

        let fullText  = ""
        let toolCalls: any[] = []

        for await (const chunk of response) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullText += chunk.delta.text
            onToken(chunk.delta.text)
          }
          if (chunk.type === "content_block_start" && chunk.content_block.type === "tool_use") {
            toolCalls.push({ id: chunk.content_block.id, name: chunk.content_block.name, partialInput: "" })
          }
          if (chunk.type === "content_block_delta" && chunk.delta.type === "input_json_delta") {
            toolCalls[toolCalls.length - 1].partialInput += chunk.delta.partial_json
          }
        }

        toolCalls = toolCalls.map(tc => ({
          ...tc,
          input: safeParseJSON(tc.partialInput)
        }))

        if (toolCalls.length === 0) {
          await finishRun(runId!, "finished", fullText)
          break
        }

        messages.push({
          role: "assistant",
          content: [
            { type: "text", text: fullText || "Executing plan..." },
            ...toolCalls.map(tc => ({ type: "tool_use", id: tc.id, name: tc.name, input: tc.input }))
          ]
        })

        const toolResults: any[] = []

        for (const tc of toolCalls) {
          const start = Date.now()
          log("🛠️", `Agent wants to use "${tc.name}" [${domain}]`, c.yellow)

          // ── TAREA 7: Validar inputs antes de mandar a governance ─────────
          const validationError = validateToolInput(tc.name, tc.input)
          if (validationError) {
            onToken(`\n\n⚠️ Input validation failed for "${tc.name}": ${validationError}. Please provide: ${validationError}`)
            onGovEvent({ toolName: tc.name, decision: "blocked", reason: `Validation: ${validationError}` })
            toolResults.push({ type: "tool_result", tool_use_id: tc.id, content: JSON.stringify({ error: validationError }) })
            continue
          }

          const { decision, toolEventId } = await beforeToolCall(runId!, tc.name, domain, tc.input)
          onGovEvent({ toolName: tc.name, decision, reason: "Evaluated by ForgeOS3" })

          let toolOutput: any = null

          if (decision === "allowed") {
            // ── TAREA 5: Manejo de errores pro ──────────────────────────────
            toolOutput = await this.runToolSafe(tc.name, tc.input, domain, onToken)
            await afterToolCall(toolEventId, tc.name, { status: "success", result: toolOutput }, Date.now() - start)

            // ── TAREA 8: Guardar en memoria de contexto ───────────────────
            memory.push({ tool: tc.name, result: toolOutput })

          } else if (decision === "approval_required") {
            // ── TAREA 9: Sistema de pausa real ───────────────────────────
            onToken(`\n\n⏳ Tool "${tc.name}" requires administrator approval...\n`)
            onToken(`Waiting for human decision. Run is paused.\n`)

            const approved = await requestApproval(runId!, tc.name,
              `Human approval required for ${tc.name} in ${domain}`,
              { agentId, agentName, domain, payload: tc.input }
            )

            if (approved) {
              onToken(`\n✅ Approved by operator. Executing "${tc.name}"...\n`)
              toolOutput = await this.runToolSafe(tc.name, tc.input, domain, onToken)
              await afterToolCall(toolEventId, tc.name, { status: "approved_and_executed", result: toolOutput }, Date.now() - start)
              memory.push({ tool: tc.name, result: toolOutput })
            } else {
              onToken(`\n❌ Rejected by operator.\n`)
              // ── TAREA 10: Auto-corrección por Sentinel ────────────────
              const alternative = getSafeAlternative(tc.name, domain)
              onToken(`🔄 Sentinel suggestion: ${alternative}\n`)
              toolOutput = { error: "Rejected by operator", sentinel_alternative: alternative }
              await afterToolCall(toolEventId, tc.name, { status: "rejected", result: toolOutput }, Date.now() - start)
            }

          } else {
            // blocked
            onToken(`\n🚫 "${tc.name}" blocked by policy engine.\n`)
            const alternative = getSafeAlternative(tc.name, domain)
            onToken(`🔄 Sentinel suggestion: ${alternative}\n`)
            toolOutput = { error: "Blocked by policy", sentinel_alternative: alternative }
            await afterToolCall(toolEventId, tc.name, { status: "blocked", result: toolOutput }, Date.now() - start)
          }

          toolResults.push({
            type:        "tool_result",
            tool_use_id: tc.id,
            content:     JSON.stringify(toolOutput)
          })
        }

        // ── TAREA 8: Actualizar memoria en el contexto del siguiente turno ──
        messages.push({ role: "user", content: toolResults })
        messages.push({
          role: "user",
          content: `[Updated memory: ${JSON.stringify(memory.slice(-5))}]`
        })
      }

    } catch (err: any) {
      // ── TAREA 5: Manejo de errores pro — no romper el flujo ─────────────
      log("🛑", `Executor Error: ${err.message}`, c.red)
      if (runId) await finishRun(runId, "blocked", err.message).catch(() => {})
      throw err
    }
  }

  // ── TAREA 5: Ejecutar tool con fallback inteligente ──────────────────────
  private async runToolSafe(name: string, input: any, domain: string, onToken: (t: string) => void): Promise<any> {
    if (name === "consult_expert") {
      log("🤝", `Cross-domain consultation: ${input.expertDomain}`, "#8b5cf6" as any)
      return {
        expertResponse: `[Expert ${input.expertDomain}] Recommendation for "${input.query}": Proceed with caution. Cross-domain integration requires monitoring.`,
        consultationId: `cons_${Math.random().toString(36).slice(2)}`
      }
    }

    const handler = TOOL_HANDLERS[name]
    if (!handler) {
      const msg = `Tool "${name}" not found in registry for domain ${domain}`
      onToken(`\n⚠️ ${msg}\n`)
      return { error: msg }
    }

    try {
      return await handler(input)
    } catch (err: any) {
      // Razonar la causa y proponer fallback
      log("⚠️", `Tool "${name}" failed: ${err.message} — activating fallback`, c.yellow)
      onToken(`\n⚠️ Tool "${name}" failed: ${err.message}\n`)
      onToken(`🔄 Fallback: returning cached/safe response\n`)
      return {
        error:    err.message,
        fallback: true,
        message:  `Tool ${name} failed. Safe fallback activated. Please retry or use an alternative.`
      }
    }
  }
}

// ── TAREA 10: Alternativas seguras por tool/dominio ──────────────────────────
function getSafeAlternative(toolName: string, domain: string): string {
  const alternatives: Record<string, string> = {
    write_clinical_record: "Use 'summarize_intake' to generate a draft for manual review instead.",
    apply_treatment:       "Use 'analyze_crop_health' to get a recommendation, then request approval.",
    execute_transfer:      "Use 'detect_fraud_patterns' first, then request manual transfer approval.",
    diagnose:              "Use 'summarize_intake' and refer to a licensed physician for diagnosis.",
    publish:               "Save as draft and request editorial review before publishing.",
    write_external:        "Log the intent internally and request operator approval to write externally.",
  }
  return alternatives[toolName] || `Review the ${domain} policy and use a lower-sensitivity alternative tool.`
}

// ── TAREA 7: Validación básica de inputs ─────────────────────────────────────
function validateToolInput(toolName: string, input: any): string | null {
  const required: Record<string, string[]> = {
    summarize_intake:      ["content"],
    write_clinical_record: ["patientId", "note"],
    analyze_crop_health:   ["fieldId"],
    apply_treatment:       ["fieldId", "treatment"],
    detect_fraud_patterns: ["accountId"],
    execute_transfer:      ["from", "to", "amount"],
    consult_expert:        ["expertDomain", "query"],
  }
  const fields = required[toolName]
  if (!fields) return null
  const missing = fields.filter(f => !input[f])
  if (missing.length > 0) return `Missing required fields: ${missing.join(", ")}`
  return null
}

function safeParseJSON(str: string): any {
  try { return JSON.parse(str || "{}") }
  catch { return {} }
}
