import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getSectionsForDifficulty } from '../data/sections'
import { UNITS_MAP } from '../data/units'
import { LESSONS_MAP } from '../data/lessons'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { useSpeech } from '../hooks/useSpeech'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { FillBlankQuiz } from '../components/quiz/FillBlankQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { buildChoices } from '../utils/quizHelpers'
import { SentencePickQuiz } from '../components/quiz/SentencePickQuiz'
import { DialogueChoiceQuiz } from '../components/quiz/DialogueChoiceQuiz'
import { cn } from '../utils/cn'
import type { WordItem, SentenceItem } from '../types'

// timeLimit: 문제당 제한 시간(초). 0 = 타이머 없음.
// 1하트: 1개 오답 or 시간 초과 즉시 실패 → 해당 섹션 학습으로 복귀
type DiffCfg = {
  hearts: number
  wordQ: number
  pickQ: number
  fillQ: number
  buildQ: number
  listenBuildQ?: number  // 오디오 듣고 영어 타일 배열
  dialogueQ?: number
  fillDir: 'ko' | 'en'
  distractorCount?: number
  timeLimit: number
}

// ── 초급 트랙 (단어 기반) ─────────────────────────────────────
// 타이머 30→25→20→15s: 초급은 시간 여유 充분, 고급으로 갈수록 압박
const DIFFICULTY_BY_IDX: Record<number, DiffCfg> = {
  1: { hearts: 3, wordQ: 2, pickQ: 1, fillQ: 1, buildQ: 1, fillDir: 'ko', distractorCount: 2, timeLimit: 30 },  // 탐험가 5문제
  2: { hearts: 3, wordQ: 1, pickQ: 1, fillQ: 1, buildQ: 2, fillDir: 'ko', distractorCount: 3, timeLimit: 25 },  // 여행자 5문제
  3: { hearts: 3, wordQ: 0, pickQ: 1, fillQ: 1, buildQ: 2, fillDir: 'en', distractorCount: 4, timeLimit: 20 },  // 도전자 4문제
  4: { hearts: 3, wordQ: 0, pickQ: 0, fillQ: 1, buildQ: 3, fillDir: 'en', timeLimit: 15 },                      // 마스터 4문제
}
const DEFAULT_DIFFICULTY = DIFFICULTY_BY_IDX[1]

// ── 중급 트랙 (dialogue + pick/fill/build, 4문제) ─────────────
// Lv1: dialogue×1 + pick×2 + fill-ko×1 | 20s, distractor:2
// Lv2: dialogue×1 + fill-en×1 + build×2 | 15s, distractor:3
const INTERMEDIATE_DIFFICULTY: Record<number, DiffCfg> = {
  1: { hearts: 3, wordQ: 0, pickQ: 2, fillQ: 1, buildQ: 0, dialogueQ: 1, fillDir: 'ko', distractorCount: 2, timeLimit: 20 },
  2: { hearts: 3, wordQ: 0, pickQ: 0, fillQ: 1, buildQ: 2, dialogueQ: 1, fillDir: 'en', distractorCount: 3, timeLimit: 15 },
}

// ── 고급 트랙 (더 높은 난이도, 4문제) ─────────────────────────
// Lv1: dialogue×1 + fill-en×1 + build×2  | 12s, distractor:3
// Lv2: dialogue×1 + fill-en×1 + listenBuild×2 | 12s, distractor:4
const ADVANCED_DIFFICULTY: Record<number, DiffCfg> = {
  1: { hearts: 3, wordQ: 0, pickQ: 0, fillQ: 1, buildQ: 2, dialogueQ: 1, fillDir: 'en', distractorCount: 3, timeLimit: 12 },
  2: { hearts: 3, wordQ: 0, pickQ: 0, fillQ: 1, buildQ: 0, listenBuildQ: 2, dialogueQ: 1, fillDir: 'en', distractorCount: 4, timeLimit: 12 },
}

// ── 문제 타입 ──────────────────────────────────────────────────
type WordChoiceQ    = { type: 'word-choice';    item: WordItem; choices: WordItem[]; direction: 'en-to-ko' | 'ko-to-en' }
type SentencePickQ  = { type: 'sentence-pick';  sentence: SentenceItem; direction: 'en-to-ko' | 'ko-to-en' }
type FillBlankQ     = { type: 'fill-blank';     sentence: SentenceItem; blankIndex: number; direction: 'ko' | 'en' }
type SentenceBuildQ = { type: 'sentence-build'; sentence: SentenceItem; direction: 'en-to-ko' | 'ko-to-en' }
type DialogueQ      = { type: 'dialogue-choice'; sentence: SentenceItem }
type ListenBuildQ   = { type: 'listen-build';   sentence: SentenceItem }
type QuestionDef    = WordChoiceQ | SentencePickQ | FillBlankQ | SentenceBuildQ | DialogueQ | ListenBuildQ

// ── 유틸 ──────────────────────────────────────────────────────
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

// ── 문제 생성 ──────────────────────────────────────────────────
function buildWordChoiceQs(words: WordItem[], count: number): WordChoiceQ[] {
  return shuffle(words).slice(0, count).map((item, idx) => ({
    type: 'word-choice',
    item,
    choices: buildChoices(item, words, 4) as WordItem[],
    direction: dir(idx),
  }))
}

function buildSentencePickQs(pool: SentenceItem[], count: number): SentencePickQ[] {
  return pool.slice(0, count).map(sentence => ({
    type: 'sentence-pick',
    sentence,
    // 방향 랜덤화 — 기계적 ABAB 패턴 방지
    direction: Math.random() < 0.5 ? 'en-to-ko' : 'ko-to-en',
  }))
}

function buildFillBlankQs(pool: SentenceItem[], count: number, direction: 'ko' | 'en' = 'en'): FillBlankQ[] {
  return pool.slice(0, count).map(sentence => {
    const parts = direction === 'en' ? sentence.englishParts : sentence.parts
    return {
      type: 'fill-blank',
      sentence,
      blankIndex: parts.length > 1 ? 1 : 0,
      direction,
    }
  })
}

function buildSentenceBuildQs(pool: SentenceItem[], count: number, direction: 'en-to-ko' | 'ko-to-en'): SentenceBuildQ[] {
  return pool.slice(0, count).map(sentence => ({ type: 'sentence-build', sentence, direction }))
}

function buildDialogueQs(pool: SentenceItem[], count: number): DialogueQ[] {
  return pool
    .filter(s => !!s.dialoguePrompt)
    .slice(0, count)
    .map(sentence => ({ type: 'dialogue-choice', sentence }))
}

function buildListenBuildQs(pool: SentenceItem[], count: number): ListenBuildQ[] {
  return pool.slice(0, count).map(sentence => ({ type: 'listen-build', sentence }))
}

function buildAllQuestions(
  words: WordItem[],
  sentences: SentenceItem[],
  cfg: DiffCfg,
  buildDirection: 'en-to-ko' | 'ko-to-en' = 'ko-to-en',
): QuestionDef[] {
  const isSentenceTrack = buildDirection === 'en-to-ko'
  const fillKoQ      = isSentenceTrack ? Math.floor(cfg.fillQ / 2) : 0
  const fillEnQ      = cfg.fillQ - fillKoQ
  const dialogueQ    = cfg.dialogueQ ?? 0
  const listenBuildQ = cfg.listenBuildQ ?? 0

  const sents = shuffle(sentences)
  const need  = cfg.pickQ + cfg.fillQ + cfg.buildQ + listenBuildQ + dialogueQ

  // pool이 부족하면 반복 채우기
  const sentPool = (() => {
    if (sents.length >= need) return sents
    let repeated = [...sents]
    while (repeated.length < need + 4) repeated = [...repeated, ...shuffle(sents)]
    return repeated.slice(0, need + 4)
  })()

  let offset = 0
  const pickSlice        = sentPool.slice(offset, offset + cfg.pickQ);      offset += cfg.pickQ
  const fillEnSlice      = sentPool.slice(offset, offset + fillEnQ);        offset += fillEnQ
  const fillKoSlice      = sentPool.slice(offset, offset + fillKoQ);        offset += fillKoQ
  const buildSlice       = sentPool.slice(offset, offset + cfg.buildQ);     offset += cfg.buildQ
  const listenBuildSlice = sentPool.slice(offset, offset + listenBuildQ);   offset += listenBuildQ
  const dialogueSlice    = sentPool.slice(offset, offset + dialogueQ)

  const wordQs        = buildWordChoiceQs(words, cfg.wordQ)
  const pickQs        = buildSentencePickQs(pickSlice, cfg.pickQ)
  const fillEnQs      = buildFillBlankQs(fillEnSlice, fillEnQ, cfg.fillDir)
  const fillKoQs      = fillKoQ > 0 ? buildFillBlankQs(fillKoSlice, fillKoQ, 'ko') : []
  const buildQs       = buildSentenceBuildQs(buildSlice, cfg.buildQ, buildDirection)
  const listenBuildQs = buildListenBuildQs(listenBuildSlice, listenBuildQ)
  const dialogueQs    = buildDialogueQs(dialogueSlice, dialogueQ)

  return shuffle([...wordQs, ...pickQs, ...fillEnQs, ...fillKoQs, ...buildQs, ...listenBuildQs, ...dialogueQs])
}

// ── 화면 컴포넌트 ──────────────────────────────────────────────
function IntroScreen({ sectionNum, timeLimit, onStart, onLater }: {
  sectionNum: number
  timeLimit: number
  onStart: () => void
  onLater: () => void
}) {
  const particle = sectionNum === 3 ? '으로' : '로'
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[96px] leading-none select-none animate-bounce">🦉</span>
          <div className="w-16 h-2.5 bg-gray-200 rounded-full blur-[2px] opacity-70" />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xl font-bold text-gray-800 leading-snug">
            이 테스트를 통과하면<br />섹션 {sectionNum} ({particle}) 건너뜁니다!
          </p>
          <div className="flex flex-col gap-1 text-sm text-gray-500 bg-gray-50 rounded-2xl px-5 py-3 w-full">
            <span>⚡ 단 4~5문제</span>
            <span>⏱ 문제당 {timeLimit}초 타임어택</span>
            <span>💔 오답 3번이면 즉시 실패</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 px-6 py-5 flex items-center justify-between w-full">
        <button onClick={onLater} className="text-[#1CB0F6] font-bold text-sm">
          나중에 하기
        </button>
        <button
          onClick={onStart}
          className="bg-[#1CB0F6] text-white font-bold px-8 py-3 rounded-2xl text-sm shadow-sm"
        >
          도전하기!
        </button>
      </div>
    </div>
  )
}

function PassScreen({ sectionTitle, onContinue }: { sectionTitle: string; onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-9xl animate-bounce">🏆</div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-3xl font-black text-yellow-500">완벽해요!</p>
        <p className="text-lg font-bold text-ink text-center">"{sectionTitle}" 건너뛰기 성공!</p>
        <p className="text-steel text-center text-sm leading-relaxed">
          이전 섹션이 모두 완료 처리됩니다.
        </p>
      </div>
      <button
        onClick={onContinue}
        className="w-full max-w-sm py-4 bg-yellow-400 text-white font-black rounded-2xl text-lg shadow-md"
      >
        {sectionTitle} 시작하기 🚀
      </button>
    </div>
  )
}

function FailScreen({ onBack, reason }: { onBack: () => void; reason: 'wrong' | 'timeout' }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
      <div className="text-8xl">{reason === 'timeout' ? '⏰' : '💔'}</div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl font-black text-ink text-center">
          {reason === 'timeout' ? '시간 초과!' : '테스트 실패'}
        </p>
        <p className="text-steel text-center leading-relaxed text-sm">
          {reason === 'timeout'
            ? '빠르게 반응할 수 있을 때까지\n해당 섹션을 더 연습해보세요!'
            : '아직 완벽하지 않아요.\n해당 섹션을 차근차근 공부한 뒤 다시 도전해보세요!'}
        </p>
      </div>
      <button
        onClick={onBack}
        className="w-full max-w-sm py-4 bg-primary text-white font-bold rounded-2xl text-base"
      >
        학습 화면으로 돌아가기
      </button>
    </div>
  )
}

// ── 메인 ──────────────────────────────────────────────────────
export function JumpTest() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()
  const { progress, skipToSection } = useApp()
  const { speak, isSpeaking } = useSpeech()
  const completedSet = new Set(progress.lessonProgress)

  const allSections = getSectionsForDifficulty(progress.difficultyLevel)
  const targetSection = allSections.find(s => s.id === sectionId)
  const targetIdx     = allSections.findIndex(s => s.id === sectionId)

  const skipWords = useMemo<WordItem[]>(() => {
    if (targetIdx <= 0) return []
    const wordUnitIds = new Set(
      allSections.slice(0, targetIdx).flatMap(s => s.unitIds).filter(uid => UNITS_MAP[uid]?.type === 'words')
    )
    return WORDS.filter(w => wordUnitIds.has(w.category))
  }, [targetIdx, allSections])

  const lessonIdsToSkip = useMemo<string[]>(() => {
    if (targetIdx <= 0) return []
    return allSections.slice(0, targetIdx)
      .flatMap(s => s.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? []))
      .filter(id => !completedSet.has(id))
  }, [targetIdx, allSections, completedSet])

  const isSentenceTrack = skipWords.length === 0 && targetIdx > 0

  const cfg = useMemo<DiffCfg>(() => {
    if (isSentenceTrack) {
      if (progress.difficultyLevel === 'advanced') {
        return ADVANCED_DIFFICULTY[targetIdx] ?? ADVANCED_DIFFICULTY[1]
      }
      return INTERMEDIATE_DIFFICULTY[targetIdx] ?? INTERMEDIATE_DIFFICULTY[1]
    }
    return DIFFICULTY_BY_IDX[targetIdx] ?? DEFAULT_DIFFICULTY
  }, [targetIdx, isSentenceTrack, progress.difficultyLevel])

  const skipSentences = useMemo<SentenceItem[]>(() => {
    if (targetIdx <= 0) return SENTENCES
    if (isSentenceTrack) {
      const lessonIds = allSections
        .slice(0, targetIdx)
        .flatMap(s => s.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? []))
      const sentenceIds = new Set(lessonIds.flatMap(lid => LESSONS_MAP[lid]?.sentenceIds ?? []))
      const pool = SENTENCES.filter(s => sentenceIds.has(s.id))
      return pool.length >= 3 ? pool : SENTENCES.filter(s => s.difficulty === 'advanced')
    }
    const prevUnitIds = new Set(allSections.slice(0, targetIdx).flatMap(s => s.unitIds))
    // 단어 트랙: 'basic' 난이도 문장만 허용 — category:'daily' 고급 문장 유입 방지
    return SENTENCES.filter(s => (!s.category || prevUnitIds.has(s.category)) && s.difficulty === 'basic')
  }, [targetIdx, allSections, isSentenceTrack])

  const questions = useMemo<QuestionDef[]>(() => {
    if (isSentenceTrack) {
      return skipSentences.length >= 3 ? buildAllQuestions([], skipSentences, cfg, 'en-to-ko') : []
    }
    return skipWords.length >= 4 ? buildAllQuestions(skipWords, skipSentences, cfg) : []
  }, [skipWords, skipSentences, cfg, isSentenceTrack])

  // ── 상태 ──────────────────────────────────────────────────
  const heartsRef = useRef(cfg.hearts)
  const [heartsDisplay, setHeartsDisplay] = useState(cfg.hearts)
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'pass' | 'fail'>('intro')
  const [failReason, setFailReason] = useState<'wrong' | 'timeout'>('wrong')
  const [timeLeft, setTimeLeft] = useState(cfg.timeLimit)

  // ── 타이머 ────────────────────────────────────────────────
  // 문제 변경 시 타이머 리셋
  useEffect(() => {
    if (phase !== 'quiz' || !cfg.timeLimit) return
    setTimeLeft(cfg.timeLimit)
  }, [current, phase, cfg.timeLimit])

  // 1초씩 카운트다운
  useEffect(() => {
    if (phase !== 'quiz' || !cfg.timeLimit || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, phase, cfg.timeLimit])

  // 시간 초과 → 즉시 실패
  useEffect(() => {
    if (phase !== 'quiz' || !cfg.timeLimit || timeLeft > 0) return
    setFailReason('timeout')
    setPhase('fail')
  }, [timeLeft, phase, cfg.timeLimit])

  // ── 가드 ──────────────────────────────────────────────────
  if (!targetSection || targetIdx <= 0) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-steel">잘못된 접근입니다.</p></div>
  }
  const hasEnoughContent = isSentenceTrack ? skipSentences.length >= 3 : skipWords.length >= 4
  if (!hasEnoughContent) {
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
        timeLimit={cfg.timeLimit}
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
  if (phase === 'fail') return <FailScreen onBack={() => navigate('/')} reason={failReason} />

  const q = questions[current]
  const progressPct = Math.round((current / questions.length) * 100)
  const timerPct = cfg.timeLimit > 0 ? (timeLeft / cfg.timeLimit) * 100 : 100

  const TYPE_LABEL: Record<QuestionDef['type'], string> = {
    'word-choice':     '🔤 의미 고르기',
    'sentence-pick':   '📖 문장 번역',
    'fill-blank':      '✏️ 빈칸채우기',
    'sentence-build':  '🧩 문장 만들기',
    'dialogue-choice': '💬 상황 대화',
    'listen-build':    '🎧 듣고 만들기',
  }

  function handleWrong() {
    heartsRef.current = Math.max(0, heartsRef.current - 1)
    setHeartsDisplay(heartsRef.current)
  }

  function handleAdvance() {
    if (heartsRef.current <= 0) {
      setFailReason('wrong')
      setPhase('fail')
      return
    }
    const next = current + 1
    if (next >= questions.length) setPhase('pass')
    else setCurrent(next)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 헤더 */}
      <div className={`sticky top-0 z-10 ${targetSection.bg} border-b ${targetSection.border}`}>
        <div className="max-w-md mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate('/')} className="text-white/80 text-xl leading-none">✕</button>
            <div className="text-center">
              <p className="text-xs text-white/70 font-bold uppercase tracking-wide">건너뛰기 테스트</p>
              <p className="text-sm font-black text-white">{targetSection.title} 섹션</p>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: cfg.hearts }).map((_, i) => (
                <span key={i} className={`text-xl ${i < heartsDisplay ? '' : 'grayscale opacity-25'}`}>❤️</span>
              ))}
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="h-2 bg-white/25 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>

          {/* 타이머 바 */}
          {cfg.timeLimit > 0 && (
            <div className="h-1 bg-white/20 rounded-full overflow-hidden mt-1">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  timerPct > 50 ? 'bg-green-300' : timerPct > 25 ? 'bg-yellow-300' : 'bg-red-400'
                )}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          )}

          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span className="font-semibold">{TYPE_LABEL[q.type]}</span>
            <span className="flex items-center gap-2">
              {cfg.timeLimit > 0 && (
                <span className={cn('font-bold', timeLeft <= 5 && 'text-yellow-200 animate-pulse')}>
                  ⏱ {timeLeft}s
                </span>
              )}
              <span>{current + 1}/{questions.length}</span>
            </span>
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
            speak={speak}
            isSpeaking={isSpeaking}
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
            distractorCount={cfg.distractorCount}
            autoAdvance={false}
          />
        )}
        {q.type === 'dialogue-choice' && (
          <DialogueChoiceQuiz
            key={`dc-${current}`}
            sentence={q.sentence}
            allSentences={SENTENCES}
            onCorrect={handleAdvance}
            onWrong={handleWrong}
            speak={speak}
            isSpeaking={isSpeaking}
          />
        )}
        {q.type === 'listen-build' && (
          <SentenceBuilderQuiz
            key={`lb-${current}`}
            sentence={q.sentence}
            direction="ko-to-en"
            onCorrect={handleAdvance}
            onWrong={handleWrong}
            speak={speak}
            isSpeaking={isSpeaking}
            distractorCount={cfg.distractorCount}
            listenBuild={true}
            autoAdvance={false}
          />
        )}
      </div>
    </div>
  )
}
