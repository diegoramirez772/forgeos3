import { motion, AnimatePresence } from 'framer-motion'
import type { GovernanceEvent, Domain } from '../types'

const DOMAIN_COLOR: Record<Domain, string> = {
  healthtech: '#00d084',
  agrotech:   '#7fc943',
  fintech:    '#f5a623',
}

interface Props {
  domain:  Domain
  events:  GovernanceEvent[]
  running: boolean
}

export function GovernanceBar({ domain, events, running }: Props) {
  const color  = DOMAIN_COLOR[domain]
  const recent = events.slice(-5)

  return (
    <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-4 px-6 py-2.5">

        {/* Status dot */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-4 h-4">
            <div className={`w-2 h-2 rounded-full ${running ? 'orb-active' : 'orb-idle'}`}
              style={{ background: running ? color : 'var(--muted)' }} />
            {running && (
              <div className="absolute inset-0 rounded-full"
                style={{ border: `1px solid ${color}`, animation: 'orb-ring 1.5s ease-out infinite', opacity: 0.5 }} />
            )}
          </div>
          <span className="mono text-[10px] tracking-wider"
            style={{ color: running ? color : 'var(--subtle)' }}>
            {running ? 'EVALUATING' : 'READY'}
          </span>
        </div>

        <span style={{ color: 'var(--border)' }}>|</span>

        {/* Events */}
        <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="popLayout">
            {recent.length === 0 ? (
              <span className="mono text-[11px]" style={{ color: 'var(--subtle)' }}>
                Waiting for tool calls...
              </span>
            ) : (
              recent.map(e => {
                const dColor = e.decision === 'allowed'
                  ? '#00d084' : e.decision === 'blocked'
                  ? '#ef4444' : '#f5a623'
                return (
                  <motion.div key={e.id} className="gov-event"
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display:     'flex',
                      alignItems:  'center',
                      gap:         6,
                      padding:     '3px 8px',
                      borderRadius: 4,
                      border:      `1px solid ${dColor}22`,
                      background:  `${dColor}0a`,
                      flexShrink:  0,
                    }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: dColor }} />
                    <span className="mono text-[10px]" style={{ color: 'var(--secondary)' }}>
                      {e.toolName}
                    </span>
                    <span className="mono text-[10px]" style={{ color: dColor }}>
                      {e.decision === 'approval_required' ? 'pending' : e.decision}
                    </span>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* ForgeOS3 badge */}
        <div className="shrink-0 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--forge)' }} />
          <span className="mono text-[10px]" style={{ color: 'var(--subtle)' }}>
            ForgeOS3
          </span>
        </div>
      </div>
    </div>
  )
}
