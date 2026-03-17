import { analyzeIntent } from "./runtime/intentAnalysis"
import { planTool } from "./runtime/toolPlanner"
import { policyCheck } from "./runtime/policyGate"
import { executeTool } from "./runtime/executor"

export function runAgent(input: string) {

  console.log("Input:", input)

  const intent = analyzeIntent(input)
  console.log("Intent:", intent)

  const tool = planTool(intent.intent)
  console.log("Tool:", tool)

  const allowed = policyCheck(tool)

  if (!allowed) {
    return "Tool no permitida"
  }

  const result = executeTool(tool)

  return result
}