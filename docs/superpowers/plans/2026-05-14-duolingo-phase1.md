# Duolingo Phase 1: Unit → Lesson 구조 도입 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 "항목 하나씩" 학습 구조를 "레슨 묶음 단위" 구조로 전환하여 같은 단어를 한 레슨 안에서 Flash → Matching → ImageChoice → ListenChoice → SentenceBuilder 순으로 반복 노출

**Architecture:** 새 타입 `Unit / Lesson / LessonChallenge`를 도입하고, 단일 항목 기반 `StudySession` 대신 레슨 단위 `LessonSession` 페이지를 신설한다. 챌린지 시퀀스는 `buildChallengeSequence()` 유틸로 생성하며, 진행 상태는 `lessonProgress: string[]`로 localStorage에 저장한다. 기존 routes는 그대로 유지하고 `/lesson/:lessonId` 경로를 추가한다.

**Tech Stack:** React 18, TypeScript strict, React Router v6, Vitest, Tailwind CSS + clsx (cn utility)

---

## 파일 변경 맵

| 액션 | 파일 | 역할 |
|------|------|------|
| 신규 | `src/types/lesson.ts` | Unit, Lesson, LessonChallenge 타입 |
| 신규 | `src/data/units.ts` | Unit 정의 (id, title, emoji, lessonIds) |
| 신규 | `src/data/lessons.ts` | Lesson 정의 (id, unitId, title, itemIds) |
| 신규 | `src/utils/lessonSequence.ts` | 챌린지 시퀀스 생성기 |
| 신규 | `src/test/utils/lessonSequence.test.ts` | 시퀀스 생성기 테스트 |
| 신규 | `src/pages/LessonSession.tsx` | 레슨 세션 (Flash→Match→Choice→Listen→Sentence) |
| 신규 | `src/pages/UnitMap.tsx` | 유닛/레슨 진행 현황 맵 |
| 수정 | `src/types/index.ts` | AppStorage에 lessonProgress 추가, AppContextValue 확장 |
| 수정 | `src/context/AppContext.tsx` | markLessonDone, lessonProgress 추가 |
| 수정 | `src/App.tsx` | /lesson/:lessonId, /units 라우트 추가 |
| 수정 | `src/pages/Home.tsx` | 학습 시작 버튼 → 다음 미완 레슨으로 연결 |

---

## Task 1: 타입 정의 — Unit, Lesson, LessonChallenge

**Files:**
- Create: `src/types/lesson.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: lesson.ts 작성**

```ts
// src/types/lesson.ts
import type { QuizDirection } from './index'

export type ChallengeKind =
  | 'flash'
  | 'matching'
  | 'image-choice'
  | 'listen-choice'
  | 'sentence-builder'

export interface LessonChallenge {
  kind: ChallengeKind
  itemId?: string        // flash, image-choice, listen-choice
  direction?: QuizDirection  // image-choice, listen-choice
  sentenceId?: string    // sentence-builder
}

export interface Lesson {
  id: string
  unitId: string
  title: string
  itemIds: string[]
}

export interface Unit {
  id: string
  title: string
  emoji: string
  type: 'alphabet' | 'words'
  lessonIds: string[]
}
```

- [ ] **Step 2: index.ts에 lessonProgress 추가**

`src/types/index.ts`의 `AppStorage`와 `AppContextValue`를 다음으로 교체:

```ts
export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
  lessonProgress: string[]
}

export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  markLessonDone: (id: string) => void
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```
Expected: `✓ built` (타입 에러 0개)

- [ ] **Step 4: 커밋**

```bash
git add src/types/lesson.ts src/types/index.ts
git commit -m "feat: add Unit, Lesson, LessonChallenge types"
```

---

## Task 2: 레슨 데이터 작성

**Files:**
- Create: `src/data/units.ts`
- Create: `src/data/lessons.ts`

- [ ] **Step 1: lessons.ts 작성**

알파벳 5레슨 + 단어 8개 카테고리를 5~6개씩 묶은 17레슨, 총 22레슨:

```ts
// src/data/lessons.ts
import type { Lesson } from '../types/lesson'

export const LESSONS_MAP: Record<string, Lesson> = {
  // ── 알파벳 ──
  'alphabet-1': { id: 'alphabet-1', unitId: 'alphabet', title: 'A ~ E', itemIds: ['A','B','C','D','E'] },
  'alphabet-2': { id: 'alphabet-2', unitId: 'alphabet', title: 'F ~ J', itemIds: ['F','G','H','I','J'] },
  'alphabet-3': { id: 'alphabet-3', unitId: 'alphabet', title: 'K ~ O', itemIds: ['K','L','M','N','O'] },
  'alphabet-4': { id: 'alphabet-4', unitId: 'alphabet', title: 'P ~ T', itemIds: ['P','Q','R','S','T'] },
  'alphabet-5': { id: 'alphabet-5', unitId: 'alphabet', title: 'U ~ Z', itemIds: ['U','V','W','X','Y','Z'] },
  // ── 과일 ──
  'fruit-1': { id: 'fruit-1', unitId: 'fruit', title: '과일 1', itemIds: ['apple','banana','grape','orange','strawberry'] },
  'fruit-2': { id: 'fruit-2', unitId: 'fruit', title: '과일 2', itemIds: ['watermelon','lemon','peach','mango','cherry'] },
  // ── 동물 ──
  'animal-1': { id: 'animal-1', unitId: 'animal', title: '동물 1', itemIds: ['cat','dog','bird','fish','rabbit'] },
  'animal-2': { id: 'animal-2', unitId: 'animal', title: '동물 2', itemIds: ['bear','elephant','lion','tiger','pig'] },
  'animal-3': { id: 'animal-3', unitId: 'animal', title: '동물 3', itemIds: ['monkey','horse','cow','sheep','duck'] },
  // ── 색깔 ──
  'color-1': { id: 'color-1', unitId: 'color', title: '색깔 1', itemIds: ['red','blue','green','yellow','white'] },
  'color-2': { id: 'color-2', unitId: 'color', title: '색깔 2', itemIds: ['black','pink','purple','brown','gray'] },
  // ── 신체 ──
  'body-1': { id: 'body-1', unitId: 'body', title: '신체 1', itemIds: ['eye','ear','nose','mouth','hand','foot'] },
  'body-2': { id: 'body-2', unitId: 'body', title: '신체 2', itemIds: ['head','hair','arm','leg','finger','toe'] },
  // ── 음식 ──
  'food-1': { id: 'food-1', unitId: 'food', title: '음식 1', itemIds: ['milk','egg','rice','bread','cake','juice'] },
  'food-2': { id: 'food-2', unitId: 'food', title: '음식 2', itemIds: ['water','soup','pizza','cookie','cheese','carrot'] },
  // ── 숫자 ──
  'number-1': { id: 'number-1', unitId: 'number', title: '숫자 1', itemIds: ['one','two','three','four','five'] },
  'number-2': { id: 'number-2', unitId: 'number', title: '숫자 2', itemIds: ['six','seven','eight','nine','ten'] },
  // ── 일상 표현 ──
  'daily-1': { id: 'daily-1', unitId: 'daily', title: '일상 표현 1', itemIds: ['hello','bye','yes','no','good'] },
  'daily-2': { id: 'daily-2', unitId: 'daily', title: '일상 표현 2', itemIds: ['bad','big','small','hot','cold'] },
  'daily-3': { id: 'daily-3', unitId: 'daily', title: '일상 표현 3', itemIds: ['happy','sad','thank-you','sorry','please'] },
  // ── 장소 ──
  'place-1': { id: 'place-1', unitId: 'place', title: '장소', itemIds: ['home','school','park','shop','hospital','library'] },
}
```

- [ ] **Step 2: units.ts 작성**

```ts
// src/data/units.ts
import type { Unit } from '../types/lesson'

export const UNITS_MAP: Record<string, Unit> = {
  alphabet: {
    id: 'alphabet', title: '알파벳', emoji: '🔤', type: 'alphabet',
    lessonIds: ['alphabet-1','alphabet-2','alphabet-3','alphabet-4','alphabet-5'],
  },
  fruit: {
    id: 'fruit', title: '과일', emoji: '🍎', type: 'words',
    lessonIds: ['fruit-1','fruit-2'],
  },
  animal: {
    id: 'animal', title: '동물', emoji: '🐱', type: 'words',
    lessonIds: ['animal-1','animal-2','animal-3'],
  },
  color: {
    id: 'color', title: '색깔', emoji: '🌈', type: 'words',
    lessonIds: ['color-1','color-2'],
  },
  body: {
    id: 'body', title: '신체', emoji: '🦶', type: 'words',
    lessonIds: ['body-1','body-2'],
  },
  food: {
    id: 'food', title: '음식', emoji: '🍚', type: 'words',
    lessonIds: ['food-1','food-2'],
  },
  number: {
    id: 'number', title: '숫자', emoji: '🔢', type: 'words',
    lessonIds: ['number-1','number-2'],
  },
  daily: {
    id: 'daily', title: '일상 표현', emoji: '👋', type: 'words',
    lessonIds: ['daily-1','daily-2','daily-3'],
  },
  place: {
    id: 'place', title: '장소', emoji: '🏠', type: 'words',
    lessonIds: ['place-1'],
  },
}

export const UNIT_ORDER = [
  'alphabet','fruit','animal','color','body','food','number','daily','place',
]
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```
Expected: `✓ built`

- [ ] **Step 4: 커밋**

```bash
git add src/data/lessons.ts src/data/units.ts
git commit -m "feat: add lesson and unit data (22 lessons, 9 units)"
```

---

## Task 3: 챌린지 시퀀스 생성기

**Files:**
- Create: `src/utils/lessonSequence.ts`
- Create: `src/test/utils/lessonSequence.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
// src/test/utils/lessonSequence.test.ts
import { describe, it, expect } from 'vitest'
import { buildChallengeSequence } from '../../utils/lessonSequence'
import { LESSONS_MAP } from '../../data/lessons'
import { SENTENCES } from '../../data/sentences'

const lesson = LESSONS_MAP['fruit-1']  // 5 items

describe('buildChallengeSequence', () => {
  it('flash challenges equal item count', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const flashes = seq.filter(c => c.kind === 'flash')
    expect(flashes).toHaveLength(5)
    expect(flashes.map(c => c.itemId)).toEqual(lesson.itemIds)
  })

  it('has exactly one matching challenge', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
  })

  it('image-choice count equals item count', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'image-choice')).toHaveLength(5)
  })

  it('image-choice alternates direction', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const choices = seq.filter(c => c.kind === 'image-choice')
    expect(choices[0].direction).toBe('en-to-ko')
    expect(choices[1].direction).toBe('ko-to-en')
    expect(choices[2].direction).toBe('en-to-ko')
  })

  it('listen-choice count is ceil(N/2)', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'listen-choice')).toHaveLength(3)
  })

  it('has exactly 2 sentence-builder challenges', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'sentence-builder')).toHaveLength(2)
  })

  it('sentence IDs differ between lessons', () => {
    const seq0 = buildChallengeSequence(lesson, 0, SENTENCES)
    const seq1 = buildChallengeSequence(lesson, 1, SENTENCES)
    const ids0 = seq0.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    const ids1 = seq1.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    expect(ids0).not.toEqual(ids1)
  })

  it('total challenge count for 5-item lesson is 16', () => {
    // 5 flash + 1 matching + 5 image-choice + 3 listen-choice + 2 sentence = 16
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq).toHaveLength(16)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run src/test/utils/lessonSequence.test.ts
```
Expected: FAIL — `lessonSequence` module not found

- [ ] **Step 3: lessonSequence.ts 구현**

```ts
// src/utils/lessonSequence.ts
import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const { itemIds } = lesson
  const seq: LessonChallenge[] = []

  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
  }

  seq.push({ kind: 'matching' })

  for (let i = 0; i < itemIds.length; i++) {
    seq.push({
      kind: 'image-choice',
      itemId: itemIds[i],
      direction: i % 2 === 0 ? 'en-to-ko' : 'ko-to-en',
    })
  }

  const listenCount = Math.ceil(itemIds.length / 2)
  for (let i = 0; i < listenCount; i++) {
    seq.push({
      kind: 'listen-choice',
      itemId: itemIds[i],
      direction: 'en-to-ko',
    })
  }

  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id })
  }

  return seq
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/utils/lessonSequence.test.ts
```
Expected: 8 tests passed

- [ ] **Step 5: 커밋**

```bash
git add src/utils/lessonSequence.ts src/test/utils/lessonSequence.test.ts
git commit -m "feat: add buildChallengeSequence utility (TDD)"
```

---

## Task 4: AppContext 확장

**Files:**
- Modify: `src/context/AppContext.tsx`

- [ ] **Step 1: DEFAULT_STORAGE에 lessonProgress 추가**

`src/context/AppContext.tsx`의 `DEFAULT_STORAGE`를 교체:

```ts
const DEFAULT_STORAGE: AppStorage = {
  streak: 0,
  lastStudiedDate: '',
  alphabetProgress: [],
  wordProgress: [],
  lessonProgress: [],
}
```

- [ ] **Step 2: markLessonDone 함수 추가**

`markWordDone` 아래에 추가:

```ts
function markLessonDone(id: string) {
  setProgress(prev => {
    if (prev.lessonProgress.includes(id)) return prev
    return { ...prev, lessonProgress: [...prev.lessonProgress, id] }
  })
}
```

- [ ] **Step 3: isPhraseUnlocked 기준 업데이트**

word 레슨 10개 완료 시 회화 잠금 해제:

```ts
function isPhraseUnlocked() {
  const wordLessonIds = [
    'fruit-1','fruit-2','animal-1','animal-2','animal-3',
    'color-1','color-2','body-1','body-2','food-1',
  ]
  return wordLessonIds.every(id => progress.lessonProgress.includes(id))
}
```

- [ ] **Step 4: Context.Provider에 markLessonDone 추가**

```ts
<AppContext.Provider value={{
  progress,
  markAlphabetDone,
  markWordDone,
  markLessonDone,
  updateStreak,
  isPhraseUnlocked,
}}>
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build
```
Expected: `✓ built`

- [ ] **Step 6: 커밋**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add lessonProgress and markLessonDone to AppContext"
```

---

## Task 5: LessonSession 페이지

**Files:**
- Create: `src/pages/LessonSession.tsx`

- [ ] **Step 1: LessonSession.tsx 작성**

```tsx
// src/pages/LessonSession.tsx
import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import { LESSONS_MAP } from '../data/lessons'
import { UNITS_MAP } from '../data/units'
import { buildChallengeSequence } from '../utils/lessonSequence'
import { buildChoices } from '../utils/quizHelpers'
import { FlashCard } from '../components/FlashCard'
import { MatchingQuiz } from '../components/quiz/MatchingQuiz'
import { ImageChoiceQuiz } from '../components/quiz/ImageChoiceQuiz'
import { ListenChoiceQuiz } from '../components/quiz/ListenChoiceQuiz'
import { SentenceBuilderQuiz } from '../components/quiz/SentenceBuilderQuiz'
import { useSpeech } from '../hooks/useSpeech'
import type { LessonChallenge } from '../types/lesson'
import type { StudyItem } from '../types'

export function LessonSession() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { markLessonDone, updateStreak } = useApp()
  const { speak } = useSpeech()

  const lesson = lessonId ? LESSONS_MAP[lessonId] : null
  const unit = lesson ? UNITS_MAP[lesson.unitId] : null

  const allItems: StudyItem[] = unit?.type === 'alphabet' ? ALPHABET : WORDS
  const lessonItems = useMemo(
    () => lesson?.itemIds.map(id => allItems.find(i => i.id === id)!).filter(Boolean) ?? [],
    [lesson?.id],
  )

  const lessonIndex = useMemo(
    () => unit?.lessonIds.indexOf(lessonId ?? '') ?? 0,
    [unit?.id, lessonId],
  )

  const [challenges] = useState<LessonChallenge[]>(() =>
    lesson ? buildChallengeSequence(lesson, lessonIndex, SENTENCES) : []
  )
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [retryQueue, setRetryQueue] = useState<LessonChallenge[]>([])
  const [phase, setPhase] = useState<'main' | 'retry'>('main')
  const [showExit, setShowExit] = useState(false)

  const currentList = phase === 'main' ? challenges : retryQueue
  const current = currentList[challengeIndex]
  const progressPct = Math.round(((phase === 'main' ? challengeIndex : challenges.length + challengeIndex) / (challenges.length + retryQueue.length)) * 100)

  const handleWrong = useCallback((challenge: LessonChallenge) => {
    setRetryQueue(prev => [...prev, { ...challenge }])
  }, [])

  function advance() {
    if (challengeIndex + 1 < currentList.length) {
      setChallengeIndex(c => c + 1)
    } else if (phase === 'main' && retryQueue.length > 0) {
      setPhase('retry')
      setChallengeIndex(0)
    } else {
      if (lessonId) markLessonDone(lessonId)
      updateStreak()
      navigate('/complete')
    }
  }

  if (!lesson || !unit || !current) {
    return <div className="p-8 text-center text-steel">레슨을 찾을 수 없습니다</div>
  }

  const exitDialog = showExit
    ? createPortal(
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center px-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowExit(false)}
        >
          <div
            className="bg-canvas border border-hairline rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-ink mb-2">학습을 나가시겠어요?</p>
            <p className="text-sm text-steel mb-4">진도는 저장됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExit(false)}
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
        document.body,
      )
    : null

  function renderChallenge() {
    const item = current.itemId
      ? allItems.find(i => i.id === current.itemId)
      : null

    if (current.kind === 'flash' && item) {
      return <FlashCard item={item} onNext={advance} />
    }

    if (current.kind === 'matching') {
      return <MatchingQuiz items={lessonItems} onComplete={advance} />
    }

    if (current.kind === 'image-choice' && item) {
      const choices = buildChoices(item, allItems, 4)
      return (
        <ImageChoiceQuiz
          item={item}
          choices={choices}
          direction={current.direction ?? 'en-to-ko'}
          onCorrect={advance}
          onWrong={() => handleWrong(current)}
        />
      )
    }

    if (current.kind === 'listen-choice' && item) {
      const choices = buildChoices(item, allItems, 4)
      return (
        <ListenChoiceQuiz
          item={item}
          choices={choices}
          direction={current.direction ?? 'en-to-ko'}
          onCorrect={advance}
          speak={speak}
        />
      )
    }

    if (current.kind === 'sentence-builder') {
      const sentence = SENTENCES.find(s => s.id === current.sentenceId) ?? SENTENCES[0]
      return (
        <SentenceBuilderQuiz
          key={`${phase}-${challengeIndex}`}
          sentence={sentence}
          onCorrect={advance}
        />
      )
    }

    return null
  }

  const phaseLabel =
    current.kind === 'flash' ? '단어 보기' :
    current.kind === 'matching' ? '짝 맞추기' :
    current.kind === 'image-choice' ? '뜻 고르기' :
    current.kind === 'listen-choice' ? '듣고 고르기' :
    '문장 연습'

  return (
    <>
      {exitDialog}
      <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <button
            onClick={() => setShowExit(true)}
            aria-label="나가기"
            className="text-muted text-2xl font-bold"
          >
            ✕
          </button>
          <div className="flex-1 h-2 bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-muted w-14 text-right">{phaseLabel}</span>
        </div>

        {phase === 'retry' && (
          <p className="text-center text-sm text-orange-600 py-1 bg-orange-50">
            틀린 문제를 다시 풀어봐요!
          </p>
        )}

        <div className="flex-1">
          {renderChallenge()}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: ImageChoiceQuiz에 onWrong prop 추가**

`src/components/quiz/ImageChoiceQuiz.tsx`의 Props 인터페이스에 `onWrong` 추가:

```ts
interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  allowNextOnWrong?: boolean
  onNext?: () => void
  onWrong?: () => void   // ← 추가
}
```

`handleSelect` 안에 오답 시 호출 추가:

```ts
function handleSelect(id: string) {
  if (answered) return
  setSelected(id)
  setAnswered(true)
  if (id === item.id) {
    setTimeout(onCorrect, 800)
  } else {
    onWrong?.()   // ← 추가
  }
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```
Expected: `✓ built`

- [ ] **Step 4: 커밋**

```bash
git add src/pages/LessonSession.tsx src/components/quiz/ImageChoiceQuiz.tsx
git commit -m "feat: add LessonSession page with multi-challenge flow"
```

---

## Task 6: UnitMap 페이지

**Files:**
- Create: `src/pages/UnitMap.tsx`

- [ ] **Step 1: UnitMap.tsx 작성**

```tsx
// src/pages/UnitMap.tsx
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UNITS_MAP, UNIT_ORDER } from '../data/units'
import { LESSONS_MAP } from '../data/lessons'
import { cn } from '../utils/cn'

export function UnitMap() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto pb-8">
      <div className="bg-ink px-4 pt-10 pb-6 text-center text-white">
        <h1 className="text-2xl font-bold">학습 맵</h1>
        <p className="text-white/60 mt-1 text-sm">배운 레슨을 확인하세요</p>
      </div>

      <div className="px-4 mt-6 flex flex-col gap-6">
        {UNIT_ORDER.map(unitId => {
          const unit = UNITS_MAP[unitId]
          const completedCount = unit.lessonIds.filter(id =>
            progress.lessonProgress.includes(id)
          ).length
          const totalCount = unit.lessonIds.length

          return (
            <div key={unitId}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{unit.emoji}</span>
                <span className="font-bold text-ink text-lg">{unit.title}</span>
                <span className="ml-auto text-xs text-muted">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unit.lessonIds.map((lessonId, idx) => {
                  const lesson = LESSONS_MAP[lessonId]
                  const done = progress.lessonProgress.includes(lessonId)
                  const isNext = !done && unit.lessonIds
                    .slice(0, idx)
                    .every(id => progress.lessonProgress.includes(id))

                  return (
                    <button
                      key={lessonId}
                      onClick={() => navigate(`/lesson/${lessonId}`)}
                      className={cn(
                        'px-4 py-2 rounded-full border-2 text-sm font-semibold transition-colors',
                        done && 'bg-green-50 border-green-400 text-green-700',
                        isNext && 'bg-primary border-primary text-ink',
                        !done && !isNext && 'bg-surface border-hairline text-muted',
                      )}
                    >
                      {done ? '✓ ' : ''}{lesson.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```
Expected: `✓ built`

- [ ] **Step 3: 커밋**

```bash
git add src/pages/UnitMap.tsx
git commit -m "feat: add UnitMap page with lesson progress display"
```

---

## Task 7: 라우터 + Home 업데이트

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: App.tsx에 라우트 추가**

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Home } from './pages/Home'
import { AlphabetList } from './pages/AlphabetList'
import { WordList } from './pages/WordList'
import { StudySession } from './pages/StudySession'
import { LessonSession } from './pages/LessonSession'
import { UnitMap } from './pages/UnitMap'
import { Complete } from './pages/Complete'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/units" element={<UnitMap />} />
          <Route path="/lesson/:lessonId" element={<LessonSession />} />
          {/* 기존 routes 유지 (하위 호환) */}
          <Route path="/alphabet" element={<AlphabetList />} />
          <Route path="/alphabet/:id" element={<StudySession mode="alphabet" />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/:id" element={<StudySession mode="words" />} />
          <Route path="/complete" element={<Complete />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
```

- [ ] **Step 2: Home.tsx 업데이트 — 다음 레슨 연결**

`handleStart` 함수를 레슨 기반으로 교체하고, "학습 맵 보기" 버튼 추가:

```tsx
// src/pages/Home.tsx
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { UNIT_ORDER, UNITS_MAP } from '../data/units'
import { StreakCard } from '../components/StreakCard'
import { ProgressCard } from '../components/ProgressCard'
import { LESSONS_MAP } from '../data/lessons'

export function Home() {
  const navigate = useNavigate()
  const { progress, isPhraseUnlocked } = useApp()

  function getNextLesson(): string | null {
    for (const unitId of UNIT_ORDER) {
      const unit = UNITS_MAP[unitId]
      for (const lessonId of unit.lessonIds) {
        if (!progress.lessonProgress.includes(lessonId)) return lessonId
      }
    }
    return null
  }

  function handleStart() {
    const next = getNextLesson()
    if (next) navigate(`/lesson/${next}`)
  }

  const totalLessons = UNIT_ORDER.reduce(
    (sum, uid) => sum + UNITS_MAP[uid].lessonIds.length, 0
  )
  const doneLessons = progress.lessonProgress.length

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto">
      <div className="bg-ink px-4 pt-10 pb-10 text-center text-white">
        <h1 className="text-3xl font-bold">Easy English</h1>
        <p className="text-white/60 mt-1">오늘도 5분 영어!</p>
      </div>

      <StreakCard streak={progress.streak} />

      <div className="p-4 flex flex-col gap-3 mt-4">
        <ProgressCard
          emoji="📚"
          title="전체 레슨"
          subtitle={`총 ${totalLessons}개 레슨`}
          current={doneLessons}
          total={totalLessons}
          onClick={() => navigate('/units')}
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

      <div className="px-4 mt-2 flex flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full py-5 bg-primary text-ink font-bold text-2xl rounded-full"
        >
          오늘 학습 시작 ▶
        </button>
        <button
          onClick={() => navigate('/units')}
          className="w-full py-3 bg-surface border border-hairline text-ink font-semibold rounded-full"
        >
          학습 맵 보기
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 전체 빌드 + 테스트 확인**

```bash
npm run build && npx vitest run
```
Expected: `✓ built`, all tests pass

- [ ] **Step 4: 최종 커밋**

```bash
git add src/App.tsx src/pages/Home.tsx
git commit -m "feat: wire LessonSession + UnitMap into router and Home"
```

---

## Self-Review

### 스펙 커버리지

| 요구사항 | 태스크 |
|----------|--------|
| Unit → Lesson 계층 타입 | Task 1 |
| 레슨 데이터 (22개 레슨) | Task 2 |
| Flash→Matching→Choice→Listen→Sentence 시퀀스 | Task 3 |
| 오답 재시도 큐 | Task 5 |
| lessonProgress 저장 | Task 4 |
| UnitMap 진행 현황 UI | Task 6 |
| 홈에서 다음 레슨 자동 연결 | Task 7 |
| 기존 routes 하위 호환 유지 | Task 7 |

### 잠재 이슈
- `ImageChoiceQuiz`의 `onWrong` prop은 기존 호출처에 영향 없음 (optional)
- `LessonSession`에서 `lessonId`가 존재하지 않는 경우 guard 처리됨 (line `if (!lesson || !unit || !current)`)
- `isPhraseUnlocked` 기준 변경으로 기존 `wordProgress >= 50` 저장값은 무시됨 — 레슨 기반으로만 판단
