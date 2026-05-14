import { useEffect } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'
import { ImageChoiceQuiz } from './ImageChoiceQuiz'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  speak: (text: string) => void
}

export function ListenChoiceQuiz({ item, choices, direction, onCorrect, speak }: Props) {
  const word = isWordItem(item) ? item.word : item.exampleWord

  useEffect(() => {
    speak(word)
  }, [item.id, speak, word])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 pt-6">
        <span className="text-6xl">🔊</span>
        <button
          onClick={() => speak(word)}
          className="px-6 py-3 bg-brand-green-dim text-ink text-lg font-semibold rounded-full hover:bg-brand-green-dim/80 transition-colors"
        >
          다시 듣기
        </button>
        <p className="text-steel">소리를 듣고 맞는 답을 고르세요</p>
      </div>
      <ImageChoiceQuiz
        item={item}
        choices={choices}
        direction={direction}
        onCorrect={onCorrect}
        showEmoji={false}
        showWord={false}
      />
    </div>
  )
}
