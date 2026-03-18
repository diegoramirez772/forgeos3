import { analyzeIntent } from "./intentAnalysis"
import { planTool } from "./toolPlanner"
import { policyGate } from "./policyGate"
import { tools } from "./toolRegistry"

export async function execute(input: string) {

  console.log("=== ForgeOS Runtime ===")
  console.log("Input:", input)

  const intentResult = analyzeIntent(input)
  console.log("Intent:", intentResult)

  const toolName = planTool(intentResult.intent)
  console.log("Tool:", toolName)

  const allowed = policyGate(toolName)

  if (!allowed) {
    console.log("Resultado final: Tool bloqueada por policy")
    return
  }

  const tool = tools[toolName]

  if (!tool) {
    console.log("Resultado final: Tool no encontrada")
    return
  }

  const result = await tool.run()

  console.log("Resultado final:", result)
}