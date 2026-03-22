// ESCENARIO D — Loop Guard
// La misma tool "classify" se llama 6 veces seguidas
// → risk score sube con cada repetición
// → al pasar de 30 el run termina automáticamente en safe_mode

import { startRun, finishRun, beforeToolCall, afterToolCall, evaluateLoop, logSection, log, c } from "../adapter/openclawAdapter"
import { classify } from "../tools/govTools"

export async function runLoopScenario() {
  logSection("🔄  ESCENARIO D — Loop Guard Demo")
  console.log(`${c.dim}   Calling "classify" 6 times in a row to trigger loop detection${c.reset}\n`)

  const run = await startRun("loop-test-agent", "classify classify classify classify classify classify")

  for (let i = 1; i <= 6; i++) {
    console.log(`\n${c.blue}--- Iteration ${i}/6 ---${c.reset}`)

    const decision = await beforeToolCall(run.id, "classify", "agrotech", { iteration: i })

    if (decision === "allowed") {
      const t0  = Date.now()
      const out = await classify(`#LOOP-${i}`)
      await afterToolCall(run.id, "classify", out, Date.now() - t0)
    } else if (decision === "blocked") {
      log("🛑", `Tool blocked on iteration ${i}`, c.red)
      await finishRun(run.id, "blocked", `Blocked on iteration ${i}`)
      return
    }

    // Evaluar loop después de cada tool call
    const { score, action } = await evaluateLoop(run.id)

    if (action === "safe_mode" || action === "kill") {
      log("⚠️", `Loop Guard triggered at iteration ${i} — score: ${score}/100`, c.yellow)
      log("🛑", `Run terminated automatically → status: safe_mode`, c.red)
      await finishRun(run.id, "safe_mode", `Loop guard activated at iteration ${i} with score ${score}`)
      return
    }
  }

  // Si llegó hasta aquí sin que el loop guard lo parara
  log("⚠️", `Completed 6 iterations — loop guard did not trigger (score may be low in real API)`, c.yellow)
  await finishRun(run.id, "finished", "Loop completed without guard trigger")
}
