import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SECTIONS, type Section } from '../data/sections'
import { UNITS_MAP } from '../data/units'
import { DifficultyModal } from '../components/DifficultyModal'
import type { DifficultyLevel } from '../types'

const ALPHABET_LESSON_IDS = new Set(UNITS_MAP['alphabet']?.lessonIds ?? [])

function getVisibleLessonIds(section: Section, isNonBeginner: boolean): string[] {
  return section.unitIds
    .filter(uid => !(isNonBeginner && uid === 'alphabet'))
    .flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? [])
}

type SectionState = 'active' | 'locked' | 'completed'

export function LearningPath() {
  const navigate = useNavigate()
  const { progress, setDifficulty } = useApp()
  const [showDiffModal, setShowDiffModal] = useState(false)

  const isNonBeginner = progress.difficultyLevel !== 'beginner'
  // For non-beginners, treat alphabet lessons as transparent (no skip badge, just invisible)
  const effectiveCompletedSet = isNonBeginner
    ? new Set([...progress.lessonProgress, ...ALPHABET_LESSON_IDS])
    : new Set(progress.lessonProgress)

  function handleDifficultyConfirm(level: DifficultyLevel) {
    setDifficulty(level)
    setShowDiffModal(false)
  }

  useEffect(() => {
    if (!progress.onboardingDone) navigate('/onboarding', { replace: true })
  }, [progress.onboardingDone, navigate])

  if (!progress.onboardingDone) return null

  const allVisibleIds = SECTIONS.flatMap(s => getVisibleLessonIds(s, isNonBeginner))
  const currentLessonId = allVisibleIds.find(id => !effectiveCompletedSet.has(id))

  function getSectionState(section: Section): SectionState {
    const ids = getVisibleLessonIds(section, isNonBeginner)
    if (ids.length === 0) return 'locked'
    if (ids.every(id => effectiveCompletedSet.has(id))) return 'completed'
    if (ids.some(id => effectiveCompletedSet.has(id)) || ids[0] === currentLessonId)
      return 'active'
    const firstId = ids[0]
    const firstIdx = allVisibleIds.indexOf(firstId)
    if (firstIdx === 0) return 'active'
    return effectiveCompletedSet.has(allVisibleIds[firstIdx - 1]) ? 'active' : 'locked'
  }

  return (
    <div className="min-h-screen bg-surface">
      {showDiffModal && (
        <DifficultyModal
          currentLevel={progress.difficultyLevel}
          onConfirm={handleDifficultyConfirm}
          onDismiss={() => setShowDiffModal(false)}
        />
      )}

      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-canvas border-b border-hairline px-4 py-3 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦉</span>
          <span className="font-black text-ink text-lg">쉬운 영어</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-orange-500 font-bold">🔥 {progress.streak}</span>
          <span className="text-yellow-500 font-bold">⚡ {progress.lessonProgress.length * 10}</span>
          <button
            onClick={() => setShowDiffModal(true)}
            aria-label="난이도 설정"
            className="text-lg text-steel hover:text-ink transition-colors"
          >
            ⚙️
          </button>
          <button
            onClick={() => { localStorage.clear(); location.reload() }}
            className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5 hover:text-red-400 hover:border-red-300"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 섹션 카드 목록 */}
      <div className="max-w-md mx-auto p-4 flex flex-col gap-4 pb-24">
        {SECTIONS.map((section, idx) => {
          const state = getSectionState(section)
          const ids = getVisibleLessonIds(section, isNonBeginner)
          const doneCount = ids.filter(id => effectiveCompletedSet.has(id)).length
          const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0

          return (
            <SectionCard
              key={section.id}
              section={section}
              num={idx + 1}
              state={state}
              pct={pct}
              message={section.message}
              onNavigate={() =>
                state === 'locked'
                  ? navigate(`/jump/${section.id}`)
                  : navigate(`/section/${section.id}`)
              }
            />
          )
        })}
      </div>
    </div>
  )
}

interface CardProps {
  section: Section
  num: number
  state: SectionState
  pct: number
  message: string
  onNavigate: () => void
}

function SectionCard({ section, num, state, pct, message, onNavigate }: CardProps) {
  const isActive = state === 'active'
  const isLocked = state === 'locked'

  return (
    <div className={[
      'rounded-3xl border-2 p-5 flex gap-4 items-start',
      isActive  && 'bg-blue-50 border-blue-200',
      isLocked  && 'bg-gray-50 border-gray-200 opacity-80',
      state === 'completed' && 'bg-green-50 border-green-200',
    ].filter(Boolean).join(' ')}>

      <div className="flex-1 flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold text-steel uppercase tracking-widest">섹션 {num}</p>
          <p className={`text-xl font-black mt-0.5 ${isLocked ? 'text-gray-400' : 'text-ink'}`}>
            {section.title}
          </p>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white rounded-full border border-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isActive ? 'bg-primary' : 'bg-green-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-steel font-semibold">{pct}%</span>
          </div>
        )}

        {isLocked && (
          <p className="text-sm text-gray-400 flex items-center gap-1">
            🔒 {section.unitIds.length}개 유닛
          </p>
        )}

        <button
          onClick={onNavigate}
          className={[
            'py-3 rounded-2xl text-sm font-bold transition-colors',
            isActive  && 'bg-primary text-white hover:bg-primary/90',
            isLocked  && 'border-2 border-gray-300 text-gray-400 bg-transparent',
            state === 'completed' && 'border-2 border-green-400 text-green-600 bg-transparent',
          ].filter(Boolean).join(' ')}
        >
          {isActive  && '계속하기'}
          {isLocked  && '여기까지 건너뛰기 테스트'}
          {state === 'completed' && '다시 연습하기'}
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 min-w-[96px]">
        <div className={[
          'rounded-2xl px-3 py-2 text-xs font-semibold text-center leading-snug max-w-[100px]',
          isLocked ? 'bg-gray-200 text-gray-400' : 'bg-white border border-gray-200 text-ink shadow-sm',
        ].join(' ')}>
          {message}
        </div>
        <span className={`text-5xl select-none ${isLocked ? 'grayscale opacity-50' : ''}`}>🦉</span>
      </div>
    </div>
  )
}
