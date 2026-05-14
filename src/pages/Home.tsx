import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UNIT_ORDER, UNITS_MAP } from '../data/units'
import { StreakCard } from '../components/StreakCard'
import { cn } from '../utils/cn'

const SECTIONS = [
  {
    id: 'alphabet',
    title: '알파벳',
    emoji: '🔤',
    subtitle: 'A-Z 기초 발음',
    unitIds: UNIT_ORDER.filter(id => UNITS_MAP[id].type === 'alphabet'),
  },
  {
    id: 'words',
    title: '단어',
    emoji: '📝',
    subtitle: '생활 필수 어휘',
    unitIds: UNIT_ORDER.filter(id => UNITS_MAP[id].type === 'words'),
  },
]

export function Home() {
  const navigate = useNavigate()
  const { progress, totalXp, currentLevel } = useApp()

  function getNextLessonInSection(unitIds: string[]): string | null {
    for (const unitId of unitIds) {
      const unit = UNITS_MAP[unitId]
      for (const lessonId of unit.lessonIds) {
        if (!progress.lessonProgress.includes(lessonId)) return lessonId
      }
    }
    return null
  }

  function getSectionProgress(unitIds: string[]) {
    const total = unitIds.reduce((sum, uid) => sum + UNITS_MAP[uid].lessonIds.length, 0)
    const done = unitIds.reduce(
      (sum, uid) =>
        sum + UNITS_MAP[uid].lessonIds.filter(id => progress.lessonProgress.includes(id)).length,
      0,
    )
    return { total, done }
  }

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto">
      <div className="bg-ink px-4 pt-10 pb-8 text-center text-white">
        <h1 className="text-3xl font-bold">Easy English</h1>
        <p className="text-white/60 mt-1">Lv.{currentLevel} · {totalXp} XP</p>
      </div>

      <StreakCard streak={progress.streak} />

      <div className="p-4 flex flex-col gap-4 mt-2">
        {SECTIONS.map(section => {
          const { total, done } = getSectionProgress(section.unitIds)
          const nextLesson = getNextLessonInSection(section.unitIds)
          const completed = done === total
          const pct = total > 0 ? Math.round((done / total) * 100) : 0

          return (
            <div key={section.id} className="bg-canvas rounded-2xl border border-hairline p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{section.emoji}</span>
                <div className="flex-1">
                  <h2 className="font-bold text-lg text-ink">{section.title}</h2>
                  <p className="text-sm text-steel">{section.subtitle}</p>
                </div>
                <span className="text-sm text-muted font-semibold">{done}/{total}</span>
              </div>
              <div className="w-full h-2 bg-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <button
                onClick={() => navigate(nextLesson ? `/lesson/${nextLesson}` : '/units')}
                className={cn(
                  'w-full py-3 font-bold rounded-full text-base',
                  completed
                    ? 'bg-surface border border-hairline text-muted'
                    : 'bg-primary text-ink',
                )}
              >
                {completed ? '✓ 완료' : done > 0 ? '이어서 학습 ▶' : '시작하기 ▶'}
              </button>
            </div>
          )
        })}

        <button
          onClick={() => navigate('/units')}
          className="w-full py-3 bg-surface border border-hairline text-ink font-semibold rounded-full"
        >
          학습 맵 보기
        </button>
      </div>
    </div>
  )
}
