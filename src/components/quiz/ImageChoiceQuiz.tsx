import { useState } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  allowNextOnWrong?: boolean
  onNext?: () => void
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  return isWordItem(item) ? item.word : item.letter
}

function getQuestion(direction: QuizDirection): string {
  return direction === 'en-to-ko' ? '이 그림의 뜻은?' : '이 그림에 맞는 영어는?'
}

export function ImageChoiceQuiz({ item, choices, direction, onCorrect, allowNextOnWrong, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(id: string) {
    if (answered) return
    setSelected(id)
    setAnswered(true)
    if (id === item.id) setTimeout(onCorrect, 800)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <span className="text-6xl">{item.emoji}</span>
      <p className="text-xl text-gray-500">{getQuestion(direction)}</p>
      <div
        className="grid grid-cols-2 gap-3 w-full"
        role="radiogroup"
        aria-label="quiz choices"
      >
        {choices.map(choice => {
          const isCorrect = choice.id === item.id
          const isSelected = choice.id === selected
          let cls = 'py-5 text-xl font-bold rounded-2xl border-2 transition-colors '
          if (!answered) cls += 'border-gray-200 bg-white text-gray-800'
          else if (isCorrect) cls += 'border-green-500 bg-green-50 text-green-800'
          else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700'
          else cls += 'border-gray-100 bg-white text-gray-300'
          return (
            <button
              key={choice.id}
              role="radio"
              aria-checked={isSelected}
              className={cls}
              onClick={() => handleSelect(choice.id)}
            >
              {getChoiceLabel(choice, direction)}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-lg font-medium ${selected === item.id ? 'text-green-600' : 'text-gray-600'}`}>
          {selected === item.id
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${getChoiceLabel(item, direction)}"이에요. 괜찮아요! 👏`}
        </p>
      )}
      {answered && selected !== item.id && allowNextOnWrong && (
        <button onClick={onNext} className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl">
          다음 ▶
        </button>
      )}
      {answered && selected !== item.id && !allowNextOnWrong && (
        <button onClick={onCorrect} className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl">
          다음 ▶
        </button>
      )}
    </div>
  )
}
