import { useState, useEffect, useRef } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import type { SpeakFn } from '../../hooks/useSpeech'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { TagBadge } from '../TagBadge'
import { SentenceTranslationCard } from './SentenceTranslationCard'

interface Props {
  sentence: SentenceItem
  allSentences: SentenceItem[]
  onCorrect: () => void
  onWrong?: () => void
  speak?: SpeakFn
  isSpeaking?: boolean
  tag?: ChallengeTag
}

export function DialogueChoiceQuiz({ sentence, allSentences, onCorrect, onWrong, speak, isSpeaking, tag }: Props) {
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [translationVisible, setTranslationVisible] = useState(false)
  const hasPlayedRef = useRef(false)

  const prompt = sentence.dialoguePrompt ?? ''
  const answer = sentence.english

  const [choices] = useState(() => {
    // englishDistractors: 문맥상 틀렸지만 문법적으로 맞는 오답들
    const seen = new Set<string>([answer])
    const distractors: string[] = []
    for (const d of sentence.englishDistractors) {
      if (distractors.length >= 3) break
      if (!seen.has(d)) { seen.add(d); distractors.push(d) }
    }
    // 부족하면 다른 문장으로 보충 (중복 제외)
    if (distractors.length < 3) {
      for (const s of shuffle(allSentences.filter(s => s.id !== sentence.id))) {
        if (distractors.length >= 3) break
        if (!seen.has(s.english)) { seen.add(s.english); distractors.push(s.english) }
      }
    }
    return shuffle([answer, ...distractors])
  })

  useEffect(() => {
    // 타이머는 매 마운트마다 시작 (StrictMode 두 번째 마운트에서도 동작)
    const timer = setTimeout(() => setChoicesVisible(true), 2000)
    // TTS는 한 번만 (hasPlayedRef로 중복 방지)
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true
      if (speak && prompt) speak(prompt, 'en-US', 1.0, 'sentence')
    }
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
  }

  function handleConfirm() {
    if (!selected || answered) return
    setAnswered(true)
    if (selected !== answer) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-lg font-bold text-ink">이 상황에 맞는 대답을 고르세요</p>

      {/* 상황 설명 힌트 */}
      {sentence.scenario && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-base shrink-0">📍</span>
          <p className="text-sm font-medium text-amber-800">{sentence.scenario}</p>
        </div>
      )}

      {/* 상대방 말풍선 */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-steel/20 flex items-center justify-center text-xl shrink-0">
          💬
        </div>
        <div className="bg-surface border-2 border-hairline rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-ink leading-relaxed flex-1">{prompt}</p>
            {sentence.dialoguePromptKorean && !answered && (
              <button
                onClick={() => setTranslationVisible(v => !v)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-steel/10 hover:bg-steel/20 transition-colors mt-0.5"
                aria-label="번역 보기"
              >
                <span className="text-sm">🌐</span>
              </button>
            )}
          </div>
          {(translationVisible || answered) && sentence.dialoguePromptKorean && (
            <p className="text-xs text-muted mt-1.5 leading-relaxed border-t border-hairline pt-1.5">
              {sentence.dialoguePromptKorean}
            </p>
          )}
          {speak && (
            <button
              onClick={() => speak(prompt, 'en-US', 1.0, 'sentence')}
              className="flex items-center gap-1 text-primary text-xs font-semibold mt-2"
            >
              <span className={isSpeaking ? 'animate-speaking inline-block' : ''}>🔊</span> 다시 듣기
            </button>
          )}
        </div>
      </div>

      {/* 선택지 — 2초 후 등장 */}
      {!choicesVisible ? (
        <div className="flex flex-col items-center gap-3 py-6 text-steel">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl animate-pulse">👂</span>
          </div>
          <p className="text-sm font-semibold">잘 들어보세요...</p>
        </div>
      ) : (
        <>
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
                    'px-4 py-3 rounded-2xl border-2 text-sm font-semibold text-left transition-colors leading-snug',
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
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
            >
              확인 ✓
            </button>
          )}

          {answered && (
            <>
              <p className={`text-base font-medium ${selected === answer ? 'text-green-600' : 'text-steel'}`}>
                {selected === answer ? '✓ 정답이에요! 👍' : `정답: "${answer}"`}
              </p>
              <SentenceTranslationCard english={sentence.english} korean={sentence.korean} />
              <button
                onClick={onCorrect}
                className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
              >
                다음 ▶
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
