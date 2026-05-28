import { useState, useEffect, useRef, useCallback } from 'react'
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
  blankIndex: number
  direction?: 'ko' | 'en'
  onCorrect: () => void
  onWrong?: () => void
  speak?: SpeakFn
  isSpeaking?: boolean
  tag?: ChallengeTag
  keyboardInput?: boolean
}

export function FillBlankQuiz({ sentence, blankIndex, direction = 'ko', onCorrect, onWrong, speak, isSpeaking, tag, keyboardInput }: Props) {
  const isEn = direction === 'en'
  const correctAnswer = isEn
    ? (sentence.englishParts[blankIndex] ?? sentence.englishParts[0])
    : (sentence.parts[blankIndex] ?? sentence.parts[0])

  const [choices] = useState(() => {
    const pool = isEn ? sentence.englishDistractors : sentence.distractors
    const wrong = shuffle([...pool]).slice(0, 2)
    return shuffle([correctAnswer, ...wrong])
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [answered, setAnswered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // 문제마다 1회만 자동 발음 (StrictMode 이중 effect 방지)
  const lastSpokenIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSpokenIdRef.current === sentence.id) return
    lastSpokenIdRef.current = sentence.id
    if (speak) speak(sentence.english, 'en-US', 1.0, 'sentence')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  useEffect(() => {
    if (keyboardInput) inputRef.current?.focus()
  }, [keyboardInput])

  const partialKorean = sentence.parts
    .map((p, i) => (i === blankIndex ? '______' : p))
    .join(' ')

  const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, '')
  const isInputCorrect = normalize(inputValue) === normalize(correctAnswer)

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
  }

  const handleConfirm = useCallback(() => {
    if (answered) return
    if (keyboardInput) {
      if (!inputValue.trim()) return
      setAnswered(true)
      if (!isInputCorrect) onWrong?.()
    } else {
      if (!selected) return
      setAnswered(true)
      if (selected !== correctAnswer) onWrong?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, keyboardInput, inputValue, isInputCorrect, selected, correctAnswer])

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-2xl font-bold text-ink">빈칸을 채우세요</p>

      {isEn ? (
        <>
          <CharacterBubble
            word={sentence.korean}
            onSpeak={speak ? () => speak(sentence.english, 'en-US', 1.0, 'sentence') : undefined}
            isSpeaking={isSpeaking}
          />
          {answered && (
            <p className="text-center text-sm text-muted -mt-3">{sentence.english}</p>
          )}

          {/* 영어 문장 인라인 빈칸 */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 bg-surface rounded-2xl px-5 py-4 border-2 border-hairline">
            {sentence.englishParts.map((part, i) =>
              i === blankIndex ? (
                <span
                  key={i}
                  className={cn(
                    'px-3 py-1 border-b-2 min-w-[56px] text-center text-lg font-bold',
                    keyboardInput && !answered && 'border-primary text-ink',
                    keyboardInput && answered && isInputCorrect && 'border-green-500 text-green-700',
                    keyboardInput && answered && !isInputCorrect && 'border-red-400 text-red-600',
                    !keyboardInput && !selected && 'border-steel text-transparent select-none',
                    !keyboardInput && selected && !answered && 'border-primary text-primary',
                    !keyboardInput && answered && selected === correctAnswer && 'border-green-500 text-green-700',
                    !keyboardInput && answered && selected !== correctAnswer && 'border-red-400 text-red-600',
                  )}
                >
                  {keyboardInput ? (inputValue || '    ') : (selected ?? '    ')}
                </span>
              ) : (
                <span key={i} className="text-xl font-semibold text-ink">{part}</span>
              )
            )}
          </div>

          {/* 영어 선택지: 키보드 입력 or 객관식 칩 */}
          {keyboardInput ? (
            <div className="flex flex-col gap-2 pt-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                placeholder="영어로 직접 입력하세요..."
                disabled={answered}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={cn(
                  'w-full px-4 py-3 border-2 rounded-xl text-base font-semibold outline-none transition-colors',
                  !answered && 'border-hairline bg-canvas text-ink focus:border-primary',
                  answered && isInputCorrect && 'border-green-500 bg-green-50 text-green-800',
                  answered && !isInputCorrect && 'border-red-400 bg-red-50 text-red-700',
                )}
              />
              {answered && !isInputCorrect && (
                <p className="text-sm text-steel">
                  정답: <span className="font-bold text-ink">{correctAnswer}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              {choices.map(choice => {
                const isCorrect = choice === correctAnswer
                const isSelected = choice === selected
                return (
                  <button
                    key={choice}
                    onClick={() => handleSelect(choice)}
                    disabled={answered}
                    className={cn(
                      'px-5 py-2 rounded-xl border-2 text-base font-semibold transition-colors',
                      !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary',
                      !answered && isSelected && 'border-primary bg-primary/10 text-primary',
                      answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                      answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                      answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted opacity-50',
                    )}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <CharacterBubble
            word={sentence.english}
            onSpeak={speak ? () => speak(sentence.english, 'en-US', 1.0, 'sentence') : undefined}
            isSpeaking={isSpeaking}
          />
          {answered && (
            <p className="text-center text-sm text-muted -mt-3">{sentence.korean}</p>
          )}

          <div className="bg-surface rounded-2xl px-5 py-4 border-2 border-hairline">
            <p className="text-xl font-semibold text-ink tracking-wide">{partialKorean}</p>
          </div>

          <div className="flex flex-col gap-2">
            {choices.map(choice => {
              const isCorrect = choice === correctAnswer
              const isSelected = choice === selected
              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={answered}
                  className={cn(
                    'px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-colors',
                    !answered && !isSelected && 'border-hairline bg-canvas text-ink hover:border-primary',
                    !answered && isSelected && 'border-primary bg-primary/10 text-ink',
                    answered && isCorrect && 'border-green-500 bg-green-50 text-green-800',
                    answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                    answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted opacity-50',
                  )}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        </>
      )}

      {!answered && (
        <button
          onClick={handleConfirm}
          disabled={keyboardInput ? !inputValue.trim() : !selected}
          className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full disabled:bg-hairline disabled:text-muted"
        >
          확인 ✓
        </button>
      )}

      {answered && (
        <>
          <p className={`text-lg font-medium ${(keyboardInput ? isInputCorrect : selected === correctAnswer) ? 'text-green-600' : 'text-steel'}`}>
            {(keyboardInput ? isInputCorrect : selected === correctAnswer)
              ? '✓ 정답이에요! 잘했어요 👍'
              : keyboardInput ? '' : `정답은 "${correctAnswer}"이에요. 괜찮아요! 👏`}
          </p>
          <SentenceTranslationCard english={sentence.english} korean={sentence.korean} speak={isEn ? speak : undefined} />
          <button
            onClick={() => {
              if (keyboardInput ? isInputCorrect : selected === correctAnswer) playCorrectSound()
              onCorrect()
            }}
            className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full"
          >
            다음 ▶
          </button>
        </>
      )}
    </div>
  )
}
