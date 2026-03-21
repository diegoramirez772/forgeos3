import axios from "axios"
import "dotenv/config"

const API_URL = process.env.VITE_API_URL || process.env.FORGEOS3_API_URL || "https://forgeos3-production.up.railway.app"
const API_KEY  = process.env.AGENT_API_KEY || ""

// ─── COLORES ────────────────────────────────────────────────────────────────
export const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m",
  red: "\x1b[31m", magenta: "\x1b[35m", blue: "\x1b[34m",
}

export function log(icon: string, msg: string, color = c.cyan) {
  const ts = new Date().toLocaleTimeString("es-MX", { hour12: false })
  console.log(`${c.dim}[${ts}]${c.reset} ${color}${c.bold}${icon}${c.reset} ${msg}`)
}

export function logSection(title: string) {
  console.log(`\n${c.magenta}${"═".repeat(58)}${c.reset}`)
  console.log(`${c.bold}${c.magenta}  ${title}${c.reset}`)
  console.log(`${c.magenta}${"═".repeat(58)}${c.reset}\n`)
}

// ─── MOCK STATE ──────────────────────────────────────────────────────────────
const mockDB = {
  runs:      new Map<string, any>(),
  toolLog:   [] as any[],
  loopScore: new Map<string, number>(),
  approvals: new Map<string, { status: string }>(),
  // Tools bloqueadas por política
  blocked:   new Set(["diagnose", "deleteAllData", "overrideBudget"]),
  // Tools que requieren approval
  needsApproval: new Set(["write_external", "publish"]),
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function headers() {
  return API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}
}

// ─── START RUN ───────────────────────────────────────────────────────────────
export async function startRun(agent: string, input: string): Promise<{ id: string }> {
  try {
    const res = await axios.post(`${API_URL}/api/runs/start`,
      { agentId: agent, agentName: agent, domain: inferDomain(agent), input },
      { timeout: 4000, headers: headers() }
    )
    log("🚀", `Starting run: ${agent}`, c.cyan)
    log("🟢", `Run registered in DB → id: ${res.data.id}`, c.green)
    return { id: res.data.id }
  } catch {
    const id = `mock-${agent}-${Date.now()}`
    mockDB.runs.set(id, { id, agent, input, status: "running", startedAt: new Date().toISOString() })
    log("🚀", `Starting run: ${agent}`, c.cyan)
    log("🟡", `Run registered (mock) → id: ${id}`, c.yellow)
    return { id }
  }
}

// ─── BEFORE TOOL CALL ────────────────────────────────────────────────────────
// Regresa: "allowed" | "blocked" | "approval_required"
export async function beforeToolCall(
  runId: string,
  toolName: string,
  domain: string,
  input: Record<string, unknown> = {}
): Promise<"allowed" | "blocked" | "approval_required"> {
  const start = Date.now()
  try {
    const res = await axios.post(`${API_URL}/api/tools/evaluate`,
      { runId, toolName, domain, input },
      { timeout: 4000, headers: headers() }
    )
    const decision: string = res.data.decision
    const ms = Date.now() - start
    printToolDecision(toolName, decision, res.data.reason, ms, "real")
    return decision as any
  } catch {
    const ms = Date.now() - start
    let decision: "allowed" | "blocked" | "approval_required" = "allowed"
    let reason = "policy: allowed by default"

    if (mockDB.blocked.has(toolName)) {
      decision = "blocked"
      reason   = `policy: strict · ${domain} domain`
    } else if (mockDB.needsApproval.has(toolName)) {
      decision = "approval_required"
      reason   = "write action detected — human approval required"
    }

    printToolDecision(toolName, decision, reason, ms, "mock")
    return decision
  }
}

// ─── AFTER TOOL CALL ─────────────────────────────────────────────────────────
export async function afterToolCall(
  runId: string,
  toolName: string,
  output: unknown,
  durationMs: number
): Promise<void> {
  try {
    await axios.post(`${API_URL}/api/tools/log`,
      { runId, toolName, output, durationMs },
      { timeout: 4000, headers: headers() }
    )
    log("📝", `Tool result logged (real) — ${toolName} (${durationMs}ms)`, c.dim as any)
  } catch {
    mockDB.toolLog.push({ runId, toolName, output, durationMs, ts: new Date().toISOString() })
    log("📝", `Tool result logged (mock) — ${toolName} (${durationMs}ms)`, c.dim as any)
  }
}

// ─── REQUEST APPROVAL (polling) ──────────────────────────────────────────────
export async function requestApproval(
  runId: string,
  toolName: string,
  reason: string,
  mockDecision: "approved" | "rejected" = "approved"
): Promise<boolean> {
  log("⏳", `Approval required for "${toolName}"`, c.yellow)
  console.log(`${c.dim}   Reason: ${reason}${c.reset}`)

  try {
    // 1. Crear approval request
    const createRes = await axios.post(`${API_URL}/api/approvals/request`,
      { runId, toolName, reason },
      { timeout: 4000, headers: headers() }
    )
    const approvalId = createRes.data.id
    log("⏳", `Waiting for operator decision... (id: ${approvalId})`, c.yellow)

    // 2. Polling cada 3 segundos (max 10 intentos)
    for (let i = 0; i < 10; i++) {
      await sleep(3000)
      const res = await axios.get(`${API_URL}/api/approvals/${approvalId}`,
        { timeout: 4000, headers: headers() }
      )
      if (res.data.status === "approved") {
        log("✅", `Approval GRANTED for "${toolName}" — continuing run`, c.green)
        return true
      }
      if (res.data.status === "rejected") {
        log("❌", `Approval REJECTED for "${toolName}" — run will be blocked`, c.red)
        return false
      }
      log("⏳", `Still waiting... (attempt ${i + 1}/10)`, c.dim as any)
    }
    log("⚠️", `Approval timeout — defaulting to DENY (safe mode)`, c.red)
    return false

  } catch {
    // Mock: simula delay de aprobación humana
    await sleep(1500)
    if (mockDecision === "approved") {
      log("✅", `Approval GRANTED by operator (mock) — continuing run`, c.green)
      return true
    } else {
      log("❌", `Approval REJECTED by operator (mock) — run will be blocked`, c.red)
      return false
    }
  }
}

// ─── EVALUATE LOOP ───────────────────────────────────────────────────────────
export async function evaluateLoop(runId: string): Promise<{ score: number; action: "normal" | "safe_mode" | "kill" }> {
  try {
    const res = await axios.post(`${API_URL}/api/risk/evaluate-loop`,
      { runId },
      { timeout: 4000, headers: headers() }
    )
    const { score, recommendation } = res.data
    printLoopScore(score, recommendation, "real")
    return { score, action: recommendation }
  } catch {
    // Mock: incrementar score acumulado por run
    const prev   = mockDB.loopScore.get(runId) || 0
    const events = mockDB.toolLog.filter(e => e.runId === runId)
    const score  = Math.min(prev + events.length * 6, 100)
    mockDB.loopScore.set(runId, score)

    const action = score >= 50 ? "kill" : score >= 30 ? "safe_mode" : "normal"
    printLoopScore(score, action, "mock")
    return { score, action }
  }
}

// ─── FINISH RUN ──────────────────────────────────────────────────────────────
export async function finishRun(
  runId: string,
  status: "finished" | "blocked" | "safe_mode",
  output?: string
): Promise<void> {
  try {
    await axios.post(`${API_URL}/api/runs/finish`,
      { runId, status, output },
      { timeout: 4000, headers: headers() }
    )
    printRunFinished(runId, status, "real")
  } catch {
    const run = mockDB.runs.get(runId)
    if (run) run.status = status
    printRunFinished(runId, status, "mock")
  }
}

// ─── HELPERS VISUALES ────────────────────────────────────────────────────────
function inferDomain(agent: string): string {
  if (agent.includes("health")) return "healthtech"
  if (agent.includes("gov"))    return "agrotech"   // ajustar cuando Diego confirme
  if (agent.includes("market")) return "fintech"
  return "custom"
}

function printToolDecision(tool: string, decision: string, reason: string, ms: number, mode: string) {
  if (decision === "allowed") {
    log("🔍", `Tool intent: ${tool} → ${c.green}✅ allowed${c.reset} (${ms}ms · ${mode})`)
  } else if (decision === "blocked") {
    log("🔍", `Tool intent: ${tool} → ${c.red}❌ blocked${c.reset} (${reason})`)
  } else {
    log("🔍", `Tool intent: ${tool} → ${c.yellow}⏳ approval_required${c.reset} (${reason})`)
  }
}

function printLoopScore(score: number, action: string, mode: string) {
  const filled = Math.round(score / 10)
  const bar    = `[${"█".repeat(filled)}${"░".repeat(10 - filled)}]`
  const color  = score >= 50 ? c.red : score >= 30 ? c.yellow : c.green
  const status = action === "kill"      ? `${c.red}${c.bold}KILL — run terminated${c.reset}` :
                 action === "safe_mode" ? `${c.yellow}${c.bold}SAFE MODE activated${c.reset}` :
                                          `${c.green}normal${c.reset}`
  console.log(`${color}🔄 [Loop Guard / ${mode}]${c.reset} score: ${color}${score}/100${c.reset} ${bar} → ${status}`)
}

function printRunFinished(runId: string, status: string, mode: string) {
  const color = status === "finished" ? c.green : status === "safe_mode" ? c.yellow : c.red
  const icon  = status === "finished" ? "✅" : status === "safe_mode" ? "⚠️" : "🛑"
  log(icon, `Run finished (${mode}): ${runId.slice(0, 24)}... → ${color}${status}${c.reset}`)
}
