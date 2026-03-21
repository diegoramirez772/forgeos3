// ESCENARIO A — Health
// Input: "Summarize patient intake #4821 and create a follow-up checklist"
// summarize → allowed | checklist → allowed | diagnose → blocked

import { startRun, finishRun, beforeToolCall, afterToolCall, evaluateLoop, logSection, log, c } from "../adapter/openclawAdapter"
import { summarize, checklist, diagnose } from "../tools/healthTools"

export async function runHealthScenario() {
  logSection("🏥  ESCENARIO A — Health Agent")
  console.log(`${c.dim}   Input: "Summarize patient intake #4821 and create a follow-up checklist"${c.reset}\n`)

  const run = await startRun("health-agent", "Summarize patient intake #4821 and create a follow-up checklist")

  // 1. summarize → allowed
  let decision = await beforeToolCall(run.id, "summarize", "healthtech", { patientId: "#4821" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await summarize("#4821")
    await afterToolCall(run.id, "summarize", out, Date.now() - t0)
    console.log(`${c.dim}   → ${out.summary}${c.reset}`)
  }

  // Loop guard check
  const loop1 = await evaluateLoop(run.id)
  if (loop1.action === "safe_mode" || loop1.action === "kill") {
    await finishRun(run.id, "safe_mode", "Loop guard triggered early")
    return
  }

  // 2. checklist → allowed
  decision = await beforeToolCall(run.id, "checklist", "healthtech", { patientId: "#4821" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await checklist("#4821")
    await afterToolCall(run.id, "checklist", out, Date.now() - t0)
    console.log(`${c.dim}   → Follow-up items: ${out.followUp.length} tasks${c.reset}`)
  }

  // Loop guard check
  const loop2 = await evaluateLoop(run.id)
  if (loop2.action === "safe_mode" || loop2.action === "kill") {
    await finishRun(run.id, "safe_mode", "Loop guard triggered")
    return
  }

  // 3. diagnose → BLOCKED (critical sensitivity + strict policy)
  decision = await beforeToolCall(run.id, "diagnose", "healthtech", { patientId: "#4821" })
  if (decision === "blocked") {
    log("🛑", `"diagnose" was blocked — run continues safely without it`, c.red)
  }
  // Si por alguna razón no está bloqueado en el entorno real:
  // if (decision === "allowed") { const out = await diagnose("#4821"); ... }

  await finishRun(run.id, "finished", "Patient #4821 summarized, follow-up checklist created, diagnose blocked by policy")
}
