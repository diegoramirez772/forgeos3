import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Shield, Zap, Lock, Eye } from 'lucide-react'
import { AGENTS } from '../types'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const }
})

export function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-forge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>F</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--color-white)', letterSpacing: '-0.02em', fontSize: 15 }}>
              Forge<span style={{ color: 'var(--color-forge)' }}>UI</span>3
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/signin')} className="ui-btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
              Sign in
            </button>
            <button onClick={() => navigate('/signup')} className="ui-btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <motion.div {...fade(0)}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 99, border: '1px solid var(--color-border)', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ color: 'var(--color-secondary)', fontSize: 12 }}>OpenClaw · Governed by ForgeOS3</span>
          </div>
        </motion.div>

        {/* Orb */}
        <motion.div {...fade(0.05)} style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="orb-idle" style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)' }} />
            <div className="orb-active" style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed, rgba(124,58,237,0.5))', boxShadow: '0 0 32px rgba(124,58,237,0.25)' }} />
          </div>
        </motion.div>

        <motion.h1 {...fade(0.1)} style={{ fontSize: 48, fontWeight: 600, color: 'var(--color-white)', letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 20 }}>
          The workspace for<br />
          <span style={{ color: 'var(--color-secondary)' }}>governed AI agents</span>
        </motion.h1>

        <motion.p {...fade(0.15)} style={{ color: 'var(--color-subtle)', fontSize: 16, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 36px' }}>
          ForgeUI3 is where users interact with AI agents built on OpenClaw. Every tool call evaluated, every action audited by ForgeOS3.
        </motion.p>

        <motion.div {...fade(0.2)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <button onClick={() => navigate('/signup')} className="ui-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 14 }}>
            Start for free <ArrowRight size={14} />
          </button>
          <button onClick={() => navigate('/gallery')} className="ui-btn-ghost"
            style={{ padding: '10px 20px', fontSize: 14 }}>
            View agents
          </button>
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <motion.div {...fade(0.25)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: Shield, label: 'Policy Engine',    sub: 'Every tool evaluated',   color: '#7c3aed' },
            { icon: Eye,    label: 'Full Audit Trail',  sub: 'Every action logged',    color: '#16a34a' },
            { icon: Lock,   label: 'Human Approvals',   sub: 'Sensitive ops reviewed', color: '#d97706' },
            { icon: Zap,    label: 'Loop Guard',         sub: 'Runaway protection',     color: '#dc2626' },
          ].map(({ icon: Icon, label, sub, color }) => (
            <div key={label} style={{ padding: '16px', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, background: `${color}14`, border: `1px solid ${color}22` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <p style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{label}</p>
              <p style={{ color: 'var(--color-subtle)', fontSize: 12 }}>{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Agents preview */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 100px' }}>
        <motion.div {...fade(0.3)}>
          <p style={{ color: 'var(--color-subtle)', fontSize: 12, letterSpacing: '0.08em', marginBottom: 20, textTransform: 'uppercase' }}>
            Available agents
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {AGENTS.map(agent => (
              <div key={agent.id} onClick={() => navigate('/signup')}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-line)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${agent.color}12`, border: `1px solid ${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: agent.color, flexShrink: 0 }}>
                  {agent.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13 }}>{agent.name}</p>
                  <p style={{ color: 'var(--color-subtle)', fontSize: 12 }}>{agent.tagline}</p>
                </div>
                <span style={{ color: agent.color, fontSize: 11, fontFamily: 'monospace' }}>{agent.domain}</span>
                <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>ForgeUI3 · TEAM GPT · Durango 2025</span>
          <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>Built on ForgeOS3 + OpenClaw</span>
        </div>
      </div>
    </div>
  )
}
