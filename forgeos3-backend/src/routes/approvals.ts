import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../db/supabase'
import { logAuditEvent } from '../engine/auditLayer'

export const approvalsRouter = Router()

approvalsRouter.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

approvalsRouter.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(404).json({ error: 'Approval not found' })
  res.json(data)
})

const RequestSchema = z.object({
  runId:     z.string().uuid(),
  agentId:   z.string(),
  agentName: z.string(),
  domain:    z.enum(['healthtech', 'agrotech', 'fintech', 'custom']),
  toolName:  z.string(),
  payload:   z.record(z.unknown()).default({}),
  reason:    z.string(),
})

approvalsRouter.post('/request', async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { runId, agentId, agentName, domain, toolName, payload, reason } = parsed.data

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      run_id:     runId,
      agent_id:   agentId,
      agent_name: agentName,
      domain,
      tool_name:  toolName,
      payload,
      reason,
      status:     'pending',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await logAuditEvent({
    type:    'approval_requested',
    runId,
    agentId,
    domain,
    data:    { toolName, reason },
  })

  res.status(201).json(data)
})

const ResolveSchema = z.object({
  status:     z.enum(['approved', 'rejected']),
  reviewedBy: z.string().email(),
})

approvalsRouter.post('/:id/resolve', async (req, res) => {
  const parsed = ResolveSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { status, reviewedBy } = parsed.data

  const { data, error } = await supabase
    .from('approval_requests')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await logAuditEvent({
    type:  'approval_resolved',
    runId: data.run_id,
    data:  { approvalId: req.params.id, status, reviewedBy },
  })

  res.json(data)
})