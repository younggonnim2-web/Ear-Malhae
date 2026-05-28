import { useCallback, useRef, useState } from 'react'

interface SpeechRecognitionAlternative {
  transcript: string
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
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
  interimTranscript: string
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
  const [interimTranscript, setInterimTranscript] = useState('')
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
    recognition.interimResults = true
    recognition.maxAlternatives = 3
    recognition.continuous = false

    let settled = false

    recognition.onstart = () => {
      // eslint-disable-next-line no-console
      console.log('[STT] onstart — 음성 인식 시작')
      setIsListening(true)
      setError(null)
      setTranscript('')
      setInterimTranscript('')
    }

    recognition.onresult = (event) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalText) {
        settled = true
        clearAutoStop()
        // eslint-disable-next-line no-console
        console.log('[STT] onresult (final) — 인식됨:', finalText)
        setTranscript(finalText)
        setInterimTranscript('')
        setIsListening(false)
      } else {
        setInterimTranscript(interimText)
      }
    }

    recognition.onerror = (event) => {
      settled = true
      clearAutoStop()
      // eslint-disable-next-line no-console
      console.log('[STT] onerror — 에러:', event.error)
      setError(event.error)
      setInterimTranscript('')
      setIsListening(false)
    }

    recognition.onend = () => {
      clearAutoStop()
      // eslint-disable-next-line no-console
      console.log('[STT] onend — 종료 (settled:', settled, ')')
      if (!settled) setError('no-speech')
      setInterimTranscript('')
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()

    timeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop()
    }, AUTO_STOP_MS)
  }, [Ctor, clearAutoStop])

  const stopListening = useCallback(() => {
    clearAutoStop()
    recognitionRef.current?.stop()
    setInterimTranscript('')
    setIsListening(false)
  }, [clearAutoStop])

  const reset = useCallback(() => {
    clearAutoStop()
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    setIsListening(false)
  }, [clearAutoStop])

  return { startListening, stopListening, transcript, interimTranscript, isListening, isSupported, error, reset }
}
