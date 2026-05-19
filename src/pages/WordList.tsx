import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS, WORD_CATEGORIES, CATEGORY_LABELS } from '../data/words'

export function WordList() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">단어</h2>
      {WORD_CATEGORIES.map(cat => {
        const catWords = WORDS.filter(w => w.category === cat)
        const doneCount = catWords.filter(w => progress.wordProgress.includes(w.id)).length
        return (
          <div key={cat} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-ink">{CATEGORY_LABELS[cat]}</h3>
              <span className="text-sm text-muted">{doneCount}/{catWords.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {catWords.map(word => {
                const done = progress.wordProgress.includes(word.id)
                return (
                  <button
                    key={word.id}
                    onClick={() => navigate(`/words/${word.id}`)}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      done ? 'border-green-400 bg-green-50 text-green-700' : 'border-hairline bg-canvas text-ink'
                    }`}
                  >
                    <div className="text-2xl">{word.emoji}</div>
                    <div className="text-sm font-medium mt-1">{word.word}</div>
                    {done && <div className="text-xs text-green-500">✓</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
