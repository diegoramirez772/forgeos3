import { motion, AnimatePresence } from 'framer-motion'
import { Mic } from 'lucide-react'

type OrbState = 'idle' | 'listening' | 'loading'

interface VoiceOrbProps {
  state: OrbState
  onClick: () => void
}

// Bar heights for idle, listening, loading states
const BAR_COUNT = 28

function WaveformBars({ state }: { state: OrbState }) {
  return (
    <div className="waveform">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const isCenter = Math.abs(i - BAR_COUNT / 2) < BAR_COUNT * 0.2
        const baseH = isCenter ? 0.55 : 0.2 + Math.random() * 0.2

        return (
          <motion.span
            key={i}
            className="waveform__bar"
            animate={
              state === 'listening'
                ? {
                  scaleY: [
                    baseH,
                    0.15 + Math.random() * 0.85,
                    0.15 + Math.random() * 0.6,
                    baseH,
                  ],
                  opacity: 1,
                }
                : state === 'loading'
                  ? {
                    scaleY: [baseH, baseH + 0.2, baseH],
                    opacity: [0.5, 0.9, 0.5],
                  }
                  : {
                    scaleY: isCenter ? 0.5 : 0.18 + (i % 3) * 0.06,
                    opacity: 0.35,
                  }
            }
            transition={
              state === 'idle'
                ? { duration: 0.4 }
                : {
                  duration: state === 'loading' ? 1.2 : 0.35 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: (i / BAR_COUNT) * (state === 'loading' ? 0.6 : 0.2),
                }
            }
          />
        )
      })}
    </div>
  )
}

export function VoiceOrb({ state, onClick }: VoiceOrbProps) {
  const labels: Record<OrbState, string> = {
    idle: 'Toca para hablar',
    listening: 'Escuchando...',
    loading: 'Procesando...',
  }

  return (
    <div className="orb-wrapper">
      {/* Main clickable zone */}
      <motion.button
        className={`voice-widget voice-widget--${state}`}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        aria-label={labels[state]}
      >
        {/* Mic button left */}
        <motion.div
          className="voice-widget__mic"
          animate={{
            backgroundColor:
              state === 'listening'
                ? 'rgba(52,211,153,0.18)'
                : 'rgba(255,255,255,0.05)',
            borderColor:
              state === 'listening'
                ? 'rgba(52,211,153,0.4)'
                : 'rgba(255,255,255,0.1)',
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{
              color: state === 'listening' ? '#34d399' : '#7c8fa3',
              scale: state === 'listening' ? [1, 1.12, 1] : 1,
            }}
            transition={
              state === 'listening'
                ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.3 }
            }
          >
            <Mic size={18} strokeWidth={1.8} />
          </motion.div>
        </motion.div>

        {/* Waveform center */}
        <WaveformBars state={state} />

        {/* Label right */}
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            className={`voice-widget__label voice-widget__label--${state}`}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            {labels[state]}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
