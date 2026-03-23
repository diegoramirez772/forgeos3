import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Zap, Shield } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-transparent overflow-hidden">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 no-scrollbar scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-24 select-none">
              {/* Premium Orb */}
              <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-pulse blur-2xl"
                  style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }} />
                <div className="w-12 h-12 rounded-full shadow-[0_0_40px_-5px_var(--color-forge)] border border-white/10 flex items-center justify-center"
                   style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                   <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white/90 mb-2">Buen día, Durango.</h2>
              <p className="text-sm text-white/40 max-w-[280px]">
                Soy tu asistente especializado en <span style={{ color }}>{domain}</span>. ¿En qué puedo ayudarte hoy?
              </p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg`}>

                {msg.role === 'agent' && (
                  <div className="flex flex-col gap-4 max-w-[85%]">
                    {/* Agent reasoning - Glass Style */}
                    {msg.thoughts && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="bg-white/[0.03] border border-white/5 rounded-[22px] px-5 py-4 backdrop-blur-3xl overflow-hidden relative group/thought">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover/thought:bg-forge transition-colors" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Análisis Sentinel</span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-white/50 italic font-medium whitespace-pre-wrap selection:bg-forge/40">
                          {msg.thoughts}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      {/* Avatar tint */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                          {msg.loading ? <div className="w-1 h-1 rounded-full bg-current animate-ping" /> : <span>{domain[0].toUpperCase()}</span>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {msg.loading ? <div className="px-4 py-2"><TypingDots /></div> : (
                          <div className="text-white/90 leading-[1.7] text-[14.5px] font-medium whitespace-pre-wrap selection:bg-forge/40">
                            {msg.content}
                          </div>
                        )}

                        {/* Artifacts - Premium Cards */}
                        {msg.artifacts && msg.artifacts.length > 0 && (
                          <div className="grid gap-4 pt-4 border-t border-white/5">
                            {msg.artifacts.map(art => (
                              <motion.div key={art.id} whileHover={{ y: -2 }}
                                className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                   <Zap size={40} />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center bg-white/5 border border-white/10 text-xl shadow-lg">
                                      {art.type === 'ticket' ? '🎫' : art.type === 'map' ? '🗺️' : '📊'}
                                    </div>
                                    <div>
                                      <h4 className="text-[13px] font-bold text-white group-hover:text-forge-light transition-colors">{art.title}</h4>
                                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Artifact Engine v1</span>
                                    </div>
                                  </div>
                                  <ArrowUp size={14} className="rotate-45 text-white/10 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-[11.5px] text-white/40 leading-relaxed font-mono bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                                  {typeof art.data === 'string' ? art.data : JSON.stringify(art.data, null, 2)}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/10 uppercase tracking-widest pt-2">
                           Sentinel Audit · {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="max-w-[70%] flex flex-col items-end">
                    <div className="bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 shadow-2xl backdrop-blur-md">
                      <p className="text-[14.5px] leading-relaxed text-white/90 font-medium whitespace-pre-wrap selection:bg-forge/40">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-3 mr-2">
                      {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input - Premium Floating Bar */}
      <div className="p-8 pb-10">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-forge/20 to-indigo-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-[30px]" />
          <div className="relative flex items-end gap-3 bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-[28px] p-3 pl-6 pr-3 transition-all group-focus-within:border-white/20 group-focus-within:bg-white/[0.05]">
            <textarea
              value={input}
              onChange={e => onInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={running}
              placeholder="Escribe una instrucción para el agente..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-[14.5px] py-3 text-white placeholder-white/20 resize-none no-scrollbar h-[44px] max-h-[160px]"
            />
            <button
              onClick={onSend}
              disabled={running || !input.trim()}
              className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all shadow-xl active:scale-95 flex-shrink-0 ${
                !input.trim() || running 
                  ? 'bg-white/5 text-white/10' 
                  : 'bg-white text-black hover:scale-105'
              }`}>
              <ArrowUp size={18} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
               <Shield size={10} className="text-emerald-500/40" /> Policy Guard Enabled
            </div>
            <div className="w-[1px] h-3 bg-white/5" />
            <div className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] font-mono">
               open-claw-model-v4
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
