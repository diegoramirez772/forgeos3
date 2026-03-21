import { analyzeIntent } from "./intentAnalysis"
import { planTool } from "./toolPlanner"
import { policyGate } from "./policyGate"
import { tools } from "./toolRegistry"
import { openclawAdapter } from "../adapter/openclawAdapter"

export async function execute(input: string) {

  console.log("=== ForgeOS Runtime ===")
  console.log("Input:", input)

  // 1. Iniciar el run en la API de Diego
  const { runId } = await openclawAdapter.startRun({
    agentId: 'forgeos3-agent',
    input,
  })
  console.log("Run iniciado, runId:", runId)

  // 2. Detectar intención y seleccionar herramienta
  const intentResult = analyzeIntent(input)
  console.log("Intent:", intentResult)

  const toolName = planTool(intentResult.intent)
  console.log("Tool:", toolName)

  // 3. Verificar política local
  const allowed = policyGate(toolName)
  if (!allowed) {
    console.log("Resultado final: Tool bloqueada por policy")
    await openclawAdapter.finishRun({ runId, status: 'blocked' })
    return
  }

  // 4. Pedir permiso a la API antes de ejecutar la tool
  const decision = await openclawAdapter.beforeToolCall({
    runId,
    toolName,
    input: { userInput: input },
  })
  console.log("Decisión de la API:", decision)

  if (decision.decision !== 'allowed') {
    console.log("Resultado final: Tool bloqueada por API:", decision.reason)
    await openclawAdapter.finishRun({ runId, status: 'blocked', output: decision.reason })
    return
  }

  // 5. Ejecutar la herramienta
  const tool = tools[toolName]
  if (!tool) {
    console.log("Resultado final: Tool no encontrada")
    await openclawAdapter.finishRun({ runId, status: 'blocked', output: 'Tool no encontrada' })
    return
  }

  const startTime = Date.now()
  const result = await tool.run()
  const durationMs = Date.now() - startTime

  // 6. Registrar resultado de la tool
  await openclawAdapter.afterToolCall({
    runId,
    toolName,
    output: { result },
    durationMs,
  })

  // 7. Finalizar el run
  await openclawAdapter.finishRun({ runId, status: 'finished', output: String(result) })

  console.log("Resultado final:", result)
}