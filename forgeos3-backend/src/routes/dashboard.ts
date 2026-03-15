import { Router } from 'express'
import { supabase } from '../db/supabase'

export const dashboardRouter = Router()

dashboardRouter.get('/stats', async (_req, res) => {
  try {
    // Run all queries in parallel
    const [
      runsResult,
      toolEventsResult,
      approvalsResult,
      agentsResult,
      recentRunsResult,
      recentApprovalsResult,
    ] = await Promise.all([
      // Total runs + by status
      supabase.from('agent_runs').select('status, loop_risk_score, domain'),

      // Tool events decisions
      supabase.from('tool_events').select('decision, risk_score'),

      // Approvals by status
      supabase.from('approval_requests').select('status, domain, created_at'),

      // Active agents count
      supabase.from('created_agents').select('id, status'),

      // 5 most recent runs
      supabase
        .from('agent_runs')
        .select('id, agent_name, domain, status, loop_risk_score, started_at')
        .order('started_at', { ascending: false })
        .limit(5),

      // Pending approvals
      supabase
        .from('approval_requests')
        .select('id, agent_name, domain, tool_name, reason, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ])

    const runs        = runsResult.data        ?? []
    const toolEvents  = toolEventsResult.data  ?? []
    const approvals   = approvalsResult.data   ?? []
    const agents      = agentsResult.data      ?? []

    // Compute stats
    const totalRuns       = runs.length
    const runsByStatus    = runs.reduce((acc: Record<string, number>, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {})

    const totalAllowed    = toolEvents.filter(e => e.decision === 'allowed').length
    const totalBlocked    = toolEvents.filter(e => e.decision === 'blocked').length
    const totalApproval   = toolEvents.filter(e => e.decision === 'approval_required').length
    const avgRiskScore    = runs.length
      ? Math.round(runs.reduce((s, r) => s + (r.loop_risk_score ?? 0), 0) / runs.length)
      : 0
    const highRiskRuns    = runs.filter(r => (r.loop_risk_score ?? 0) > 30).length

    const pendingApprovals = approvals.filter(a => a.status === 'pending').length
    const activeAgents     = agents.filter(a => a.status === 'active').length

    const runsByDomain = runs.reduce((acc: Record<string, number>, r) => {
      acc[r.domain] = (acc[r.domain] || 0) + 1
      return acc
    }, {})

    res.json({
      // Core metrics
      totalRuns,
      activeAgents,
      pendingApprovals,
      totalBlocked,
      totalAllowed,
      totalApprovalRequired: totalApproval,
      avgRiskScore,
      highRiskRuns,

      // Breakdowns
      runsByStatus,
      runsByDomain,

      // Recent data for dashboard widgets
      recentRuns:      recentRunsResult.data      ?? [],
      pendingList:     recentApprovalsResult.data  ?? [],
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})