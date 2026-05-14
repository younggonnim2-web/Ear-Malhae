import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UNIT_ORDER, UNITS_MAP } from '../data/units'
import { StreakCard } from '../components/StreakCard'
import { ProgressCard } from '../components/ProgressCard'

export function Home() {
  const navigate = useNavigate()
  const { progress, isPhraseUnlocked, totalXp, currentLevel } = useApp()

  function getNextLesson(): string | null {
    for (const unitId of UNIT_ORDER) {
      const unit = UNITS_MAP[unitId]
      for (const lessonId of unit.lessonIds) {
        if (!progress.lessonProgress.includes(lessonId)) return lessonId
      }
    }
    return null
  }

  function handleStart() {
    const next = getNextLesson()
    if (next) navigate(`/lesson/${next}`)
  }

  const totalLessons = UNIT_ORDER.reduce(
    (sum, uid) => sum + UNITS_MAP[uid].lessonIds.length, 0
  )
  const doneLessons = progress.lessonProgress.length

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto">
      <div className="bg-ink px-4 pt-10 pb-10 text-center text-white">
        <h1 className="text-3xl font-bold">Easy English</h1>
        <p className="text-white/60 mt-1">오늘도 5분 영어!</p>
      </div>

      <StreakCard streak={progress.streak} />

      <div className="p-4 flex flex-col gap-3 mt-4">
        <ProgressCard
          emoji="📚"
          title="전체 레슨"
          subtitle={`Lv.${currentLevel} · ${totalXp} XP`}
          current={doneLessons}
          total={totalLessons}
          onClick={() => navigate('/units')}
        />
        <ProgressCard
          emoji="💬"
          title="회화"
          subtitle="기초 회화 30문장"
          current={0}
          total={30}
          locked={!isPhraseUnlocked()}
        />
      </div>

      <div className="px-4 mt-2 flex flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full py-5 bg-primary text-ink font-bold text-2xl rounded-full"
        >
          오늘 학습 시작 ▶
        </button>
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
