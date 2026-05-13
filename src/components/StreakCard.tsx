interface Props {
  streak: number
}

export function StreakCard({ streak }: Props) {
  return (
    <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md p-4 text-center">
      <div className="text-4xl">🔥</div>
      <div className="text-3xl font-bold text-orange-500 mt-1">{streak}일째</div>
      <div className="text-sm text-gray-400 mt-1">연속 학습 중</div>
    </div>
  )
}
