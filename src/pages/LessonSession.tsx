// src/pages/LessonSession.tsx
import { useState, useCallback, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { LESSONS_MAP } from '../data/lessons'
import { UNITS_MAP } from '../data/units'
import { SECTIONS } from '../data/sections'
import { buildChallengeSequence } from '../utils/lessonSequence'
import { buildChoices } from '../utils/quizHelpers'
import { FlashCard } from '../components/FlashCard'
import { MatchingQuiz } from '../components/quiz/MatchingQuiz'
import { ListenMatchingQuiz } from '../components/quiz/ListenMatchingQuiz'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { ListenChoiceQuiz } from '../components/quiz/ListenChoiceQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { SentencePickQuiz } from '../components/quiz/SentencePickQuiz'
import { FillBlankQuiz } from '../components/quiz/FillBlankQuiz'
import { PronunciationQuiz } from '../components/quiz/PronunciationQuiz'
import { DialogueChoiceQuiz } from '../components/quiz/DialogueChoiceQuiz'
import { ListenTypeQuiz } from '../components/quiz/ListenTypeQuiz'
import { WordTypeQuiz } from '../components/quiz/WordTypeQuiz'
import { TranslateTypeQuiz } from '../components/quiz/TranslateTypeQuiz'
import { useSpeech } from '../hooks/useSpeech'
import { STAR_XP } from '../utils/xp'
import type { LessonChallenge } from '../types/lesson'
import type { StudyItem } from '../types'

export function LessonSession() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const kindParam = searchParams.get('kind')
  const completionOverride = searchParams.get('completion') !== null ? parseInt(searchParams.get('completion')!, 10) : null
  const { markLessonDone, updateStreak, progress, addWrongAnswer, addSessionLog } = useApp()
  const { speak, isSpeaking } = useSpeech()

  const lesson = lessonId ? LESSONS_MAP[lessonId] : null
  const unit = lesson ? UNITS_MAP[lesson.unitId] : null

  const allItems: StudyItem[] = unit?.type === 'alphabet' ? ALPHABET : WORDS
  const lessonItems = useMemo(
    () => unit?.type === 'sentences'
      ? []
      : lesson?.itemIds.map(id => allItems.find(i => i.id === id)!).filter(Boolean) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson?.id],
  )

  const lessonIndex = useMemo(
    () => unit?.lessonIds.indexOf(lessonId ?? '') ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit?.id, lessonId],
  )

  const completionCount = completionOverride ?? (lessonId ? (progress.lessonCompletionCount[lessonId] ?? 0) : 0)

  const sectionIndex = useMemo(
    () => SECTIONS.findIndex(s => s.unitIds.includes(lesson?.unitId ?? '')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson?.unitId],
  )

  const sectionBaseTier = SECTIONS[sectionIndex]?.baseTier ?? 0

  const difficultyOffset =
    progress.difficultyLevel === 'advanced' ? 2
    : progress.difficultyLevel === 'intermediate' ? 1
    : 0

  const reviewItems = useMemo(() => {
    if (sectionIndex < 0 || !lesson?.unitId) return []
    const currentSection = SECTIONS[sectionIndex]
    if (!currentSection) return []

    // 같은 섹션에서 현재 유닛 앞에 위치한 유닛 → 맥락이 가장 가까운 복습
    const currentUnitIdx = currentSection.unitIds.indexOf(lesson.unitId)
    const sameSectionPrev = currentSection.unitIds.slice(0, currentUnitIdx)
    if (sameSectionPrev.length > 0) {
      return WORDS.filter(w => sameSectionPrev.includes(w.category))
    }

    // 섹션의 첫 번째 유닛: 직전 섹션의 마지막 유닛만 복습
    if (sectionIndex > 0) {
      const prevSection = SECTIONS[sectionIndex - 1]
      const lastUnitId = prevSection.unitIds[prevSection.unitIds.length - 1]
      return WORDS.filter(w => w.category === lastUnitId)
    }

    return []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIndex, lesson?.unitId])

  // 현재 유닛 카테고리에 맞는 문장만 사용 (category 없음 = 범용)
  const relevantSentences = useMemo(() => {
    // sentence-type 레슨: 전체 문장 풀 (오답 선택지를 다른 고급 문장에서 뽑기 위해)
    if (unit?.type === 'sentences') return SENTENCES
    const unitId = lesson?.unitId
    if (!unitId) return SENTENCES
    return SENTENCES.filter(s => !s.category || s.category === unitId)
  }, [lesson?.unitId, unit?.type]) // eslint-disable-line react-hooks/exhaustive-deps

  const [challenges, setChallenges] = useState<LessonChallenge[]>(() =>
    lesson
      ? buildChallengeSequence(lesson, lessonIndex, relevantSentences, unit?.type ?? 'words', completionCount, sectionBaseTier, reviewItems, difficultyOffset)
      : []
  )
  const [challengeIndex, setChallengeIndex] = useState(() => {
    if (!kindParam || !lesson) return 0
    const chs = buildChallengeSequence(lesson, lessonIndex, relevantSentences, unit?.type ?? 'words', completionCount, sectionBaseTier, reviewItems, difficultyOffset)
    const idx = chs.findIndex(c => c.kind === kindParam)
    return idx >= 0 ? idx : 0
  })
  const [retryQueue, setRetryQueue] = useState<LessonChallenge[]>([])
  const [phase, setPhase] = useState<'main' | 'retry'>('main')
  const [wrongCount, setWrongCount] = useState(0)
  const [showExit, setShowExit] = useState(false)

  const currentList = phase === 'main' ? challenges : retryQueue
  const current = currentList[challengeIndex]

  // DEV: 디버그 - 현재 챌린지 정보 콘솔 로그 (배포에선 자동 제거)
  useEffect(() => {
    if (!import.meta.env.DEV || !current) return
    // eslint-disable-next-line no-console
    console.log('[Lesson]', {
      lessonId,
      phase,
      index: `${challengeIndex + 1}/${currentList.length}`,
      kind: current.kind,
      itemId: current.itemId,
      sentenceId: current.sentenceId,
      direction: current.direction,
      tag: current.tag,
    })
  }, [lessonId, phase, challengeIndex, currentList.length, current])

  const currentChoices = useMemo(() => {
    if (!current?.itemId) return []
    const item = allItems.find(i => i.id === current.itemId)
    if (!item) return []
    // Prefer same-lesson items as distractors; fall back to full pool if pool is too small
    const pool = lessonItems.length >= 3 ? lessonItems : allItems
    return buildChoices(item, pool, 3)
  // recompute only when the challenge changes, not on isSpeaking re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeIndex, phase])

  const progressPct = Math.round(
    ((phase === 'main' ? challengeIndex : challenges.length + challengeIndex) /
      (challenges.length + retryQueue.length)) *
      100,
  )

  const handleWrong = useCallback((challenge: LessonChallenge) => {
    setWrongCount(c => c + 1)
    setRetryQueue(prev => [...prev, { ...challenge }])
    const id = challenge.itemId ?? challenge.sentenceId
    if (id && lessonId) addWrongAnswer(id, challenge.kind, lessonId)
  }, [addWrongAnswer, lessonId])

  const handleSpeakSkip = useCallback(() => {
    if (!current) return
    // 이미 한 번 스킵된 문제이거나 마지막 문제면 → 바로 완료 처리
    if (current.skipped || challengeIndex >= currentList.length - 1) {
      advance()
      return
    }
    // 현재 위치에서 제거 후 3문제 뒤에 재삽입 (skipped 표시) → 총 문제 수 유지
    setChallenges(prev => {
      const next = [...prev]
      next.splice(challengeIndex, 1)
      const insertAt = Math.min(challengeIndex + 3, next.length)
      next.splice(insertAt, 0, { ...current, skipped: true })
      return next
    })
    // challengeIndex 유지: 제거로 인해 다음 문제가 현재 인덱스로 자동 이동
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, challengeIndex, currentList.length])

  function advance() {
    if (challengeIndex + 1 < currentList.length) {
      setChallengeIndex(c => c + 1)
    } else if (phase === 'main' && retryQueue.length > 0) {
      setPhase('retry')
      setChallengeIndex(0)
    } else {
      const stars: 1 | 2 | 3 = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
      if (lessonId) {
        markLessonDone(lessonId, stars)
        addSessionLog(lessonId, stars)
      }
      updateStreak()
      const sectionId = SECTIONS[sectionIndex]?.id
      navigate('/complete', { state: { stars, xpGained: STAR_XP[stars], sectionId } })
    }
  }

  if (!lesson || !unit || !current) {
    return <div className="p-8 text-center text-steel">레슨을 찾을 수 없습니다</div>
  }

  const section = SECTIONS[sectionIndex]
  const headerBg = phase === 'retry' ? 'bg-orange-500' : (section?.bg ?? 'bg-primary')
  const headerBorder = phase === 'retry' ? 'border-orange-600/30' : (section?.border ?? 'border-primary/30')

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
      return <MatchingQuiz items={lessonItems} onComplete={advance} speak={speak} />
    }

    if (current.kind === 'listen-matching') {
      return <ListenMatchingQuiz items={lessonItems} onComplete={advance} speak={speak} />
    }

    if (current.kind === 'image-choice' && item) {
      return (
        <ImageChoiceQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          choices={currentChoices}
          direction={current.direction ?? 'ko-to-en'}
          displayMode={current.displayMode ?? 'cards'}
          tag={current.tag}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
        />
      )
    }

    if (current.kind === 'listen-choice' && item) {
      return (
        <ListenChoiceQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          choices={currentChoices}
          direction={current.direction ?? 'ko-to-en'}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
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
          onWrong={() => handleWrong(current)}
          speak={speak}
          direction={current.direction ?? 'en-to-ko'}
          tag={current.tag}
          isSpeaking={isSpeaking}
          listenBuild={current.listenBuild}
          distractorCount={current.distractorCount}
        />
      )
    }

    if (current.kind === 'sentence-pick') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <SentencePickQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          allSentences={SENTENCES}
          direction={(current.direction as 'en-to-ko' | 'ko-to-en') ?? 'en-to-ko'}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'speak-check' && item) {
      return (
        <PronunciationQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          onCorrect={advance}
          onSkip={handleSpeakSkip}
          speak={speak}
          isSpeaking={isSpeaking}
          isLastChance={current.skipped}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'speak-sentence') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      // partIndex가 있으면 해당 영어 파트만 발음, 없으면 문장 전체
      const phrase = current.partIndex !== undefined
        ? { english: sentence.englishParts[current.partIndex], korean: sentence.parts[current.partIndex] }
        : { english: sentence.english, korean: sentence.korean }
      return (
        <PronunciationQuiz
          key={`${phase}-${challengeIndex}`}
          phrase={phrase}
          onCorrect={advance}
          onSkip={handleSpeakSkip}
          speak={speak}
          isSpeaking={isSpeaking}
          isLastChance={current.skipped}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'fill-blank') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <FillBlankQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          blankIndex={current.blankIndex ?? 0}
          direction={current.fillDir ?? 'ko'}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
          tag={current.tag}
          keyboardInput={current.keyboardInput}
        />
      )
    }

    if (current.kind === 'listen-type') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <ListenTypeQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'type-word' && item) {
      return (
        <WordTypeQuiz
          key={`${phase}-${challengeIndex}`}
          item={item}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'translate-type') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <TranslateTypeQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          tag={current.tag}
        />
      )
    }

    if (current.kind === 'dialogue-choice') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <DialogueChoiceQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          allSentences={SENTENCES}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
          speak={speak}
          isSpeaking={isSpeaking}
          tag={current.tag}
        />
      )
    }

    return null
  }

  return (
    <>
      {exitDialog}
      <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
        {/* 헤더 */}
        <div className={`sticky top-0 z-10 ${headerBg} border-b ${headerBorder}`}>
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowExit(true)}
                aria-label="나가기"
                className="text-white/80 text-xl leading-none"
              >
                ✕
              </button>
              <div className="text-center">
                <p className="text-xs text-white/70 font-bold uppercase tracking-wide">{unit.title}</p>
                <p className="text-sm font-black text-white">{lesson.title}</p>
              </div>
              <span className="text-xs text-white/80 font-semibold">
                {challengeIndex + 1}/{currentList.length}
              </span>
            </div>
            <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          {phase === 'retry' && (
            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-black/15">
              <span className="text-sm">🔄</span>
              <p className="text-xs font-bold text-white">복습 구간 — 틀린 문제를 다시 풀어봐요!</p>
            </div>
          )}
        </div>

        {import.meta.env.DEV && current && (
          <div className="px-3 py-1 bg-yellow-50 border-b border-yellow-200 text-[10px] font-mono text-yellow-900 leading-tight">
            <span className="font-bold">DEBUG</span>
            <span className="ml-2">{lessonId}</span>
            <span className="ml-2">[{phase}]</span>
            <span className="ml-2">{challengeIndex + 1}/{currentList.length}</span>
            <span className="ml-2">kind={current.kind}</span>
            {current.itemId && <span className="ml-2">item={current.itemId}</span>}
            {current.sentenceId && <span className="ml-2">sent={current.sentenceId}</span>}
            {current.direction && <span className="ml-2">dir={current.direction}</span>}
            {current.tag && <span className="ml-2">tag={current.tag}</span>}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {renderChallenge()}
        </div>
      </div>
    </>
  )
}
