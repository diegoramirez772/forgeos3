import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, RotateCcw, Shield } from 'lucide-react'
import { GovernanceBar } from '../components/GovernanceBar'
import { AgentChat }     from '../components/AgentChat'
import { HealthCanvas }  from '../canvases/HealthCanvas'
import { AgroCanvas }    from '../canvases/AgroCanvas'
import { FinCanvas }     from '../canvases/FinCanvas'
import { useAgentStore } from '../store/agentStore'
import { runAgent }      from '../lib/agentClient'
import { AGENTS, type Domain, type GovernanceEvent } from '../types'

export function AgentCanvas() {
  const { domain } = useParams<{ domain: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [sideOpen, setSideOpen] = useState(true)

  const {
    messages, govEvents, running,
    addMessage, updateLast, addGovEvent,
    setRunning, clear,
  } = useAgentStore()

  const agent = AGENTS.find(a => a.domain === domain)

  const handleSend = useCallback(async () => {
    if (!agent || !input.trim() || running) return

    const userMsg = {
      id: crypto.randomUUID(), role: 'user' as const,
      content: input.trim(), ts: Date.now(),
    }
    addMessage(userMsg)
    setInput('')
    setRunning(true)
    addMessage({ id: crypto.randomUUID(), role: 'agent' as const, content: '', ts: Date.now(), loading: true })

    await runAgent({
      domain:    agent.domain as Domain,
      agentId:   agent.agentId,
      agentName: agent.name,
      input:     userMsg.content,
      onToken:   (chunk) => {
        updateLast((messages[messages.length - 1]?.content ?? '') + chunk)
      },
      onGovEvent: (evt) => {
        addGovEvent({
          id: crypto.randomUUID(),
          toolName: evt.toolName,
          decision: evt.decision as GovernanceEvent['decision'],
          reason: evt.reason,
          ts: Date.now(),
        })
      },
      onDone:  (output) => { updateLast(output); setRunning(false) },
      onError: (err)    => { updateLast(`Error: ${err}`); setRunning(false) },
    })
  }, [input, running, agent, messages, addMessage, updateLast, addGovEvent, setRunning])

  if (!agent) { navigate('/gallery'); return null }

  const ContextPanel = domain === 'healthtech' ? HealthCanvas
    : domain === 'agrotech' ? AgroCanvas : FinCanvas

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '0 20px', height: 52, flexShrink: 0 }}
        className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/gallery')}
            className="flex items-center transition-opacity hover:opacity-60"
            style={{ color: 'var(--subtle)' }}>
            <ChevronLeft size={16} />
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <div className="flex items-center gap-2">
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: `${agent.color}12`, border: `1px solid ${agent.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: agent.color,
            }}>
              {agent.icon}
            </div>
            <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 500 }}>{agent.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSideOpen(p => !p)}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{
              color:        sideOpen ? 'var(--secondary)' : 'var(--subtle)',
              fontSize:     12,
              padding:      '5px 10px',
              borderRadius: 6,
              border:       `1px solid ${sideOpen ? 'var(--border)' : 'transparent'}`,
            }}>
            <Shield size={11} />
            <span className="mono text-[10px]">
              {govEvents.length > 0 ? govEvents.length : ''} Events
            </span>
          </button>

          <button onClick={clear}
            className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{
              color: 'var(--subtle)', fontSize: 12, padding: '5px 10px',
              borderRadius: 6, border: '1px solid transparent',
            }}>
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* Governance bar */}
      <div style={{ flexShrink: 0 }}>
        <GovernanceBar domain={agent.domain as Domain} events={govEvents} running={running} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          <ContextPanel onExampleClick={setInput} color={agent.color} />
        </div>

        {/* Chat */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AgentChat
            domain={agent.domain as Domain}
            messages={messages}
            running={running}
            input={input}
            onInput={setInput}
            onSend={handleSend}
          />
        </div>

        {/* Right panel - governance events */}
        <AnimatePresence>
          {sideOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ borderLeft: '1px solid var(--border)', overflowY: 'auto', overflowX: 'hidden', flexShrink: 0, background: 'var(--surface)' }}>

              <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 16px' }}>
                <p style={{ color: 'var(--secondary)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
                  GOVERNANCE LOG
                </p>
              </div>

              <div>
                {govEvents.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--subtle)', fontSize: 12 }}>No events yet</p>
                  </div>
                ) : (
                  [...govEvents].reverse().map(e => {
                    const dColor = e.decision === 'allowed' ? '#00d084'
                      : e.decision === 'blocked' ? '#ef4444' : '#f5a623'
                    return (
                      <div key={e.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                          <code style={{ color: 'var(--secondary)', fontSize: 11 }}>{e.toolName}</code>
                          <span style={{ color: dColor, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                            {e.decision === 'approval_required' ? 'pending' : e.decision}
                          </span>
                        </div>
                        {e.reason && (
                          <p style={{ color: 'var(--subtle)', fontSize: 11, lineHeight: 1.5 }}>{e.reason}</p>
                        )}
                        <p style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginTop: 4 }}>
                          {new Date(e.ts).toLocaleTimeString()}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}