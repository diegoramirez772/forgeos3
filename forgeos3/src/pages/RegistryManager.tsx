import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Package, Shield, Layers } from 'lucide-react'
import { DOMAIN_PROFILES, TOOL_PACKS, POLICY_PRESETS } from '../lib/constants'

const TABS = [
  { label: 'Domain Profiles', icon: Layers,  count: DOMAIN_PROFILES.length },
  { label: 'Tool Packs',      icon: Package, count: TOOL_PACKS.length      },
  { label: 'Policy Presets',  icon: Shield,  count: POLICY_PRESETS.length  },
]

const DOMAIN_STYLE: Record<string, { pill: string; icon: string }> = {
  health:    { pill: 'bg-blue-500/10 border-blue-500/20 text-blue-500',     icon: 'text-blue-400'     },
  gov:       { pill: 'bg-purple-500/10 border-purple-500/20 text-purple-500', icon: 'text-purple-400' },
  marketing: { pill: 'bg-amber-400/10 border-amber-400/20 text-amber-500',  icon: 'text-amber-400'    },
  custom:    { pill: 'bg-forge-elevated border-forge-border text-forge-subtle', icon: 'text-forge-subtle' },
}

const SENS_STYLE: Record<string, string> = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-500',
  high:     'bg-amber-400/10 border-amber-400/20 text-amber-500',
  medium:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
  low:      'bg-forge-elevated border-forge-border text-forge-subtle',
}

const fade = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export function RegistryManager() {
  const [tab, setTab] = useState(0)

  return (
    <div className="min-h-screen bg-forge-bg">
      {/* Topbar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-forge-border sticky top-0 z-10 bg-forge-bg/90 backdrop-blur-sm">
        <div>
          <h1 className="text-base font-semibold text-forge-white">Registry</h1>
          <p className="text-xs text-forge-subtle mt-0.5">Reusable components for agent creation</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-black text-xs font-bold rounded-xl hover:bg-amber-300 transition-all"
          style={{ boxShadow: '0 0 14px rgba(245,158,11,0.2)' }}>
          <Plus size={12} /> New
        </button>
      </div>

      <div className="px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-forge-surface border border-forge-border p-1 rounded-2xl w-fit">
          {TABS.map(({ label, icon: Icon, count }, i) => (
            <button key={label} onClick={() => setTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === i ? 'bg-amber-400 text-black' : 'text-forge-secondary hover:text-forge-primary'}`}>
              <Icon size={13} />
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === i ? 'bg-black/15 text-black' : 'bg-forge-elevated text-forge-subtle'}`}>{count}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Domain Profiles */}
          {tab === 0 && (
            <motion.div key="domains" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 gap-4">
              {DOMAIN_PROFILES.map(d => {
                const s = DOMAIN_STYLE[d.key]
                return (
                  <motion.div key={d.id} variants={fade}
                    className="group p-5 bg-forge-surface border border-forge-border rounded-2xl hover:border-forge-line transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-forge-elevated border border-forge-border flex items-center justify-center text-xl ${s.icon}`}>
                        {d.icon}
                      </div>
                      <button className="p-1.5 text-forge-subtle hover:text-forge-primary rounded-lg hover:bg-forge-elevated transition-colors opacity-0 group-hover:opacity-100">
                        <Edit2 size={13} />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-forge-white mb-1">{d.name}</h3>
                    <p className="text-xs text-forge-subtle leading-relaxed mb-4">{d.description}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${s.pill}`}>{d.key}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${d.riskMode === 'safe' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-forge-elevated border-forge-border text-forge-subtle'}`}>
                        {d.riskMode} mode
                      </span>
                    </div>
                  </motion.div>
                )
              })}
              {/* Add new card */}
              <motion.div variants={fade}
                className="p-5 bg-forge-surface border border-dashed border-forge-border rounded-2xl hover:border-forge-line transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-forge-subtle hover:text-forge-secondary min-h-40">
                <Plus size={20} />
                <span className="text-xs font-medium">New Domain Profile</span>
              </motion.div>
            </motion.div>
          )}

          {/* Tool Packs */}
          {tab === 1 && (
            <motion.div key="packs" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-4">
              {TOOL_PACKS.map(tp => {
                const ds = DOMAIN_STYLE[tp.domain]
                return (
                  <motion.div key={tp.id} variants={fade}
                    className="group p-5 bg-forge-surface border border-forge-border rounded-2xl hover:border-forge-line transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-sm font-bold text-forge-white">{tp.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${ds.pill}`}>{tp.domain}</span>
                        </div>
                        <p className="text-xs text-forge-subtle">{tp.description} · {tp.tools.length} tools</p>
                      </div>
                      <button className="p-1.5 text-forge-subtle hover:text-forge-primary rounded-lg hover:bg-forge-elevated transition-colors opacity-0 group-hover:opacity-100">
                        <Edit2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tp.tools.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-forge-elevated/60 border border-forge-border rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.sensitivity === 'critical' ? 'bg-red-500' : t.sensitivity === 'high' ? 'bg-amber-400' : 'bg-forge-subtle'}`} />
                            <code className="text-[11px] font-mono text-amber-500 truncate">{t.name}</code>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide shrink-0 ${SENS_STYLE[t.sensitivity]}`}>
                            {t.sensitivity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Policy Presets */}
          {tab === 2 && (
            <motion.div key="policies" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="space-y-3">
              {POLICY_PRESETS.map(p => (
                <motion.div key={p.id} variants={fade}
                  className="group flex items-center gap-5 p-5 bg-forge-surface border border-forge-border rounded-2xl hover:border-forge-line transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-forge-white">{p.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${p.level === 'strict' ? 'bg-red-500/10 border-red-500/20 text-red-500' : p.level === 'medium' ? 'bg-amber-400/10 border-amber-400/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                        {p.level}
                      </span>
                    </div>
                    <p className="text-xs text-forge-subtle">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`w-6 h-2 rounded-full transition-colors ${i <= p.strictness ? 'bg-amber-400' : 'bg-forge-elevated'}`} />
                    ))}
                  </div>
                  <button className="p-1.5 text-forge-subtle hover:text-forge-primary rounded-lg hover:bg-forge-elevated transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    <Edit2 size={13} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}