  const MOCK_TOOLS = [
    { id: 'mt-1',  name: 'execute_transfer',  description: 'Transfiere fondos entre cuentas bancarias',         sensitivity: 'critical' as const, requiresApproval: true,  packName: 'FinTech Core',      domain: 'fintech'    },
    { id: 'mt-2',  name: 'diagnose_patient',  description: 'Genera diagnóstico preliminar con síntomas',        sensitivity: 'critical' as const, requiresApproval: true,  packName: 'HealthTech Core',   domain: 'healthtech' },
    { id: 'mt-3',  name: 'apply_treatment',   description: 'Aplica tratamiento agrícola a campo seleccionado',  sensitivity: 'critical' as const, requiresApproval: true,  packName: 'AgroTech Core',     domain: 'agrotech'   },
    { id: 'mt-4',  name: 'detect_fraud',      description: 'Analiza transacciones en busca de patrones fraude', sensitivity: 'high'     as const, requiresApproval: true,  packName: 'FinTech Core',      domain: 'fintech'    },
    { id: 'mt-5',  name: 'prescribe_med',     description: 'Sugiere medicamento y dosis según historial',       sensitivity: 'high'     as const, requiresApproval: true,  packName: 'HealthTech Core',   domain: 'healthtech' },
    { id: 'mt-6',  name: 'bulk_spray',        description: 'Programa fumigación masiva en zona de cultivo',     sensitivity: 'high'     as const, requiresApproval: true,  packName: 'AgroTech Core',     domain: 'agrotech'   },
    { id: 'mt-7',  name: 'analyze_market',    description: 'Análisis de tendencias del mercado financiero',     sensitivity: 'medium'   as const, requiresApproval: false, packName: 'FinTech Core',      domain: 'fintech'    },
    { id: 'mt-8',  name: 'patient_summary',   description: 'Genera resumen de historial médico del paciente',   sensitivity: 'medium'   as const, requiresApproval: false, packName: 'HealthTech Core',   domain: 'healthtech' },
    { id: 'mt-9',  name: 'crop_sensor_read',  description: 'Lee sensores de humedad, pH y temperatura',        sensitivity: 'medium'   as const, requiresApproval: false, packName: 'AgroTech Core',     domain: 'agrotech'   },
    { id: 'mt-10', name: 'generate_report',   description: 'Exporta reporte de actividad de agentes',          sensitivity: 'low'      as const, requiresApproval: false, packName: 'FinTech Core',      domain: 'fintech'    },
    { id: 'mt-11', name: 'schedule_reminder', description: 'Crea recordatorio para seguimiento de paciente',   sensitivity: 'low'      as const, requiresApproval: false, packName: 'HealthTech Core',   domain: 'healthtech' },
    { id: 'mt-12', name: 'yield_forecast',    description: 'Predice rendimiento de cosecha por parcela',       sensitivity: 'low'      as const, requiresApproval: false, packName: 'AgroTech Core',     domain: 'agrotech'   },
  ]

  const allToolsRaw = packs.flatMap(pack =>
    (pack.tools ?? []).map(tool => ({
      ...tool,
      packName: pack.name,
      domain: pack.domain,
    }))
  )

  const allTools = allToolsRaw.length > 0 ? allToolsRaw : MOCK_TOOLS
