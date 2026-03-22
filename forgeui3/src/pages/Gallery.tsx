import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LogOut } from 'lucide-react'
import { AGENTS } from '../types'
import { supabase } from '../lib/supabase'

export function Gallery() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '', email: data.user.email || '' })
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 220, borderRight: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', padding: '20px 12px', zIndex: 40 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 24 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--color-forge)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>F</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-white)', fontSize: 14, letterSpacing: '-0.02em' }}>
            Forge<span style={{ color: 'var(--color-forge)' }}>UI</span>3
          </span>
        </div>

        {/* Nav */}
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--color-subtle)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
            Agents
          </p>
          {AGENTS.map(agent => (
            <button key={agent.id} onClick={() => navigate(`/canvas/${agent.domain}`)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: 2, transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: `${agent.color}14`, border: `1px solid ${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: agent.color, flexShrink: 0 }}>
                {agent.icon}
              </div>
              <span style={{ color: 'var(--color-secondary)', fontSize: 13, textAlign: 'left' }}>{agent.name}</span>
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-elevated)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'var(--color-secondary)', fontSize: 11, fontWeight: 600 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'var(--color-primary)', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ color: 'var(--color-subtle)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-subtle)', padding: 4, display: 'flex', borderRadius: 4, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtle)')}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, padding: '48px 40px', maxWidth: 'calc(100% - 220px)' }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-white)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Agents
            </h1>
            <p style={{ color: 'var(--color-subtle)', fontSize: 13 }}>
              Select an agent to start a session. All interactions are governed by ForgeOS3.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {AGENTS.map((agent, i) => (
              <motion.div key={agent.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/canvas/${agent.domain}`)}
                style={{ padding: '20px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', transition: 'border-color 0.15s' }}
                whileHover={{ y: -2 }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'var(--color-line)')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'var(--color-border)')}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${agent.color}12`, border: `1px solid ${agent.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: agent.color }}>
                    {agent.icon}
                  </div>
                  <span style={{ fontSize: 10, color: agent.color, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 4, background: `${agent.color}10`, border: `1px solid ${agent.color}20` }}>
                    {agent.domain}
                  </span>
                </div>

                <p style={{ color: 'var(--color-white)', fontWeight: 500, fontSize: 14, marginBottom: 6 }}>{agent.name}</p>
                <p style={{ color: 'var(--color-subtle)', fontSize: 12, lineHeight: 1.55, marginBottom: 16 }}>{agent.description}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: agent.color, fontSize: 12, fontWeight: 500 }}>
                  Open <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}