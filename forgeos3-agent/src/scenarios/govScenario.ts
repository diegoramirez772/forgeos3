// ESCENARIO B — Gov
// Input: "Analyze public request #2291 and route to the right department"
// classify → allowed | route → allowed | write_external → approval_required

import { startRun, finishRun, beforeToolCall, afterToolCall, evaluateLoop, requestApproval, logSection, log, c } from "../adapter/openclawAdapter"
import { classify, route, write_external } from "../tools/govTools"

export async function runGovScenario() {
  logSection("🏛️  ESCENARIO B — Government Agent")
  console.log(`${c.dim}   Input: "Analyze public request #2291 and route to the right department"${c.reset}\n`)

  const run = await startRun("gov-agent", "Analyze public request #2291 and route to the right department")

  // 1. classify → allowed
  let decision = await beforeToolCall(run.id, "classify", "agrotech", { requestId: "#2291" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await classify("#2291")
    await afterToolCall(run.id, "classify", out, Date.now() - t0)
    console.log(`${c.dim}   → Category: ${out.category} / ${out.subcategory}${c.reset}`)
  }

  const loop1 = await evaluateLoop(run.id)
  if (loop1.action !== "normal") { await finishRun(run.id, "safe_mode"); return }

  // 2. route → allowed
  decision = await beforeToolCall(run.id, "route", "agrotech", { requestId: "#2291", category: "infrastructure" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await route("#2291", "infrastructure")
    await afterToolCall(run.id, "route", out, Date.now() - t0)
    console.log(`${c.dim}   → Routed to: ${out.routed_to} (${out.estimated_response_days} days)${c.reset}`)
  }

  const loop2 = await evaluateLoop(run.id)
  if (loop2.action !== "normal") { await finishRun(run.id, "safe_mode"); return }

  // 3. write_external → approval_required (escribe en BD municipal)
  decision = await beforeToolCall(run.id, "write_external", "agrotech", { requestId: "#2291" })
  if (decision === "approval_required") {
    const approved = await requestApproval(
      run.id,
      "write_external",
      "Agent wants to write to municipal registry DB — requires operator approval",
      "approved" // mock: aprobado
    )
    if (approved) {
      const t0  = Date.now()
      const out = await write_external("#2291", { routed: true })
      await afterToolCall(run.id, "write_external", out, Date.now() - t0)
      console.log(`${c.dim}   → Written to ${out.target_db}${c.reset}`)
      await finishRun(run.id, "finished", "Request #2291 classified, routed, and registered in municipal DB")
    } else {
      log("🛑", `write_external rejected — run blocked`, c.red)
      await finishRun(run.id, "blocked", "Operator rejected write to municipal DB")
    }
  } else if (decision === "allowed") {
    const t0  = Date.now()
    const out = await write_external("#2291", { routed: true })
    await afterToolCall(run.id, "write_external", out, Date.now() - t0)
    await finishRun(run.id, "finished", "Request #2291 processed")
  }
}
