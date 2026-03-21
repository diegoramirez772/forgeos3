// ESCENARIO C — Marketing
// Input: "Generate a campaign workflow and prepare a content draft"
// summarize → allowed | draft → allowed | publish → approval_required (REJECTED en el demo)

import { startRun, finishRun, beforeToolCall, afterToolCall, evaluateLoop, requestApproval, logSection, log, c } from "../adapter/openclawAdapter"
import { summarize, draft, publish } from "../tools/marketingTools"

export async function runMarketingScenario() {
  logSection("📣  ESCENARIO C — Marketing Agent")
  console.log(`${c.dim}   Input: "Generate a campaign workflow and prepare a content draft"${c.reset}\n`)

  const run = await startRun("marketing-agent", "Generate a campaign workflow and prepare a content draft")

  // 1. summarize → allowed
  let decision = await beforeToolCall(run.id, "summarize", "fintech", { campaignId: "q4-promo" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await summarize("q4-promo")
    await afterToolCall(run.id, "summarize", out, Date.now() - t0)
    console.log(`${c.dim}   → ${out.summary}${c.reset}`)
  }

  const loop1 = await evaluateLoop(run.id)
  if (loop1.action !== "normal") { await finishRun(run.id, "safe_mode"); return }

  // 2. draft → allowed
  decision = await beforeToolCall(run.id, "draft", "fintech", { campaignId: "q4-promo" })
  if (decision === "allowed") {
    const t0  = Date.now()
    const out = await draft("q4-promo")
    await afterToolCall(run.id, "draft", out, Date.now() - t0)
    console.log(`${c.dim}   → Draft ready: "${out.draft.slice(0, 60)}..."${c.reset}`)
    console.log(`${c.dim}   → Estimated reach: ${out.estimated_reach.toLocaleString()} people${c.reset}`)
  }

  const loop2 = await evaluateLoop(run.id)
  if (loop2.action !== "normal") { await finishRun(run.id, "safe_mode"); return }

  // 3. publish → approval_required — y en este demo es RECHAZADO
  decision = await beforeToolCall(run.id, "publish", "fintech", { campaignId: "q4-promo" })
  if (decision === "approval_required") {
    const approved = await requestApproval(
      run.id,
      "publish",
      "Agent wants to publish content to external channels (Instagram, LinkedIn) without final review",
      "rejected" // mock: rechazado — muestra el flujo de rechazo
    )
    if (approved) {
      const t0  = Date.now()
      const out = await publish("q4-promo", { draft: true })
      await afterToolCall(run.id, "publish", out, Date.now() - t0)
      await finishRun(run.id, "finished", "Campaign drafted and published")
    } else {
      log("🛑", `"publish" rejected — agent cannot post without operator approval`, c.red)
      await finishRun(run.id, "blocked", "Publish action rejected by operator — content not posted")
    }
  } else if (decision === "allowed") {
    const t0  = Date.now()
    const out = await publish("q4-promo", { draft: true })
    await afterToolCall(run.id, "publish", out, Date.now() - t0)
    await finishRun(run.id, "finished", "Campaign drafted and published")
  }
}
