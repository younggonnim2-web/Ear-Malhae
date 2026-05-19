import { useCallback, useRef, useState } from 'react'

// Web Speech API — 브라우저 타입이 완전하지 않아 직접 선언
interface SpeechRecognitionEvent {
  results: { 0: { 0: { transcript: string } } }
}
interface SpeechRecognitionErrorEvent {
  error: string
}
interface SpeechRecognitionInstance {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onstart: (() => void) | null
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

const getSpeechRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, unknown>
  return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition'] ?? null) as SpeechRecognitionCtor | null
}

export interface UseSpeechRecognitionResult {
  startListening: () => void
  stopListening: () => void
  transcript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  reset: () => void
}

const AUTO_STOP_MS = 8000

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const Ctor = getSpeechRecognitionCtor()
  const isSupported = Ctor !== null

  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAutoStop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    if (!Ctor) return
    const recognition = new Ctor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    recognition.continuous = false

    // onend가 result/error 없이 호출됐는지 추적
    let settled = false

    recognition.onstart = () => {
      console.log('[STT] 시작')
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      settled = true
      clearAutoStop()
      const text = event.results[0][0].transcript
      console.log('[STT] 인식됨:', text)
      setTranscript(text)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      settled = true
      clearAutoStop()
      console.log('[STT] 에러:', event.error)
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      clearAutoStop()
      console.log('[STT] 종료 (settled:', settled, ')')
      // result도 error도 없이 ended → no-speech로 처리
      if (!settled) setError('no-speech')
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()

    // 8초 내 응답 없으면 강제 stop
    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop()
    }, AUTO_STOP_MS)
  }, [Ctor, clearAutoStop])

  const stopListening = useCallback(() => {
    clearAutoStop()
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [clearAutoStop])

  const reset = useCallback(() => {
    clearAutoStop()
    setTranscript('')
    setError(null)
    setIsListening(false)
  }, [clearAutoStop])

  return { startListening, stopListening, transcript, isListening, isSupported, error, reset }
}
