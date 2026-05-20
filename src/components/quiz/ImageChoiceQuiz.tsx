import { useState, useEffect, useRef } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { cn } from '../../utils/cn'
import { CharacterBubble } from '../CharacterBubble'
import { TagBadge } from '../TagBadge'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  onWrong?: () => void
  allowNextOnWrong?: boolean
  onNext?: () => void
  speak?: (text: string, lang?: string, rate?: number) => void
  isSpeaking?: boolean
  displayMode?: 'cards' | 'list'
  tag?: ChallengeTag
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  // 선택지는 항상 단어형으로 통일 (sentence는 question prompt에만 사용)
  return isWordItem(item) ? item.word : item.exampleWord
}

function getQuestionWord(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return isWordItem(item) ? (item.sentence ?? item.word) : item.exampleWord
  return item.meaning
}

export function ImageChoiceQuiz({
  item, choices, direction, onCorrect, onWrong, allowNextOnWrong, onNext,
  speak, isSpeaking, displayMode = 'list', tag,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  const questionWord = getQuestionWord(item, direction)

  useEffect(() => {
    if (lastSpokenIdRef.current === item.id) return
    // list 모드 + 영어 단어 표시(en-to-ko)일 때만 문제별 1회 자동 발음
    if (speak && displayMode !== 'cards' && direction === 'en-to-ko') {
      lastSpokenIdRef.current = item.id
      speak(questionWord, 'en-US')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  function handleSelect(id: string) {
    if (answered) return
    setSelected(id)
    const choice = choices.find(c => c.id === id)
    if (speak && choice) {
      const word = isWordItem(choice) ? choice.word : choice.exampleWord
      speak(word, 'en-US')
    }
  }

  function handleConfirm() {
    if (!selected || answered) return
    setAnswered(true)
    if (selected !== item.id) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && (
        <div>
          <TagBadge tag={tag} />
        </div>
      )}

      {displayMode === 'cards' ? (
        <>
          <p className="text-2xl font-bold text-ink">
            다음 중 어느 그림이 {questionWord}인가요?
          </p>
          <CardChoices
            choices={choices}
            item={item}
            direction={direction}
            selected={selected}
            answered={answered}
            onSelect={handleSelect}
          />
          {selected && !answered && (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
            >
              확인 ✓
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-ink">올바른 의미를 선택하세요</p>
          <CharacterBubble
            word={questionWord}
            onSpeak={direction === 'en-to-ko' && speak ? () => speak(questionWord, 'en-US') : undefined}
            isSpeaking={isSpeaking}
          />
          <ListChoices
            choices={choices}
            item={item}
            direction={direction}
            selected={selected}
            answered={answered}
            onSelect={handleSelect}
          />
          {selected && !answered && (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
            >
              확인 ✓
            </button>
          )}
        </>
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
              'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors',
              !answered && !isSelected && 'border-hairline bg-canvas',
              !answered && isSelected && 'border-primary bg-primary/10',
              answered && isCorrect && 'border-green-500 bg-green-50',
              answered && isSelected && !isCorrect && 'border-red-400 bg-red-50',
              answered && !isSelected && !isCorrect && 'border-hairline bg-canvas opacity-40',
            )}
          >
            <span className="text-5xl">{choice.emoji}</span>
            <span className={cn(
              'text-sm font-semibold text-center leading-tight',
              !answered && 'text-ink',
              answered && isCorrect && 'text-green-800',
              answered && isSelected && !isCorrect && 'text-red-700',
              answered && !isSelected && !isCorrect && 'text-muted',
            )}>
              {getChoiceLabel(choice, direction)}
            </span>
            <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold">
              {idx + 1}
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
              'flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-colors',
              !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary/50',
              !answered && isSelected && 'border-primary bg-primary/10 text-ink',
              answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
              answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
              answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted',
            )}
          >
            <span className={cn(
              'w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0',
              !answered && !isSelected && 'border-steel text-steel',
              !answered && isSelected && 'border-primary text-primary',
              answered && isCorrect && 'border-green-500 text-green-700',
              answered && isSelected && !isCorrect && 'border-red-400 text-red-600',
              answered && !isSelected && !isCorrect && 'border-hairline text-muted',
            )}>
              {idx + 1}
            </span>
            <span className="font-semibold text-base flex-1 text-center">
              {getChoiceLabel(choice, direction)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
