import { useState, useEffect, useRef } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import type { SpeakFn } from '../../hooks/useSpeech'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { playCorrectSound } from '../../utils/sound'
import { CharacterBubble } from '../CharacterBubble'
import { TagBadge } from '../TagBadge'
import { SentenceTranslationCard } from './SentenceTranslationCard'

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
  onWrong?: () => void
  speak?: SpeakFn
  direction?: 'en-to-ko' | 'ko-to-en'
  tag?: ChallengeTag
  isSpeaking?: boolean
  listenBuild?: boolean
  distractorCount?: number
  autoAdvance?: boolean
}

export function SentenceBuilderQuiz({ sentence, onCorrect, onWrong, speak, direction = 'en-to-ko', tag, isSpeaking, listenBuild, distractorCount, autoAdvance = true }: Props) {
  // listenBuild: 한국어 텍스트 숨기고 오디오만 듣고 영어 타일 배열 (Dictation 모드)
  const isEnToKo = direction === 'en-to-ko' && !listenBuild

  // en-to-ko: Korean tile bank (parts + distractors)
  // ko-to-en: English tile bank (english words + englishDistractors)
  const englishTiles = sentence.english.replace(/[.,!?]/g, '').split(' ')

  const [tiles] = useState(() => {
    const koDistractors = distractorCount !== undefined
      ? shuffle([...sentence.distractors]).slice(0, distractorCount)
      : sentence.distractors
    const enDistractors = distractorCount !== undefined
      ? shuffle([...sentence.englishDistractors]).slice(0, distractorCount)
      : sentence.englishDistractors
    return isEnToKo
      ? shuffle([...sentence.parts, ...koDistractors])
      : shuffle([...englishTiles, ...enDistractors])
  })
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === sentence.id) return
    lastSpokenIdRef.current = sentence.id
    if (speak) {
      speak(sentence.english, 'en-US', 1.0, 'sentence')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  const handleTileClick = (tile: string) => {
    if (checked) return
    setSelected(prev => [...prev, tile])
    if (speak) {
      if (isEnToKo) {
        // 정답 타일 → englishParts에서 매핑
        const partsIdx = sentence.parts.indexOf(tile)
        if (partsIdx >= 0 && sentence.englishParts[partsIdx]) {
          speak(sentence.englishParts[partsIdx], 'en-US', 1.0, 'sentence')
          return
        }
        // 오답 타일 → englishDistractors에서 매핑 (평행 배열 가정)
        const distrIdx = sentence.distractors.indexOf(tile)
        if (distrIdx >= 0 && sentence.englishDistractors[distrIdx]) {
          speak(sentence.englishDistractors[distrIdx], 'en-US', 1.0, 'sentence')
        }
      } else {
        speak(tile, 'en-US', 1.0, 'sentence')
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
    if (autoAdvance && correct) setTimeout(onCorrect, 2000)
  }

  const hasInput = selected.length > 0

  const usedCounts: Record<string, number> = {}
  for (const t of selected) usedCounts[t] = (usedCounts[t] ?? 0) + 1
  const remaining = { ...usedCounts }
  const displayTiles = tiles.filter(t => {
    if ((remaining[t] ?? 0) > 0) { remaining[t]!--; return false }
    return true
  })

  const questionLabel = listenBuild
    ? '들리는 문장을 영어로 만드세요'
    : (isEnToKo ? '한국어로 작성하세요' : '영어로 작성하세요')
  const displayWord = isEnToKo ? sentence.english : sentence.korean

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {tag && (
        <div>
          <TagBadge tag={tag} />
        </div>
      )}

      <p className="text-2xl font-bold text-ink">{questionLabel}</p>

      {listenBuild ? (
        <>
          <button
            onClick={() => speak?.(sentence.english, 'en-US')}
            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            aria-label="다시 듣기"
          >
            <span className="text-7xl select-none">🦉</span>
            <div className="relative bg-brand-green-dim rounded-2xl px-6 py-3 shadow-sm">
              <span className={cn('text-2xl font-bold text-ink', isSpeaking && 'animate-speaking inline-block')}>
                🔊 다시 듣기
              </span>
            </div>
          </button>
          {checked && (
            <p className="text-center text-sm text-muted">{sentence.korean}</p>
          )}
        </>
      ) : (
        <>
          <CharacterBubble
            word={displayWord}
            onSpeak={!listenBuild && speak ? () => speak(sentence.english, 'en-US', 1.0, 'sentence') : undefined}
            isSpeaking={isSpeaking}
          />
          {checked && (
            <p className="text-center text-sm text-muted -mt-2">
              {isEnToKo ? sentence.korean : sentence.english}
            </p>
          )}
        </>
      )}

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
        <>
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
          <SentenceTranslationCard english={sentence.english} korean={sentence.korean} speak={isEnToKo || listenBuild ? undefined : speak} />
        </>
      )}

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={!hasInput}
          className="w-full py-3 bg-primary text-ink rounded-full font-bold text-base
            disabled:bg-hairline disabled:text-muted"
        >
          확인
        </button>
      )}

      {checked && (!autoAdvance || result === 'wrong') && (
        <button
          onClick={() => {
            if (result === 'correct') playCorrectSound()
            onCorrect()
          }}
          className="w-full py-3 bg-primary text-ink rounded-full font-bold text-base"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}
