import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { DifficultyLevel } from '../types'

interface LevelOption {
  level: DifficultyLevel
  label: string
  description: string
  hint: string
}

const OPTIONS: LevelOption[] = [
  {
    level: 'beginner',
    label: '처음 배우는 분이에요',
    description: 'ABC부터 차근차근 배워요',
    hint: 'A B C 🔤',
  },
  {
    level: 'intermediate',
    label: '단어는 조금 알아요',
    description: '그림 없이 듣기·빈칸 위주로 시작해요',
    hint: '🍎 apple  🍌 banana',
  },
  {
    level: 'advanced',
    label: '문장도 읽을 수 있어요',
    description: '처음부터 문장 구성·발음 체크로 시작해요',
    hint: 'I am happy 😊',
  },
]

export function Onboarding() {
  const navigate = useNavigate()
  const { setDifficulty, progress } = useApp()
  const [selected, setSelected] = useState<DifficultyLevel | null>(null)

  function handleConfirm() {
    if (!selected) return
    setDifficulty(selected)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (progress.onboardingDone) navigate('/', { replace: true })
  }, [progress.onboardingDone, navigate])

  if (progress.onboardingDone) return null

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto px-6 pt-12 pb-8">
      <div className="flex flex-col items-center gap-2 mb-8">
        <span className="text-6xl">🦉</span>
        <h1 className="text-3xl font-black text-ink">이어 말해</h1>
        <p className="text-steel text-center text-base mt-1">
          현재 영어 실력을 알려주세요!<br />
          맞춤 학습 경로로 시작할게요.
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {OPTIONS.map(option => {
          const isSelected = selected === option.level
          return (
            <button
              key={option.level}
              onClick={() => setSelected(option.level)}
              className={[
                'w-full rounded-2xl border-2 p-5 text-left transition-all',
                isSelected
                  ? 'border-primary bg-blue-50'
                  : 'border-hairline bg-canvas hover:border-primary/40',
              ].join(' ')}
            >
              <div className="flex items-start gap-4">
                <div className={[
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300',
                ].join(' ')}>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white block" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-ink text-base">{option.label}</p>
                  <p className="text-steel text-sm mt-0.5">{option.description}</p>
                  <div className="mt-3 bg-surface rounded-xl px-4 py-3 text-center">
                    <span className="text-lg font-semibold text-ink">{option.hint}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected}
        className={[
          'mt-6 w-full py-4 rounded-full text-lg font-bold transition-all',
          selected
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-300',
        ].join(' ')}
      >
        시작하기 🚀
      </button>
    </div>
  )
}
