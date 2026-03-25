import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Send } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onMicClick: () => void
  isListening: boolean
  isLoading: boolean
  disabled?: boolean
}

const QUICK_QUERIES = [
  '¿Hay alertas del gusano barrenador esta semana?',
  'Reporte rápido de riesgo actual',
  '¿Qué señales debo revisar en el ganado?',
  'Resumen de noticias recientes',
]

interface QuickChipsProps {
  onSelect: (q: string) => void
  disabled: boolean
}

export function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="quick-chips">
      {QUICK_QUERIES.map((q) => (
        <motion.button
          key={q}
          className="chip"
          onClick={() => !disabled && onSelect(q)}
          disabled={disabled}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          {q}
        </motion.button>
      ))}
    </div>
  )
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onMicClick,
  isListening,
  isLoading,
  disabled = false,
}: SearchBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSubmit()
    }
  }

  return (
    <div className="search-box">
      <div className="search-box__inner">
        <textarea
          ref={textareaRef}
          className="search-box__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Consulta noticias, alertas o reportes del gusano barrenador…"
          rows={1}
          disabled={disabled}
        />
        <div className="search-box__actions">
          <motion.button
            className={`icon-btn ${isListening ? 'icon-btn--active' : ''}`}
            onClick={onMicClick}
            disabled={isLoading}
            whileTap={{ scale: 0.92 }}
            title={isListening ? 'Detener grabación' : 'Hablar'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </motion.button>

          <motion.button
            className="send-btn"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            whileTap={{ scale: 0.93 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}