import "dotenv/config"

import { runGovScenario } from "./scenarios/govScenario"
import { runHealthScenario } from "./scenarios/healthScenario"
import { runMarketingScenario } from "./scenarios/marketingScenario"

async function main() {

    console.log("Running ForgeOS3 Agent...\n")

    await runGovScenario()
    await runHealthScenario()
    await runMarketingScenario()

}

main()