export function analyzeIntent(input: string) {

  const text = input.toLowerCase()

  if (text.includes("salud") || text.includes("health")) {
    return {
      intent: "health",
      confidence: 0.9
    }
  }

  if (text.includes("marketing")) {
    return {
      intent: "marketing",
      confidence: 0.9
    }
  }

  if (text.includes("gobierno") || text.includes("gov")) {
    return {
      intent: "gov",
      confidence: 0.9
    }
  }

  return {
    intent: "unknown",
    confidence: 0.5
  }
}