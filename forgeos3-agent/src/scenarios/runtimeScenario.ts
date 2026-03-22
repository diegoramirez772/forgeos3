import { tools } from "../runtime/toolRegistry"
import { logStep } from "../runtime/logger"

async function runScenario(input: string) {

  console.log("=== ForgeOS Runtime ===")

  console.log("Input:", input)
  logStep("Input recibido", input)

  let intent = { intent: "unknown", confidence: 0.5 }

  if (input.includes("salud")) {
    intent = { intent: "health", confidence: 0.9 }
  }

  if (input.includes("marketing")) {
    intent = { intent: "marketing", confidence: 0.9 }
  }

  if (input.includes("gobierno")) {
    intent = { intent: "gov", confidence: 0.9 }
  }

  console.log("Intent:", intent)
  logStep("Intent detectado", intent)

  let toolName = "none"

  if (intent.intent === "health") toolName = "healthTool"
  if (intent.intent === "marketing") toolName = "marketingTool"
  if (intent.intent === "gov") toolName = "govTool"

  console.log("Tool:", toolName)
  logStep("Tool seleccionada", toolName)

  if (toolName === "none") {
    console.log("Resultado final: Tool no permitida")
    return
  }

  const tool = tools[toolName]

  if (!tool) {
    console.log("Resultado final: No se pudo ejecutar ninguna herramienta")
    return
  }

  const result = await tool.run()

  logStep("Resultado herramienta", result)

  console.log("Resultado final:", result)
}

async function main() {

  await runScenario("Revisar estado del sistema de salud")

  await runScenario("Crear campaña de marketing digital")

  await runScenario("Consultar datos del gobierno")

}

main()