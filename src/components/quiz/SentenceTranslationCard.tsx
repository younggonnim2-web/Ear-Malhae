import type { SpeakFn } from '../../hooks/useSpeech'

interface Props {
  english: string
  korean: string
  speak?: SpeakFn
}

export function SentenceTranslationCard({ english, korean, speak }: Props) {
  return (
    <div className="px-4 py-3 bg-surface rounded-xl border border-hairline">
      <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">문장 해석</p>
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-bold text-ink leading-snug flex-1">{english}</p>
        {speak && (
          <button
            onClick={() => speak(english, 'en-US', 1.0, 'sentence')}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-hairline hover:bg-steel/20 transition-colors flex-shrink-0 mt-0.5"
            aria-label="듣기"
          >
            <span className="text-sm">🔊</span>
          </button>
        )}
      </div>
      <p className="text-sm text-steel mt-1 leading-snug">{korean}</p>
    </div>
  )
}
