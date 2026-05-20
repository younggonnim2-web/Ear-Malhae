import { useEffect, useRef } from 'react'
import type { StudyItem } from '../types'
import { isWordItem } from '../types'
import { useSpeech } from '../hooks/useSpeech'
import { cn } from '../utils/cn'

interface Props {
  item: StudyItem
  onNext: () => void
}

export function FlashCard({ item, onNext }: Props) {
  const { speak, isSupported, isSpeaking } = useSpeech()
  const word = isWordItem(item) ? item.word : item.exampleWord
  const meaning = item.meaning
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === item.id) return
    lastSpokenIdRef.current = item.id
    if (isSupported) speak(word)
  }, [item.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="bg-surface border border-hairline rounded-2xl p-8 w-full flex flex-col items-center gap-4">
        <span className="text-7xl">{item.emoji}</span>
        <span className="text-4xl font-bold tracking-widest text-ink">{word}</span>
        <div className="w-10 h-1 bg-primary rounded-full" />
        <span className="text-2xl text-steel">{meaning}</span>
      </div>
      {isSupported && (
        <button
          onClick={() => speak(word)}
          className="w-full py-4 bg-surface border border-hairline text-ink text-xl font-semibold rounded-full"
        >
          <span className={cn(isSpeaking && 'animate-speaking inline-block')}>🔊</span> 발음 듣기
        </button>
      )}
      <button
        onClick={onNext}
        className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
      >
        다음 ▶
      </button>
    </div>
  )
}
