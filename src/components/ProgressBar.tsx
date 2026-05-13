interface Props {
  current: number
  total: number
  step: 'view' | 'quiz' | 'speak'
}

const STEP_LABELS = { view: '보기', quiz: '퀴즈', speak: '발음' } as const

export function ProgressBar({ current, total, step }: Props) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{current} / {total}</span>
        <span className="text-primary font-semibold">Step {STEP_LABELS[step]}</span>
      </div>
      <div
        className="h-2 bg-blue-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
