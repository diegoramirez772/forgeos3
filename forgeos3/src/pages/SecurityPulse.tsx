import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldOff, ShieldAlert, Activity, TrendingUp,
  TrendingDown, Lock, AlertTriangle, CheckCircle,
  Eye, RefreshCw, BarChart2, Target, Layers
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { useDashboardStore } from '../store/dashboardStore'
import { useRunStore } from '../store/runStore'

// ─── helpers ────────────────────────────────────────────────────────────────

function timeAgo(ts: string) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 60000) return `${Math.round(d / 1000)}s ago`
  if (d < 3600000) return `${Math.round(d / 60000)}m ago`
  return `${Math.round(d / 3600000)}h ago`
}

function buildSparkline(total: number, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const base = Math.round((total / count) * (0.6 + Math.random() * 0.8))
    return { t: i, v: Math.max(0, base) }
  })
}

// ─── tiny animated counter ──────────────────────────────────────────────────

function Counter({ to, duration = 1200, prefix = '', suffix = '' }: {
  to: number; duration?: number; prefix?: string; suffix?: string
}) {
  const [val, setVal] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef(Date.now())

  useEffect(() => {
    start.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start.current
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(ease * to))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [to, duration])

  return <>{prefix}{val.toLocaleString()}{suffix}</>
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  sub: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  icon: React.ElementType
  accent: string
  bg: string
  border: string
  sparkData?: { t: number; v: number }[]
  sparkColor?: string
  delay?: number
  pulsing?: boolean
}

function KpiCard({
  label, value, prefix, suffix, sub, trend, trendLabel,
  icon: Icon, accent, bg, border, sparkData, sparkColor, delay = 0, pulsing
}: KpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-400' : 'text-forge-subtle'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className={`relative p-5 rounded-2xl bg-forge-surface border ${border} overflow-hidden group`}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{ background: `radial-gradient(circle at 80% 20%, ${sparkColor || 'rgba(245,158,11,0.04)'} 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[10px] font-semibold text-forge-subtle uppercase tracking-wider leading-tight">
            {label}
          </span>
          <div className={`p-1.5 rounded-lg ${bg} relative`}>
            <Icon size={13} className={accent} />
            {pulsing && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </div>

        <div className={`text-3xl font-bold tracking-tight mb-0.5 tabular-nums ${accent}`}>
          <Counter to={value} prefix={prefix} suffix={suffix} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-forge-subtle">{sub}</span>
          {trend && trendLabel && (
            <div className={`flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
              <TrendIcon size={10} />
              {trendLabel}
            </div>
          )}
        </div>
      </div>

      {/* Sparkline bottom strip */}
      {sparkData && (
        <div className="absolute bottom-0 left-0 right-0 h-10 opacity-25 group-hover:opacity-40 transition-opacity">
          <ResponsiveContainer width="100%" height={40} minWidth={0}>
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone" dataKey="v"
                stroke={sparkColor || '#f59e0b'}
                fill={sparkColor || '#f59e0b'}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}

// ─── Risk Donut (SVG pure) ───────────────────────────────────────────────────

function RiskDonut({ safetyScore }: { safetyScore: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const filled = (safetyScore / 100) * circ
  const color = safetyScore >= 80 ? '#10b981' : safetyScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center relative z-10">
        <div className="text-2xl font-bold tabular-nums" style={{ color }}>
          <Counter to={safetyScore} suffix="%" duration={1200} />
        </div>
        <div className="text-[9px] text-forge-subtle font-semibold uppercase tracking-wider mt-0.5">Safety</div>
      </div>
    </div>
  )
}

// ─── Live event ticker ───────────────────────────────────────────────────────

interface TickerEvent {
  id: string
  tool: string
  decision: 'blocked' | 'allowed' | 'approval_required'
  agent: string
  domain: string
  ts: string
}

const DECISION_META: Record<string, { label: string; dot: string; badge: string }> = {
  blocked:           { label: 'BLOQUEADO',  dot: 'bg-red-500',     badge: 'bg-red-500/10 border-red-500/20 text-red-400'     },
  allowed:           { label: 'PERMITIDO',  dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
  approval_required: { label: 'PENDIENTE',  dot: 'bg-amber-400',   badge: 'bg-amber-400/10 border-amber-400/20 text-amber-500'  },
}

const DOMAIN_COLOR: Record<string, string> = {
  healthtech: 'text-blue-400',
  agrotech:   'text-green-400',
  fintech:    'text-amber-500',
}

function EventTicker({ events }: { events: TickerEvent[] }) {
  return (
    <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar">
      <AnimatePresence initial={false}>
        {events.slice(0, 12).map((ev) => {
          const meta = DECISION_META[ev.decision] || DECISION_META['allowed']
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-forge-elevated/40 hover:bg-forge-elevated/70 transition-colors border border-forge-border/30"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
              <span className="text-[11px] text-forge-primary font-medium truncate flex-1 min-w-0">{ev.agent}</span>
              <code className="text-[10px] text-amber-500 font-mono truncate max-w-20 shrink-0">{ev.tool}</code>
              <span className={`text-[9px] shrink-0 capitalize ${DOMAIN_COLOR[ev.domain] || 'text-forge-subtle'}`}>{ev.domain}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${meta.badge}`}>
                {meta.label}
              </span>
              <span className="text-[9px] text-forge-subtle shrink-0">{timeAgo(ev.ts)}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
      {events.length === 0 && (
        <div className="flex items-center justify-center py-8 text-forge-subtle text-xs">
          Sin eventos registrados
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function SecurityPulse() {
  const { stats, fetchStats } = useDashboardStore()
  const { runs, fetchRuns } = useRunStore()

  useEffect(() => {
    fetchStats()
    fetchRuns()
    const iv = setInterval(() => { fetchStats(); fetchRuns() }, 5000)
    return () => clearInterval(iv)
  }, [fetchStats, fetchRuns])

  // Derived metrics
  const allEvents: TickerEvent[] = (runs ?? [])
    .flatMap((r: any) => (r.toolEvents ?? []).map((e: any) => ({
      id: e.id,
      tool: e.toolName,
      decision: e.decision,
      agent: r.agentName,
      domain: r.domain,
      ts: e.timestamp,
    })))
    .sort((a: any, b: any) => new Date(b.ts).getTime() - new Date(a.ts).getTime())

  const totalBlocked   = allEvents.filter(e => e.decision === 'blocked').length
  const totalAllowed   = allEvents.filter(e => e.decision === 'allowed').length
  const totalPending   = allEvents.filter(e => e.decision === 'approval_required').length
  const totalActions   = allEvents.length

  // Protected resources = unique tools that were blocked at least once
  const protectedTools = new Set(
    allEvents.filter(e => e.decision === 'blocked').map(e => e.tool)
  ).size

  // Unique agents protected = those that had at least one blocked event
  const protectedAgents = new Set(
    allEvents.filter(e => e.decision === 'blocked').map(e => e.agent)
  ).size

  const safetyScore = stats?.securityPulse.safetyScore ?? 0
  const valueProtected = stats?.securityPulse.totalValueProtected ?? 0
  const shieldStatus = stats?.securityPulse.shieldStatus ?? 'Active'
  const lastBlocked = stats?.securityPulse.lastAttackBlocked ?? '—'

  // Bar chart: decisions by domain
  const domainMap: Record<string, { blocked: number; allowed: number; pending: number }> = {}
  for (const ev of allEvents) {
    if (!domainMap[ev.domain]) domainMap[ev.domain] = { blocked: 0, allowed: 0, pending: 0 }
    if (ev.decision === 'blocked') domainMap[ev.domain].blocked++
    else if (ev.decision === 'allowed') domainMap[ev.domain].allowed++
    else domainMap[ev.domain].pending++
  }
  const domainData = Object.entries(domainMap).map(([name, d]) => ({ name, ...d }))

  // Sparklines
  const blockedSpark = buildSparkline(totalBlocked)
  const allowedSpark = buildSparkline(totalAllowed)
  const pendingSpark = buildSparkline(totalPending)
  const valueSpark   = buildSparkline(valueProtected)

  const statusColor =
    shieldStatus === 'Elite'   ? 'text-amber-400' :
    shieldStatus === 'Warning' ? 'text-red-400'   : 'text-emerald-400'

  return (
    <div className="min-h-screen bg-forge-bg">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-forge-border sticky top-0 z-10 bg-forge-bg/90 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield size={15} className="text-amber-500" />
            <h1 className="text-base font-semibold text-forge-white">Security Pulse</h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-500 uppercase tracking-wider">
              {shieldStatus}
            </span>
          </div>
          <p className="text-xs text-forge-subtle">
            KPIs de gobernanza en tiempo real · ForgeOS3 Sentinel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] text-emerald-500 font-medium">Live</span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* ── Hero banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative p-6 rounded-2xl overflow-hidden border border-amber-500/20"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(16,185,129,0.04) 50%, rgba(239,68,68,0.04) 100%)',
          }}
        >
          {/* decorative bg icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06]">
            <Shield size={140} className="text-amber-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            {/* Donut */}
            <div className="flex items-center gap-6 shrink-0">
              <RiskDonut safetyScore={safetyScore} />
              <div>
                <div className="text-xs text-forge-subtle mb-1">Sentinel Status</div>
                <div className={`text-xl font-bold ${statusColor}`}>{shieldStatus}</div>
                <div className="text-[11px] text-forge-subtle mt-1">
                  Última amenaza bloqueada:
                </div>
                <code className="text-[11px] text-amber-500 font-mono">{lastBlocked}</code>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-forge-border/60" />

            {/* Headline stats row */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: 'Riesgos Bloqueados', value: totalBlocked, color: 'text-red-400', icon: ShieldOff },
                { label: 'Acciones Detenidas', value: totalPending, color: 'text-amber-500', icon: Lock },
                { label: 'Recursos Protegidos', value: protectedTools, color: 'text-blue-400', icon: Shield },
                { label: 'Agentes Custodiados', value: protectedAgents, color: 'text-purple-400', icon: Eye },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={11} className={color} />
                    <span className="text-[9px] text-forge-subtle font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${color}`}>
                    <Counter to={value} duration={900} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Riesgos Bloqueados"
            value={totalBlocked}
            sub="Por Policy Engine"
            trend="down"
            trendLabel="bajo control"
            icon={ShieldOff}
            accent="text-red-400"
            bg="bg-red-500/8"
            border="border-red-500/15"
            sparkData={blockedSpark}
            sparkColor="#ef4444"
            delay={0.0}
          />
          <KpiCard
            label="Recursos Protegidos"
            value={protectedTools}
            sub="Herramientas en escudo"
            trend="up"
            trendLabel="cobertura activa"
            icon={Lock}
            accent="text-blue-400"
            bg="bg-blue-500/8"
            border="border-blue-500/15"
            sparkData={pendingSpark}
            sparkColor="#60a5fa"
            delay={0.08}
          />
          <KpiCard
            label="Acciones Detenidas"
            value={totalPending}
            sub="Esperando aprobación"
            trend="neutral"
            trendLabel="en revisión"
            icon={ShieldAlert}
            accent="text-amber-500"
            bg="bg-amber-500/8"
            border="border-amber-500/15"
            sparkData={allowedSpark}
            sparkColor="#f59e0b"
            delay={0.16}
          />
          <KpiCard
            label="Valor Protegido"
            value={valueProtected}
            prefix="$"
            sub="Transacciones bloqueadas"
            trend="up"
            trendLabel="+12% sesión"
            icon={Target}
            accent="text-emerald-400"
            bg="bg-emerald-500/8"
            border="border-emerald-500/15"
            sparkData={valueSpark}
            sparkColor="#10b981"
            delay={0.24}
            pulsing
          />
        </div>

        {/* ── Secondary row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Domain breakdown bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.45 }}
            className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border">
              <div className="flex items-center gap-2">
                <BarChart2 size={13} className="text-amber-500" />
                <span className="text-sm font-semibold text-forge-white">Decisiones por Dominio</span>
              </div>
            </div>
            <div className="p-5">
              {domainData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-forge-subtle text-xs">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height={160} minWidth={0}>
                  <BarChart data={domainData} barSize={10} barGap={2}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} width={20} />
                    <Tooltip
                      contentStyle={{ background: '#0f1014', border: '1px solid #1f2937', borderRadius: 10, fontSize: 11 }}
                      labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                      itemStyle={{ color: '#9ca3af' }}
                    />
                    <Bar dataKey="allowed"  fill="#10b981" radius={[3,3,0,0]} name="Permitido" />
                    <Bar dataKey="blocked"  fill="#ef4444" radius={[3,3,0,0]} name="Bloqueado" />
                    <Bar dataKey="pending"  fill="#f59e0b" radius={[3,3,0,0]} name="Pendiente" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="flex items-center gap-4 mt-2 justify-center">
                {[
                  { color: 'bg-emerald-500', label: 'Permitido' },
                  { color: 'bg-red-500',     label: 'Bloqueado' },
                  { color: 'bg-amber-400',   label: 'Pendiente' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-[10px] text-forge-subtle">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Coverage ratio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.40, duration: 0.45 }}
            className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border">
              <div className="flex items-center gap-2">
                <Layers size={13} className="text-amber-500" />
                <span className="text-sm font-semibold text-forge-white">Cobertura de Acciones</span>
              </div>
              <span className="text-[10px] text-forge-subtle">{totalActions} total</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Permitidas',  value: totalAllowed,  total: totalActions, color: 'bg-emerald-500', text: 'text-emerald-500' },
                { label: 'Bloqueadas', value: totalBlocked,  total: totalActions, color: 'bg-red-500',     text: 'text-red-400'   },
                { label: 'En Revisión', value: totalPending,  total: totalActions, color: 'bg-amber-400',   text: 'text-amber-500' },
              ].map(({ label, value, total, color, text }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-forge-secondary">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tabular-nums ${text}`}>{value}</span>
                        <span className="text-[10px] text-forge-subtle">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-forge-elevated rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                        className={`h-full rounded-full ${color}`}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="pt-2 border-t border-forge-border/50 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-forge-elevated/50 border border-forge-border/50">
                  <div className="text-[9px] text-forge-subtle uppercase tracking-wider mb-1">Eficiencia</div>
                  <div className="text-lg font-bold text-amber-500 tabular-nums">
                    <Counter to={safetyScore} suffix="%" duration={1000} />
                  </div>
                  <div className="text-[9px] text-forge-subtle">Gov. score</div>
                </div>
                <div className="p-3 rounded-xl bg-forge-elevated/50 border border-forge-border/50">
                  <div className="text-[9px] text-forge-subtle uppercase tracking-wider mb-1">Interceptadas</div>
                  <div className="text-lg font-bold text-red-400 tabular-nums">
                    <Counter to={totalBlocked + totalPending} duration={1000} />
                  </div>
                  <div className="text-[9px] text-forge-subtle">de {totalActions}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.45 }}
            className="space-y-3"
          >
            {[
              {
                icon: CheckCircle, label: 'Acciones Seguras',
                value: totalAllowed, total: totalActions,
                accent: 'text-emerald-500', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15',
                desc: 'Pasaron el Policy Engine'
              },
              {
                icon: AlertTriangle, label: 'Amenazas Activas',
                value: totalBlocked, total: totalActions,
                accent: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15',
                desc: 'Neutralizadas por Sentinel'
              },
              {
                icon: RefreshCw, label: 'Flujo Activo',
                value: (runs ?? []).filter((r: any) => r.status === 'running').length,
                accent: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15',
                desc: `de ${(runs ?? []).length} ejecuciones`
              },
            ].map(({ icon: Icon, label, value, accent, bg, border, desc }) => (
              <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl bg-forge-surface border ${border}`}>
                <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                  <Icon size={14} className={accent} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-forge-subtle uppercase tracking-wider">{label}</div>
                  <div className={`text-xl font-bold tabular-nums ${accent}`}>
                    <Counter to={value} duration={800} />
                  </div>
                  <div className="text-[10px] text-forge-subtle">{desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Live Event Ticker ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56, duration: 0.45 }}
          className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-amber-500" />
              <span className="text-sm font-semibold text-forge-white">Feed en Tiempo Real</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-forge-elevated border border-forge-border text-forge-subtle">
                {allEvents.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-500 font-medium">en vivo</span>
            </div>
          </div>
          <div className="p-4">
            <EventTicker events={allEvents} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
