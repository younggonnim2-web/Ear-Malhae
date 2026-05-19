import { cn } from '../utils/cn'

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
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl border border-hairline text-left transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed enabled:active:bg-surface',
        locked ? 'bg-surface' : 'bg-canvas',
      )}
    >
      <span className="text-4xl">{locked ? '🔒' : emoji}</span>
      <div className="flex-1">
        <div className="text-lg font-bold text-ink">{title}</div>
        <div className="text-sm text-steel">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold px-3 py-1 rounded-full bg-primary text-ink">
        {current}/{total}
      </div>
    </button>
  )
}
