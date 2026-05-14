// src/pages/LessonSession.tsx
import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { LESSONS_MAP } from '../data/lessons'
import { UNITS_MAP } from '../data/units'
import { buildChallengeSequence } from '../utils/lessonSequence'
import { buildChoices } from '../utils/quizHelpers'
import { FlashCard } from '../components/FlashCard'
import { MatchingQuiz } from '../components/quiz/MatchingQuiz'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { ListenChoiceQuiz } from '../components/quiz/ListenChoiceQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { useSpeech } from '../hooks/useSpeech'
import { STAR_XP } from '../utils/xp'
import type { LessonChallenge } from '../types/lesson'
import type { StudyItem } from '../types'

export function LessonSession() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { markLessonDone, updateStreak } = useApp()
  const { speak } = useSpeech()

  const lesson = lessonId ? LESSONS_MAP[lessonId] : null
  const unit = lesson ? UNITS_MAP[lesson.unitId] : null

  const allItems: StudyItem[] = unit?.type === 'alphabet' ? ALPHABET : WORDS
  const lessonItems = useMemo(
    () => lesson?.itemIds.map(id => allItems.find(i => i.id === id)!).filter(Boolean) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson?.id],
  )

  const lessonIndex = useMemo(
    () => unit?.lessonIds.indexOf(lessonId ?? '') ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit?.id, lessonId],
  )

  const [challenges] = useState<LessonChallenge[]>(() =>
    lesson ? buildChallengeSequence(lesson, lessonIndex, SENTENCES) : []
  )
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [retryQueue, setRetryQueue] = useState<LessonChallenge[]>([])
  const [phase, setPhase] = useState<'main' | 'retry'>('main')
  const [wrongCount, setWrongCount] = useState(0)
  const [showExit, setShowExit] = useState(false)

  const currentList = phase === 'main' ? challenges : retryQueue
  const current = currentList[challengeIndex]
  const progressPct = Math.round(
    ((phase === 'main' ? challengeIndex : challenges.length + challengeIndex) /
      (challenges.length + retryQueue.length)) *
      100,
  )

  const handleWrong = useCallback((challenge: LessonChallenge) => {
    setWrongCount(c => c + 1)
    setRetryQueue(prev => [...prev, { ...challenge }])
  }, [])

  function advance() {
    if (challengeIndex + 1 < currentList.length) {
      setChallengeIndex(c => c + 1)
    } else if (phase === 'main' && retryQueue.length > 0) {
      setPhase('retry')
      setChallengeIndex(0)
    } else {
      const stars: 1 | 2 | 3 = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
      if (lessonId) markLessonDone(lessonId, stars)
      updateStreak()
      navigate('/complete', { state: { stars, xpGained: STAR_XP[stars] } })
    }
  }

  if (!lesson || !unit || !current) {
    return <div className="p-8 text-center text-steel">레슨을 찾을 수 없습니다</div>
  }

  const exitDialog = showExit
    ? createPortal(
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowExit(false)}
        >
          <div
            className="bg-canvas border border-hairline rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-ink mb-2">학습을 나가시겠어요?</p>
            <p className="text-sm text-steel mb-4">진도는 저장됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExit(false)}
                className="flex-1 py-3 bg-surface border border-hairline text-ink rounded-full font-semibold"
              >
                계속 학습
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-primary text-ink rounded-full font-bold"
              >
                나가기
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null

  function renderChallenge() {
    const item = current.itemId
      ? allItems.find(i => i.id === current.itemId)
      : null

    if (current.kind === 'flash' && item) {
      return <FlashCard item={item} onNext={advance} />
    }

    if (current.kind === 'matching') {
      return <MatchingQuiz items={lessonItems} onComplete={advance} />
    }

    if (current.kind === 'image-choice' && item) {
      const choices = buildChoices(item, allItems, 4)
      return (
        <ImageChoiceQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          choices={choices}
          direction={current.direction ?? 'en-to-ko'}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
        />
      )
    }

    if (current.kind === 'listen-choice' && item) {
      const choices = buildChoices(item, allItems, 4)
      return (
        <ListenChoiceQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          choices={choices}
          direction={current.direction ?? 'en-to-ko'}
          onCorrect={advance}
          speak={speak}
        />
      )
    }

    if (current.kind === 'sentence-builder') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <SentenceBuilderQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          onCorrect={advance}
        />
      )
    }

    return null
  }

  const phaseLabel =
    current.kind === 'flash' ? '단어 보기' :
    current.kind === 'matching' ? '짝 맞추기' :
    current.kind === 'image-choice' ? '뜻 고르기' :
    current.kind === 'listen-choice' ? '듣고 고르기' :
    '문장 연습'

  return (
    <>
      {exitDialog}
      <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <button
            onClick={() => setShowExit(true)}
            aria-label="나가기"
            className="text-muted text-2xl font-bold"
          >
            ✕
          </button>
          <div className="flex-1 h-2 bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted w-14 text-right">{phaseLabel}</span>
        </div>

        {phase === 'retry' && (
          <p className="text-center text-sm text-orange-600 py-1 bg-orange-50">
            틀린 문제를 다시 풀어봐요!
          </p>
        )}

        <div className="flex-1">
          {renderChallenge()}
        </div>
      </div>
    </>
  )
}
