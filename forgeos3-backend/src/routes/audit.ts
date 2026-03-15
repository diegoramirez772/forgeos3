import { Router } from 'express'
import { supabase } from '../db/supabase'

export const auditRouter = Router()

// ── GET /api/audit — full audit log paginated ─────────────────
auditRouter.get('/', async (req, res) => {
  const limit     = Math.min(parseInt(req.query.limit  as string) || 50, 200)
  const offset    = parseInt(req.query.offset as string) || 0
  const domain    = req.query.domain     as string | undefined
  const eventType = req.query.event_type as string | undefined
  const runId     = req.query.run_id     as string | undefined

  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (domain)    query = query.eq('domain', domain)
  if (eventType) query = query.eq('event_type', eventType)
  if (runId)     query = query.eq('run_id', runId)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: 'Failed to fetch audit log' })
  res.json({ data, total: count, limit, offset })
})

// ── GET /api/audit/run/:runId — all events for a run ─────────
auditRouter.get('/run/:runId', async (req, res) => {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('run_id', req.params.runId)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: 'Failed to fetch run audit' })
  res.json(data)
})

// ── GET /api/audit/summary — counts by event type ────────────
auditRouter.get('/summary', async (_req, res) => {
  const { data, error } = await supabase
    .from('audit_log')
    .select('event_type, domain')

  if (error) return res.status(500).json({ error: 'Failed to fetch audit summary' })

  const byType: Record<string, number> = {}
  const byDomain: Record<string, number> = {}

  for (const row of data ?? []) {
    byType[row.event_type]  = (byType[row.event_type]  || 0) + 1
    if (row.domain) {
      byDomain[row.domain]  = (byDomain[row.domain] || 0) + 1
    }
  }

  res.json({ byType, byDomain, total: data?.length ?? 0 })
})