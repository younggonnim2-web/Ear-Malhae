import { useEffect, useState } from 'react'
import type { StudyItem } from '../../types'
import { isWordItem } from '../../types'
import type { ChallengeTag } from '../../types/lesson'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { evaluateTyped } from '../../utils/fuzzyMatch'
import { TagBadge } from '../TagBadge'

interface Props {
  item: StudyItem
  onCorrect: () => void
  onSkip?: () => void
  speak?: (text: string, lang?: string, rate?: number) => void
  tag?: ChallengeTag
}

type Phase = 'idle' | 'listening' | 'result' | 'blocked'

export function PronunciationQuiz({ item, onCorrect, onSkip, speak, tag }: Props) {
  const { startListening, stopListening, transcript, isSupported, error, reset } =
    useSpeechRecognition()

  const [phase, setPhase] = useState<Phase>('idle')
  const [attempts, setAttempts] = useState(0)
  const [matched, setMatched] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')

  const targetWord = isWordItem(item) ? item.word : item.letter

  // 인식 결과 도착 시 평가
  useEffect(() => {
    if (!transcript) return
    const result = evaluateTyped(transcript, targetWord)
    setMatched(result !== 'wrong')
    setLastTranscript(transcript)
    setPhase('result')
  }, [transcript, targetWord])

  // 에러 처리
  useEffect(() => {
    if (!error) return
    if (error === 'no-speech') {
      setLastTranscript('')
      setPhase('result')
      setMatched(false)
    } else if (error === 'not-allowed' || error === 'service-not-allowed') {
      // 마이크 권한 거부 → 결과 화면에서 안내
      setLastTranscript('')
      setPhase('blocked')
    } else {
      // network 등 기타 에러 → 결과 없음으로 처리
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

      <p className="text-lg text-steel text-center font-semibold">이 단어를 말해보세요</p>

      {/* 단어 표시 */}
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-5xl font-black text-ink">{targetWord}</span>
        {isWordItem(item) && (
          <span className="text-xl text-steel">{item.meaning}</span>
        )}
        {speak && (
          <button
            onClick={() => speak(targetWord, 'en-US')}
            className="flex items-center gap-1 text-primary text-sm font-semibold mt-1"
          >
            🔊 발음 듣기
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
              지금은 넘길게요 (잠시 후 다시 출제)
            </button>
          )}
        </div>
      )}

      {/* 녹음 중 */}
      {phase === 'listening' && (
        <div className="flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-xl">
            <span className="text-4xl">🎤</span>
          </div>
          {/* 이퀄라이저 파형 */}
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
                <p className="text-sm text-steel mt-2">들린 말: &ldquo;{lastTranscript}&rdquo;</p>
              )}
            </div>
          ) : canRetry ? (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-orange-600">다시 해볼까요? 💪</p>
              {lastTranscript ? (
                <p className="text-sm text-steel mt-2">들린 말: &ldquo;{lastTranscript}&rdquo;</p>
              ) : (
                <p className="text-sm text-steel mt-2">소리가 잘 안 들렸어요</p>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-blue-600">괜찮아요! 계속 연습해봐요 😊</p>
              <p className="text-sm text-steel mt-1">정답: {targetWord}</p>
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
