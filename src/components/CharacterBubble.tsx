import { cn } from '../utils/cn'

interface Props {
  word: string
  onSpeak?: () => void
  isSpeaking?: boolean
}

export function CharacterBubble({ word, onSpeak, isSpeaking }: Props) {
  const bubble = (
    <div className="relative bg-brand-green-dim rounded-2xl px-6 py-3 shadow-sm">
      <span className="text-2xl font-bold text-ink">{word}</span>
      {onSpeak && (
        <span className={cn(
          'absolute -top-2 -right-2 text-lg',
          isSpeaking && 'animate-speaking inline-block',
        )}>
          🔊
        </span>
      )}
    </div>
  )

  if (onSpeak) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onSpeak}
          className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
          aria-label="단어 듣기"
        >
          <span className="text-7xl select-none">🦉</span>
          {bubble}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <span className="text-5xl select-none">🦉</span>
      {bubble}
    </div>
  )
}
