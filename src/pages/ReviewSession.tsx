import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { buildChoices } from '../utils/quizHelpers'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { ListenChoiceQuiz } from '../components/quiz/ListenChoiceQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { SentencePickQuiz } from '../components/quiz/SentencePickQuiz'
import { FillBlankQuiz } from '../components/quiz/FillBlankQuiz'
import { ListenTypeQuiz } from '../components/quiz/ListenTypeQuiz'
import { WordTypeQuiz } from '../components/quiz/WordTypeQuiz'
import { TranslateTypeQuiz } from '../components/quiz/TranslateTypeQuiz'
import { DialogueChoiceQuiz } from '../components/quiz/DialogueChoiceQuiz'
import { PronunciationQuiz } from '../components/quiz/PronunciationQuiz'
import { useSpeech } from '../hooks/useSpeech'
import { playCorrectSound } from '../utils/sound'
import type { ChallengeKind } from '../types/lesson'

export function ReviewSession() {
  const navigate = useNavigate()
  const { progress, clearWrongAnswer } = useApp()
  const { speak, isSpeaking } = useSpeech()

  const [entries] = useState(() =>
    Object.entries(progress.wrongAnswers ?? {}).sort((a, b) => b[1].count - a[1].count)
  )

  const [index, setIndex] = useState(0)
  const [doneIds, setDoneIds] = useState<string[]>([])

  const current = entries[index]
  const currentId = current?.[0]
  const currentEntry = current?.[1]

  const wordChoices = useMemo(() => {
    const word = WORDS.find(w => w.id === currentId)
    if (!word) return []
    return buildChoices(word, WORDS, 3)
  }, [currentId])

  function handleCorrect() {
    if (!current) return
    clearWrongAnswer(current[0])
    setDoneIds(prev => [...prev, current[0]])
    playCorrectSound()
    if (index + 1 < entries.length) {
      setIndex(i => i + 1)
    } else {
      navigate(-1)
    }
  }

  function handleWrong() {
    // wrong during review: keep in wrong answers, just move on
  }

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 p-6 max-w-md mx-auto">
        <span className="text-6xl">🎉</span>
        <p className="text-xl font-black text-ink">복습할 항목이 없어요!</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 py-3 px-8 bg-primary text-white rounded-full font-bold"
        >
          돌아가기
        </button>
      </div>
    )
  }

  if (!current || !currentEntry) return null

  const total = entries.length
  const progressPct = Math.round((index / total) * 100)

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-amber-500 border-b border-amber-600/30">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="text-white/80 text-xl leading-none"
              aria-label="나가기"
            >
              ✕
            </button>
            <div className="text-center">
              <p className="text-xs text-white/70 font-bold uppercase tracking-wide">오답 복습</p>
              <p className="text-sm font-black text-white">틀린 문제를 다시 풀어봐요</p>
            </div>
            <span className="text-xs text-white/80 font-semibold">
              {index + 1}/{total}
            </span>
          </div>
          <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-black/15">
          <span className="text-sm">🔄</span>
          <p className="text-xs font-bold text-white">오답 복습 — {doneIds.length}개 완료</p>
        </div>
      </div>

      <div className="flex-1">
        <ReviewQuiz
          key={currentId}
          id={currentId}
          kind={currentEntry.kind}
          wordChoices={wordChoices}
          speak={speak}
          isSpeaking={isSpeaking}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      </div>
    </div>
  )
}

// ── 퀴즈 렌더러 ─────────────────────────────────────────────────────────────

interface QuizProps {
  id: string
  kind: ChallengeKind
  wordChoices: ReturnType<typeof buildChoices>
  speak: ReturnType<typeof useSpeech>['speak']
  isSpeaking: boolean
  onCorrect: () => void
  onWrong: () => void
}

function ReviewQuiz({ id, kind, wordChoices, speak, isSpeaking, onCorrect, onWrong }: QuizProps) {
  const word = WORDS.find(w => w.id === id)
  const sentence = SENTENCES.find(s => s.id === id)

  // ── 단어 기반 퀴즈 ──────────────────────────────────────────────────────
  if (word) {
    if (kind === 'listen-choice') {
      return (
        <ListenChoiceQuiz
          item={word}
          choices={wordChoices}
          direction="ko-to-en"
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          isSpeaking={isSpeaking}
        />
      )
    }
    if (kind === 'type-word') {
      return (
        <WordTypeQuiz
          item={word}
          onCorrect={onCorrect}
          onWrong={onWrong}
          tag="복습"
        />
      )
    }
    if (kind === 'speak-check') {
      return (
        <PronunciationQuiz
          item={word}
          onCorrect={onCorrect}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    // image-choice 및 기타 단어 퀴즈
    return (
      <ImageChoiceQuiz
        item={word}
        choices={wordChoices}
        direction="ko-to-en"
        displayMode="cards"
        onCorrect={onCorrect}
        onWrong={onWrong}
        speak={speak}
        isSpeaking={isSpeaking}
        tag="복습"
      />
    )
  }

  // ── 문장 기반 퀴즈 ──────────────────────────────────────────────────────
  if (sentence) {
    if (kind === 'fill-blank') {
      return (
        <FillBlankQuiz
          sentence={sentence}
          blankIndex={0}
          direction="ko"
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    if (kind === 'listen-type') {
      return (
        <ListenTypeQuiz
          sentence={sentence}
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    if (kind === 'translate-type') {
      return (
        <TranslateTypeQuiz
          sentence={sentence}
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          tag="복습"
        />
      )
    }
    if (kind === 'sentence-pick') {
      return (
        <SentencePickQuiz
          sentence={sentence}
          allSentences={SENTENCES}
          direction="en-to-ko"
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    if (kind === 'dialogue-choice') {
      return (
        <DialogueChoiceQuiz
          sentence={sentence}
          allSentences={SENTENCES}
          onCorrect={onCorrect}
          onWrong={onWrong}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    if (kind === 'speak-sentence') {
      return (
        <PronunciationQuiz
          phrase={{ english: sentence.english, korean: sentence.korean }}
          onCorrect={onCorrect}
          speak={speak}
          isSpeaking={isSpeaking}
          tag="복습"
        />
      )
    }
    // sentence-builder 및 기타 문장 퀴즈
    return (
      <SentenceBuilderQuiz
        sentence={sentence}
        onCorrect={onCorrect}
        onWrong={onWrong}
        speak={speak}
        direction="en-to-ko"
        tag="복습"
        isSpeaking={isSpeaking}
        autoAdvance={false}
      />
    )
  }

  // 데이터 없음 fallback
  return (
    <div className="p-6 text-center text-steel">
      <p className="mb-4">항목을 찾을 수 없습니다: {id}</p>
      <button
        onClick={onCorrect}
        className="py-3 px-8 bg-primary text-white rounded-full font-bold"
      >
        다음 ▶
      </button>
    </div>
  )
}
