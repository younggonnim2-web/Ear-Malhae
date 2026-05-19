import { useState, useEffect } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { CharacterBubble } from '../CharacterBubble'
import { TagBadge } from '../TagBadge'

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
  onWrong?: () => void
  speak?: (text: string, lang?: string, rate?: number) => void
  direction?: 'en-to-ko' | 'ko-to-en'
  tag?: ChallengeTag
  isSpeaking?: boolean
}

export function SentenceBuilderQuiz({ sentence, onCorrect, onWrong, speak, direction = 'en-to-ko', tag, isSpeaking }: Props) {
  const isEnToKo = direction === 'en-to-ko'

  // en-to-ko: Korean tile bank (parts + distractors)
  // ko-to-en: English tile bank (english words + englishDistractors)
  const englishTiles = sentence.english.replace(/[.,!?]/g, '').split(' ')

  const [tiles] = useState(() =>
    isEnToKo
      ? shuffle([...sentence.parts, ...sentence.distractors])
      : shuffle([...englishTiles, ...sentence.englishDistractors])
  )
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)

  useEffect(() => {
    // auto-speak only for en-to-ko (read the English sentence aloud)
    if (isEnToKo && speak) {
      speak(sentence.english, 'en-US')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  const handleTileClick = (tile: string) => {
    if (checked) return
    setSelected(prev => [...prev, tile])
    if (speak) {
      if (isEnToKo) {
        const idx = sentence.parts.indexOf(tile)
        const word = idx >= 0 ? sentence.englishParts[idx] : null
        if (word) speak(word, 'en-US')
      } else {
        speak(tile, 'en-US')
      }
    }
  }

  const handleSlotClick = (index: number) => {
    if (checked) return
    setSelected(prev => prev.filter((_, i) => i !== index))
  }

  const handleCheck = () => {
    const correct = isEnToKo
      ? JSON.stringify(selected) === JSON.stringify(sentence.parts)
      : JSON.stringify(selected) === JSON.stringify(englishTiles)
    setResult(correct ? 'correct' : 'wrong')
    setChecked(true)
    if (!correct) onWrong?.()
    setTimeout(onCorrect, 1200)
  }

  const hasInput = selected.length > 0

  const usedCounts: Record<string, number> = {}
  for (const t of selected) usedCounts[t] = (usedCounts[t] ?? 0) + 1
  const remaining = { ...usedCounts }
  const displayTiles = tiles.filter(t => {
    if ((remaining[t] ?? 0) > 0) { remaining[t]!--; return false }
    return true
  })

  const questionLabel = isEnToKo ? '한국어로 작성하세요' : '영어로 작성하세요'
  const displayWord = isEnToKo ? sentence.english : sentence.korean

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {tag && (
        <div>
          <TagBadge tag={tag} />
        </div>
      )}

      <p className="text-2xl font-bold text-ink">{questionLabel}</p>

      <CharacterBubble
        word={displayWord}
        onSpeak={isEnToKo && speak ? () => speak(sentence.english, 'en-US') : undefined}
        isSpeaking={isSpeaking}
      />

      <div className="flex-1 h-px bg-hairline my-1" />

      <div
        className={cn(
          'flex flex-wrap gap-2 min-h-[56px] rounded-xl p-3 border-2 border-dashed border-hairline bg-surface',
        )}
      >
        {selected.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleSlotClick(i)}
            disabled={checked}
            className="px-3 py-2 bg-canvas border-2 border-primary rounded-xl text-sm font-semibold text-ink disabled:opacity-70"
          >
            {tile}
          </button>
        ))}
      </div>

      <div className="flex-1 h-px bg-hairline my-1" />

      <div className="flex flex-wrap gap-2">
        {displayTiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(tile)}
            disabled={checked}
            className="px-3 py-2 bg-canvas border-2 border-hairline rounded-xl text-sm
              font-semibold disabled:opacity-50 hover:border-primary"
          >
            {tile}
          </button>
        ))}
      </div>

      {checked && result && (
        <div
          className={cn(
            'text-center text-sm font-bold rounded-lg p-2',
            result === 'correct' && 'text-green-700 bg-green-50',
            result === 'wrong' && 'text-red-600 bg-red-50',
          )}
        >
          {result === 'correct' && '✓ 완성했어요! 👍'}
          {result === 'wrong' && `정답: ${isEnToKo ? sentence.parts.join(' ') : englishTiles.join(' ')}`}
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={!hasInput || checked}
        className="w-full py-3 bg-primary text-ink rounded-full font-bold text-base
          disabled:bg-hairline disabled:text-muted"
      >
        확인
      </button>
    </div>
  )
}
