export function policyGate(toolName: string): boolean {

  const blockedTools: string[] = []

  if (blockedTools.includes(toolName)) {
    return false
  }

  return true
}