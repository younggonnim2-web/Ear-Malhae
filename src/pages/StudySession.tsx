import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { getQuizAssignment } from '../utils/quizAssignment'
import { buildChoices } from '../utils/quizHelpers'
import { ProgressBar } from '../components/ProgressBar'
import { FlashCard } from '../components/FlashCard'
import { QuizStep } from '../components/quiz/QuizStep'
import { PronunciationStep } from '../components/PronunciationStep'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import type { StudyItem } from '../types'

interface Props {
  mode: 'alphabet' | 'words'
}

type Step = 'view' | 'quiz' | 'speak'
type Phase = 'study' | 'review'

export function StudySession({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { markAlphabetDone, markWordDone, updateStreak } = useApp()
  const [step, setStep] = useState<Step>('view')
  const [phase, setPhase] = useState<Phase>('study')
  const [wrongItems, setWrongItems] = useState<StudyItem[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const allItems: StudyItem[] = mode === 'alphabet' ? ALPHABET : WORDS
  const itemIndex = allItems.findIndex(i => i.id === id)
  const item = allItems[itemIndex]

  if (!item) {
    return <div className="p-8 text-center text-gray-500">항목을 찾을 수 없습니다</div>
  }

  const markWrong = useCallback((wrongItem: StudyItem) => {
    setWrongItems(prev =>
      prev.some(w => w.id === wrongItem.id) ? prev : [...prev, wrongItem]
    )
  }, [])

  function handleDone() {
    if (mode === 'alphabet') markAlphabetDone(item.id)
    else markWordDone(item.id)

    const next = allItems[itemIndex + 1]
    if (next) {
      navigate(`/${mode === 'alphabet' ? 'alphabet' : 'words'}/${next.id}`, { replace: true })
      setStep('view')
    } else {
      if (wrongItems.length > 0) {
        setPhase('review')
        setReviewIndex(0)
      } else {
        updateStreak()
        navigate('/complete')
      }
    }
  }

  function handleReviewDone() {
    const next = reviewIndex + 1
    if (next < wrongItems.length) {
      setReviewIndex(next)
    } else {
      updateStreak()
      navigate('/complete')
    }
  }

  const assignment = getQuizAssignment(itemIndex)

  if (phase === 'review') {
    const reviewItem = wrongItems[reviewIndex]
    const choices = buildChoices(reviewItem, allItems, 4)
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col max-w-md mx-auto">
        <div className="bg-orange-500 text-white text-center py-3 font-bold text-lg">
          복습 다시 풀기
        </div>
        <p className="text-center text-sm text-orange-700 py-2">
          {wrongItems.length}개를 틀렸어요. 다시 한 번 풀어봐요!
        </p>
        <div className="text-center text-xs text-gray-500 pb-1">
          복습 {reviewIndex + 1} / {wrongItems.length}
        </div>
        <div className="flex-1 px-4">
          <ImageChoiceQuiz
            item={reviewItem}
            choices={choices}
            direction="en-to-ko"
            onCorrect={handleReviewDone}
            allowNextOnWrong
            onNext={handleReviewDone}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 shadow-xl">
            <p className="text-lg font-bold text-gray-800 mb-2">학습을 나가시겠어요?</p>
            <p className="text-sm text-gray-500 mb-4">진도는 저장됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700"
              >
                계속 학습
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center px-4 pt-4">
        <button
          onClick={() => setShowExitDialog(true)}
          aria-label="학습 나가기"
          className="text-gray-400 text-2xl font-bold mr-2"
        >
          ✕
        </button>
        <div className="flex-1">
          <ProgressBar
            current={itemIndex + 1}
            total={allItems.length}
            step={step}
          />
        </div>
      </div>
      <div className="flex-1">
        {step === 'view' && <FlashCard item={item} onNext={() => setStep('quiz')} />}
        {step === 'quiz' && (
          <QuizStep
            item={item}
            allItems={allItems}
            assignment={assignment}
            wordIndex={itemIndex}
            onComplete={() => setStep('speak')}
            onWrong={() => markWrong(item)}
          />
        )}
        {step === 'speak' && <PronunciationStep item={item} onComplete={handleDone} />}
      </div>
    </div>
  )
}
