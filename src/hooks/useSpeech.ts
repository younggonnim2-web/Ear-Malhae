import { useCallback } from 'react'

interface UseSpeechResult {
  speak: (text: string, lang?: string) => void
  isSupported: boolean
}

export function useSpeech(): UseSpeechResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  return { speak, isSupported }
}
