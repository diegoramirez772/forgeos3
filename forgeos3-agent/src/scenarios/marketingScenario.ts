import { startRun, finishRun, beforeToolCall } from "../adapter/openclawAdapter"
import { analyzeCampaign, generateMarketingInsights } from "../tools/marketingTools"

export async function runMarketingScenario() {

    const run = await startRun("marketing-agent")

    if (await beforeToolCall("analyzeCampaign", {})) {
        const data = await analyzeCampaign()
        console.log(data)
    }

    if (await beforeToolCall("generateMarketingInsights", {})) {
        const insights = await generateMarketingInsights()
        console.log(insights)
    }

    await finishRun(run.id, "marketing scenario completed")

}