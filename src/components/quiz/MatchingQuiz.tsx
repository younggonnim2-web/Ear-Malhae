import { useState, useMemo } from 'react'
import type { StudyItem } from '../../types'
import { isWordItem } from '../../types'
import { shuffle } from '../../utils/quizHelpers'

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
    return isWordItem(item) ? item.word : item.letter
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
    if (matched.has(id)) return 'border-green-500 bg-green-50 text-green-700'
    if (selectedLeft === id) return 'border-blue-500 bg-blue-50 text-blue-700'
    return 'border-gray-200 bg-white text-gray-800'
  }

  function rightCls(id: string): string {
    if (matched.has(id)) return 'border-green-500 bg-green-50 text-green-700'
    if (wrong === id) return 'border-red-400 bg-red-50 text-red-600 animate-flash'
    return 'border-gray-200 bg-white text-gray-600'
  }

  return (
    <div className="p-6">
      <p className="text-center text-gray-500 mb-4 text-lg">짝을 맞춰보세요!</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          {items.map(item => (
            <button key={item.id} onClick={() => handleLeft(item.id)}
              className={`py-5 rounded-2xl border-2 text-xl font-bold transition-colors ${leftCls(item.id)}`}>
              {getWord(item)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {rightItems.map(item => (
            <button key={item.id} onClick={() => handleRight(item.id)}
              className={`py-5 rounded-2xl border-2 text-xl transition-colors ${rightCls(item.id)}`}>
              {item.meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
