import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, ChevronDown, AlertTriangle, Clock, CheckCircle, XCircle, Timer,
  Activity, Play, Square, Zap, ChevronRight
} from 'lucide-react'
import { useRunStore } from '../store/runStore'
import { useAgentStore } from '../store/agentStore'
import type { ToolEvent } from '../types/run'
import type { Agent } from '../types/agent'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:4000'

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
  return `${Math.round(diff / 3600000)}h ago`
}

const D_CONFIG: Record<string, { dot: string; ring: string; text: string; bg: string; label: string; border: string }> = {
  allowed:          { dot: 'bg-emerald-500', ring: 'ring-emerald-500/40', text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'allowed',  border: 'border-emerald-500/60' },
  blocked:          { dot: 'bg-red-500',     ring: 'ring-red-500/40',     text: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/20',         label: 'blocked',  border: 'border-red-500/60'     },
  approval_required:{ dot: 'bg-amber-400',   ring: 'ring-amber-400/40',   text: 'text-amber-500',   bg: 'bg-amber-400/10 border-amber-400/20',     label: 'approval', border: 'border-amber-400/60'   },
}

const STATUS_CONFIG: Record<string, { text: string; dot: string }> = {
  finished:         { text: 'text-emerald-500', dot: 'bg-emerald-500' },
  blocked:          { text: 'text-red-500',     dot: 'bg-red-500'     },
  waiting_approval: { text: 'text-amber-500',   dot: 'bg-amber-400'   },
  running:          { text: 'text-blue-400',    dot: 'bg-blue-400'    },
  safe_mode:        { text: 'text-red-500',     dot: 'bg-red-500'     },
}

type RunningState = 'idle' | 'running' | 'done' | 'error'

export function SentinelStudio() {
  const { runs, selectedRun, setSelectedRun, fetchRuns, fetchApprovals } = useRunStore()
  const { agents, fetchAgents, isLive } = useAgentStore()
  const [selectedEvent, setSelectedEvent] = useState<ToolEvent | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  // Run panel state
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [input, setInput] = useState('')
  const [streamOutput, setStreamOutput] = useState('')
  const [govEvents, setGovEvents] = useState<Array<{ toolName: string; decision: string; reason: string }>>([])
  const [runState, setRunState] = useState<RunningState>('idle')
  const [runError, setRunError] = useState<string | null>(null)
  const [showRunPanel, setShowRunPanel] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const run = selectedRun || runs[0]
  const riskData = (run?.toolEvents ?? []).map((e, i) => ({ name: e.toolName, risk: e.riskScore, i: i + 1 }))
  const sc = run ? (STATUS_CONFIG[run.status] || STATUS_CONFIG['finished']) : null

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [streamOutput])

  useEffect(() => {
    fetchAgents()
    // Set first agent as default
  }, [fetchAgents])

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) setSelectedAgent(agents[0])
  }, [agents, selectedAgent])

  const startRun = async () => {
    if (!selectedAgent || !input.trim() || runState === 'running') return
    setRunState('running')
    setStreamOutput('')
    setGovEvents([])
    setRunError(null)

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${AGENT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId:   selectedAgent.id,
          agentName: selectedAgent.name,
          domain:    selectedAgent.domainProfile,
          input:     input.trim(),
        }),
        signal: abortRef.current.signal,
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response stream from agent')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventType = ''
        let dataLine = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) eventType = line.slice(7).trim()
          else if (line.startsWith('data: ')) dataLine = line.slice(6).trim()
          else if (line === '' && eventType && dataLine) {
            try {
              const payload = JSON.parse(dataLine)
              if (eventType === 'token')     setStreamOutput(prev => prev + payload.text)
              if (eventType === 'gov_event') setGovEvents(prev => [...prev, payload])
              if (eventType === 'done')      setRunState('done')
              if (eventType === 'error') {
                setRunError(payload.message)
                setRunState('error')
              }
            } catch { /* ignore parse errors */ }
            eventType = ''
            dataLine = ''
          }
        }
      }

      // Refresh runs and approvals after completion
      await fetchRuns()
      await fetchApprovals()
      setRunState('done')

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setRunError(err.message || 'Connection to agent failed')
        setRunState('error')
      } else {
        setRunState('idle')
      }
    }
  }

  const stopRun = () => {
    abortRef.current?.abort()
  }

  return (
    <div className="min-h-screen bg-forge-bg">
      <div className="flex items-center justify-between px-8 py-5 border-b border-forge-border sticky top-0 z-10 bg-forge-bg/90 backdrop-blur-sm">
        <div>
          <h1 className="text-base font-semibold text-forge-white">Sentinel Studio</h1>
          <p className="text-xs text-forge-subtle mt-0.5">Real-time observability and agent runner</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRunPanel(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              showRunPanel
                ? 'bg-amber-400/10 border-amber-400/20 text-amber-500'
                : 'bg-forge-surface border-forge-border text-forge-secondary hover:text-forge-primary hover:border-forge-line'
            }`}>
            <Zap size={12} />
            Run Agent
          </button>
          <div className="relative">
            <button onClick={() => setShowPicker(p => !p)}
              className="flex items-center gap-2 px-4 py-2 bg-forge-surface border border-forge-border rounded-xl text-sm text-forge-primary hover:border-forge-line transition-colors">
              <Eye size={13} className="text-amber-500" />
              <span className="max-w-36 truncate">{run?.agentName || 'Select run'}</span>
              <ChevronDown size={12} className={`text-forge-subtle transition-transform ${showPicker ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showPicker && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-80 bg-forge-surface border border-forge-border rounded-2xl shadow-forge-lg z-20 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-forge-border">
                    <span className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest">Select Run</span>
                  </div>
                  {runs.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-forge-subtle">No runs yet — use Run Agent to start one</div>
                  ) : runs.map(r => {
                    const s = STATUS_CONFIG[r.status] || STATUS_CONFIG['finished']
                    return (
                      <button key={r.id} onClick={() => { setSelectedRun(r); setSelectedEvent(null); setShowPicker(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-forge-elevated text-left transition-colors border-b border-forge-border/50 last:border-0 ${r.id === run?.id ? 'bg-forge-elevated' : ''}`}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-forge-primary font-medium truncate">{r.agentName}</div>
                          <div className="text-[10px] text-forge-subtle">{r.domain} · {timeAgo(r.startedAt)}</div>
                        </div>
                        <span className={`text-[10px] font-semibold ${s.text} shrink-0`}>{r.status.replace('_', ' ')}</span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── Run Agent Panel ─────────────────────────────── */}
        <AnimatePresence>
          {showRunPanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-forge-border">
                <Zap size={13} className="text-amber-500" />
                <span className="text-sm font-bold text-forge-white">Run Agent</span>
                <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                  isLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {isLive ? 'OpenClaw Online' : 'Agent Offline'}
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Agent selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest">Agent</label>
                  <div className="flex gap-2 flex-wrap">
                    {agents.map(a => (
                      <button key={a.id} onClick={() => setSelectedAgent(a)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedAgent?.id === a.id
                            ? 'bg-amber-400/10 border-amber-400/25 text-amber-500'
                            : 'bg-forge-elevated border-forge-border text-forge-secondary hover:text-forge-primary'
                        }`}>
                        {a.name}
                      </button>
                    ))}
                    {agents.length === 0 && <span className="text-xs text-forge-subtle">No agents deployed yet</span>}
                  </div>
                </div>

                {/* Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest">Task Input</label>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`e.g. ${selectedAgent?.domainProfile === 'healthtech' ? 'Summarize patient intake form #4821' : selectedAgent?.domainProfile === 'agrotech' ? 'Analyze crop health for field #22' : 'Analyze Q1 transactions for fraud'}`}
                    rows={3}
                    disabled={runState === 'running'}
                    className="forge-input resize-none text-sm leading-relaxed disabled:opacity-50"
                  />
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={runState === 'running' ? stopRun : startRun}
                    disabled={!isLive || !selectedAgent || (!input.trim() && runState !== 'running')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      runState === 'running'
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15'
                        : 'bg-amber-400 text-black hover:bg-amber-300'
                    }`}
                    style={runState !== 'running' ? { boxShadow: '0 0 14px rgba(245,158,11,0.2)' } : {}}>
                    {runState === 'running' ? <><Square size={12} /> Stop</> : <><Play size={12} /> Run</>}
                  </button>
                  {(runState === 'done' || runState === 'error') && (
                    <button onClick={() => { setStreamOutput(''); setGovEvents([]); setRunState('idle'); setRunError(null) }}
                      className="px-4 py-2.5 rounded-xl text-xs text-forge-subtle hover:text-forge-primary border border-forge-border hover:border-forge-line transition-colors">
                      Clear
                    </button>
                  )}
                </div>

                {/* Stream output */}
                {(streamOutput || runState === 'running') && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest">Agent Output</div>
                    <div ref={outputRef}
                      className="h-56 overflow-y-auto bg-forge-bg border border-forge-border rounded-xl p-4 font-mono text-xs text-forge-secondary leading-relaxed no-scrollbar">
                      {streamOutput || <span className="text-forge-muted animate-pulse">Connecting to agent…</span>}
                      {runState === 'running' && (
                        <span className="inline-block w-2 h-3 bg-amber-400 ml-0.5 animate-pulse rounded-sm" />
                      )}
                    </div>
                  </div>
                )}

                {/* Governance events */}
                {govEvents.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest">Policy Engine Decisions</div>
                    <div className="space-y-1.5">
                      {govEvents.map((e, i) => {
                        const cfg = D_CONFIG[e.decision] || D_CONFIG['blocked']
                        return (
                          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                            <code className="font-mono">{e.toolName}</code>
                            <ChevronRight size={10} className="opacity-60" />
                            <span className="font-bold uppercase tracking-wide">{cfg.label}</span>
                            {e.reason && <span className="text-forge-subtle ml-auto text-[10px]">{e.reason}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {runError && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-xs text-red-400">
                    <AlertTriangle size={12} />
                    {runError}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Run Inspector ──────────────────────────────── */}
        {run ? (
          <div className="space-y-5">
            <div className="p-5 bg-forge-surface border border-forge-border rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-base font-bold text-forge-white">{run.agentName}</h2>
                    {sc && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forge-elevated border border-forge-border">
                        <div className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${run.status === 'running' ? 'animate-pulse' : ''}`} />
                        <span className={`text-[10px] font-semibold ${sc.text}`}>{run.status.replace('_', ' ')}</span>
                      </div>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-forge-elevated border border-forge-border text-forge-subtle`}>
                      {run.domain}
                    </span>
                  </div>
                  <p className="text-sm text-forge-secondary leading-relaxed">"{run.input}"</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-3xl font-bold ${(run.loopRiskScore ?? 0) > 30 ? 'text-red-500' : (run.loopRiskScore ?? 0) > 15 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {run.loopRiskScore ?? 0}
                  </div>
                  <div className="text-[10px] text-forge-subtle">loop risk</div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-forge-border">
                <div className="text-[10px] font-bold text-forge-subtle uppercase tracking-widest mb-4">Tool Timeline</div>
                {(run.toolEvents ?? []).length === 0 ? (
                  <p className="text-xs text-forge-subtle">No tool events yet</p>
                ) : (
                  <div className="relative">
                    <div className="absolute top-4 left-4 right-4 h-px bg-forge-border" />
                    <div className="flex gap-8 relative overflow-x-auto no-scrollbar pb-2">
                      {(run.toolEvents ?? []).map((event, i) => {
                        const cfg = D_CONFIG[event.decision]
                        const active = selectedEvent?.id === event.id
                        const hovered = hoveredEvent === event.id
                        return (
                          <button key={event.id}
                            onClick={() => setSelectedEvent(active ? null : event)}
                            onMouseEnter={() => setHoveredEvent(event.id)}
                            onMouseLeave={() => setHoveredEvent(null)}
                            className="flex flex-col items-center gap-2.5 shrink-0 group outline-none">
                            <div className={`w-8 h-8 rounded-full border-2 border-forge-bg flex items-center justify-center z-10 transition-all duration-150 ${cfg.dot} ${active ? `scale-125 ring-4 ${cfg.ring}` : hovered ? `ring-2 ${cfg.ring} scale-110` : ''}`}>
                              <span className="text-[9px] font-bold text-white">{i + 1}</span>
                            </div>
                            <code className={`text-[10px] font-mono transition-colors ${active ? cfg.text : hovered ? cfg.text : 'text-forge-subtle'}`}>
                              {event.toolName}
                            </code>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border transition-all ${active || hovered ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-forge-elevated border-forge-border text-forge-subtle'}`}>
                              {cfg.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2">
                <AnimatePresence mode="wait">
                  {selectedEvent ? (
                    <motion.div key={selectedEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-forge-border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-forge-white">Event Detail</span>
                          <code className="text-xs font-mono text-amber-500">{selectedEvent.toolName}</code>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${D_CONFIG[selectedEvent.decision].bg} ${D_CONFIG[selectedEvent.decision].text}`}>
                          {selectedEvent.decision === 'allowed' ? <CheckCircle size={11} /> : selectedEvent.decision === 'blocked' ? <XCircle size={11} /> : <Timer size={11} />}
                          {D_CONFIG[selectedEvent.decision].label}
                        </div>
                      </div>
                      <div className="p-5 space-y-0">
                        {[
                          { label: 'Tool',      value: selectedEvent.toolName,                                                   mono: true  },
                          { label: 'Decision',  value: selectedEvent.decision.replace('_', ' '),                                 mono: false },
                          { label: 'Risk Score',value: String(selectedEvent.riskScore),                                          mono: false },
                          { label: 'Timestamp', value: new Date(selectedEvent.timestamp).toLocaleTimeString(),                   mono: false },
                          { label: 'Duration',  value: selectedEvent.durationMs ? `${selectedEvent.durationMs}ms` : 'Pending…', mono: false },
                        ].map(({ label, value, mono }, i) => (
                          <div key={label} className={`flex items-center justify-between py-3 ${i < 4 ? 'border-b border-forge-border/40' : ''}`}>
                            <span className="text-xs text-forge-subtle">{label}</span>
                            <span className={`text-xs font-semibold ${mono ? 'font-mono text-amber-500' : 'text-forge-primary'} capitalize`}>{value}</span>
                          </div>
                        ))}
                      </div>
                      {selectedEvent.reason && (
                        <div className="mx-5 mb-5 p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle size={11} className="text-red-500" />
                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Block Reason</span>
                          </div>
                          <p className="text-xs text-forge-secondary leading-relaxed">{selectedEvent.reason}</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-64 bg-forge-surface border border-forge-border rounded-2xl flex flex-col items-center justify-center gap-3">
                      <Eye size={24} className="text-forge-muted" />
                      <p className="text-sm text-forge-subtle">Click a timeline event to inspect</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3.5 border-b border-forge-border">
                    <Activity size={13} className="text-amber-500" />
                    <span className="text-sm font-bold text-forge-white">Risk Score</span>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={110}>
                      <LineChart data={riskData}>
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#555' }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#555' }} tickLine={false} axisLine={false} width={20} />
                        <Tooltip contentStyle={{ background: '#181818', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#888' }} />
                        <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
                        <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-forge-surface border border-forge-border rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3.5 border-b border-forge-border">
                    <Clock size={13} className="text-amber-500" />
                    <span className="text-sm font-bold text-forge-white">Run Stats</span>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {[
                      { label: 'Started',  value: timeAgo(run.startedAt) },
                      { label: 'Events',   value: (run.toolEvents ?? []).length },
                      { label: 'Allowed',  value: (run.toolEvents ?? []).filter(e => e.decision === 'allowed').length,            color: 'text-emerald-500' },
                      { label: 'Blocked',  value: (run.toolEvents ?? []).filter(e => e.decision === 'blocked').length,            color: 'text-red-500'     },
                      { label: 'Approval', value: (run.toolEvents ?? []).filter(e => e.decision === 'approval_required').length,  color: 'text-amber-500'   },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-forge-subtle">{label}</span>
                        <span className={`text-xs font-bold ${color || 'text-forge-primary'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
            <Eye size={32} className="text-forge-muted" />
            <p className="text-sm text-forge-subtle">No runs yet — use the Run Agent panel to start one</p>
            <button onClick={() => setShowRunPanel(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition-all"
              style={{ boxShadow: '0 0 14px rgba(245,158,11,0.2)' }}>
              <Zap size={13} fill="currentColor" /> Launch First Run
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
