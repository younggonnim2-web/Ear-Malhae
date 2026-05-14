import { useCallback, useState } from 'react'

interface UseSpeechResult {
  speak: (text: string, lang?: string) => void
  isSupported: boolean
  isSpeaking: boolean
}

export function useSpeech(): UseSpeechResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.85
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    // Chrome bug: speak() immediately after cancel() sometimes silently fails
    setTimeout(() => window.speechSynthesis.speak(utterance), 50)
  }, [isSupported])

  return { speak, isSupported, isSpeaking }
}
