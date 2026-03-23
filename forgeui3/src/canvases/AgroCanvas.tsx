import { motion } from 'framer-motion'
import { Leaf, Droplets, TrendingUp, ShieldCheck } from 'lucide-react'

interface Props { onExampleClick: (ex: string) => void }

const FIELDS = [
  { id: '#22', status: 'Tratamiento', risk: 'high',   pct: 85, icon: Leaf },
  { id: '#08', status: 'Saludable',   risk: 'low',    pct: 12, icon: Droplets },
  { id: '#15', status: 'Monitoreo',  risk: 'medium', pct: 44, icon: TrendingUp },
]
const RISK_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f5a623', low: '#10b981' }

const EXAMPLES = [
  'Analizar sensores del campo #22',
  'Predecir cosecha sector norte',
  'Nivel de humedad 34% — recomendar',
  'Comparar campo #08 vs mes pasado',
]

export function AgroCanvas({ onExampleClick }: Props) {
  return (
    <div className="p-6 space-y-8 bg-transparent">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
          <Leaf size={10} /> Monitoreo de Campo
        </h3>
        <div className="space-y-4">
          {FIELDS.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-[20px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-mono text-white/40">
                    {f.id}
                  </div>
                  <span className="text-xs font-bold text-white/80">{f.status}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: RISK_COLOR[f.risk] }} />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full" style={{ background: RISK_COLOR[f.risk] }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Sugerencias Durango</h3>
        <div className="grid gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => onExampleClick(ex)}
              className="text-left p-3 rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.03] hover:border-white/10 transition-all text-[11px] text-white/50 leading-relaxed font-medium">
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
        <ShieldCheck size={14} className="text-emerald-500 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-emerald-500/60 font-bold uppercase tracking-wider">
          Gobernanza Activa: apply_treatment requiere firma del Council
        </p>
      </div>
    </div>
  )
}
