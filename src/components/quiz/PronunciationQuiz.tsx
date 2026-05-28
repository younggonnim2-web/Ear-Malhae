import { useEffect, useState } from 'react'
import type { StudyItem } from '../../types'
import { isWordItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import type { SpeakFn } from '../../hooks/useSpeech'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { evaluateTyped } from '../../utils/fuzzyMatch'
import { TagBadge } from '../TagBadge'

interface Props {
  /** 단어/알파벳 발음 모드 */
  item?: StudyItem
  /** 문장 또는 임의 영어 텍스트 발음 모드 (item과 둘 중 하나 필수) */
  phrase?: { english: string; korean: string }
  onCorrect: () => void
  onSkip?: () => void
  speak?: SpeakFn
  isSpeaking?: boolean
  isLastChance?: boolean
  tag?: ChallengeTag
}

type Phase = 'idle' | 'listening' | 'result' | 'blocked'

function TranscriptHighlight({ transcript, target, matched }: { transcript: string; target: string; matched: boolean }) {
  if (matched) {
    return <span className="text-green-600 font-semibold">"{transcript}"</span>
  }
  const targetWords = new Set(
    target.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''))
  )
  const words = transcript.split(/\s+/)
  return (
    <>
      &ldquo;
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '')
        const hit = targetWords.has(clean) || [...targetWords].some(tw => tw.includes(clean) || clean.includes(tw))
        return (
          <span key={i} className={hit ? 'text-green-600 font-semibold' : 'text-orange-500'}>
            {word}{i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
      &rdquo;
    </>
  )
}

export function PronunciationQuiz({ item, phrase, onCorrect, onSkip, speak, isSpeaking, isLastChance, tag }: Props) {
  const { startListening, stopListening, transcript, interimTranscript, isSupported, error, reset } =
    useSpeechRecognition()

  const [phase, setPhase] = useState<Phase>('idle')
  const [attempts, setAttempts] = useState(0)
  const [matched, setMatched] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')

  const targetWord = item
    ? (isWordItem(item) ? item.word : item.letter)
    : (phrase?.english ?? '')
  const meaning = item
    ? (isWordItem(item) ? item.meaning : '')
    : (phrase?.korean ?? '')
  const isLongPhrase = targetWord.includes(' ')
  const promptText = isLongPhrase ? '이 문장을 말해보세요' : '이 단어를 말해보세요'

  useEffect(() => {
    if (!transcript) return
    const result = evaluateTyped(transcript, targetWord)
    // eslint-disable-next-line no-console
    console.log('[STT] 매칭 평가 — 들린 말:', JSON.stringify(transcript), '/ 정답:', JSON.stringify(targetWord), '/ 결과:', result)
    setMatched(result !== 'wrong')
    setLastTranscript(transcript)
    setPhase('result')
  }, [transcript, targetWord])

  useEffect(() => {
    if (!error) return
    if (error === 'no-speech') {
      setLastTranscript('')
      setPhase('result')
      setMatched(false)
    } else if (error === 'not-allowed' || error === 'service-not-allowed') {
      setLastTranscript('')
      setPhase('blocked')
    } else {
      setLastTranscript('')
      setPhase('result')
      setMatched(false)
    }
  }, [error, onCorrect])

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-5 p-6">
        <p className="text-steel text-center text-base">이 기기에서는 발음 기능을 지원하지 않습니다</p>
        <button
          onClick={onCorrect}
          className="w-full py-4 bg-primary text-white text-xl font-bold rounded-full"
        >
          다음 ▶
        </button>
      </div>
    )
  }

  function handleStart() {
    reset()
    setPhase('listening')
    startListening()
  }

  function handleRetry() {
    reset()
    setPhase('idle')
    setAttempts(a => a + 1)
  }

  const canRetry = !matched && attempts < 2

  return (
    <div className="flex flex-col gap-5 p-6">
      {tag && <div><TagBadge tag={tag} /></div>}

      <p className="text-lg text-steel text-center font-semibold">{promptText}</p>

      <div className="flex flex-col items-center gap-2 py-4">
        <span className={`${isLongPhrase ? 'text-3xl' : 'text-5xl'} font-black text-ink text-center`}>{targetWord}</span>
        {meaning && (
          <span className="text-xl text-steel text-center">{meaning}</span>
        )}
        {speak && (
          <button
            onClick={() => speak(targetWord, 'en-US')}
            className="flex items-center gap-1 text-primary text-sm font-semibold mt-1"
          >
            <span className={isSpeaking ? 'animate-speaking inline-block' : ''}>🔊</span> 발음 듣기
          </button>
        )}
      </div>

      {/* 대기 */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            className="w-full py-5 bg-red-500 text-white text-xl font-bold rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
          >
            🎤 말해보세요
          </button>
          {attempts > 0 && (
            <p className="text-sm text-steel">시도 {attempts + 1} / 3</p>
          )}
          {onSkip && attempts === 0 && (
            <button
              onClick={onSkip}
              className="text-sm text-steel text-center underline py-1"
            >
              {isLastChance ? '넘기고 단원 종료하기' : '지금은 넘길게요 (잠시 후 다시 출제)'}
            </button>
          )}
        </div>
      )}

      {/* 녹음 중 */}
      {phase === 'listening' && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-xl">
            <span className="text-4xl">🎤</span>
          </div>
          <div className="flex items-center gap-1.5 h-10">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.2, 0.1].map((delay, i) => (
              <div
                key={i}
                className="w-2 bg-red-500 rounded-full animate-sound-bar origin-center"
                style={{ height: '100%', animationDelay: `${delay}s` }}
              />
            ))}
          </div>
          <p className="text-red-500 font-bold text-lg">듣고 있어요...</p>

          {/* 실시간 인식 텍스트 */}
          <div className="min-h-[48px] w-full bg-gray-50 border border-hairline rounded-2xl px-4 py-3 text-center">
            {interimTranscript ? (
              <p className="text-steel text-base italic opacity-80">"{interimTranscript}"</p>
            ) : (
              <p className="text-gray-300 text-sm">말하면 여기에 표시돼요</p>
            )}
          </div>

          <button
            onClick={() => { stopListening(); setPhase('idle') }}
            className="text-sm text-steel underline"
          >
            취소
          </button>
        </div>
      )}

      {/* 마이크 권한 차단 */}
      {phase === 'blocked' && (
        <div className="flex flex-col gap-4">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-yellow-700">마이크 사용 불가 🎙️</p>
            <p className="text-sm text-steel mt-2">
              이 환경에서는 마이크 권한이 허용되지 않습니다.{'\n'}
              HTTPS 연결이 필요해요.
            </p>
          </div>
          <button
            onClick={onCorrect}
            className="w-full py-4 bg-primary text-white text-xl font-bold rounded-full"
          >
            다음으로 넘어가기 ▶
          </button>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && (
        <div className="flex flex-col gap-4">
          {matched ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-green-600">잘하셨어요! 👏</p>
              <p className="text-base text-green-500 mt-1">발음이 정확해요</p>
              {lastTranscript && (
                <p className="text-sm text-steel mt-3">
                  🎤 인식된 내용:{' '}
                  <TranscriptHighlight transcript={lastTranscript} target={targetWord} matched={matched} />
                </p>
              )}
            </div>
          ) : canRetry ? (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-orange-600">다시 해볼까요? 💪</p>
              {lastTranscript ? (
                <p className="text-sm text-steel mt-3">
                  🎤 인식된 내용:{' '}
                  <TranscriptHighlight transcript={lastTranscript} target={targetWord} matched={matched} />
                </p>
              ) : (
                <p className="text-sm text-steel mt-2">소리가 잘 안 들렸어요</p>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-blue-600">괜찮아요! 계속 연습해봐요 😊</p>
              <p className="text-sm text-steel mt-1">정답: {targetWord}</p>
              {lastTranscript && (
                <p className="text-sm text-steel mt-3">
                  🎤 인식된 내용:{' '}
                  <TranscriptHighlight transcript={lastTranscript} target={targetWord} matched={matched} />
                </p>
              )}
            </div>
          )}

          {matched || !canRetry ? (
            <button
              onClick={onCorrect}
              className="w-full py-4 bg-primary text-white text-xl font-bold rounded-full"
            >
              다음 ▶
            </button>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="w-full py-4 bg-red-500 text-white text-xl font-bold rounded-full flex items-center justify-center gap-2"
              >
                🎤 다시 말하기
              </button>
              <button
                onClick={onCorrect}
                className="text-sm text-steel text-center underline py-1"
              >
                건너뛰기
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
