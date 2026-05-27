import { useState, useMemo } from 'react'
import type { StudyItem } from '../../types'
import type { SpeakFn } from '../../hooks/useSpeech'
import { isWordItem } from '../../types'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'

interface Props {
  items: StudyItem[]
  onComplete: () => void
  speak: SpeakFn
}

export function MatchingQuiz({ items, onComplete, speak }: Props) {
  const rightItems = useMemo(() => shuffle(items), [items])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [lastMatched, setLastMatched] = useState<string | null>(null)

  function getWord(item: StudyItem): string {
    return isWordItem(item) ? item.word : item.exampleWord
  }

  function handleLeft(id: string) {
    if (matched.has(id)) return
    setSelectedLeft(prev => prev === id ? null : id)
  }

  function handleRight(id: string) {
    if (matched.has(id) || !selectedLeft) return
    if (selectedLeft === id) {
      const matchedItem = items.find(i => i.id === id)
      if (matchedItem) speak(getWord(matchedItem), 'en-US', 1.0, 'confirm')
      const next = new Set(matched).add(id)
      setMatched(next)
      setLastMatched(id)
      setSelectedLeft(null)
      setTimeout(() => setLastMatched(null), 700)
      if (next.size === items.length) setTimeout(onComplete, 800)
    } else {
      setWrong(id)
      setTimeout(() => { setWrong(null); setSelectedLeft(null) }, 500)
    }
  }

  function btnCls(id: string, side: 'left' | 'right'): string {
    const isMatched = matched.has(id)
    const isPopping = lastMatched === id
    const isSelected = side === 'left' && selectedLeft === id
    const isWrong = side === 'right' && wrong === id
    return cn(
      'flex items-center gap-2 py-3 px-4 rounded-2xl border-2 transition-colors',
      isMatched && 'border-green-500 bg-green-50 text-green-700',
      isMatched && isPopping && 'animate-match-pop',
      !isMatched && isSelected && 'border-primary bg-brand-green-dim text-ink',
      !isMatched && isWrong && 'border-red-400 bg-red-50 text-red-600 animate-flash',
      !isMatched && !isSelected && !isWrong && (side === 'left' ? 'border-hairline bg-canvas text-ink' : 'border-hairline bg-canvas text-steel'),
    )
  }

  function Badge({ id, label }: { id: string; label: string | number }) {
    const isMatched = matched.has(id)
    return (
      <span className={cn(
        'w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 transition-colors',
        isMatched ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500',
      )}>
        {isMatched ? '✓' : label}
      </span>
    )
  }

  return (
    <div className="p-6">
      <p className="text-2xl font-bold text-ink mb-6">의미가 같은 단어끼리 짝을 지으세요</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          {items.map((item, idx) => (
            <div key={item.id} className="relative">
              {lastMatched === item.id && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-float-up text-3xl leading-none">✨</span>
              )}
              <button onClick={() => handleLeft(item.id)} className={btnCls(item.id, 'left')}>
                <Badge id={item.id} label={idx + 1} />
                <span className="text-base font-semibold">{getWord(item)}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {rightItems.map((item, idx) => (
            <div key={item.id} className="relative">
              {lastMatched === item.id && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-float-up text-3xl leading-none">✨</span>
              )}
              <button onClick={() => handleRight(item.id)} className={btnCls(item.id, 'right')}>
                <Badge id={item.id} label={items.length + idx + 1} />
                <span className="text-base font-semibold">{item.meaning}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
