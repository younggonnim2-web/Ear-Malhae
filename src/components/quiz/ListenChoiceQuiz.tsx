import { useState, useEffect, useRef } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'
import type { SpeakFn } from '../../hooks/useSpeech'
import { cn } from '../../utils/cn'
import { playCorrectSound } from '../../utils/sound'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  onWrong?: () => void
  speak: SpeakFn
  isSpeaking?: boolean
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  // 선택지는 항상 단어형으로 통일 (sentence는 question prompt에만 사용)
  return isWordItem(item) ? item.word : item.exampleWord
}

export function ListenChoiceQuiz({ item, choices, direction, onCorrect, onWrong, speak, isSpeaking }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const word = isWordItem(item) ? (item.sentence ?? item.word) : item.exampleWord
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === item.id) return
    lastSpokenIdRef.current = item.id
    const timer = setTimeout(() => speak(word, 'en-US'), 1200)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id])

  function handleSelect(id: string) {
    if (answered) return
    setSelected(id)
  }

  function handleConfirm() {
    if (!selected || answered) return
    setAnswered(true)
    if (selected !== item.id) onWrong?.()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <p className="text-2xl font-bold text-ink">들은 내용을 탭하세요</p>

      <div className="flex gap-4">
        <button
          onClick={() => speak(word, 'en-US')}
          className={cn(
            'w-16 h-16 rounded-2xl bg-primary flex items-center justify-center transition-colors hover:bg-primary/80',
          )}
          aria-label="보통 속도로 듣기"
        >
          <span className={cn('text-3xl text-white', isSpeaking && 'animate-speaking inline-block')}>🔊</span>
        </button>
        <button
          onClick={() => speak(word, 'en-US', 0.3)}
          className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center transition-colors hover:bg-primary/80"
          aria-label="천천히 듣기"
        >
          <span className="text-xl text-white">🐢</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center w-full">
        {choices.map(choice => {
          const isCorrect = choice.id === item.id
          const isSelected = choice.id === selected
          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              className={cn(
                'px-6 py-3 rounded-full border-2 text-base font-semibold transition-colors',
                !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary',
                !answered && isSelected && 'border-primary bg-primary/10 text-ink',
                answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted opacity-50',
              )}
            >
              {getChoiceLabel(choice, direction)}
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
        <p className={`text-lg font-medium ${selected === item.id ? 'text-green-600' : 'text-steel'}`}>
          {selected === item.id
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${getChoiceLabel(item, direction)}"이에요. 괜찮아요! 👏`}
        </p>
      )}

      {answered && (
        <button
          onClick={() => {
            if (selected === item.id) playCorrectSound()
            onCorrect()
          }}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}
