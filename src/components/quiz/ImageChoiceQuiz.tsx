import { useState, useEffect } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'
import { cn } from '../../utils/cn'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  onWrong?: () => void
  allowNextOnWrong?: boolean
  onNext?: () => void
  showEmoji?: boolean
  showWord?: boolean
  speak?: (text: string) => void
  isSpeaking?: boolean
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  return isWordItem(item) ? item.word : item.exampleWord
}

function getQuestion(direction: QuizDirection): string {
  return direction === 'en-to-ko' ? '뜻을 고르세요' : '영어를 고르세요'
}

function getQuestionWord(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return isWordItem(item) ? item.word : item.exampleWord
  return item.meaning
}

export function ImageChoiceQuiz({ item, choices, direction, onCorrect, onWrong, allowNextOnWrong, onNext, showEmoji = true, showWord = true, speak, isSpeaking }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const questionWord = getQuestionWord(item, direction)

  useEffect(() => {
    if (speak) speak(questionWord)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  function handleSelect(id: string) {
    if (answered) return
    setSelected(id)
    setAnswered(true)
    if (id === item.id) {
      setTimeout(onCorrect, 800)
    } else {
      onWrong?.()
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      {showEmoji && <span className="text-6xl">{item.emoji}</span>}
      {showWord && (
        <p className="text-3xl font-bold text-ink">{questionWord}</p>
      )}
      {speak && (
        <button
          onClick={() => speak(questionWord)}
          className="px-5 py-2 bg-brand-green-dim text-ink text-base font-semibold rounded-full hover:bg-brand-green-dim/80 transition-colors"
        >
          <span className={cn(isSpeaking && 'animate-speaking inline-block')}>🔊</span> 다시 듣기
        </button>
      )}
      <p className="text-xl text-steel">{getQuestion(direction)}</p>
      <div
        className="grid grid-cols-2 gap-3 w-full"
        role="radiogroup"
        aria-label="quiz choices"
      >
        {choices.map(choice => {
          const isCorrect = choice.id === item.id
          const isSelected = choice.id === selected
          return (
            <button
              key={choice.id}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'py-5 text-xl font-bold rounded-full border-2 transition-colors',
                !answered && 'border-hairline bg-canvas text-ink',
                answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted',
              )}
              onClick={() => handleSelect(choice.id)}
            >
              {getChoiceLabel(choice, direction)}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-lg font-medium ${selected === item.id ? 'text-green-600' : 'text-steel'}`}>
          {selected === item.id
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${getChoiceLabel(item, direction)}"이에요. 괜찮아요! 👏`}
        </p>
      )}
      {answered && selected !== item.id && allowNextOnWrong && (
        <button onClick={onNext} className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full">
          다음 ▶
        </button>
      )}
      {answered && selected !== item.id && !allowNextOnWrong && (
        <button onClick={onCorrect} className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full">
          다음 ▶
        </button>
      )}
    </div>
  )
}
