import { useState, useCallback, useEffect } from 'react'

export function useSpeech(onResult: (text: string) => void) {
  const [state, setState] = useState<'idle' | 'listening'>('idle')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true)
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setState('listening')
    recognition.onend = () => setState('idle')
    recognition.onerror = () => setState('idle')
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('Speech Start Error:', e)
    }
  }, [onResult])

  const stopListening = useCallback(() => {
    // Recognition usually stops automatically on result/end in this simple impl
    setState('idle')
  }, [])

  return { state, supported, startListening, stopListening }
}
