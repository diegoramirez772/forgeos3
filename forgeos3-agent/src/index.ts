import "dotenv/config"
import { runHealthScenario }    from "./scenarios/healthScenario"
import { runGovScenario }       from "./scenarios/govScenario"
import { runMarketingScenario } from "./scenarios/marketingScenario"
import { runLoopScenario }      from "./scenarios/loopScenario"
import { c } from "./adapter/openclawAdapter"

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════════╗${c.reset}`)
  console.log(`${c.bold}${c.cyan}║        ForgeOS3 — Agent Runtime Demo · 4 Scenarios       ║${c.reset}`)
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════════╝${c.reset}`)

  await runHealthScenario()
  await sleep(800)

  await runGovScenario()
  await sleep(800)

  await runMarketingScenario()
  await sleep(800)

  await runLoopScenario()

  console.log(`\n${c.bold}${c.green}╔══════════════════════════════════════════════════════════╗${c.reset}`)
  console.log(`${c.bold}${c.green}║             ✅ All 4 scenarios completed                  ║${c.reset}`)
  console.log(`${c.bold}${c.green}║                                                          ║${c.reset}`)
  console.log(`${c.bold}${c.green}║  A) Health  — summarize ✅  checklist ✅  diagnose ❌    ║${c.reset}`)
  console.log(`${c.bold}${c.green}║  B) Gov     — classify ✅  route ✅  write_external ⏳   ║${c.reset}`)
  console.log(`${c.bold}${c.green}║  C) Marketing — summarize ✅  draft ✅  publish ❌       ║${c.reset}`)
  console.log(`${c.bold}${c.green}║  D) Loop Guard — score escalation → safe_mode 🔄         ║${c.reset}`)
  console.log(`${c.bold}${c.green}╚══════════════════════════════════════════════════════════╝${c.reset}\n`)
}

main().catch(console.error)
