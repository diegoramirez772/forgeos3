import { useState, useCallback, useRef } from 'react'

export type SpeechState = 'idle' | 'listening' | 'processing'

export interface UseSpeechReturn {
  state: SpeechState
  supported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  cancelSpeech: () => void
}

export function useSpeech(onFinalResult: (text: string) => void): UseSpeechReturn {
  const [state, setState] = useState<SpeechState>('idle')
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current)
    setState('idle')
  }, [])

  const startListening = useCallback(() => {
    if (!supported) return
    // Stop any previous recognition
    stopListening()

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRec()
    recognitionRef.current = recognition

    recognition.lang = 'es-MX'
    recognition.continuous = true        // Keep listening until silence
    recognition.interimResults = true    // Show live transcript as you speak
    recognition.maxAlternatives = 1

    let finalTranscript = ''
    let interimTranscript = ''

    const resetSilenceTimer = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current)
      // Auto-submit after 1.8s of silence if we have a transcript
      silenceTimer.current = setTimeout(() => {
        if (finalTranscript.trim()) {
          recognition.stop()
          setState('processing')
          onFinalResult(finalTranscript.trim())
          setTranscript('')
        }
      }, 1800)
    }

    recognition.onstart = () => {
      setState('listening')
      setTranscript('')
      finalTranscript = ''
    }

    recognition.onresult = (event: any) => {
      interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interimTranscript += result[0].transcript
        }
      }
      setTranscript(finalTranscript + interimTranscript)
      resetSilenceTimer()
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Silently ignore — just keep waiting
        return
      }
      console.warn('[Speech] Error:', event.error)
      stopListening()
      setTranscript('')
    }

    recognition.onend = () => {
      // If continuous mode ended without explicit stop (browser permission timeout etc.)
      if (recognitionRef.current) {
        setState('idle')
        setTranscript('')
      }
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('[Speech] Start failed:', e)
      setState('idle')
    }
  }, [supported, onFinalResult, stopListening])

  // Text-to-speech: reads the agent's response back aloud
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-MX'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to pick a Spanish voice
    const voices = window.speechSynthesis.getVoices()
    const esVoice = voices.find(v => v.lang.startsWith('es'))
    if (esVoice) utterance.voice = esVoice

    window.speechSynthesis.speak(utterance)
  }, [])

  const cancelSpeech = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  return { state, supported, transcript, startListening, stopListening, speak, cancelSpeech }
}
