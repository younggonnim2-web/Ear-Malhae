import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'

export function AlphabetList() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-ink mb-4">알파벳</h2>
      <div className="grid grid-cols-4 gap-3">
        {ALPHABET.map(item => {
          const done = progress.alphabetProgress.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/alphabet/${item.id}`)}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-2xl font-bold border-2 transition-colors ${
                done ? 'border-green-400 bg-green-50 text-green-700' : 'border-hairline bg-canvas text-ink'
              }`}
            >
              {item.letter}
              {done && <span className="text-xs mt-1">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
