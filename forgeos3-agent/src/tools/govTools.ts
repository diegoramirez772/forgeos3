export async function getCitizenData() {

    console.log("Fetching citizen data...");

    return {
        citizens: 1200,
        active: 950
    };

}

export async function generatePolicyReport() {

    console.log("Generating policy report...");

    return {
        report: "Policy report generated"
    };

}