import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { DifficultyLevel } from '../types'
import type { AdaptiveSuggestion } from '../utils/difficultyAdaptive'

const LEVEL_CONFIG: Record<DifficultyLevel, { label: string; hint: string; description: string }> = {
  beginner: {
    label: '초급',
    hint: 'A B C 🔤',
    description: 'ABC부터 기초 단어까지',
  },
  intermediate: {
    label: '중급',
    hint: '🍎 apple  🍌 banana',
    description: '단어 위주 집중 학습',
  },
  advanced: {
    label: '고급',
    hint: 'I am happy 😊',
    description: '문장과 실용 표현 중심',
  },
}

const LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced']

interface Props {
  currentLevel: DifficultyLevel
  suggestion?: AdaptiveSuggestion
  onConfirm: (level: DifficultyLevel) => void
  onDismiss: () => void
}

export function DifficultyModal({ currentLevel, suggestion, onConfirm, onDismiss }: Props) {
  const [selected, setSelected] = useState<DifficultyLevel>(
    suggestion ? suggestion.to : currentLevel,
  )

  const upgradeMsg = suggestion?.type === 'upgrade'
    ? '🚀 실력이 많이 늘었어요! 더 어려운 단계로 올라갈까요?'
    : null
  const downgradeMsg = suggestion?.type === 'downgrade'
    ? '💪 조금 더 탄탄하게 연습해볼까요? 난이도를 낮춰드릴게요.'
    : null

  const modal = (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center px-4 pb-0"
      style={{ zIndex: 9999 }}
      onClick={onDismiss}
    >
      <div
        className="bg-canvas rounded-t-3xl w-full max-w-md p-6 pb-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        <h2 className="text-xl font-black text-ink mb-1">학습 난이도</h2>

        {(upgradeMsg || downgradeMsg) && (
          <p className="text-sm text-primary font-semibold mb-4">
            {upgradeMsg ?? downgradeMsg}
          </p>
        )}

        {!suggestion && (
          <p className="text-sm text-steel mb-4">
            현재 난이도: <strong>{LEVEL_CONFIG[currentLevel].label}</strong>
          </p>
        )}

        <div className="flex flex-col gap-2 mb-6">
          {LEVELS.map(level => {
            const cfg = LEVEL_CONFIG[level]
            const isSelected = selected === level
            const isCurrent = level === currentLevel
            const isSuggested = suggestion?.to === level
            return (
              <button
                key={level}
                onClick={() => setSelected(level)}
                className={[
                  'w-full rounded-xl border-2 p-4 text-left flex items-center gap-3 transition-all',
                  isSelected ? 'border-primary bg-blue-50' : 'border-hairline bg-surface',
                ].join(' ')}
              >
                <div className={[
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                  isSelected ? 'border-primary bg-primary' : 'border-gray-300',
                ].join(' ')}>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white block" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{cfg.label}</span>
                    {isCurrent && !isSuggested && (
                      <span className="text-xs bg-gray-100 text-steel rounded-full px-2 py-0.5">현재</span>
                    )}
                    {isSuggested && (
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-semibold">추천</span>
                    )}
                  </div>
                  <p className="text-xs text-steel mt-0.5">{cfg.description}</p>
                </div>
                <span className="text-sm text-steel">{cfg.hint}</span>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 border-2 border-hairline rounded-full font-semibold text-steel"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={selected === currentLevel && !suggestion}
            className={[
              'flex-1 py-3 rounded-full font-bold transition-all',
              selected !== currentLevel || suggestion
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-400',
            ].join(' ')}
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
