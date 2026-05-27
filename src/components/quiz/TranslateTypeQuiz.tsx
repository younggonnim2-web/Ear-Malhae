import { useState, useEffect, useRef, useCallback } from 'react'
import type { SentenceItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import type { SpeakFn } from '../../hooks/useSpeech'
import { checkBestAnswer, stripPunct } from '../../utils/answerCheck'
import type { AnswerResult } from '../../utils/answerCheck'
import { cn } from '../../utils/cn'
import { TagBadge } from '../TagBadge'
import { SentenceTranslationCard } from './SentenceTranslationCard'

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
  onWrong?: () => void
  speak?: SpeakFn
  tag?: ChallengeTag
}

function TypoCorrectionLine({ sentence, typoIndices }: { sentence: string; typoIndices: Set<number> }) {
  const words = sentence.trim().split(/\s+/)
  return (
    <p className="text-sm font-semibold text-green-800 leading-relaxed">
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          {typoIndices.has(i)
            ? <span className="underline decoration-orange-500 decoration-2 text-orange-600">{word}</span>
            : stripPunct(word)
          }
        </span>
      ))}
    </p>
  )
}

export function TranslateTypeQuiz({ sentence, onCorrect, onWrong, speak, tag }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [typoIndices, setTypoIndices] = useState<Set<number>>(new Set())
  const [hintVisible, setHintVisible] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [corrected, setCorrected] = useState(sentence.english)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleHintTap = () => {
    if (answered) return
    setHintVisible(prev => !prev)
    setHintUsed(true)
  }

  const handleConfirm = useCallback(() => {
    if (answered || !inputValue.trim()) return
    const { result, typoIndices: ti, corrected: cor } = checkBestAnswer(
      inputValue, sentence.english, sentence.acceptableAnswers
    )
    setAnswerResult(result)
    setTypoIndices(ti)
    setCorrected(cor)
    setAnswered(true)
    setHintVisible(false)
    if (result === 'wrong') onWrong?.()
  }, [answered, inputValue, sentence.english, sentence.acceptableAnswers, onWrong])

  const isAccepted = answerResult === 'correct' || answerResult === 'typo'
  const hintLabel = sentence.englishParts[0] ? `${sentence.englishParts[0]}...` : null

  const alternatives = isAccepted
    ? (sentence.acceptableAnswers ?? [])
        .filter(a => a.toLowerCase().replace(/[.,!?'"]/g, '') !== inputValue.trim().toLowerCase().replace(/[.,!?'"]/g, ''))
        .slice(0, 2)
    : []

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">영어로 작성하세요</p>

      {/* 캐릭터 + 한국어 말풍선 (탭 → 첫 단어 힌트) */}
      <div className="flex items-start gap-3">
        <span className="text-5xl select-none">🦉</span>
        <div className="relative flex-1">
          {hintVisible && hintLabel && (
            <div className="absolute -top-10 left-6 z-10 bg-ink text-canvas text-sm font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none">
              {hintLabel}
              <div className="absolute top-full left-6 border-4 border-transparent border-t-ink" />
            </div>
          )}
          <button
            onClick={handleHintTap}
            disabled={answered}
            className={cn(
              'relative w-full text-left bg-brand-green-dim rounded-2xl px-5 py-3 shadow-sm transition-opacity',
              !answered && 'active:opacity-70',
            )}
          >
            {!answered && !hintUsed && (
              <span className="absolute top-2 right-3 text-base opacity-50">💡</span>
            )}
            <p className="text-xl font-bold text-ink leading-snug pr-6">{sentence.korean}</p>
          </button>
        </div>
      </div>

      {/* 입력 필드 */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
        placeholder="영어로 번역하세요..."
        disabled={answered}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        className={cn(
          'w-full px-4 py-4 border-2 rounded-xl text-base font-semibold outline-none transition-colors',
          !answered && 'border-hairline bg-canvas text-ink focus:border-primary',
          answered && isAccepted && 'border-green-500 bg-green-50 text-green-800',
          answered && answerResult === 'wrong' && 'border-red-400 bg-red-50 text-red-700',
        )}
      />

      {/* 결과 피드백 */}
      {answered && answerResult === 'correct' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-4 flex flex-col gap-3">
          {!hintUsed
            ? <p className="text-base font-bold text-green-700">완벽해요! 힌트 없이 맞췄어요! ✨</p>
            : <p className="text-base font-bold text-green-700">정답이에요! 👍</p>
          }
          {alternatives.length > 0 && (
            <div className="pt-2 border-t border-green-200 flex flex-col gap-1.5">
              <p className="text-xs font-bold text-green-600">💡 이런 표현도 맞아요</p>
              {alternatives.map((alt, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-800">{alt}</p>
                  {speak && (
                    <button
                      onClick={() => speak(alt, 'en-US', 1.0, 'sentence')}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-colors flex-shrink-0"
                      aria-label="듣기"
                    >
                      <span className="text-sm">🔊</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {answered && answerResult === 'typo' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-4 flex flex-col gap-3">
          <div>
            <p className="text-base font-bold text-green-700">오타가 있습니다.</p>
            <TypoCorrectionLine sentence={corrected} typoIndices={typoIndices} />
          </div>
          {alternatives.length > 0 && (
            <div className="pt-2 border-t border-green-200 flex flex-col gap-1.5">
              <p className="text-xs font-bold text-green-600">💡 이런 표현도 맞아요</p>
              {alternatives.map((alt, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-800">{alt}</p>
                  {speak && (
                    <button
                      onClick={() => speak(alt, 'en-US', 1.0, 'sentence')}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 transition-colors flex-shrink-0"
                      aria-label="듣기"
                    >
                      <span className="text-sm">🔊</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {answered && answerResult === 'wrong' && (
        <SentenceTranslationCard english={sentence.english} korean={sentence.korean} speak={speak} userInput={inputValue} />
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
