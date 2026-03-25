import React, { useState, useRef, useEffect } from 'react';
import { VoiceOrb, OrbState } from './components/VoiceOrb';
import { SearchBar } from './components/SearchBar';
import { ResponseCard } from './components/ResponseCard';
import { callAgent, parseAgentResponse, ParsedResponse } from './services/agent';
import { useSpeech } from './hooks/useSpeech';

export default function App() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [response, setResponse] = useState<ParsedResponse | null>(null);
  const [govEventMsg, setGovEventMsg] = useState<string>('');
  const rawDataRef = useRef('');

  // ── Core search handler ───────────────────────────────────────────────────
  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    setOrbState('loading');
    setResponse(null);
    setGovEventMsg('');
    rawDataRef.current = '';

    // Open Google tab if user asks
    const wantsGoogle = /busca?(r)?\s*(en\s*)?(google|internet|web|navegador)/i.test(query) || /ve a google/i.test(query);
    if (wantsGoogle) {
      const term = query
        .replace(/busca?(r)?\s*(en\s*)?(google|internet|web|navegador)/gi, '')
        .replace(/ve a google/gi, '')
        .trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(term || query)}`, '_blank');
    }

    callAgent(query, 'agrotech', 'Forge Sentinel', 'openclaw', {
      onToken: (text) => { rawDataRef.current += text; },
      onGovEvent: (event: any) => {
        setGovEventMsg(`⚙️ Gobernanza: ${event.tool || ''} → ${event.decision || ''}`);
        setTimeout(() => setGovEventMsg(''), 3500);
      },
      onDone: () => {
        const parsed = parseAgentResponse(rawDataRef.current);
        setResponse(parsed);
        setOrbState('responding');
        // Read summary aloud via TTS
        if (parsed?.summary) {
          speech.speak(parsed.summary);
        }
        setTimeout(() => setOrbState('idle'), 4000);
      },
      onError: (err) => {
        console.error('[Agent Error]', err);
        setOrbState('idle');
        setGovEventMsg(`❌ Error: ${err}`);
        setTimeout(() => setGovEventMsg(''), 4000);
      },
    });
  };

  // ── Voice hook ────────────────────────────────────────────────────────────
  const speech = useSpeech(handleSearch);

  // Sync orb state with speech state
  useEffect(() => {
    if (speech.state === 'listening') setOrbState('listening');
    else if (speech.state === 'processing') setOrbState('loading');
    // don't reset to idle here — let the agent flow control that
  }, [speech.state]);

  const toggleVoice = () => {
    if (speech.state === 'listening') {
      speech.stopListening();
    } else {
      speech.cancelSpeech(); // Stop any TTS before listening
      speech.startListening();
    }
  };

  return (
    <div className="app">
      <div className="app__container">
        <div className="app__eyebrow">FORGEOS Sentinel</div>
        <h1 className="app__title">Protege tu ganado con inteligencia</h1>
        <p className="app__subtitle">
          Consulta por voz o texto noticias, alertas y reportes sobre el gusano barrenador
        </p>

        {/* Orb — clickable to toggle voice */}
        <div onClick={toggleVoice} style={{ cursor: 'pointer' }}>
          <VoiceOrb state={orbState} />
        </div>

        {/* Live transcript while speaking */}
        {speech.transcript && (
          <div style={{
            margin: '0 auto 16px',
            maxWidth: 520,
            padding: '10px 18px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            fontSize: 14,
            color: '#94a3b8',
            textAlign: 'center',
            fontStyle: 'italic',
            letterSpacing: '0.01em',
          }}>
            🎤 &ldquo;{speech.transcript}&rdquo;
          </div>
        )}

        {/* Governance event toast */}
        {govEventMsg && (
          <div style={{
            margin: '0 auto 12px',
            maxWidth: 520,
            padding: '8px 16px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12,
            fontSize: 12,
            color: '#f59e0b',
            textAlign: 'center',
          }}>
            {govEventMsg}
          </div>
        )}

        <SearchBar
          onSearch={handleSearch}
          onVoiceStart={toggleVoice}
          onVoiceEnd={speech.stopListening}
          isListening={speech.state === 'listening'}
        />

        <ResponseCard response={response} isLoading={orbState === 'loading'} />

        {/* Voice not supported fallback */}
        {!speech.supported && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#ef4444', marginTop: 8 }}>
            ⚠️ Tu navegador no soporta reconocimiento de voz. Usa Chrome.
          </p>
        )}
      </div>
    </div>
  );
}
