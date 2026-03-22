export function planTool(intent: string) {

  if (intent === "health") {
    return "healthTool"
  }

  if (intent === "marketing") {
    return "marketingTool"
  }

  if (intent === "gov") {
    return "govTool"
  }

  return "none"
}