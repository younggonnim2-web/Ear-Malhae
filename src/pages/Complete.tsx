import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calcLevelBarPct } from '../utils/xp'

interface CompleteState {
  stars: 1 | 2 | 3
  xpGained: number
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
  const { progress, totalXp, currentLevel, xpToNextLevel } = useApp()
  const state = location.state as CompleteState | null

  const barPct = calcLevelBarPct(totalXp, currentLevel)

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
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

      <button
        onClick={() => navigate('/')}
        className="w-full py-5 bg-primary text-ink font-bold text-2xl rounded-full"
      >
        홈으로
      </button>
    </div>
  )
}
