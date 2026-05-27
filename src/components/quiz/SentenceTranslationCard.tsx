import { useState } from 'react'
import type { SpeakFn } from '../../hooks/useSpeech'
import { cn } from '../../utils/cn'

interface Props {
  english: string
  korean: string
  speak?: SpeakFn
  userInput?: string
}

function lev(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[.,!?'"]/g, '')
}

function computeWrongIndices(correct: string, input: string): Set<number> {
  const correctWords = correct.trim().split(/\s+/)
  const inputWords = normalize(input).split(/\s+/).filter(Boolean)
  const wrong = new Set<number>()

  correctWords.forEach((word, i) => {
    const cn = normalize(word)
    if (!cn) return
    const hasMatch = inputWords.some(iw => {
      if (!iw) return false
      if (iw === cn) return true
      // 붙여쓴 단어 포함 여부 (fittingroom ↔ fitting)
      if (iw.includes(cn) || cn.includes(iw)) return true
      // 오타 허용: 글자 수의 30% or 최소 1
      return lev(iw, cn) <= Math.max(1, Math.floor(cn.length * 0.3))
    })
    if (!hasMatch) wrong.add(i)
  })
  return wrong
}

export function SentenceTranslationCard({ english, korean, speak, userInput }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)

  function handleSpeak() {
    if (!speak) return
    speak(english, 'en-US', 1.0, 'sentence')
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 3000)
  }

  const wrongIndices = userInput ? computeWrongIndices(english, userInput) : null
  const englishWords = english.trim().split(/\s+/)

  return (
    <div className="px-4 py-3 bg-surface rounded-xl border border-hairline">
      <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">문장 해석</p>
      <div className="flex items-start justify-between gap-2">
        {wrongIndices ? (
          <p className="text-base font-bold text-ink leading-snug flex-1">
            {englishWords.map((word, i) => (
              <span key={i}>
                {i > 0 && ' '}
                {wrongIndices.has(i)
                  ? <span className="underline decoration-orange-500 decoration-2 text-orange-600">{word}</span>
                  : word
                }
              </span>
            ))}
          </p>
        ) : (
          <p className="text-base font-bold text-ink leading-snug flex-1">{english}</p>
        )}
        {speak && (
          <button
            onClick={handleSpeak}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-hairline hover:bg-steel/20 transition-colors flex-shrink-0 mt-0.5"
            aria-label="듣기"
          >
            <span className={cn('text-sm', isPlaying && 'animate-speaking inline-block')}>🔊</span>
          </button>
        )}
      </div>
      <p className="text-sm text-steel mt-1 leading-snug">{korean}</p>
    </div>
  )
}
