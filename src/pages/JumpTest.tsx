import { useState, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SECTIONS } from '../data/sections'
import { UNITS_MAP } from '../data/units'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { useSpeech } from '../hooks/useSpeech'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { FillBlankQuiz } from '../components/quiz/FillBlankQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { cn } from '../utils/cn'
import type { WordItem, SentenceItem } from '../types'

// 섹션 인덱스(1~4) → 난이도 설정
// buildQ는 항상 ko-to-en (한국어 보고 영어 작성 = 최고 난이도)
const DIFFICULTY_BY_IDX: Record<number, { hearts: number; wordQ: number; pickQ: number; fillQ: number; buildQ: number }> = {
  1: { hearts: 3, wordQ: 4, pickQ: 3, fillQ: 3, buildQ: 2 },  // → 탐험가  (12문제)
  2: { hearts: 3, wordQ: 3, pickQ: 4, fillQ: 4, buildQ: 3 },  // → 여행자  (14문제)
  3: { hearts: 2, wordQ: 2, pickQ: 4, fillQ: 5, buildQ: 5 },  // → 도전자  (16문제)
  4: { hearts: 1, wordQ: 1, pickQ: 4, fillQ: 6, buildQ: 7 },  // → 마스터  (18문제)
}
const DEFAULT_DIFFICULTY = DIFFICULTY_BY_IDX[1]

// ── 문제 타입 ─────────────────────────────────────────────
type WordChoiceQ   = { type: 'word-choice';    item: WordItem; choices: WordItem[]; direction: 'en-to-ko' | 'ko-to-en' }
type SentencePickQ = { type: 'sentence-pick';  sentence: SentenceItem; choices: string[]; answer: string; direction: 'en-to-ko' | 'ko-to-en' }
type FillBlankQ    = { type: 'fill-blank';     sentence: SentenceItem; blankIndex: number }
type SentenceBuildQ = { type: 'sentence-build'; sentence: SentenceItem; direction: 'en-to-ko' | 'ko-to-en' }
type QuestionDef   = WordChoiceQ | SentencePickQ | FillBlankQ | SentenceBuildQ

// ── 유틸 ──────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dir(idx: number): 'en-to-ko' | 'ko-to-en' {
  return idx % 2 === 0 ? 'en-to-ko' : 'ko-to-en'
}

// ── 문제 생성 ──────────────────────────────────────────────
function buildWordChoiceQs(words: WordItem[], count: number): WordChoiceQ[] {
  return shuffle(words).slice(0, count).map((item, idx) => {
    const same  = shuffle(words.filter(w => w.id !== item.id && w.category === item.category))
    const other = shuffle(words.filter(w => w.id !== item.id && w.category !== item.category))
    const choices = shuffle([item, ...[...same, ...other].slice(0, 3)])
    return { type: 'word-choice', item, choices, direction: dir(idx) }
  })
}

function buildSentencePickQs(pool: SentenceItem[], all: SentenceItem[], count: number): SentencePickQ[] {
  return pool.slice(0, count).map((sentence, idx) => {
    const d = dir(idx)
    const answer = d === 'en-to-ko' ? sentence.korean : sentence.english
    const wrong  = shuffle(all.filter(s => s.id !== sentence.id)).slice(0, 3)
                     .map(s => d === 'en-to-ko' ? s.korean : s.english)
    return { type: 'sentence-pick', sentence, choices: shuffle([answer, ...wrong]), answer, direction: d }
  })
}

function buildFillBlankQs(pool: SentenceItem[], count: number): FillBlankQ[] {
  return pool.slice(0, count).map(sentence => ({
    type: 'fill-blank',
    sentence,
    blankIndex: Math.floor(Math.random() * sentence.parts.length),
  }))
}

// sentence-build는 항상 ko-to-en (한국어 보고 영어 작성 = 최고 난이도)
function buildSentenceBuildQs(pool: SentenceItem[], count: number): SentenceBuildQ[] {
  return pool.slice(0, count).map(sentence => ({
    type: 'sentence-build',
    sentence,
    direction: 'ko-to-en' as const,
  }))
}

function buildAllQuestions(
  words: WordItem[],
  sentences: SentenceItem[],
  cfg: typeof DEFAULT_DIFFICULTY,
): QuestionDef[] {
  const sents = shuffle(sentences)
  const need = cfg.pickQ + cfg.fillQ + cfg.buildQ
  // 문장이 부족하면 반복 허용
  const sentPool = sents.length >= need
    ? sents
    : [...sents, ...sents, ...sents].slice(0, need + 4)

  let offset = 0
  const pickSlice  = sentPool.slice(offset, offset + cfg.pickQ);  offset += cfg.pickQ
  const fillSlice  = sentPool.slice(offset, offset + cfg.fillQ);  offset += cfg.fillQ
  const buildSlice = sentPool.slice(offset, offset + cfg.buildQ)

  const wordQs  = buildWordChoiceQs(words, cfg.wordQ)
  const pickQs  = buildSentencePickQs(pickSlice, sents, cfg.pickQ)
  const fillQs  = buildFillBlankQs(fillSlice, cfg.fillQ)
  const buildQs = buildSentenceBuildQs(buildSlice, cfg.buildQ)
  return shuffle([...wordQs, ...pickQs, ...fillQs, ...buildQs])
}

// ── 문장 번역 선택형 ───────────────────────────────────────
function SentencePickQuiz({ q, onCorrect, onWrong }: {
  q: SentencePickQ
  onCorrect: () => void
  onWrong: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(choice: string) {
    if (answered) return
    setSelected(choice)
    setAnswered(true)
    if (choice !== q.answer) onWrong()
  }

  const label = q.direction === 'en-to-ko' ? '올바른 한국어 번역을 고르세요' : '올바른 영어 번역을 고르세요'
  const prompt = q.direction === 'en-to-ko' ? q.sentence.english : q.sentence.korean

  return (
    <div className="flex flex-col gap-5 p-6">
      <p className="text-2xl font-bold text-ink">{label}</p>
      <div className="bg-surface rounded-2xl px-5 py-5 border-2 border-hairline">
        <p className="text-lg font-semibold text-ink leading-relaxed">{prompt}</p>
      </div>
      <div className="flex flex-col gap-2">
        {q.choices.map((choice, idx) => {
          const isCorrect  = choice === q.answer
          const isSelected = choice === selected
          return (
            <button
              key={idx}
              onClick={() => handleSelect(choice)}
              disabled={answered}
              className={cn(
                'px-4 py-4 rounded-2xl border-2 text-base font-semibold text-left transition-colors',
                !answered && 'border-hairline bg-canvas text-ink hover:border-primary',
                answered && isCorrect  && 'border-green-500 bg-green-50 text-green-800',
                answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700',
                answered && !isSelected && !isCorrect && 'border-hairline bg-canvas text-muted opacity-50',
              )}
            >
              {choice}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-base font-medium ${selected === q.answer ? 'text-green-600' : 'text-steel'}`}>
          {selected === q.answer ? '✓ 정답이에요! 👍' : `정답: "${q.answer}"`}
        </p>
      )}
      {answered && (
        <button onClick={onCorrect} className="w-full py-4 bg-primary text-ink text-xl font-bold rounded-full">
          다음 ▶
        </button>
      )}
    </div>
  )
}

// ── 결과 화면 ──────────────────────────────────────────────
function PassScreen({ sectionTitle, onContinue }: { sectionTitle: string; onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-8xl">🎉</div>
      <p className="text-2xl font-black text-ink text-center">테스트 통과!</p>
      <p className="text-steel text-center leading-relaxed">
        <span className="font-bold text-ink">"{sectionTitle}"</span> 섹션이 잠금 해제됐어요.
        <br />이전 섹션은 자동으로 완료 처리됩니다.
      </p>
      <button onClick={onContinue} className="w-full max-w-sm py-4 bg-primary text-white font-bold rounded-2xl text-base">
        {sectionTitle} 시작하기
      </button>
    </div>
  )
}

function FailScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-8xl">💔</div>
      <p className="text-2xl font-black text-ink text-center">테스트 실패</p>
      <p className="text-steel text-center leading-relaxed">
        하트가 모두 소진됐어요.
        <br />현재 섹션을 더 학습한 뒤 다시 도전해보세요!
      </p>
      <button onClick={onBack} className="w-full max-w-sm py-4 bg-primary text-white font-bold rounded-2xl text-base">
        학습 화면으로 돌아가기
      </button>
    </div>
  )
}

// ── 메인 ──────────────────────────────────────────────────
export function JumpTest() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()
  const { progress, skipToSection } = useApp()
  const { speak, isSpeaking } = useSpeech()
  const completedSet = new Set(progress.lessonProgress)

  const targetSection = SECTIONS.find(s => s.id === sectionId)
  const targetIdx     = SECTIONS.findIndex(s => s.id === sectionId)

  const skipWords = useMemo<WordItem[]>(() => {
    if (targetIdx <= 0) return []
    const wordUnitIds = new Set(
      SECTIONS.slice(0, targetIdx).flatMap(s => s.unitIds).filter(uid => UNITS_MAP[uid]?.type === 'words')
    )
    return WORDS.filter(w => wordUnitIds.has(w.category))
  }, [targetIdx])

  const lessonIdsToSkip = useMemo<string[]>(() => {
    if (targetIdx <= 0) return []
    return SECTIONS.slice(0, targetIdx)
      .flatMap(s => s.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? []))
      .filter(id => !completedSet.has(id))
  }, [targetIdx, completedSet])

  const cfg = DIFFICULTY_BY_IDX[targetIdx] ?? DEFAULT_DIFFICULTY

  const questions = useMemo<QuestionDef[]>(
    () => (skipWords.length >= 4 ? buildAllQuestions(skipWords, SENTENCES, cfg) : []),
    [skipWords, cfg]
  )

  // 하트는 ref로 즉시 참조 + state로 렌더링
  const heartsRef = useRef(cfg.hearts)
  const [heartsDisplay, setHeartsDisplay] = useState(cfg.hearts)
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState<'quiz' | 'pass' | 'fail'>('quiz')

  if (!targetSection || targetIdx <= 0) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-steel">잘못된 접근입니다.</p></div>
  }
  if (skipWords.length < 4) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-steel text-center">건너뛰기 테스트를 위한 학습 콘텐츠가 부족합니다.</p>
        <button onClick={() => navigate('/')} className="text-primary font-bold">돌아가기</button>
      </div>
    )
  }

  if (phase === 'pass') {
    return (
      <PassScreen
        sectionTitle={targetSection.title}
        onContinue={() => { skipToSection(lessonIdsToSkip); navigate(`/section/${sectionId}`) }}
      />
    )
  }
  if (phase === 'fail') return <FailScreen onBack={() => navigate('/')} />

  const q = questions[current]
  const progressPct = Math.round((current / questions.length) * 100)

  const TYPE_LABEL: Record<QuestionDef['type'], string> = {
    'word-choice':    '🔤 올바른 의미선택',
    'sentence-pick':  '📖 문장 번역',
    'fill-blank':     '✏️ 빈칸채우기',
    'sentence-build': '🧩 문장 작성하기',
  }

  function handleWrong() {
    heartsRef.current = Math.max(0, heartsRef.current - 1)
    setHeartsDisplay(heartsRef.current)
  }

  function handleAdvance() {
    if (heartsRef.current <= 0) { setPhase('fail'); return }
    const next = current + 1
    if (next >= questions.length) setPhase('pass')
    else setCurrent(next)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-canvas border-b border-hairline">
        <div className="max-w-md mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate('/')} className="text-steel text-xl leading-none">✕</button>
            <div className="text-center">
              <p className="text-xs text-steel font-bold uppercase tracking-wide">건너뛰기 테스트</p>
              <p className="text-sm font-black text-ink">{targetSection.title} 섹션</p>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: cfg.hearts }).map((_, i) => (
                <span key={i} className={`text-xl ${i < heartsDisplay ? '' : 'grayscale opacity-25'}`}>❤️</span>
              ))}
            </div>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-steel mt-1">
            <span className="font-semibold">{TYPE_LABEL[q.type]}</span>
            <span>{current + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      {/* 문제 */}
      <div className="flex-1 max-w-md mx-auto w-full overflow-y-auto">
        {q.type === 'word-choice' && (
          <ImageChoiceQuiz
            key={`wc-${current}`}
            item={q.item}
            choices={q.choices}
            direction={q.direction}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
            speak={speak}
            isSpeaking={isSpeaking}
            displayMode="list"
          />
        )}
        {q.type === 'sentence-pick' && (
          <SentencePickQuiz
            key={`sp-${current}`}
            q={q}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
          />
        )}
        {q.type === 'fill-blank' && (
          <FillBlankQuiz
            key={`fb-${current}`}
            sentence={q.sentence}
            blankIndex={q.blankIndex}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
            speak={speak}
            isSpeaking={isSpeaking}
          />
        )}
        {q.type === 'sentence-build' && (
          <SentenceBuilderQuiz
            key={`sb-${current}`}
            sentence={q.sentence}
            direction={q.direction}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
            speak={speak}
            isSpeaking={isSpeaking}
          />
        )}
      </div>
    </div>
  )
}
