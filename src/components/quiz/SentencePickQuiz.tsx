import { useState } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import type { SpeakFn } from '../../hooks/useSpeech'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { playCorrectSound } from '../../utils/sound'
import { TagBadge } from '../TagBadge'
import { SentenceTranslationCard } from './SentenceTranslationCard'

interface Props {
  sentence: SentenceItem
  allSentences: SentenceItem[]
  direction: 'en-to-ko' | 'ko-to-en'
  onCorrect: () => void
  onWrong?: () => void
  speak?: SpeakFn
  isSpeaking?: boolean
  tag?: ChallengeTag
}

export function SentencePickQuiz({ sentence, allSentences, direction, onCorrect, onWrong, speak, isSpeaking, tag }: Props) {
  const isEnToKo = direction === 'en-to-ko'
  const answer = isEnToKo ? sentence.korean : sentence.english
  const prompt = isEnToKo ? sentence.english : sentence.korean
  const label = isEnToKo ? '올바른 한국어 번역을 고르세요' : '올바른 영어 번역을 고르세요'

  const [choices] = useState(() => {
    // 정답 문장과 같은 difficulty 우선 → 부족하면 전체 폴백
    const sameDiff = allSentences.filter(
      s => s.id !== sentence.id && s.difficulty === sentence.difficulty
    )
    const pool = sameDiff.length >= 3
      ? sameDiff
      : allSentences.filter(s => s.id !== sentence.id)

    // 정답 및 이미 뽑힌 텍스트와 중복되지 않는 오답만 수집
    const seen = new Set<string>([answer])
    const wrong: string[] = []
    for (const s of shuffle(pool)) {
      if (wrong.length >= 3) break
      const text = isEnToKo ? s.korean : s.english
      if (!seen.has(text)) {
        seen.add(text)
        wrong.push(text)
      }
    }
    return shuffle([answer, ...wrong])
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
    // 영어 선택지는 TTS 재생 (en-to-ko: 프롬프트가 영어이므로 선택지는 한국어 → 스킵)
    if (!isEnToKo && speak) speak(choice, 'en-US', 1.0, 'sentence')
  }

  function handleConfirm() {
    if (!selected || answered) return
    setAnswered(true)
    if (selected !== answer) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}
      <p className="text-2xl font-bold text-ink">{label}</p>
      <div className="bg-surface rounded-2xl px-5 py-5 border-2 border-hairline">
        <p className="text-lg font-semibold text-ink leading-relaxed">{prompt}</p>
        {answered && (
          <p className="text-sm text-muted mt-1 leading-relaxed">
            {isEnToKo ? sentence.korean : sentence.english}
          </p>
        )}
        {isEnToKo && speak && (
          <button
            onClick={() => speak(prompt, 'en-US', 1.0, 'sentence')}
            className="flex items-center gap-1 text-primary text-xs font-semibold mt-2"
          >
            <span className={isSpeaking ? 'animate-speaking inline-block' : ''}>🔊</span> 다시 듣기
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {choices.map((choice, idx) => {
          const isCorrect = choice === answer
          const isSelected = choice === selected
          return (
            <button
              key={idx}
              onClick={() => handleSelect(choice)}
              disabled={answered}
              className={cn(
                'px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-colors',
                !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary',
                !answered && isSelected && 'border-primary bg-primary/10 text-ink',
                answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted opacity-50',
              )}
            >
              {choice}
            </button>
          )
        })}
      </div>
      {selected && !answered && (
        <button onClick={handleConfirm} className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full">
          확인 ✓
        </button>
      )}
      {answered && (
        <>
          <p className={`text-base font-medium ${selected === answer ? 'text-green-600' : 'text-steel'}`}>
            {selected === answer ? '✓ 정답이에요! 👍' : `정답: "${answer}"`}
          </p>
          <SentenceTranslationCard english={sentence.english} korean={sentence.korean} speak={isEnToKo ? undefined : speak} />
          <button
            onClick={() => {
              if (selected === answer) playCorrectSound()
              onCorrect()
            }}
            className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
          >
            다음 ▶
          </button>
        </>
      )}
    </div>
  )
}
