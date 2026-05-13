import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { StreakCard } from '../components/StreakCard'
import { ProgressCard } from '../components/ProgressCard'

export function Home() {
  const navigate = useNavigate()
  const { progress, isPhraseUnlocked } = useApp()

  function handleStart() {
    const nextAlphabet = ALPHABET.find(a => !progress.alphabetProgress.includes(a.id))
    if (nextAlphabet) { navigate(`/alphabet/${nextAlphabet.id}`); return }
    const nextWord = WORDS.find(w => !progress.wordProgress.includes(w.id))
    if (nextWord) navigate(`/words/${nextWord.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="bg-blue-500 px-4 pt-10 pb-10 text-center text-white">
        <h1 className="text-3xl font-bold">Easy English</h1>
        <p className="text-blue-100 mt-1">오늘도 5분 영어!</p>
      </div>

      <StreakCard streak={progress.streak} />

      <div className="p-4 flex flex-col gap-3 mt-4">
        <ProgressCard
          emoji="🔤"
          title="알파벳"
          subtitle="A ~ Z, 26자"
          current={progress.alphabetProgress.length}
          total={26}
          onClick={() => {
            const next = ALPHABET.find(a => !progress.alphabetProgress.includes(a.id))
            if (next) navigate(`/alphabet/${next.id}`)
          }}
        />
        <ProgressCard
          emoji="📖"
          title="단어"
          subtitle="기초 단어 100개"
          current={progress.wordProgress.length}
          total={100}
          onClick={() => {
            const next = WORDS.find(w => !progress.wordProgress.includes(w.id))
            if (next) navigate(`/words/${next.id}`)
          }}
        />
        <ProgressCard
          emoji="💬"
          title="회화"
          subtitle="기초 회화 30문장"
          current={0}
          total={30}
          locked={!isPhraseUnlocked()}
        />
      </div>

      <div className="px-4 mt-2">
        <button
          onClick={handleStart}
          className="w-full py-5 bg-primary text-white text-2xl font-bold rounded-2xl"
        >
          오늘 학습 시작 ▶
        </button>
      </div>
    </div>
  )
}
