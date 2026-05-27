import { useCallback, useState } from 'react'

/** 퀴즈 역할별 목소리 구분
 *  - word:      단어 학습 (flash, image-choice, listen-choice, matching 확인)
 *  - sentence:  문장 퀴즈 (sentence-builder, fill-blank, listen-type 등)
 *  - confirm:   매칭 정답 효과음 (가장 짧고 경쾌한 목소리)
 */
export type VoiceRole = 'word' | 'sentence' | 'confirm'

// 역할별 우선 목소리 이름 (포함 여부로 매칭)
const ROLE_PRIORITY: Record<VoiceRole, string[]> = {
  word:     ['Aria', 'Samantha', 'Jenny', 'Zira', 'Google US English Female', 'Microsoft Zira'],
  sentence: ['Libby', 'Sonia', 'Google UK English Female', 'Karen', 'Moira', 'Microsoft Libby', 'Microsoft Sonia'],
  confirm:  ['Guy', 'David', 'Mark', 'Davis', 'Ryan', 'Google US English Male', 'Microsoft David', 'Microsoft Guy', 'Microsoft Ryan'],
}

// 모듈 레벨 캐시 (인스턴스 간 공유)
let voiceMap: Record<VoiceRole, SpeechSynthesisVoice | null> | null = null

function pickVoice(role: VoiceRole, taken: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
  if (en.length === 0) return null
  for (const pattern of ROLE_PRIORITY[role]) {
    const found = en.find(v => v.name.includes(pattern) && !taken.includes(v))
    if (found) return found
  }
  // 폴백: taken에 없는 아무 영어 목소리
  return en.find(v => !taken.includes(v)) ?? en[0] ?? null
}

function buildVoiceMap(): Record<VoiceRole, SpeechSynthesisVoice | null> {
  const word = pickVoice('word', [])
  const confirm = pickVoice('confirm', word ? [word] : [])
  const sentence = pickVoice('sentence', [word, confirm].filter(Boolean) as SpeechSynthesisVoice[])
  return { word, sentence, confirm }
}

function getVoiceMap(): Record<VoiceRole, SpeechSynthesisVoice | null> {
  if (!voiceMap) voiceMap = buildVoiceMap()
  return voiceMap
}

// Chrome: voices는 비동기 로드 → 변경 시 캐시 초기화
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { voiceMap = null }
}

export type SpeakFn = (text: string, lang?: string, rate?: number, role?: VoiceRole) => void

interface UseSpeechResult {
  speak: SpeakFn
  isSupported: boolean
  isSpeaking: boolean
}

export function useSpeech(): UseSpeechResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback<SpeakFn>((text, lang = 'en-US', rate = 1.0, role = 'word') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate

    const voice = getVoiceMap()[role]
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    // Chrome bug: speak() immediately after cancel() sometimes silently fails
    setTimeout(() => window.speechSynthesis.speak(utterance), 50)
  }, [isSupported])

  return { speak, isSupported, isSpeaking }
}
