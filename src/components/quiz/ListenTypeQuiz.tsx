import { useState, useEffect, useRef, useCallback } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { cn } from '../../utils/cn'
import { TagBadge } from '../TagBadge'
import { SentenceTranslationCard } from './SentenceTranslationCard'

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
  onWrong?: () => void
  speak: (text: string, lang?: string, rate?: number) => void
  isSpeaking?: boolean
  tag?: ChallengeTag
}

export function ListenTypeQuiz({ sentence, onCorrect, onWrong, speak, isSpeaking, tag }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === sentence.id) return
    lastSpokenIdRef.current = sentence.id
    speak(sentence.english, 'en-US')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?'"]/g, '').replace(/\s+/g, ' ')

  const handleConfirm = useCallback(() => {
    if (answered || !inputValue.trim()) return
    const correct = normalize(inputValue) === normalize(sentence.english)
    setIsCorrect(correct)
    setAnswered(true)
    if (!correct) onWrong?.()
  }, [answered, inputValue, sentence.english, onWrong])

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">들리는 내용을 입력하세요</p>

      {/* 캐릭터 + 재생 버튼 */}
      <div className="flex items-center gap-4">
        <div className="text-6xl select-none">🎧</div>
        <div className="flex gap-2">
          <button
            onClick={() => speak(sentence.english, 'en-US', 1.0)}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center transition-colors hover:bg-primary/80"
            aria-label="듣기"
          >
            <span className={cn('text-2xl', isSpeaking && 'animate-speaking inline-block')}>🔊</span>
          </button>
          <button
            onClick={() => speak(sentence.english, 'en-US', 0.5)}
            className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center transition-colors hover:bg-primary/80"
            aria-label="천천히 듣기"
          >
            <span className="text-xl">🐢</span>
          </button>
        </div>
      </div>

      {/* 입력 필드 */}
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          placeholder="들은 내용을 영어로 입력하세요..."
          disabled={answered}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={cn(
            'w-full px-4 py-4 border-2 rounded-xl text-base font-semibold outline-none transition-colors',
            !answered && 'border-hairline bg-canvas text-ink focus:border-primary',
            answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
            answered && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
          )}
        />
        {answered && (
          <SentenceTranslationCard english={sentence.english} korean={sentence.korean} />
        )}
      </div>

      {/* 결과 피드백 */}
      {answered && (
        <p className={`text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-steel'}`}>
          {isCorrect ? '✓ 정답이에요! 잘했어요 👍' : '오타가 있습니다.'}
        </p>
      )}

      {!answered && (
        <button
          onClick={handleConfirm}
          disabled={!inputValue.trim()}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full disabled:bg-hairline disabled:text-muted"
        >
          확인 ✓
        </button>
      )}

      {answered && (
        <button
          onClick={onCorrect}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          계속하기 ▶
        </button>
      )}
    </div>
  )
}
