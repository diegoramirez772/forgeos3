import { useState, useRef, useEffect } from 'react'
import { Wand2, Code2, RefreshCw, Download, Trash2, Loader2, Sparkles, ChevronRight } from 'lucide-react'

const AGENT_URL = import.meta.env.VITE_AGENT_URL ?? 'http://localhost:4000'

const EXAMPLE_PROMPTS = [
  "Un dashboard de monitoreo de ganado con métricas de salud, temperatura y alertas",
  "Un formulario de reporte de incidencias de plaga con mapa y nivel de riesgo",
  "Un panel de estadísticas de producción con gráficas de barras y tabla de datos",
  "Una pantalla de chat con un agente AI con burbujas animadas y modo oscuro"
]

interface SavedUI {
  id: string
  name: string
  prompt: string
  code: string
  createdAt: string
}

function extractHTMLFromCode(raw: string): string {
  // Try to extract HTML block
  const htmlMatch = raw.match(/```html([\s\S]*?)```/)
  if (htmlMatch) return htmlMatch[1].trim()
  // Try picking up raw HTML
  if (raw.includes('<!DOCTYPE') || raw.includes('<html') || raw.includes('<div')) return raw
  // Wrap plain HTML-like code
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #0f172a; color: #f1f5f9; }
  * { box-sizing: border-box; }
</style>
</head>
<body>
${raw}
</body>
</html>`
}

export function AgentUIBuilder() {
  const [prompt, setPrompt] = useState('')
  const [code, setCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedUIs, setSavedUIs] = useState<SavedUI[]>(() => {
    try { return JSON.parse(localStorage.getItem('forgeos_uis') || '[]') } catch { return [] }
  })
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [selectedSaved, setSelectedSaved] = useState<SavedUI | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const rawRef = useRef('')

  const saveToLocalStorage = (uis: SavedUI[]) => {
    localStorage.setItem('forgeos_uis', JSON.stringify(uis))
    setSavedUIs(uis)
  }

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setCode('')
    rawRef.current = ''

    const fullPrompt = `Genera el código HTML completo (con CSS embebido en <style> y JS embebido en <script>) para la siguiente UI:

${prompt}

REGLAS IMPORTANTES:
- Solo devuelve un bloque de código HTML completo dentro de \`\`\`html ... \`\`\`
- Usa diseño dark moderno (fondo oscuro, colores neón suaves)
- Usa datos de ejemplo realistas (no dejes campos vacíos)
- El diseño debe verse premium y profesional
- No uses frameworks externos (sin React, sin Vue, sin Bootstrap CDN de fonts web)
- Usa CSS Grid o Flexbox para el layout
- Agrega micro-animaciones con CSS transitions
- Todo en un solo archivo HTML autocontenido`

    try {
      const initRes = await fetch(`${AGENT_URL}/api/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fullPrompt, domain: 'agrotech', mode: 'ui_builder' })
      })
      const { runId } = await initRes.json()
      const es = new EventSource(`${AGENT_URL}/api/agent/stream/${runId}`)

      es.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.type === 'token') {
          rawRef.current += data.text
          setCode(rawRef.current)
        } else if (data.type === 'done' || data.type === 'error') {
          es.close()
          setIsGenerating(false)
          // Auto-save
          const newUI: SavedUI = {
            id: Date.now().toString(),
            name: prompt.slice(0, 40) + (prompt.length > 40 ? '...' : ''),
            prompt,
            code: rawRef.current,
            createdAt: new Date().toISOString()
          }
          const updated = [newUI, ...savedUIs].slice(0, 20)
          saveToLocalStorage(updated)
        }
      }
      es.onerror = () => { es.close(); setIsGenerating(false) }
    } catch (err) {
      console.error(err)
      setIsGenerating(false)
    }
  }

  const renderedHTML = code ? extractHTMLFromCode(code) : ''

  const downloadCode = () => {
    const blob = new Blob([renderedHTML], { type: 'text/html' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `forgeos-ui-${Date.now()}.html`; a.click()
  }

  const deleteUI = (id: string) => {
    const updated = savedUIs.filter(u => u.id !== id)
    saveToLocalStorage(updated)
    if (selectedSaved?.id === id) { setSelectedSaved(null); setCode('') }
  }

  const loadSaved = (ui: SavedUI) => {
    setSelectedSaved(ui)
    setPrompt(ui.prompt)
    setCode(ui.code)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0d12', color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Left Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Wand2 size={16} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc' }}>AI UI Builder</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Genera interfaces con lenguaje natural</span>
        </div>

        <div style={{ padding: '12px 12px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#475569' }}>
          Tus UIs Guardadas
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {savedUIs.length === 0 && (
            <div style={{ padding: '16px 12px', fontSize: 12, color: '#475569', textAlign: 'center' }}>
              Genera tu primera UI para verla aquí
            </div>
          )}
          {savedUIs.map(ui => (
            <div key={ui.id}
              onClick={() => loadSaved(ui)}
              style={{
                padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: selectedSaved?.id === ui.id ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: selectedSaved?.id === ui.id ? '2px solid #f59e0b' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.15s'
              }}>
              <Sparkles size={12} color={selectedSaved?.id === ui.id ? '#f59e0b' : '#475569'} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ui.name}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>{new Date(ui.createdAt).toLocaleDateString('es-MX')}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteUI(ui.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 2, display: 'flex' }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Prompt Area */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate() }}
              placeholder="Describe la interfaz que quieres generar... (Ctrl+Enter para generar)"
              rows={3}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, resize: 'none',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.5
              }}
            />
            <button
              onClick={generate}
              disabled={isGenerating || !prompt.trim()}
              style={{
                background: isGenerating ? 'rgba(245,158,11,0.3)' : '#f59e0b', color: '#0a0d12',
                border: 'none', borderRadius: 14, padding: '12px 20px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}>
              {isGenerating ? <><Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Generando...</> : <><Wand2 size={16} /> Generar UI</>}
            </button>
          </div>

          {/* Example prompts */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button key={i} onClick={() => setPrompt(ex)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '4px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                }}>
                <ChevronRight size={10} /> {ex.slice(0, 45)}...
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 4 }}>
          {(['preview', 'code'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                color: activeTab === tab ? '#f59e0b' : '#64748b', fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                borderBottom: activeTab === tab ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'all 0.15s', textTransform: 'capitalize'
              }}>
              {tab === 'preview' ? '🖥️ Preview' : '</>  Código'}
            </button>
          ))}

          {code && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => { setPrompt(''); setCode('') }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} /> Nueva
              </button>
              <button onClick={downloadCode}
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '6px 12px', color: '#f59e0b', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={12} /> Descargar HTML
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {!code && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#334155' }}>
              <Wand2 size={48} strokeWidth={1} />
              <p style={{ fontSize: 15, margin: 0 }}>Describe una interfaz arriba y presiona <strong style={{ color: '#f59e0b' }}>Generar UI</strong></p>
            </div>
          )}

          {isGenerating && !code && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#64748b' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#f59e0b' }} />
              <p style={{ fontSize: 14, margin: 0 }}>Claude está diseñando tu interfaz...</p>
            </div>
          )}

          {code && activeTab === 'preview' && (
            <iframe
              ref={iframeRef}
              srcDoc={renderedHTML}
              title="UI Preview"
              sandbox="allow-scripts"
              style={{ width: '100%', height: '100%', border: 'none', background: '#0f172a' }}
            />
          )}

          {code && activeTab === 'code' && (
            <div style={{ height: '100%', overflow: 'auto', padding: 24 }}>
              <pre style={{
                margin: 0, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13,
                lineHeight: 1.7, color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
              }}>
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
