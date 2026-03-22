type IntentResult = {
  intent: string
  confidence: number
}

const intentKeywords: Record<string, string[]> = {
  health: ["salud", "hospital", "medico"],
  marketing: ["marketing", "campaña", "publicidad"],
  gov: ["gobierno", "estado", "datos"]
}

export function analyzeIntent(input: string): IntentResult {

  const text = input.toLowerCase()

  for (const intent in intentKeywords) {

    const keywords = intentKeywords[intent]

    for (const word of keywords) {

      if (text.includes(word)) {
        return {
          intent,
          confidence: 0.9
        }
      }

    }

  }

  return {
    intent: "unknown",
    confidence: 0.5
  }

}