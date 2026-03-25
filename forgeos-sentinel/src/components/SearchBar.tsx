import React, { useState } from 'react';
import { Mic, Send } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  isListening?: boolean;
}

export function SearchBar({ onSearch, onVoiceStart, onVoiceEnd, isListening }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSend = () => {
    if (query.trim()) {
      onSearch(query);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="search-box">
      <div className="search-box__row">
        <input
          type="text"
          className="search-box__input"
          placeholder="Pregunta por noticias, alertas o reportes del gusano barrenador..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="search-box__actions">
          <button 
            className="icon-btn" 
            onClick={isListening ? onVoiceEnd : onVoiceStart}
            style={isListening ? { color: '#34d399', borderColor: '#34d399' } : {}}
          >
            <Mic size={24} />
          </button>
          <button className="primary-btn" onClick={handleSend}>
            Consultar <Send size={18} style={{ marginLeft: 8, display: 'inline-block', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
}