import { startRun, finishRun, beforeToolCall } from "../adapter/openclawAdapter"
import { getHospitalStats, generateHealthReport } from "../tools/healthTools"

export async function runHealthScenario() {

    const run = await startRun("health-agent")

    if (await beforeToolCall("getHospitalStats", {})) {
        const stats = await getHospitalStats()
        console.log(stats)
    }

    if (await beforeToolCall("generateHealthReport", {})) {
        const report = await generateHealthReport()
        console.log(report)
    }

    await finishRun(run.id, "health scenario completed")

}