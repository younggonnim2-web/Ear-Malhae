import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calcLevelBarPct } from '../utils/xp'
import { checkAdaptiveDifficulty } from '../utils/difficultyAdaptive'
import { DifficultyModal } from '../components/DifficultyModal'
import { SECTIONS } from '../data/sections'
import { UNITS_MAP } from '../data/units'

interface CompleteState {
  stars: 1 | 2 | 3
  xpGained: number
  sectionId?: string
}

function StarDisplay({ stars }: { stars: 1 | 2 | 3 }) {
  return (
    <span>
      {([1, 2, 3] as const).map(n => (n <= stars ? '★' : '☆')).join('')}
    </span>
  )
}

export function Complete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { progress, totalXp, currentLevel, xpToNextLevel, setDifficulty } = useApp()

  function handleDifficultyConfirm(level: import('../types').DifficultyLevel) {
    setDifficulty(level)
    setShowDiffModal(false)
  }
  const state = location.state as CompleteState | null
  const [showDiffModal, setShowDiffModal] = useState(false)

  const [showCelebration, setShowCelebration] = useState(false)

  const sectionLessonIds = useMemo(() => {
    if (!state?.sectionId) return []
    const section = SECTIONS.find(s => s.id === state.sectionId)
    return section?.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? []) ?? []
  }, [state?.sectionId])

  const sectionCompleted = useMemo(
    () => sectionLessonIds.length > 0 && sectionLessonIds.every(id => progress.lessonProgress.includes(id)),
    [sectionLessonIds, progress.lessonProgress]
  )

  const completedSection = SECTIONS.find(s => s.id === state?.sectionId)

  useEffect(() => {
    if (!sectionCompleted) return
    setShowCelebration(true)
    const t = setTimeout(() => setShowCelebration(false), 3500)
    return () => clearTimeout(t)
  }, [sectionCompleted])

  // Compute once at mount — progress is stable at the moment of lesson completion
  const adaptiveSuggestionRef = useRef(checkAdaptiveDifficulty(progress, sectionLessonIds))
  const adaptiveSuggestion = adaptiveSuggestionRef.current

  const barPct = calcLevelBarPct(totalXp, currentLevel)

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
      {showCelebration && completedSection && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 cursor-pointer"
          onClick={() => setShowCelebration(false)}
        >
          {['✨','🌟','⭐','🎉','✨','🌟','🎊','⭐','✨','🌟'].map((e, i) => (
            <span
              key={i}
              className="absolute text-3xl pointer-events-none animate-float-up"
              style={{
                left: `${5 + i * 9}%`,
                bottom: `${20 + (i % 3) * 10}%`,
                animationDelay: `${i * 0.12}s`,
                animationDuration: `${1.5 + (i % 3) * 0.3}s`,
              }}
            >
              {e}
            </span>
          ))}
          <div className="animate-celebrate bg-white rounded-3xl px-10 py-8 text-center shadow-2xl">
            <div className="text-7xl mb-3">🏆</div>
            <p className="text-2xl font-black text-ink">섹션 완료!</p>
            <p className="text-primary font-bold mt-1">{completedSection.title}</p>
          </div>
          <p className="text-white/50 text-xs mt-5">탭하면 계속</p>
        </div>
      )}

      {showDiffModal && (
        <DifficultyModal
          currentLevel={progress.difficultyLevel}
          suggestion={adaptiveSuggestion ?? undefined}
          onConfirm={handleDifficultyConfirm}
          onDismiss={() => setShowDiffModal(false)}
        />
      )}
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-ink mb-2">오늘 학습 완료!</h2>
      <p className="text-steel mb-6">정말 잘했어요 👏</p>

      {state && (
        <div
          data-testid="star-card"
          className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-4"
        >
          <div className="text-4xl text-yellow-400 mb-1">
            <StarDisplay stars={state.stars} />
          </div>
          <div className="text-2xl font-bold text-primary mt-2">+{state.xpGained} XP</div>
        </div>
      )}

      <div
        data-testid="level-bar"
        className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-4"
      >
        <div className="flex justify-between text-sm text-steel mb-2">
          <span className="font-bold text-ink">Lv.{currentLevel}</span>
          <span>
            {xpToNextLevel === null
              ? 'MAX'
              : `총 ${totalXp} XP · 다음 레벨까지 ${xpToNextLevel} XP`}
          </span>
        </div>
        <div className="w-full h-3 bg-hairline rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-8">
        <div className="text-5xl font-bold text-orange-500">🔥 {progress.streak}일</div>
        <div className="text-steel mt-1">연속 학습 중</div>
      </div>

      {adaptiveSuggestion && (
        <button
          data-testid="adaptive-suggestion"
          onClick={() => setShowDiffModal(true)}
          className={[
            'w-full rounded-2xl border-2 p-4 mb-4 text-left transition-all',
            adaptiveSuggestion.type === 'upgrade'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200',
          ].join(' ')}
        >
          <p className={`font-bold text-base ${adaptiveSuggestion.type === 'upgrade' ? 'text-blue-700' : 'text-orange-700'}`}>
            {adaptiveSuggestion.type === 'upgrade' ? '🚀 난이도 올려볼까요?' : '💪 난이도를 조정해볼까요?'}
          </p>
          <p className="text-sm text-steel mt-0.5">
            {adaptiveSuggestion.type === 'upgrade'
              ? '연속 3번 만점이에요! 더 도전해보세요.'
              : '조금 더 쉬운 단계로 연습해볼게요.'}
          </p>
          <p className="text-xs text-primary font-semibold mt-2">난이도 변경 →</p>
        </button>
      )}

      <button
        onClick={() => navigate('/')}
        className="w-full py-5 bg-primary text-ink font-bold text-2xl rounded-full"
      >
        홈으로
      </button>
    </div>
  )
}
