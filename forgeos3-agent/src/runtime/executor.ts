export function executeTool(tool: string): string {

  switch (tool) {

    case "healthTool":
      return "Sistema de salud funcionando correctamente"

    case "marketingTool":
      return "Análisis de marketing ejecutado"

    default:
      return "No se pudo ejecutar ninguna herramienta"
  }

}