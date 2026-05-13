interface Props {
  emoji: string
  title: string
  subtitle: string
  current: number
  total: number
  locked?: boolean
  onClick?: () => void
}

export function ProgressCard({ emoji, title, subtitle, current, total, locked, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        enabled:active:bg-gray-50"
      style={{ borderColor: locked ? '#E0E0E0' : '#BBDEFB', background: locked ? '#F5F5F5' : '#FFFFFF' }}
    >
      <span className="text-4xl">{locked ? '🔒' : emoji}</span>
      <div className="flex-1">
        <div className="text-lg font-bold text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold px-3 py-1 rounded-full bg-primary text-white">
        {current}/{total}
      </div>
    </button>
  )
}
