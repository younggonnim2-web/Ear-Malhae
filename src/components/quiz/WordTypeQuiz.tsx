import { useState, useEffect, useRef, useCallback } from 'react'
import type { StudyItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { isWordItem } from '../../types'
import { cn } from '../../utils/cn'
import { playCorrectSound } from '../../utils/sound'
import { TagBadge } from '../TagBadge'

interface Props {
  item: StudyItem
  onCorrect: () => void
  onWrong?: () => void
  tag?: ChallengeTag
}

type AnswerResult = 'correct' | 'typo' | 'wrong'

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function checkWord(input: string, correct: string): AnswerResult {
  const a = input.trim().toLowerCase().replace(/[.,!?'"]/g, '')
  const b = correct.trim().toLowerCase()
  if (a === b) return 'correct'
  const threshold = b.length <= 3 ? 0 : b.length <= 6 ? 1 : 2
  return levenshtein(a, b) <= threshold ? 'typo' : 'wrong'
}

function koParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xAC00 || code > 0xD7A3) return '을(를)'
  return (code - 0xAC00) % 28 === 0 ? '를' : '을'
}

export function WordTypeQuiz({ item, onCorrect, onWrong, tag }: Props) {
  const word = isWordItem(item) ? item.word : item.letter
  const meaning = item.meaning
  const emoji = item.emoji

  const [inputValue, setInputValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleConfirm = useCallback(() => {
    if (answered || !inputValue.trim()) return
    const r = checkWord(inputValue, word)
    setResult(r)
    setAnswered(true)
    if (r === 'wrong') onWrong?.()
  }, [answered, inputValue, word, onWrong])

  const isAccepted = result === 'correct' || result === 'typo'
  const particle = koParticle(meaning)

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">
        영어로 &ldquo;{meaning}&rdquo;{particle} 작성하세요
      </p>

      {/* 이모지 */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[96px] leading-none select-none">{emoji}</span>
      </div>

      {/* 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
        placeholder="영어로 입력하세요..."
        disabled={answered}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        className={cn(
          'w-full px-4 py-4 border-2 rounded-xl text-base font-semibold outline-none transition-colors',
          !answered && 'border-hairline bg-canvas text-ink focus:border-primary',
          answered && isAccepted && 'border-green-500 bg-green-50 text-green-800',
          answered && result === 'wrong' && 'border-red-400 bg-red-50 text-red-700',
        )}
      />

      {/* 결과 피드백 */}
      {answered && result === 'correct' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-4">
          <p className="text-base font-bold text-green-700">멋져요! 🎉</p>
        </div>
      )}

      {answered && result === 'typo' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-4 flex flex-col gap-1">
          <p className="text-base font-bold text-green-700">오타가 있습니다.</p>
          <p className="text-sm font-semibold">
            <span className="underline decoration-orange-500 decoration-2 text-orange-600">{word}</span>
          </p>
        </div>
      )}

      {answered && result === 'wrong' && (
        <div className="rounded-2xl bg-surface border border-hairline px-4 py-4 flex flex-col gap-1">
          <p className="text-sm text-steel">정답</p>
          <p className="text-base font-bold text-ink">{word}</p>
        </div>
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
          onClick={() => {
            if (isAccepted) playCorrectSound()
            onCorrect()
          }}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
        >
          계속하기 ▶
        </button>
      )}
    </div>
  )
}
