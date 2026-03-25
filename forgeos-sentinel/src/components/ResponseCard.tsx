import React from 'react';
import { ParsedResponse } from '../services/agent';
import { motion } from 'framer-motion';

export function ResponseCard({ response, isLoading }: { response: ParsedResponse | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="loading">
        Analizando fuentes y consultando al agente...
      </motion.div>
    );
  }

  if (!response || (!response.summary && response.findings.length === 0 && !response.recommendation)) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="result-card"
    >
      <h3 className="result-card__title">Resultado</h3>
      
      {response.riskLevel && (
        <div className="result-card__section">
          <div className="result-card__label">Nivel de Riesgo</div>
          <span className="result-card__badge" style={
            response.riskLevel === 'Alto' ? { background: 'rgba(239, 68, 68, 0.14)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.18)' } :
            response.riskLevel === 'Medio' ? { background: 'rgba(245, 158, 11, 0.14)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.18)' } :
            { background: 'rgba(52, 211, 153, 0.14)', color: '#6ee7b7', border: '1px solid rgba(52, 211, 153, 0.18)' }
          }>
            {response.riskLevel}
          </span>
        </div>
      )}

      {response.summary && (
        <div className="result-card__section">
          <div className="result-card__label">Resumen</div>
          <p className="result-card__text">{response.summary}</p>
        </div>
      )}

      {response.findings && response.findings.length > 0 && (
        <div className="result-card__section">
          <div className="result-card__label">Hallazgos</div>
          <ul className="result-card__list">
            {response.findings.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {response.recommendation && (
        <div className="result-card__section">
          <div className="result-card__label">Acción Sugerida</div>
          <p className="result-card__text">{response.recommendation}</p>
        </div>
      )}
    </motion.div>
  );
}
