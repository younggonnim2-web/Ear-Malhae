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
  displayMode?: 'cards' | 'list'
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  return isWordItem(item) ? item.word : item.exampleWord
}

function getQuestion(direction: QuizDirection, displayMode: 'cards' | 'list'): string {
  if (displayMode === 'cards') return '어느 그림이 맞나요?'
  if (direction === 'en-to-ko') return '올바른 의미를 선택하세요'
  return '영어를 고르세요'
}

function getQuestionWord(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return isWordItem(item) ? item.word : item.exampleWord
  return item.meaning
}

export function ImageChoiceQuiz({
  item, choices, direction, onCorrect, onWrong, allowNextOnWrong, onNext,
  showEmoji = true, showWord = true, speak, isSpeaking, displayMode = 'list',
}: Props) {
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
    if (id !== item.id) {
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
      <p className="text-base text-steel">{getQuestion(direction, displayMode)}</p>

      {displayMode === 'cards' ? (
        <CardChoices
          choices={choices}
          item={item}
          direction={direction}
          selected={selected}
          answered={answered}
          onSelect={handleSelect}
        />
      ) : (
        <ListChoices
          choices={choices}
          item={item}
          direction={direction}
          selected={selected}
          answered={answered}
          onSelect={handleSelect}
        />
      )}

      {answered && (
        <p className={`text-lg font-medium ${selected === item.id ? 'text-green-600' : 'text-steel'}`}>
          {selected === item.id
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${getChoiceLabel(item, direction)}"이에요. 괜찮아요! 👏`}
        </p>
      )}
      {answered && (
        <button
          onClick={selected === item.id ? onCorrect : allowNextOnWrong ? onNext : onCorrect}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}

interface ChoicesProps {
  choices: StudyItem[]
  item: StudyItem
  direction: QuizDirection
  selected: string | null
  answered: boolean
  onSelect: (id: string) => void
}

function CardChoices({ choices, item, direction, selected, answered, onSelect }: ChoicesProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full" role="radiogroup" aria-label="quiz choices">
      {choices.map(choice => {
        const isCorrect = choice.id === item.id
        const isSelected = choice.id === selected
        return (
          <button
            key={choice.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(choice.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors',
              !answered && 'border-hairline bg-canvas',
              answered && isCorrect && 'border-green-500 bg-green-50',
              answered && isSelected && !isCorrect && 'border-red-400 bg-red-50',
              answered && !isSelected && !isCorrect && 'border-hairline bg-canvas opacity-40',
            )}
          >
            <span className="text-5xl">{choice.emoji}</span>
            <span className={cn(
              'text-xs font-semibold text-center leading-tight',
              !answered && 'text-ink',
              answered && isCorrect && 'text-green-800',
              answered && isSelected && !isCorrect && 'text-red-700',
              answered && !isSelected && !isCorrect && 'text-muted',
            )}>
              {getChoiceLabel(choice, direction)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ListChoices({ choices, item, direction, selected, answered, onSelect }: ChoicesProps) {
  return (
    <div className="flex flex-col gap-2 w-full" role="radiogroup" aria-label="quiz choices">
      {choices.map((choice, idx) => {
        const isCorrect = choice.id === item.id
        const isSelected = choice.id === selected
        return (
          <button
            key={choice.id}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(choice.id)}
            className={cn(
              'flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-colors text-left',
              !answered && 'border-hairline bg-canvas text-ink',
              answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
              answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
              answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted',
            )}
          >
            <span className={cn(
              'w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0',
              !answered && 'border-steel text-steel',
              answered && isCorrect && 'border-green-500 text-green-700',
              answered && isSelected && !isCorrect && 'border-red-400 text-red-600',
              answered && !isSelected && !isCorrect && 'border-hairline text-muted',
            )}>
              {idx + 1}
            </span>
            <span className="font-semibold text-base">{getChoiceLabel(choice, direction)}</span>
          </button>
        )
      })}
    </div>
  )
}
