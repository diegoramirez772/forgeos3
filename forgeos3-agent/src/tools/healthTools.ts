// Escenario A — Health
// summarize → allowed | checklist → allowed | diagnose → blocked

export async function summarize(patientId: string) {
  return {
    patientId,
    summary: "Patient #4821 — Male, 67. Chief complaint: chest pain 3 days. Vitals stable. Pending ECG.",
    riskFlags: ["hypertension", "diabetes_type2"],
  }
}

export async function checklist(patientId: string) {
  return {
    patientId,
    followUp: [
      "Schedule ECG within 24h",
      "Review medication compliance",
      "Refer to cardiology if ECG abnormal",
      "Blood panel: HbA1c, lipid profile",
    ],
  }
}

export async function diagnose(patientId: string) {
  // Esta tool NUNCA debe ejecutarse — bloqueada por política strict + critical sensitivity
  return {
    patientId,
    diagnosis: "BLOCKED — should never reach here",
  }
}

export async function write_record(patientId: string, data: any) {
  return { patientId, saved: true, timestamp: new Date().toISOString() }
}
