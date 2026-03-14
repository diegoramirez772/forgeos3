import { Router } from 'express'
import { supabase } from '../db/supabase'

export const registryRouter = Router()

registryRouter.get('/domain-profiles', async (_req, res) => {
  const { data, error } = await supabase.from('domain_profiles').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.get('/tool-packs', async (_req, res) => {
  const { data, error } = await supabase
    .from('tool_packs')
    .select('*, tools:tool_pack_items(*)')
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.get('/policy-presets', async (_req, res) => {
  const { data, error } = await supabase.from('policy_presets').select('*').order('strictness')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.get('/runtime-presets', async (_req, res) => {
  const { data, error } = await supabase.from('runtime_presets').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

registryRouter.get('/templates', async (_req, res) => {
  const { data, error } = await supabase.from('agent_templates').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})