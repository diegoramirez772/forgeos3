import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../db/supabase'
import { logAuditEvent } from '../engine/auditLayer'

export const runsRouter = Router()

runsRouter.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*, tool_events(*)')
    .order('started_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

runsRouter.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('agent_runs')
    .select('*, tool_events(*), approval_requests(*)')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(404).json({ error: 'Run not found' })
  res.json(data)
})

runsRouter.get('/:id/tools', async (req, res) => {
  const { data, error } = await supabase
    .from('tool_events')
    .select('*')
    .eq('run_id', req.params.id)
    .order('timestamp', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

const StartRunSchema = z.object({
  agentId:   z.string(),
  agentName: z.string(),
  domain:    z.enum(['healthtech', 'agrotech', 'fintech', 'custom']),
  input:     z.string(),
})

runsRouter.post('/start', async (req, res) => {
  const parsed = StartRunSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { agentId, agentName, domain, input } = parsed.data

  const { data, error } = await supabase
    .from('agent_runs')
    .insert({
      agent_id:        agentId,
      agent_name:      agentName,
      domain,
      input,
      status:          'running',
      loop_risk_score: 0,
      started_at:      new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await logAuditEvent({
    type:    'run_started',
    runId:   data.id,
    agentId: agentId,
    domain,
    data:    { agentName, input },
  })

  res.status(201).json(data)
})

const FinishRunSchema = z.object({
  runId:  z.string().uuid(),
  status: z.enum(['finished', 'blocked', 'safe_mode']),
  output: z.string().optional(),
})

runsRouter.post('/finish', async (req, res) => {
  const parsed = FinishRunSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { runId, status, output } = parsed.data

  const { data, error } = await supabase
    .from('agent_runs')
    .update({ status, output: output ?? null, finished_at: new Date().toISOString() })
    .eq('id', runId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await logAuditEvent({
    type:  'run_finished',
    runId,
    data:  { status, output },
  })

  res.json(data)
})