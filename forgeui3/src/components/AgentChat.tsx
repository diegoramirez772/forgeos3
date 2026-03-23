import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import type { Message, Domain } from '../types'

const DOMAIN_COLOR: Record<Domain, string> = {
  healthtech: '#00d084',
  agrotech:   '#7fc943',
  fintech:    '#f5a623',
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0,1,2].map(i => (
        <span key={i} className="typing-dot w-1 h-1 rounded-full bg-[var(--muted)]" />
      ))}
    </div>
  )
}

interface Props {
  domain:  Domain
  messages: Message[]
  running: boolean
  input:   string
  onInput: (v: string) => void
  onSend:  () => void
}

export function AgentChat({ domain, messages, running, input, onInput, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const color = DOMAIN_COLOR[domain]

  // Fix auto-scroll during streaming
  const lastMsgContent = messages.length > 0 ? messages[messages.length - 1].content : ''
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, lastMsgContent])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-24 select-none">
              {/* Orb */}
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full orb-idle"
                  style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }} />
                <div className="w-8 h-8 rounded-full orb-idle"
                  style={{ background: `radial-gradient(circle, ${color} 0%, ${color}80 100%)` }} />
              </div>
              <p style={{ color: 'var(--secondary)', fontSize: 14 }}>
                Ask anything
              </p>
              <p style={{ color: 'var(--subtle)', fontSize: 12, marginTop: 4 }}>
                Governed by ForgeOS3
              </p>
            </motion.div>
          ) : (
            messages.map(msg => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                {msg.role === 'agent' && (
                  <div className="flex gap-3 max-w-[80%]">
                    {/* Agent indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      </div>
                    </div>
                    <div>
                      {msg.loading ? <TypingDots /> : (
                        <p style={{ color: 'var(--primary)', lineHeight: 1.65, fontSize: 14 }}
                          className="whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                      <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }} className="mono">
                        {new Date(msg.ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="max-w-[75%]">
                    <div style={{
                      background:  'var(--elevated)',
                      border:      '1px solid var(--border)',
                      borderRadius: 12,
                      padding:     '10px 14px',
                      color:       'var(--primary)',
                      fontSize:    14,
                      lineHeight:  1.6,
                    }}>
                      {msg.content}
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4, textAlign: 'right' }} className="mono">
                      {new Date(msg.ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px 20px' }}>
        <div className="relative">
          <textarea
            value={input}
            onChange={e => onInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={running}
            placeholder="Message the agent..."
            rows={1}
            className="ui-input pr-12"
            style={{
              minHeight: 44,
              maxHeight: 120,
              overflowY: 'auto',
              borderColor: input ? `${color}40` : undefined,
            }}
          />
          <button
            onClick={onSend}
            disabled={running || !input.trim()}
            className="absolute right-3 bottom-3 w-7 h-7 rounded-md flex items-center justify-center transition-all"
            style={{
              background: !input.trim() || running ? 'var(--muted)' : color,
              opacity:    !input.trim() ? 0.4 : 1,
              cursor:     !input.trim() || running ? 'not-allowed' : 'pointer',
            }}>
            <ArrowUp size={13} style={{ color: '#000' }} />
          </button>
        </div>
        <p style={{ color: 'var(--subtle)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          All tool calls evaluated by ForgeOS3 before execution
        </p>
      </div>
    </div>
  )
}
