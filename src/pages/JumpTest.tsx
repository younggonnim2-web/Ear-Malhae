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
import { buildChoices } from '../utils/quizHelpers'
import { SentencePickQuiz } from '../components/quiz/SentencePickQuiz'
import type { WordItem, SentenceItem } from '../types'

// 섹션 인덱스(1~4) → 난이도 설정
// fillDir: 'ko'=한국어 빈칸(이해), 'en'=영어 빈칸(생산)
// buildQ: 항상 ko-to-en (영어 문장 작성)
const DIFFICULTY_BY_IDX: Record<number, { hearts: number; wordQ: number; pickQ: number; fillQ: number; buildQ: number; fillDir: 'ko' | 'en' }> = {
  1: { hearts: 3, wordQ: 4, pickQ: 2, fillQ: 3, buildQ: 2, fillDir: 'ko' },  // → 탐험가  (11문제) 단어선택 중심
  2: { hearts: 3, wordQ: 2, pickQ: 4, fillQ: 3, buildQ: 3, fillDir: 'ko' },  // → 여행자  (12문제) 문장번역 중심
  3: { hearts: 2, wordQ: 0, pickQ: 2, fillQ: 5, buildQ: 6, fillDir: 'en' },  // → 도전자  (13문제) 영어빈칸+작문
  4: { hearts: 1, wordQ: 0, pickQ: 0, fillQ: 5, buildQ: 9, fillDir: 'en' },  // → 마스터  (14문제) 작문만
}
const DEFAULT_DIFFICULTY = DIFFICULTY_BY_IDX[1]

// ── 문제 타입 ─────────────────────────────────────────────
type WordChoiceQ   = { type: 'word-choice';    item: WordItem; choices: WordItem[]; direction: 'en-to-ko' | 'ko-to-en' }
type SentencePickQ = { type: 'sentence-pick';  sentence: SentenceItem; direction: 'en-to-ko' | 'ko-to-en' }
type FillBlankQ    = { type: 'fill-blank';     sentence: SentenceItem; blankIndex: number; direction: 'ko' | 'en' }
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
  return shuffle(words).slice(0, count).map((item, idx) => ({
    type: 'word-choice',
    item,
    choices: buildChoices(item, words, 4) as WordItem[],
    direction: dir(idx),
  }))
}

function buildSentencePickQs(pool: SentenceItem[], count: number): SentencePickQ[] {
  return pool.slice(0, count).map((sentence, idx) => ({
    type: 'sentence-pick',
    sentence,
    direction: dir(idx),
  }))
}

function buildFillBlankQs(pool: SentenceItem[], count: number, direction: 'ko' | 'en' = 'en'): FillBlankQ[] {
  return pool.slice(0, count).map(sentence => {
    const parts = direction === 'en' ? sentence.englishParts : sentence.parts
    // distractors는 마지막 파트(동사/형용사) 기준으로 설계됨 → 항상 index 1(또는 마지막)을 blank로
    return {
      type: 'fill-blank',
      sentence,
      blankIndex: parts.length > 1 ? 1 : 0,
      direction,
    }
  })
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
  const sentPool = sents.length >= need
    ? sents
    : [...sents, ...sents, ...sents].slice(0, need + 4)

  let offset = 0
  const pickSlice  = sentPool.slice(offset, offset + cfg.pickQ);  offset += cfg.pickQ
  const fillSlice  = sentPool.slice(offset, offset + cfg.fillQ);  offset += cfg.fillQ
  const buildSlice = sentPool.slice(offset, offset + cfg.buildQ)

  const wordQs  = buildWordChoiceQs(words, cfg.wordQ)
  const pickQs  = buildSentencePickQs(pickSlice, cfg.pickQ)
  const fillQs  = buildFillBlankQs(fillSlice, cfg.fillQ, cfg.fillDir)
  const buildQs = buildSentenceBuildQs(buildSlice, cfg.buildQ)
  return shuffle([...wordQs, ...pickQs, ...fillQs, ...buildQs])
}

// ── 인트로 화면 ────────────────────────────────────────────
function IntroScreen({ sectionNum, onStart, onLater }: {
  sectionNum: number
  onStart: () => void
  onLater: () => void
}) {
  const particle = sectionNum === 3 ? '으로' : '로'
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[96px] leading-none select-none animate-bounce">🦉</span>
          <div className="w-16 h-2.5 bg-gray-200 rounded-full blur-[2px] opacity-70" />
        </div>
        <p className="text-xl font-bold text-gray-800 text-center leading-snug">
          이 테스트를 통과하면<br />섹션 {sectionNum} ({particle}) 건너뜁니다!
        </p>
      </div>

      <div className="border-t border-gray-100 px-6 py-5 flex items-center justify-between w-full">
        <button onClick={onLater} className="text-[#1CB0F6] font-bold text-sm">
          나중에 하기
        </button>
        <button
          onClick={onStart}
          className="bg-[#1CB0F6] text-white font-bold px-8 py-3 rounded-2xl text-sm shadow-sm"
        >
          계속하기
        </button>
      </div>
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
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'pass' | 'fail'>('intro')

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

  if (phase === 'intro') {
    return (
      <IntroScreen
        sectionNum={targetIdx + 1}
        onStart={() => setPhase('quiz')}
        onLater={() => navigate('/')}
      />
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
            sentence={q.sentence}
            allSentences={SENTENCES}
            direction={q.direction}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
          />
        )}
        {q.type === 'fill-blank' && (
          <FillBlankQuiz
            key={`fb-${current}`}
            sentence={q.sentence}
            blankIndex={q.blankIndex}
            direction={q.direction}
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
