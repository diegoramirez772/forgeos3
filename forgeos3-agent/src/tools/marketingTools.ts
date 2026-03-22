// Escenario C — Marketing
// summarize → allowed | draft → allowed | publish → approval_required

export async function summarize(campaignId: string) {
  return {
    campaignId,
    summary: "Q4 campaign — 3 content pillars: product launch, testimonials, seasonal promotions.",
    audience: "25-45, tech-aware, LatAm",
    budget_remaining: "$4,200 USD",
  }
}

export async function draft(campaignId: string) {
  return {
    campaignId,
    draft: "🚀 Big news! Our new product line is here. Designed for you. Built for tomorrow.",
    format: "social_post",
    channels: ["instagram", "linkedin"],
    estimated_reach: 12000,
  }
}

export async function publish(campaignId: string, content: any) {
  // approval_required — publica en canal externo
  return {
    campaignId,
    published: true,
    channels: ["instagram", "linkedin"],
    timestamp: new Date().toISOString(),
  }
}

export async function schedule(campaignId: string, date: string) {
  return { campaignId, scheduled_for: date, status: "queued" }
}
