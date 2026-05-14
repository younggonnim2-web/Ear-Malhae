import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UNITS_MAP, UNIT_ORDER } from '../data/units'
import { LESSONS_MAP } from '../data/lessons'
import { cn } from '../utils/cn'
import { calcLevelBarPct } from '../utils/xp'

export function UnitMap() {
  const navigate = useNavigate()
  const { progress, totalXp, currentLevel, xpToNextLevel } = useApp()
  const barPct = calcLevelBarPct(totalXp, currentLevel)

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto pb-8">
      <div className="bg-ink px-4 pt-10 pb-6 text-center text-white relative">
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="absolute left-4 top-10 text-white/70 text-2xl font-bold hover:text-white"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">학습 맵</h1>
        <p className="text-white/60 mt-1 text-sm">배운 레슨을 확인하세요</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold">Lv.{currentLevel}</span>
            <span className="text-white/60">
              {xpToNextLevel === null ? 'MAX' : `${totalXp} XP · 다음 레벨까지 ${xpToNextLevel} XP`}
            </span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 flex flex-col gap-6">
        {UNIT_ORDER.map(unitId => {
          const unit = UNITS_MAP[unitId]
          const completedCount = unit.lessonIds.filter(id =>
            progress.lessonProgress.includes(id)
          ).length
          const totalCount = unit.lessonIds.length

          return (
            <div key={unitId}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{unit.emoji}</span>
                <span className="font-bold text-ink text-lg">{unit.title}</span>
                <span className="ml-auto text-xs text-muted">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unit.lessonIds.map((lessonId, idx) => {
                  const lesson = LESSONS_MAP[lessonId]
                  const done = progress.lessonProgress.includes(lessonId)
                  const isNext = !done && unit.lessonIds
                    .slice(0, idx)
                    .every(id => progress.lessonProgress.includes(id))

                  return (
                    <button
                      key={lessonId}
                      onClick={() => navigate(`/lesson/${lessonId}`)}
                      className={cn(
                        'px-4 py-2 rounded-full border-2 text-sm font-semibold transition-colors',
                        done && 'bg-green-50 border-green-400 text-green-700',
                        isNext && 'bg-primary border-primary text-ink',
                        !done && !isNext && 'bg-surface border-hairline text-muted',
                      )}
                    >
                      {done
                        ? `${'★'.repeat(progress.lessonStars[lessonId] ?? 1)}${'☆'.repeat(3 - (progress.lessonStars[lessonId] ?? 1))} ${lesson.title}`
                        : lesson.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
