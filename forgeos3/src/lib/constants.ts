import type { DomainProfileConfig, ToolPack, PolicyPreset } from '../types/agent'
import type { Run } from '../types/run'
import type { ApprovalRequest } from '../types/approval'

export const DOMAIN_PROFILES: DomainProfileConfig[] = [
  { id: '1', key: 'health', name: 'HealthTech', icon: '♥', description: 'Clinical documentation and patient support agents', color: 'blue', riskMode: 'safe' },
  { id: '2', key: 'gov', name: 'GovTech', icon: '⬡', description: 'Public services and administrative automation', color: 'purple', riskMode: 'safe' },
  { id: '3', key: 'marketing', name: 'Marketing', icon: '◈', description: 'Autonomous content pipelines and engagement engines', color: 'amber', riskMode: 'normal' },
  { id: '4', key: 'custom', name: 'Custom', icon: '◎', description: 'Define your own domain policies and rules', color: 'gray', riskMode: 'normal' },
]

export const TOOL_PACKS: ToolPack[] = [
  {
    id: 'tp-health', name: 'Health Core', description: 'Medical documentation tools', domain: 'health',
    tools: [
      { id: 't1', name: 'summarize', description: 'Summarize patient intake', sensitivity: 'low', requiresApproval: false },
      { id: 't2', name: 'checklist', description: 'Generate follow-up checklist', sensitivity: 'low', requiresApproval: false },
      { id: 't3', name: 'diagnose', description: 'Diagnostic assistance', sensitivity: 'critical', requiresApproval: true },
      { id: 't4', name: 'write_record', description: 'Write to patient record', sensitivity: 'high', requiresApproval: true },
    ]
  },
  {
    id: 'tp-gov', name: 'Gov Core', description: 'Government workflow tools', domain: 'gov',
    tools: [
      { id: 't5', name: 'classify', description: 'Classify public request', sensitivity: 'low', requiresApproval: false },
      { id: 't6', name: 'route', description: 'Route to workflow', sensitivity: 'medium', requiresApproval: false },
      { id: 't7', name: 'write_external', description: 'Write to external system', sensitivity: 'high', requiresApproval: true },
      { id: 't8', name: 'publish', description: 'Publish public notice', sensitivity: 'critical', requiresApproval: true },
    ]
  },
  {
    id: 'tp-marketing', name: 'Marketing Core', description: 'Content creation tools', domain: 'marketing',
    tools: [
      { id: 't9', name: 'summarize', description: 'Summarize brief', sensitivity: 'low', requiresApproval: false },
      { id: 't10', name: 'draft', description: 'Draft content', sensitivity: 'low', requiresApproval: false },
      { id: 't11', name: 'schedule', description: 'Schedule campaign', sensitivity: 'medium', requiresApproval: false },
      { id: 't12', name: 'publish', description: 'Publish to channels', sensitivity: 'high', requiresApproval: true },
    ]
  },
]

export const POLICY_PRESETS: PolicyPreset[] = [
  { id: 'pp-low', name: 'Permissive', level: 'low', strictness: 1, description: 'Allow most actions, minimal approvals' },
  { id: 'pp-medium', name: 'Balanced', level: 'medium', strictness: 3, description: 'Block critical, approval for high-risk tools' },
  { id: 'pp-strict', name: 'Strict', level: 'strict', strictness: 5, description: 'Maximum governance, all sensitive tools need approval' },
]

export const MOCK_RUNS: Run[] = [
  {
    id: 'run-001', agentId: 'ag-1', agentName: 'HealthAgent Alpha', domain: 'health',
    status: 'finished', input: 'Summarize patient intake form #4821 and create follow-up checklist',
    loopRiskScore: 12, startedAt: new Date(Date.now() - 300000).toISOString(),
    finishedAt: new Date(Date.now() - 60000).toISOString(),
    toolEvents: [
      { id: 'te-1', runId: 'run-001', toolName: 'summarize', decision: 'allowed', input: {}, riskScore: 5, timestamp: new Date(Date.now() - 280000).toISOString(), durationMs: 1200 },
      { id: 'te-2', runId: 'run-001', toolName: 'checklist', decision: 'allowed', input: {}, riskScore: 8, timestamp: new Date(Date.now() - 200000).toISOString(), durationMs: 800 },
      { id: 'te-3', runId: 'run-001', toolName: 'diagnose', decision: 'blocked', input: {}, riskScore: 12, timestamp: new Date(Date.now() - 120000).toISOString(), reason: 'Diagnosis tools blocked in health domain by policy' },
    ]
  },
  {
    id: 'run-002', agentId: 'ag-2', agentName: 'GovBot Prime', domain: 'gov',
    status: 'waiting_approval', input: 'Analyze public request #2291 and route to appropriate department',
    loopRiskScore: 34, startedAt: new Date(Date.now() - 120000).toISOString(),
    toolEvents: [
      { id: 'te-4', runId: 'run-002', toolName: 'classify', decision: 'allowed', input: {}, riskScore: 10, timestamp: new Date(Date.now() - 110000).toISOString(), durationMs: 600 },
      { id: 'te-5', runId: 'run-002', toolName: 'route', decision: 'allowed', input: {}, riskScore: 18, timestamp: new Date(Date.now() - 90000).toISOString(), durationMs: 400 },
      { id: 'te-6', runId: 'run-002', toolName: 'write_external', decision: 'approval_required', input: { system: 'municipal_db', record: '#2291' }, riskScore: 34, timestamp: new Date(Date.now() - 30000).toISOString() },
    ]
  },
  {
    id: 'run-003', agentId: 'ag-3', agentName: 'MarketingAgent', domain: 'marketing',
    status: 'finished', input: 'Generate campaign workflow and prepare content draft',
    loopRiskScore: 20, startedAt: new Date(Date.now() - 600000).toISOString(),
    finishedAt: new Date(Date.now() - 400000).toISOString(),
    toolEvents: [
      { id: 'te-7', runId: 'run-003', toolName: 'summarize', decision: 'allowed', input: {}, riskScore: 5, timestamp: new Date(Date.now() - 580000).toISOString(), durationMs: 900 },
      { id: 'te-8', runId: 'run-003', toolName: 'draft', decision: 'allowed', input: {}, riskScore: 10, timestamp: new Date(Date.now() - 540000).toISOString(), durationMs: 2100 },
      { id: 'te-9', runId: 'run-003', toolName: 'publish', decision: 'approval_required', input: { channel: 'twitter' }, riskScore: 20, timestamp: new Date(Date.now() - 500000).toISOString() },
    ]
  },
]

export const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'apr-001', runId: 'run-002', agentId: 'ag-2', agentName: 'GovBot Prime',
    domain: 'gov', toolName: 'write_external', status: 'pending',
    reason: 'Writing to external municipal database requires human approval per GovTech policy',
    payload: { system: 'municipal_db', record: '#2291', action: 'update_status', value: 'routed_to_urban_planning' },
    createdAt: new Date(Date.now() - 30000).toISOString(), waitingMs: 30000,
  },
  {
    id: 'apr-002', runId: 'run-003', agentId: 'ag-3', agentName: 'MarketingAgent',
    domain: 'marketing', toolName: 'publish', status: 'approved',
    reason: 'Publishing to social channels requires approval',
    payload: { channel: 'twitter', content: 'Campaign launch for Q4' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    reviewedBy: 'admin@forgeos3.dev', reviewedAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'apr-003', runId: 'run-004', agentId: 'ag-1', agentName: 'HealthAgent Alpha',
    domain: 'health', toolName: 'write_record', status: 'rejected',
    reason: 'Writing to patient record requires approval',
    payload: { patientId: '4821', field: 'notes', value: 'Follow-up scheduled' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reviewedBy: 'admin@forgeos3.dev', reviewedAt: new Date(Date.now() - 7100000).toISOString(),
  },
]
