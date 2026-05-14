import { useState, useMemo } from 'react'
import type { StudyItem } from '../../types'
import { isWordItem } from '../../types'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'

interface Props {
  items: StudyItem[]
  onComplete: () => void
}

export function MatchingQuiz({ items, onComplete }: Props) {
  const rightItems = useMemo(() => shuffle(items), [items])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)

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
      const next = new Set(matched).add(id)
      setMatched(next)
      setSelectedLeft(null)
      if (next.size === items.length) setTimeout(onComplete, 600)
    } else {
      setWrong(id)
      setTimeout(() => { setWrong(null); setSelectedLeft(null) }, 500)
    }
  }

  function leftCls(id: string): string {
    return cn(
      'flex items-center gap-2 py-3 px-4 rounded-2xl border-2 transition-colors',
      matched.has(id) && 'border-green-500 bg-green-50 text-green-700',
      !matched.has(id) && selectedLeft === id && 'border-primary bg-brand-green-dim text-ink',
      !matched.has(id) && selectedLeft !== id && 'border-hairline bg-canvas text-ink',
    )
  }

  function rightCls(id: string): string {
    return cn(
      'flex items-center gap-2 py-3 px-4 rounded-2xl border-2 transition-colors',
      matched.has(id) && 'border-green-500 bg-green-50 text-green-700',
      !matched.has(id) && wrong === id && 'border-red-400 bg-red-50 text-red-600 animate-flash',
      !matched.has(id) && wrong !== id && 'border-hairline bg-canvas text-steel',
    )
  }

  return (
    <div className="p-6">
      <p className="text-2xl font-bold text-ink mb-6">의미가 같은 단어끼리 짝을 지으세요</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          {items.map((item, idx) => (
            <button key={item.id} onClick={() => handleLeft(item.id)}
              className={leftCls(item.id)}>
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-base font-semibold">{getWord(item)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {rightItems.map((item, idx) => (
            <button key={item.id} onClick={() => handleRight(item.id)}
              className={rightCls(item.id)}>
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-bold flex-shrink-0">
                {items.length + idx + 1}
              </span>
              <span className="text-base font-semibold">{item.meaning}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
