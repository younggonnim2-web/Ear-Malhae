import { useState, useEffect, useRef } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { CharacterBubble } from '../CharacterBubble'
import { TagBadge } from '../TagBadge'

interface Props {
  sentence: SentenceItem
  blankIndex: number
  direction?: 'ko' | 'en'
  onCorrect: () => void
  onWrong?: () => void
  speak?: (text: string, lang?: string, rate?: number) => void
  isSpeaking?: boolean
  tag?: ChallengeTag
}

export function FillBlankQuiz({ sentence, blankIndex, direction = 'ko', onCorrect, onWrong, speak, isSpeaking, tag }: Props) {
  const isEn = direction === 'en'
  const correctAnswer = isEn
    ? (sentence.englishParts[blankIndex] ?? sentence.englishParts[0])
    : (sentence.parts[blankIndex] ?? sentence.parts[0])

  const [choices] = useState(() => {
    const pool = isEn ? sentence.englishDistractors : sentence.distractors
    const wrong = shuffle([...pool]).slice(0, 2)
    return shuffle([correctAnswer, ...wrong])
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === sentence.id) return
    lastSpokenIdRef.current = sentence.id
    if (speak) speak(sentence.english, 'en-US')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  const partialKorean = sentence.parts
    .map((p, i) => (i === blankIndex ? '______' : p))
    .join(' ')

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
  }

  function handleConfirm() {
    if (!selected || answered) return
    setAnswered(true)
    if (selected !== correctAnswer) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">빈칸을 채우세요</p>

      {isEn ? (
        <>
          <CharacterBubble
            word={sentence.korean}
            onSpeak={speak ? () => speak(sentence.english, 'en-US') : undefined}
            isSpeaking={isSpeaking}
          />

          {/* 영어 문장 인라인 빈칸 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 bg-surface rounded-2xl px-5 py-4 border-2 border-hairline">
            {sentence.englishParts.map((part, i) =>
              i === blankIndex ? (
                <span
                  key={i}
                  className={cn(
                    'px-3 py-1 border-b-2 min-w-[56px] text-center text-lg font-bold',
                    !selected && 'border-steel text-transparent select-none',
                    selected && !answered && 'border-primary text-primary',
                    answered && selected === correctAnswer && 'border-green-500 text-green-700',
                    answered && selected !== correctAnswer && 'border-red-400 text-red-600',
                  )}
                >
                  {selected ?? '    '}
                </span>
              ) : (
                <span key={i} className="text-xl font-semibold text-ink">{part}</span>
              )
            )}
          </div>

          {/* 영어 선택지 칩 */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {choices.map(choice => {
              const isCorrect = choice === correctAnswer
              const isSelected = choice === selected
              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={answered}
                  className={cn(
                    'px-5 py-2 rounded-xl border-2 text-base font-semibold transition-colors',
                    !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary',
                    !answered && isSelected && 'border-primary bg-primary/10 text-primary',
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
        </>
      ) : (
        <>
          <CharacterBubble
            word={sentence.english}
            onSpeak={speak ? () => speak(sentence.english, 'en-US') : undefined}
            isSpeaking={isSpeaking}
          />

          <div className="bg-surface rounded-2xl px-5 py-4 border-2 border-hairline">
            <p className="text-xl font-semibold text-ink tracking-wide">{partialKorean}</p>
          </div>

          <div className="flex flex-col gap-2">
            {choices.map(choice => {
              const isCorrect = choice === correctAnswer
              const isSelected = choice === selected
              return (
                <button
                  key={choice}
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
        </>
      )}

      {selected && !answered && (
        <button
          onClick={handleConfirm}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          확인 ✓
        </button>
      )}

      {answered && (
        <p className={`text-lg font-medium ${selected === correctAnswer ? 'text-green-600' : 'text-steel'}`}>
          {selected === correctAnswer
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${correctAnswer}"이에요. 괜찮아요! 👏`}
        </p>
      )}

      {answered && (
        <button
          onClick={onCorrect}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}
