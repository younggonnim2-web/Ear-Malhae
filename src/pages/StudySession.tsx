import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { getQuizAssignment } from '../utils/quizAssignment'
import { buildChoices } from '../utils/quizHelpers'
import { ProgressBar } from '../components/ProgressBar'
import { FlashCard } from '../components/FlashCard'
import { QuizStep } from '../components/quiz/QuizStep'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import type { StudyItem } from '../types'

interface Props {
  mode: 'alphabet' | 'words'
}

type Step = 'view' | 'quiz'
type Phase = 'study' | 'review' | 'sentence'

const SENTENCE_COUNT = 3

export function StudySession({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { markAlphabetDone, markWordDone, updateStreak } = useApp()
  const [step, setStep] = useState<Step>('view')
  const [phase, setPhase] = useState<Phase>('study')
  const [wrongItems, setWrongItems] = useState<StudyItem[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const allItems: StudyItem[] = mode === 'alphabet' ? ALPHABET : WORDS
  const itemIndex = allItems.findIndex(i => i.id === id)
  const item = allItems[itemIndex]

  const markWrong = useCallback((wrongItem: StudyItem) => {
    setWrongItems(prev =>
      prev.some(w => w.id === wrongItem.id) ? prev : [...prev, wrongItem]
    )
  }, [])

  if (!item) {
    return <div className="p-8 text-center text-steel">항목을 찾을 수 없습니다</div>
  }

  function goToSentenceOrComplete() {
    setPhase('sentence')
    setSentenceIndex(0)
  }

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
        goToSentenceOrComplete()
      }
    }
  }

  function handleReviewDone() {
    const next = reviewIndex + 1
    if (next < wrongItems.length) {
      setReviewIndex(next)
    } else {
      goToSentenceOrComplete()
    }
  }

  function handleSentenceDone() {
    const next = sentenceIndex + 1
    if (next < SENTENCE_COUNT) {
      setSentenceIndex(next)
    } else {
      updateStreak()
      navigate('/complete')
    }
  }

  const assignment = getQuizAssignment(itemIndex)

  const exitDialog = showExitDialog
    ? createPortal(
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowExitDialog(false)}
        >
          <div
            className="bg-canvas border border-hairline rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-ink mb-2">학습을 나가시겠어요?</p>
            <p className="text-sm text-steel mb-4">진도는 저장됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitDialog(false)}
                className="flex-1 py-3 bg-surface border border-hairline text-ink rounded-full font-semibold"
              >
                계속 학습
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 bg-primary text-ink rounded-full font-bold"
              >
                나가기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null

  if (phase === 'sentence') {
    const sentence = SENTENCES[sentenceIndex % SENTENCES.length]
    return (
      <>
        {exitDialog}
        <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
          <div className="flex items-center px-4 pt-4 pb-2">
            <button
              onClick={() => setShowExitDialog(true)}
              aria-label="학습 나가기"
              className="text-muted text-2xl font-bold mr-2"
            >
              ✕
            </button>
            <div className="flex-1 text-center font-bold text-ink">문장 연습</div>
            <div className="text-xs text-muted w-8 text-right">
              {sentenceIndex + 1}/{SENTENCE_COUNT}
            </div>
          </div>
          <p className="text-center text-sm text-steel pb-2">
            배운 단어로 문장을 완성해봐요!
          </p>
          <div className="flex-1 px-4">
            <SentenceBuilderQuiz
              key={sentenceIndex}
              sentence={sentence}
              onCorrect={handleSentenceDone}
            />
          </div>
        </div>
      </>
    )
  }

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
        <div className="text-center text-xs text-steel pb-1">
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
    <>
      {exitDialog}
      <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <div className="flex items-center px-4 pt-4">
        <button
          onClick={() => setShowExitDialog(true)}
          aria-label="학습 나가기"
          className="text-muted text-2xl font-bold mr-2"
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
            onComplete={handleDone}
            onWrong={() => markWrong(item)}
          />
        )}
      </div>
      </div>
    </>
  )
}
