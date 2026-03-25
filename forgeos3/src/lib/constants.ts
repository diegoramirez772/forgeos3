import type { DomainProfileConfig, ToolPack, PolicyPreset } from '../types/agent'

// These constants were previously used for simulation. 
// They are now empty as the application fetches all configuration from the Supabase backend.
export const DOMAIN_PROFILES: DomainProfileConfig[] = []
export const TOOL_PACKS: ToolPack[] = []
export const POLICY_PRESETS: PolicyPreset[] = []
