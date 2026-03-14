import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../db/supabase'
import { evaluatePolicy } from '../engine/policyEngine'
import { evaluateLoop }   from '../engine/loopGuard'
import { logAuditEvent }  from '../engine/auditLayer'

export const toolsRouter = Router()

const EvaluateSchema = z.object({
  runId:    z.string().uuid(),
  toolName: z.string(),
  domain:   z.enum(['healthtech', 'agrotech', 'fintech', 'custom']),
  input:    z.record(z.unknown()).default({}),
})

toolsRouter.post('/evaluate', async (req, res) => {
  const parsed = EvaluateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { runId, toolName, domain, input } = parsed.data

  // 1. Get run to find policy info
  const { data: run, error: runError } = await supabase
    .from('agent_runs')
    .select('*, created_agents(policy_preset_id, risk_mode, tool_pack_id)')
    .eq('id', runId)
    .single()

  if (runError || !run) return res.status(404).json({ error: 'Run not found' })

  // 2. Get tool sensitivity from tool_pack_items
  let sensitivity: string   = 'low'
  let requiresApproval       = false
  let policyLevel: string    = 'medium'

  if (run.created_agents?.tool_pack_id) {
    const { data: toolItem } = await supabase
      .from('tool_pack_items')
      .select('sensitivity, requires_approval')
      .eq('tool_pack_id', run.created_agents.tool_pack_id)
      .eq('name', toolName)
      .single()

    if (toolItem) {
      sensitivity      = toolItem.sensitivity
      requiresApproval = toolItem.requires_approval
    }
  }

  if (run.created_agents?.policy_preset_id) {
    const { data: preset } = await supabase
      .from('policy_presets')
      .select('level')
      .eq('id', run.created_agents.policy_preset_id)
      .single()
    if (preset) policyLevel = preset.level
  }

  // 3. Evaluate policy
  const result = evaluatePolicy({
    toolName,
    domain,
    policyLevel:      policyLevel as 'low' | 'medium' | 'strict',
    sensitivity:      sensitivity as 'low' | 'medium' | 'high' | 'critical',
    riskMode:         (run.created_agents?.risk_mode ?? 'normal') as 'safe' | 'normal',
    requiresApproval,
  })

  // 4. Calculate risk score
  const scoreMap: Record<string, number> = { low: 5, medium: 10, high: 20, critical: 35 }
  const riskScore = scoreMap[sensitivity] ?? 5

  // 5. Log the tool event
  const { data: toolEvent } = await supabase
    .from('tool_events')
    .insert({
      run_id:     runId,
      tool_name:  toolName,
      decision:   result.decision,
      input,
      risk_score: riskScore,
      reason:     result.reason,
      timestamp:  new Date().toISOString(),
    })
    .select()
    .single()

  // 6. Update run loop_risk_score
  await supabase
    .from('agent_runs')
    .update({ loop_risk_score: run.loop_risk_score + riskScore })
    .eq('id', runId)

  // 7. Audit
  await logAuditEvent({
    type:   result.decision === 'blocked' ? 'tool_blocked' : 'tool_evaluated',
    runId,
    domain,
    data:   { toolName, decision: result.decision, reason: result.reason, riskScore },
  })

  res.json({
    decision:    result.decision,
    reason:      result.reason,
    riskScore,
    toolEventId: toolEvent?.id ?? null,
  })
})

const LogToolSchema = z.object({
  toolEventId: z.string().uuid(),
  output:      z.record(z.unknown()).optional(),
  durationMs:  z.number().optional(),
})

toolsRouter.post('/log', async (req, res) => {
  const parsed = LogToolSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { toolEventId, output, durationMs } = parsed.data

  const { data, error } = await supabase
    .from('tool_events')
    .update({ output: output ?? null, duration_ms: durationMs ?? null })
    .eq('id', toolEventId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await logAuditEvent({
    type: 'tool_executed',
    data: { toolEventId, durationMs },
  })

  res.json(data)
})

// Loop risk evaluation
const LoopSchema = z.object({
  runId: z.string().uuid(),
})

toolsRouter.post('/evaluate-loop', async (req, res) => {
  const parsed = LoopSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { runId } = parsed.data

  const { data: events, error } = await supabase
    .from('tool_events')
    .select('tool_name, decision, risk_score, timestamp')
    .eq('run_id', runId)
    .order('timestamp', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  const result = evaluateLoop(
    (events ?? []).map(e => ({
      toolName:  e.tool_name,
      decision:  e.decision,
      riskScore: e.risk_score,
      timestamp: e.timestamp,
    }))
  )

  // Update run loop_risk_score
  await supabase
    .from('agent_runs')
    .update({ loop_risk_score: result.score })
    .eq('id', runId)

  if (result.recommendation !== 'normal') {
    await logAuditEvent({
      type:  'loop_risk_escalated',
      runId,
      data:  { score: result.score, recommendation: result.recommendation, reason: result.reason },
    })
  }

  res.json(result)
})