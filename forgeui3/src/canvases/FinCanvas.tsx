import { motion } from 'framer-motion'
import { Landmark, ShieldAlert, CreditCard, Activity } from 'lucide-react'

interface Props { onExampleClick: (ex: string) => void }

const ACCOUNTS = [
  { id: 'ACC-9921', risk: 88, status: 'Alto Riesgo', icon: ShieldAlert },
  { id: 'ACC-3341', risk: 12, status: 'Protegido',  icon: CreditCard },
  { id: 'ACC-7782', risk: 45, status: 'Monitoreo',  icon: Activity },
]

const EXAMPLES = [
  'Analizar transacciones Q1 ACC-9921',
  'Detectar actividad sospechosa 30d',
  'Generar reporte de riesgo fraudulento',
  'Score de riesgo transacción TXN-4821',
]

export function FinCanvas({ onExampleClick }: Props) {
  return (
    <div className="p-6 space-y-8 bg-transparent">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
          <Landmark size={10} /> Riesgo Financiero
        </h3>
        <div className="space-y-4">
          {ACCOUNTS.map((a, i) => {
            const rc = a.risk > 70 ? '#ef4444' : a.risk > 40 ? '#f5a623' : '#10b981'
            return (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/40">
                      {a.id.split('-')[1]}
                    </div>
                    <span className="text-xs font-bold text-white/80">{a.status}</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono" style={{ color: rc }}>{a.risk}%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.risk}%` }} transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full" style={{ background: rc }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Consultas Durango</h3>
        <div className="grid gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => onExampleClick(ex)}
              className="text-left p-3 rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.03] hover:border-white/10 transition-all text-[11px] text-white/50 leading-relaxed font-medium">
              "{ex}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
