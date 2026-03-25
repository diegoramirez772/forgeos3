import { Router } from 'express'
import { supabase } from '../db/supabase'

export const registryRouter = Router()

registryRouter.get('/domain-profiles', async (_req, res) => {
  const { data, error } = await supabase
    .from('domain_profiles')
    .select('*')
    .order('name')
  if (error) return res.status(500).json({ error: 'Failed to fetch domain profiles' })
  res.json(data)
})

registryRouter.get('/tool-packs', async (req, res) => {
  const domain = req.query.domain as string | undefined
  let query = supabase
    .from('tool_packs')
    .select('*, tools:tool_pack_items(*)')
    .order('name')

  if (domain) query = query.eq('domain', domain)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: 'Failed to fetch tool packs' })
  res.json(data)
})

registryRouter.get('/policy-presets', async (_req, res) => {
  const { data, error } = await supabase
    .from('policy_presets')
    .select('*')
    .order('strictness')
  if (error) return res.status(500).json({ error: 'Failed to fetch policy presets' })
  res.json(data)
})

registryRouter.get('/runtime-presets', async (_req, res) => {
  const { data, error } = await supabase
    .from('runtime_presets')
    .select('*')
    .order('name')
  if (error) return res.status(500).json({ error: 'Failed to fetch runtime presets' })
  res.json(data)
})

registryRouter.get('/templates', async (req, res) => {
  const domain = req.query.domain as string | undefined
  let query = supabase
    .from('agent_templates')
    .select('*')
    .order('name')

  if (domain) query = query.eq('default_domain', domain)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: 'Failed to fetch templates' })
  res.json(data)
})

// --- DOMAIN PROFILES ---
registryRouter.post('/domain-profiles', async (req, res) => {
  const { data, error } = await supabase.from('domain_profiles').insert(req.body).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

registryRouter.patch('/domain-profiles/:id', async (req, res) => {
  const { data, error } = await supabase.from('domain_profiles').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.delete('/domain-profiles/:id', async (req, res) => {
  const { error } = await supabase.from('domain_profiles').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

// --- TOOL PACKS ---
registryRouter.post('/tool-packs', async (req, res) => {
  const { tools, ...rest } = req.body
  const { data: pack, error: packErr } = await supabase.from('tool_packs').insert(rest).select().single()
  if (packErr) return res.status(500).json({ error: packErr.message })

  if (tools && tools.length > 0) {
    const items = tools.map((t: any) => ({ ...t, tool_pack_id: pack.id }))
    const { error: itemsErr } = await supabase.from('tool_pack_items').insert(items)
    if (itemsErr) return res.status(500).json({ error: itemsErr.message })
  }
  
  res.status(201).json(pack)
})

registryRouter.patch('/tool-packs/:id', async (req, res) => {
  const { data, error } = await supabase.from('tool_packs').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.delete('/tool-packs/:id', async (req, res) => {
  const { error } = await supabase.from('tool_packs').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})

// --- POLICY PRESETS ---
registryRouter.post('/policy-presets', async (req, res) => {
  const { data, error } = await supabase.from('policy_presets').insert(req.body).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

registryRouter.patch('/policy-presets/:id', async (req, res) => {
  const { data, error } = await supabase.from('policy_presets').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.delete('/policy-presets/:id', async (req, res) => {
  const { error } = await supabase.from('policy_presets').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.status(204).send()
})