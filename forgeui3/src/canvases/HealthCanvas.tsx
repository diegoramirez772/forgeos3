interface Props { onExampleClick: (ex: string) => void; color: string }

const STATS = [
  { label: 'Patients today',  value: '24' },
  { label: 'Pending reviews', value: '7'  },
  { label: 'Forms processed', value: '142'},
]

const EXAMPLES = [
  'Summarize patient intake form #4821',
  'Create follow-up checklist for post-op',
  'Review: fever 38.5°C, fatigue, 3 days',
  'Discharge instructions for diabetic patient',
]

export function HealthCanvas({ onExampleClick, color }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: 'var(--subtle)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
        CLINICAL CONTEXT
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 6, background: 'var(--elevated)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--subtle)', fontSize: 12 }}>{s.label}</span>
            <span style={{ color, fontSize: 13, fontWeight: 500 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--subtle)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>
        EXAMPLES
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => onExampleClick(ex)}
            style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--secondary)', fontSize: 12, cursor: 'pointer', lineHeight: 1.4, transition: 'border-color 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            "{ex}"
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 12px', borderRadius: 6, border: `1px solid ${color}20`, background: `${color}08`, color: `${color}bb`, fontSize: 11, lineHeight: 1.5 }}>
        Safe mode: <strong>diagnose</strong> + <strong>write_record</strong> require approval
      </div>
    </div>
  )
}
