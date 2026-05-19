import { useState, useEffect } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { CharacterBubble } from '../CharacterBubble'
import { TagBadge } from '../TagBadge'

interface Props {
  sentence: SentenceItem
  blankIndex: number
  onCorrect: () => void
  onWrong?: () => void
  speak?: (text: string, lang?: string, rate?: number) => void
  isSpeaking?: boolean
  tag?: ChallengeTag
}

export function FillBlankQuiz({ sentence, blankIndex, onCorrect, onWrong, speak, isSpeaking, tag }: Props) {
  const correctAnswer = sentence.parts[blankIndex] ?? sentence.parts[0]

  const [choices] = useState(() =>
    shuffle([correctAnswer, ...sentence.distractors.slice(0, 2)])
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    if (speak) speak(sentence.english, 'en-US')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  const partialKorean = sentence.parts
    .map((p, i) => (i === blankIndex ? '______' : p))
    .join(' ')

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
    setAnswered(true)
    if (choice !== correctAnswer) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">같은 패턴으로 완성하세요</p>

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
              className={cn(
                'px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-colors',
                !answered && 'border-hairline bg-canvas text-ink hover:border-primary',
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
