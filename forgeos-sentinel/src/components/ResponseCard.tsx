import { motion } from 'framer-motion'
import { Shield, Info, AlertOctagon, CheckCircle2, Clock, XCircle, Search } from 'lucide-react'
import type { ParsedResponse, GovEvent } from '../services/agent'

interface ResponseCardProps {
  streaming: string
  parsed: ParsedResponse | null
  govEvents: GovEvent[]
  isStreaming: boolean
  timestamp: string
}

export function LoadingCard() {
  return (
    <div className="response-card">
      <div className="loading-indicator">
        <div className="loading-indicator__dots">
          <span />
          <span />
          <span />
        </div>
        Buscando en la base de datos...
      </div>
    </div>
  )
}

function GovEventItem({ event }: { event: GovEvent }) {
  const icons: Record<string, any> = {
    allowed: <CheckCircle2 size={13} className="text-emerald-500" />,
    blocked: <XCircle size={13} className="text-red-500" />,
    approval_required: <Clock size={13} className="text-amber-500" />,
  }

  return (
    <div className="gov-event">
      <span className="gov-event__icon">⚡</span>
      <span className="gov-event__tool">{event.tool}</span>
      <span className={`gov-event__decision gov-event__decision--${event.decision}`}>
        {event.decision.replace('_', ' ')}
      </span>
      {icons[event.decision]}
    </div>
  )
}

export function ResponseCard({ streaming, parsed, govEvents, isStreaming, timestamp }: ResponseCardProps) {
  if (!parsed && !streaming) return null

  const riskClass = 
    parsed?.riskLevel === 'Bajo' ? 'risk-badge--low' :
    parsed?.riskLevel === 'Medio' ? 'risk-badge--medium' : 
    'risk-badge--high'

  return (
    <motion.div 
      className="response-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="response-card__header">
        <div className="response-card__title">
          <span className="dot" />
          {isStreaming ? 'Analizando en tiempo real...' : 'Reporte de Sentinel'}
        </div>
        <span className="response-card__meta">{timestamp}</span>
      </div>

      {isStreaming ? (
        <div className="response-card__streaming">
          {streaming}
        </div>
      ) : (
        <>
          <div className="response-card__summary">
            {parsed?.summary}
          </div>

          <div className="response-card__sections">
            {parsed?.findings && parsed.findings.length > 0 && (
              <div className="response-card__section">
                <div className="response-card__label">
                  <Search size={11} /> Hallazgos clave
                </div>
                <ul className="response-card__list">
                  {parsed.findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsed?.recommendation && (
              <div className="response-card__section">
                <div className="response-card__label">
                  <Shield size={11} /> Recomendación
                </div>
                <p className="response-card__text">{parsed.recommendation}</p>
              </div>
            )}
          </div>

          <div className="response-card__footer">
            <div className={`risk-badge ${riskClass}`}>
              {parsed?.riskLevel === 'Alto' ? <AlertOctagon size={13} /> : <CheckCircle2 size={13} />}
              Nivel de Riesgo: {parsed?.riskLevel}
            </div>
          </div>
        </>
      )}

      {govEvents.length > 0 && (
        <div className="gov-events">
          <div className="response-card__label mt-4">
            <Shield size={10} /> Registro de Gobernanza (ForgeOS Engine)
          </div>
          {govEvents.map((ev, i) => (
            <GovEventItem key={i} event={ev} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
