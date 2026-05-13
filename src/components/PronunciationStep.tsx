import { useEffect } from 'react'
import type { StudyItem } from '../types'
import { isWordItem } from '../types'
import { useSpeech } from '../hooks/useSpeech'

interface Props {
  item: StudyItem
  onComplete: () => void
}

export function PronunciationStep({ item, onComplete }: Props) {
  const { speak, isSupported } = useSpeech()
  const word = isWordItem(item) ? item.word : item.exampleWord

  useEffect(() => {
    if (isSupported) speak(word)
  }, [item.id, speak, isSupported])

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="bg-gray-100 rounded-3xl p-8 w-full flex flex-col items-center gap-4">
        <span className="text-7xl">{item.emoji}</span>
        <span className="text-4xl font-bold tracking-widest text-gray-900">{word}</span>
        <div className="w-10 h-1 bg-primary rounded-full" />
        <span className="text-2xl text-gray-600">{item.meaning}</span>
      </div>
      {isSupported && (
        <button
          onClick={() => speak(word)}
          className="w-full py-4 bg-blue-50 text-primary text-xl font-semibold rounded-2xl"
        >
          🔊 발음 다시 듣기
        </button>
      )}
      {!isSupported && (
        <p className="text-sm text-gray-400 text-center">이 브라우저는 발음 기능을 지원하지 않습니다</p>
      )}
      <button
        onClick={onComplete}
        className="w-full py-4 bg-green-500 text-white text-xl font-bold rounded-2xl"
      >
        완료 ✓
      </button>
    </div>
  )
}
