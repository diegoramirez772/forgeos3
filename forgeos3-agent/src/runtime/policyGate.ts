export function policyCheck(tool: string): boolean {

  const allowedTools = [
  "healthTool",
  "marketingTool",
  "govTool"
]


  return allowedTools.includes(tool)
}