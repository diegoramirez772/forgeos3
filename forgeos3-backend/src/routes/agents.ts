import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../db/supabase'

export const agentsRouter = Router()

const CreateAgentSchema = z.object({
  name:            z.string().min(1),
  description:     z.string().optional(),
  runtime:         z.string().default('openclaw_v1'),
  domain_profile:  z.enum(['healthtech', 'agrotech', 'fintech', 'custom']),
  tool_pack_id:    z.string().uuid().optional(),
  policy_preset_id:z.string().uuid().optional(),
  risk_mode:       z.enum(['safe', 'normal']).default('normal'),
})

agentsRouter.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('created_agents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

agentsRouter.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('created_agents')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(404).json({ error: 'Agent not found' })
  res.json(data)
})

agentsRouter.post('/', async (req, res) => {
  const parsed = CreateAgentSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const { data, error } = await supabase
    .from('created_agents')
    .insert({ ...parsed.data, status: 'active' })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

agentsRouter.post('/:id/deploy', async (req, res) => {
  const { data, error } = await supabase
    .from('created_agents')
    .update({ status: 'active' })
    .eq('id', req.params.id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

agentsRouter.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('created_agents')
    .delete()
    .eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})