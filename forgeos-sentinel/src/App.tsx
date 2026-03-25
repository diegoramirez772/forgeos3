import React, { useState } from 'react';
import { VoiceOrb, OrbState } from './components/VoiceOrb';
import { SearchBar } from './components/SearchBar';
import { ResponseCard } from './components/ResponseCard';
import { callAgent, parseAgentResponse, ParsedResponse } from './services/agent';

export default function App() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [response, setResponse] = useState<ParsedResponse | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    
    setIsListening(true);
    setOrbState('listening');
    
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'es-MX';
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      handleSearch(text);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Wait for the status to change during search to not reset to idle wrongly.
      setOrbState(prev => prev === 'listening' ? 'idle' : prev);
    };
    
    recognition.start();
  };

  const handleSearch = (query: string) => {
    setOrbState('loading');
    setResponse(null);

    // Abre Google si el usuario pide buscar en internet
    const wantsGoogle = /busca?(r)?\s*(en\s*)?(google|internet|web|navegador)/i.test(query) || /ve a google/i.test(query);
    if (wantsGoogle) {
      const searchTerm = query
        .replace(/busca?(r)?\s*(en\s*)?(google|internet|web|navegador)/gi, '')
        .replace(/ve a google/gi, '')
        .trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm || query)}`, '_blank');
    }

    let rawData = "";

    callAgent(
      query,
      'agrotech',
      'Forge Sentinel',
      'openclaw',
      {
        onToken: (text) => {
          rawData += text;
        },
        onGovEvent: (event) => {
           // We might log this or show in UI, skipping for MVP minimalism
        },
        onDone: () => {
          setResponse(parseAgentResponse(rawData));
          setOrbState('responding');
          setTimeout(() => setOrbState('idle'), 3000);
        },
        onError: (err) => {
          console.error(err);
          setOrbState('idle');
          alert("Error: " + err);
        }
      }
    );
  };

  return (
    <div className="app">
      <div className="app__container">
        <div className="app__eyebrow">FORGEOS Sentinel</div>
        <h1 className="app__title">Protege tu ganado con inteligencia</h1>
        <p className="app__subtitle">
          Consulta por voz o texto noticias, alertas y reportes sobre el gusano barrenador
        </p>

        <VoiceOrb state={orbState} />

        <SearchBar 
          onSearch={handleSearch} 
          onVoiceStart={startListening} 
          onVoiceEnd={() => setIsListening(false)} 
          isListening={isListening} 
        />

        <ResponseCard response={response} isLoading={orbState === 'loading'} />
      </div>
    </div>
  );
}
