import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoiceOrb } from './components/VoiceOrb'
import { SearchBar, QuickChips } from './components/SearchBar'
import { ResponseCard, LoadingCard } from './components/ResponseCard'
import { QueryHistory } from './components/QueryHistory'
import { callAgent, parseAgentResponse } from './services/agent'
import type { ParsedResponse, GovEvent } from './services/agent'
import { saveQuery, getRecentQueries } from './services/supabase'
import type { SentinelQuery } from './services/supabase'
import { useSpeech } from './hooks/useSpeech'
import './styles/app.scss'

type OrbState = 'idle' | 'listening' | 'loading'

export default function App() {
  const [input, setInput] = useState('')
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [streaming, setStreaming] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [parsed, setParsed] = useState<ParsedResponse | null>(null)
  const [govEvents, setGovEvents] = useState<GovEvent[]>([])
  const [showResponse, setShowResponse] = useState(false)
  const [timestamp, setTimestamp] = useState('')
  const [recentQueries, setRecentQueries] = useState<SentinelQuery[]>([])
  const [abortFn, setAbortFn] = useState<(() => void) | null>(null)

  // Load recent queries from Supabase on mount
  useEffect(() => {
    getRecentQueries(5).then(setRecentQueries)
  }, [])

  const { state: speechState, startListening, stopListening } = useSpeech(
    (text) => {
      setInput(text)
      setOrbState('idle')
    }
  )

  useEffect(() => {
    if (speechState === 'listening') setOrbState('listening')
    else if (orbState === 'listening') setOrbState('idle')
  }, [speechState])

  const handleMicClick = useCallback(() => {
    if (orbState === 'listening') {
      stopListening()
      setOrbState('idle')
    } else if (orbState === 'idle') {
      startListening()
    }
  }, [orbState, startListening, stopListening])

  const handleOrbClick = useCallback(() => {
    if (orbState === 'loading') {
      abortFn?.()
      setOrbState('idle')
      setIsStreaming(false)
      return
    }
    handleMicClick()
  }, [orbState, abortFn, handleMicClick])

  const handleSubmit = useCallback(async () => {
    const query = input.trim()
    if (!query || orbState === 'loading') return

    setStreaming('')
    setParsed(null)
    setGovEvents([])
    setShowResponse(true)
    setIsStreaming(true)
    setOrbState('loading')
    setTimestamp(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

    let fullText = ''

    const abort = callAgent(
      query,
      'agrotech',
      'AgroBot Prime',
      'AgroBot Prime',
      {
        onToken: (text) => {
          fullText += text
          setStreaming(fullText)
        },
        onGovEvent: (event) => {
          setGovEvents(prev => [...prev, event])
        },
        onDone: async () => {
          setIsStreaming(false)
          setOrbState('idle')
          const result = parseAgentResponse(fullText)
          setParsed(result)

          const saved = await saveQuery({
            query,
            domain: 'agrotech',
            summary: result.summary,
            risk_level: result.riskLevel,
            raw_response: fullText,
          })
          if (saved) {
            setRecentQueries(prev => [saved, ...prev].slice(0, 5))
          }
        },
        onError: (msg) => {
          setIsStreaming(false)
          setOrbState('idle')
          setStreaming(prev => prev + `\n\n⚠️ Error: ${msg}`)
          setParsed({
            summary: `Error al conectar con el agente. Verifica que el servidor esté activo.`,
            findings: [`Error detalle: ${msg}`],
            riskLevel: 'Bajo',
            recommendation: 'Reintenta en unos momentos.'
          })
        },
      }
    )

    setAbortFn(() => abort)
  }, [input, orbState])

  const handleQuickSelect = useCallback((q: string) => {
    setInput(q)
  }, [])

  return (
    <>
      <div className="sentinel-bg" />
      <div className="noise" />

      <main className="sentinel-app">
        <header className="sentinel-header">
          <div className="sentinel-header__brand">
            <div className="sentinel-header__logo">FS</div>
            <span className="sentinel-header__name">
              Forge<span>OS</span> Sentinel
            </span>
          </div>
          <div className="sentinel-header__status">
            <div className="sentinel-header__dot" />
            Sistema activo
          </div>
        </header>

        <motion.section
          className="sentinel-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="sentinel-hero__eyebrow">Agente AgroTech · Vigilancia Inteligente</p>
          <h1 className="sentinel-hero__title">
            Protege tu ganado con{' '}
            <em>inteligencia en tiempo real</em>
          </h1>
          <p className="sentinel-hero__subtitle">
            Consulta noticias, alertas y reportes sobre el gusano barrenador. Tecnología de ForgeOS.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <VoiceOrb state={orbState} onClick={handleOrbClick} />
        </motion.div>

        <motion.div
          style={{ width: '100%', maxWidth: 680 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onMicClick={handleMicClick}
            isListening={orbState === 'listening'}
            isLoading={orbState === 'loading'}
            disabled={orbState === 'loading'}
          />
        </motion.div>

        <motion.div
          style={{ width: '100%', maxWidth: 680 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <QuickChips
            onSelect={handleQuickSelect}
            disabled={orbState === 'loading'}
          />
        </motion.div>

        <div className="response-area">
          <AnimatePresence mode="wait">
            {showResponse && orbState === 'loading' && !streaming && (
              <LoadingCard key="loading" />
            )}
            {showResponse && (streaming || parsed) && (
              <ResponseCard
                key="response"
                streaming={streaming}
                parsed={parsed}
                govEvents={govEvents}
                isStreaming={isStreaming}
                timestamp={timestamp}
              />
            )}
          </AnimatePresence>
        </div>

        <motion.div
          style={{ width: '100%', maxWidth: 680 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <QueryHistory
            queries={recentQueries}
            onSelect={(q) => setInput(q)}
          />
        </motion.div>
      </main>
    </>
  )
}
