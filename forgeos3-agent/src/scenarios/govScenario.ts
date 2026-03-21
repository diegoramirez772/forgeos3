import { startRun, finishRun, beforeToolCall } from "../adapter/openclawAdapter";
import { getCitizenData, generatePolicyReport } from "../tools/govTools";

export async function runGovScenario() {

    const run = await startRun("gov-agent");

    if (await beforeToolCall("getCitizenData", {})) {
        const data = await getCitizenData();
        console.log(data);
    }

    if (await beforeToolCall("generatePolicyReport", {})) {
        const report = await generatePolicyReport();
        console.log(report);
    }

    await finishRun(run.id, "gov scenario completed");
}