import { useState, useMemo } from 'react'
import type { StudyItem } from '../../types'
import type { SpeakFn } from '../../hooks/useSpeech'
import { isWordItem } from '../../types'
import { shuffle } from '../../utils/quizHelpers'
import { cn } from '../../utils/cn'
import { playCorrectSound } from '../../utils/sound'

interface Props {
  items: StudyItem[]
  onComplete: () => void
  speak: SpeakFn
  onSkip?: () => void
}

const BAR_HEIGHTS = [4, 7, 10, 8, 13, 9, 7, 11, 5]

export function ListenMatchingQuiz({ items, onComplete, speak, onSkip }: Props) {
  const rightItems = useMemo(() => shuffle(items), [items])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [lastMatched, setLastMatched] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  function getWord(item: StudyItem): string {
    return isWordItem(item) ? (item.sentence ?? item.word) : item.exampleWord
  }

  function handleLeft(id: string) {
    if (matched.has(id)) return
    setSelectedLeft(prev => prev === id ? null : id)
    const item = items.find(i => i.id === id)
    if (item) {
      setPlayingId(id)
      speak(getWord(item), 'en-US')
      setTimeout(() => setPlayingId(p => p === id ? null : p), 1600)
    }
  }

  function handleRight(id: string) {
    if (matched.has(id) || !selectedLeft) return
    if (selectedLeft === id) {
      playCorrectSound()
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

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <p className="text-2xl font-bold text-ink">의미가 일치하는 단어끼리 짝을 지으세요</p>

      <div className="flex-1 flex items-center">
        <div className="flex gap-3 w-full">
          {/* 좌: 오디오 버튼 */}
          <div className="flex flex-col gap-3 flex-1">
            {items.map(item => {
              const isMatched = matched.has(item.id)
              const isSelected = selectedLeft === item.id
              const isPlaying = playingId === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleLeft(item.id)}
                  disabled={isMatched}
                  className={cn(
                    'h-14 flex items-center gap-2 px-4 rounded-2xl border-2 transition-colors',
                    isMatched && 'border-green-500 bg-green-50',
                    !isMatched && isSelected && 'border-primary bg-primary/10',
                    !isMatched && !isSelected && 'border-hairline bg-canvas',
                  )}
                >
                  <span className={cn(
                    'text-xl flex-shrink-0',
                    isMatched ? 'text-green-500' : isSelected ? 'text-primary' : 'text-steel',
                  )}>
                    🔊
                  </span>
                  <div className="flex gap-[3px] items-center">
                    {BAR_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          animationDelay: `${i * 0.06}s`,
                          transformOrigin: 'center',
                        }}
                        className={cn(
                          'rounded-full transition-colors',
                          isMatched ? 'bg-green-400' : isSelected ? 'bg-primary' : 'bg-gray-300',
                          isPlaying && 'animate-sound-bar',
                        )}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 우: 한국어 텍스트 */}
          <div className="flex flex-col gap-3 flex-1">
            {rightItems.map(item => {
              const isMatched = matched.has(item.id)
              const isWrong = wrong === item.id
              const isLastMatched = lastMatched === item.id
              return (
                <div key={item.id} className="relative">
                  {isLastMatched && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-float-up text-3xl leading-none">
                      ✨
                    </span>
                  )}
                  <button
                    onClick={() => handleRight(item.id)}
                    disabled={isMatched || !selectedLeft}
                    className={cn(
                      'w-full h-14 flex items-center justify-center px-4 rounded-2xl border-2 text-base font-semibold transition-colors',
                      isMatched && 'border-green-500 bg-green-50 text-green-700',
                      !isMatched && isWrong && 'border-red-400 bg-red-50 text-red-600 animate-flash',
                      !isMatched && !isWrong && 'border-hairline bg-canvas text-steel',
                    )}
                  >
                    {item.meaning}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full py-3 border border-hairline rounded-2xl text-sm text-steel"
        >
          지금 들을 수 없어요
        </button>
      )}
    </div>
  )
}
