import { motion } from 'framer-motion'
import { Activity, Clipboard, UserPlus, ShieldPlus } from 'lucide-react'

interface Props { onExampleClick: (ex: string) => void; color: string }

const STATS = [
  { label: 'Pacientes hoy',  value: '24', icon: UserPlus },
  { label: 'Pendientes',     value: '7',  icon: Clipboard  },
  { label: 'Procesados',     value: '142',icon: Activity },
]

const EXAMPLES = [
  'Resumir formulario ingreso #4821',
  'Checklist seguimiento post-op',
  'Revisión: fiebre 38.5°C, 3 días',
  'Instrucciones de alta diabético',
]

export function HealthCanvas({ onExampleClick, color }: Props) {
  return (
    <div className="p-6 space-y-8 bg-transparent">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 flex items-center gap-2">
          <Activity size={10} /> Contexto Clínico
        </h3>
        <div className="space-y-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex justify-between items-center p-4 rounded-[20px] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
              <div className="flex items-center gap-3">
                <s.icon size={14} className="text-white/20" />
                <span className="text-[12px] text-white/40 font-medium">{s.label}</span>
              </div>
              <span className="text-sm font-bold text-white/80" style={{ color }}>{s.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">Sugerencias Médicas</h3>
        <div className="grid gap-2">
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => onExampleClick(ex)}
              className="text-left p-3 rounded-xl border border-white/5 bg-transparent hover:bg-white/[0.03] hover:border-white/10 transition-all text-[11px] text-white/50 leading-relaxed font-medium">
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 flex items-start gap-3">
        <ShieldPlus size={14} className="text-sky-500 mt-0.5" />
        <p className="text-[10px] leading-relaxed text-sky-500/60 font-bold uppercase tracking-wider">
          Protocolo Seguro: diagnóstico y registros requieren validación humana
        </p>
      </div>
    </div>
  )
}
