import React from 'react';
import { motion } from 'framer-motion';

export type OrbState = 'idle' | 'listening' | 'loading' | 'responding';

export function VoiceOrb({ state }: { state: OrbState }) {
  const getAnimation = () => {
    switch (state) {
      case 'idle':
        return { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] };
      case 'listening':
        return { scale: [1, 1.2, 1], opacity: [1, 0.8, 1], boxShadow: "0 0 60px rgba(52, 211, 153, 0.4)" };
      case 'loading':
        return { scale: [1, 0.9, 1], rotate: [0, 180, 360], opacity: [0.5, 1, 0.5] };
      case 'responding':
        return { scale: 1.1, opacity: 1, boxShadow: "0 0 40px rgba(96, 165, 250, 0.5)" };
      default:
        return {};
    }
  };

  return (
    <motion.div
      className="voice-orb"
      animate={getAnimation()}
      transition={{ repeat: Infinity, duration: state === 'listening' ? 1 : 2, ease: "easeInOut" }}
    />
  );
}
