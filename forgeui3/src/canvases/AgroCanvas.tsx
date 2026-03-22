interface Props { onExampleClick: (ex: string) => void; color: string }

const FIELDS = [
  { id: '#22', status: 'Needs treatment', risk: 'high',   pct: 85 },
  { id: '#8',  status: 'Healthy',         risk: 'low',    pct: 12 },
  { id: '#15', status: 'Monitoring',      risk: 'medium', pct: 44 },
]
const RISK_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f5a623', low: '#00d084' }

const EXAMPLES = [
  'Analyze crop sensor data for field #22',
  'Predict yield for the north sector',
  'Soil moisture 34% — recommend treatment',
  'Compare field #8 vs last month',
]

export function AgroCanvas({ onExampleClick, color }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: 'var(--subtle)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
        FIELD STATUS
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {FIELDS.map(f => (
          <div key={f.id} style={{ padding: '10px 12px', borderRadius: 6, background: 'var(--elevated)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--primary)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{f.id}</span>
              <span style={{ color: RISK_COLOR[f.risk], fontSize: 11 }}>{f.status}</span>
            </div>
            <div style={{ height: 2, borderRadius: 1, background: 'var(--border)' }}>
              <div style={{ height: '100%', borderRadius: 1, width: `${f.pct}%`, background: RISK_COLOR[f.risk], transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
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
        Safe mode: <strong>apply_treatment</strong> requires approval before any field action
      </div>
    </div>
  )
}
