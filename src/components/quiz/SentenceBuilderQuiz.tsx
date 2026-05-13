import { useState } from 'react'
import type { SentenceItem } from '../../types'
import { evaluateTyped } from '../../utils/fuzzyMatch'
import { shuffle } from '../../utils/quizHelpers'

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
}

type InputMode = 'tile' | 'type'

export function SentenceBuilderQuiz({ sentence, onCorrect }: Props) {
  const [tiles] = useState(() => shuffle([...sentence.parts, ...sentence.distractors]))
  const [selected, setSelected] = useState<string[]>([])
  const [typedValue, setTypedValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('tile')
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<'exact' | 'fuzzy' | 'wrong' | 'tile-correct' | 'tile-wrong' | null>(null)

  const handleTileClick = (tile: string) => {
    if (checked) return
    setInputMode('tile')
    setTypedValue('')
    setSelected(prev => [...prev, tile])
  }

  const handleSlotClick = (index: number) => {
    if (checked) return
    setSelected(prev => prev.filter((_, i) => i !== index))
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedValue(e.target.value)
    if (e.target.value.length > 0) {
      setInputMode('type')
      setSelected([])
    } else {
      setInputMode('tile')
    }
  }

  const handleCheck = () => {
    if (inputMode === 'type') {
      const r = evaluateTyped(typedValue, sentence.english)
      setResult(r)
      setChecked(true)
      if (r === 'exact' || r === 'fuzzy') onCorrect()
    } else {
      const correct = JSON.stringify(selected) === JSON.stringify(sentence.parts)
      setResult(correct ? 'tile-correct' : 'tile-wrong')
      setChecked(true)
      if (correct) onCorrect()
    }
  }

  const hasInput = inputMode === 'tile' ? selected.length > 0 : typedValue.length > 0

  const usedCounts: Record<string, number> = {}
  for (const t of selected) usedCounts[t] = (usedCounts[t] ?? 0) + 1
  const displayTiles = tiles.filter(t => {
    const used = usedCounts[t] ?? 0
    if (used > 0) { usedCounts[t]!--; return false }
    return true
  })

  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      <div className="text-center text-base font-bold text-blue-700 bg-blue-50 rounded-lg p-3">
        {sentence.english}
      </div>

      <div
        className={`flex flex-wrap gap-2 min-h-[44px] rounded-lg p-2 border border-dashed
          ${inputMode === 'type' ? 'opacity-40' : 'bg-gray-50 border-gray-300'}`}
      >
        {selected.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleSlotClick(i)}
            disabled={checked || inputMode === 'type'}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold"
          >
            {tile}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        또는 직접 입력
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <input
        type="text"
        value={typedValue}
        onChange={handleTypeChange}
        disabled={checked}
        placeholder="직접 입력해보세요"
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base
          focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
      />

      {checked && result && (
        <div className={`text-center text-sm font-bold rounded-lg p-2
          ${result === 'exact' || result === 'tile-correct'
            ? 'text-green-700 bg-green-50'
            : result === 'fuzzy'
            ? 'text-blue-700 bg-blue-50'
            : 'text-red-600 bg-red-50'}`}
        >
          {result === 'exact' && '✓ 완벽해요! 👍'}
          {result === 'tile-correct' && '✓ 완성했어요! 👍'}
          {result === 'fuzzy' && `거의 맞아요! 정확한 표현: ${sentence.english}`}
          {(result === 'wrong' || result === 'tile-wrong') && `정답: ${sentence.english}`}
        </div>
      )}

      <div className={`flex flex-wrap gap-2 flex-1 content-start
        ${inputMode === 'type' ? 'opacity-40' : ''}`}
      >
        {displayTiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(tile)}
            disabled={checked || inputMode === 'type'}
            className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm
              font-semibold disabled:opacity-50 hover:border-blue-300"
          >
            {tile}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!hasInput}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-base
            disabled:bg-gray-300"
        >
          확인
        </button>
      ) : (
        <button
          onClick={onCorrect}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-base"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}
