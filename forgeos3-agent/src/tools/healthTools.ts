export async function getHospitalStats() {

    console.log("Fetching hospital stats...")

    return {
        hospitals: 12,
        patients: 340
    }

}

export async function generateHealthReport() {

    console.log("Generating health report...")

    return {
        report: "Health system stable"
    }

}