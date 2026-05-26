interface Props {
  english: string
  korean: string
}

export function SentenceTranslationCard({ english, korean }: Props) {
  return (
    <div className="px-4 py-3 bg-surface rounded-xl border border-hairline">
      <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">문장 해석</p>
      <p className="text-base font-bold text-ink leading-snug">{english}</p>
      <p className="text-sm text-steel mt-1 leading-snug">{korean}</p>
    </div>
  )
}
