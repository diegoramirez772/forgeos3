interface Props { onExampleClick: (ex: string) => void; color: string }

const ACCOUNTS = [
  { id: 'ACC-9921', risk: 88, status: 'High risk'  },
  { id: 'ACC-3341', risk: 12, status: 'Clean'       },
  { id: 'ACC-7782', risk: 45, status: 'Monitoring'  },
]

const EXAMPLES = [
  'Analyze Q1 transactions for ACC-9921',
  'Flag suspicious activity last 30 days',
  'Generate fraud risk report',
  'Risk score for transaction TXN-4821',
]

export function FinCanvas({ onExampleClick, color }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: 'var(--subtle)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
        ACCOUNT RISK
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {ACCOUNTS.map(a => {
          const rc = a.risk > 70 ? '#ef4444' : a.risk > 40 ? '#f5a623' : '#00d084'
          return (
            <div key={a.id} style={{ padding: '10px 12px', borderRadius: 6, background: 'var(--elevated)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--primary)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{a.id}</span>
                <span style={{ color: rc, fontSize: 11 }}>{a.status}</span>
              </div>
              <div style={{ height: 2, borderRadius: 1, background: 'var(--border)' }}>
                <div style={{ height: '100%', borderRadius: 1, width: `${a.risk}%`, background: rc }} />
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ color: 'var(--subtle)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>EXAMPLES</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => onExampleClick(ex)}
            style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--secondary)', fontSize: 12, cursor: 'pointer', lineHeight: 1.4 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            "{ex}"
          </button>
        ))}
      </div>
      <div style={{ padding: '10px 12px', borderRadius: 6, border: `1px solid ${color}20`, background: `${color}08`, color: `${color}bb`, fontSize: 11, lineHeight: 1.5 }}>
        Transfer lock: <strong>execute_transfer</strong> frozen until human authorization
      </div>
    </div>
  )
}
