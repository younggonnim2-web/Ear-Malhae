# Star + XP 시스템 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 레슨 완료 시 오답 수 기반으로 1~3성을 부여하고, 누적 XP로 1~5레벨을 산정하여 Complete / UnitMap / Home 화면에 노출한다.

**Architecture:** 순수 함수 유틸(`xp.ts`)이 별→XP 계산과 레벨 계산을 담당한다. AppContext가 `lessonStars`를 localStorage에 저장하고 `totalXp / currentLevel / xpToNextLevel`을 `useMemo`로 파생한다. LessonSession이 오답 수를 추적해 navigate state로 전달하고, Complete / UnitMap / Home이 context와 state를 소비해 UI를 렌더링한다.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Vitest 4, React Testing Library 16, React Router v6

---

## 파일 구조

| 액션 | 파일 | 역할 |
|------|------|------|
| **신규** | `src/utils/xp.ts` | calcXp / calcLevel / calcXpToNext / calcLevelBarPct 순수 함수 |
| **신규** | `src/test/utils/xp.test.ts` | xp 유틸 테스트 (~16개) |
| **신규** | `src/test/pages/Complete.test.tsx` | Complete 페이지 state 유/무 분기 테스트 |
| **수정** | `src/types/index.ts` | AppStorage.lessonStars, AppContextValue computed 필드 |
| **수정** | `src/context/AppContext.tsx` | markLessonDone(id, stars), totalXp/currentLevel/xpToNextLevel |
| **수정** | `src/test/context/AppContext.test.tsx` | markLessonDone 시그니처 반영 + lessonStars 테스트 |
| **수정** | `src/pages/LessonSession.tsx` | wrongCount state, navigate('/complete', { state }) |
| **수정** | `src/pages/Complete.tsx` | 별 카드 + XP 카드 + 레벨 바 |
| **수정** | `src/pages/UnitMap.tsx` | 헤더 레벨/XP 바, 레슨 버튼 별 표시 |
| **수정** | `src/pages/Home.tsx` | 진도 카드 Lv + XP 한 줄 추가 |

---

## Task 1: xp.ts 유틸리티 (TDD)

**Files:**
- Create: `src/test/utils/xp.test.ts`
- Create: `src/utils/xp.ts`

- [ ] **Step 1: 실패 테스트 작성**

`src/test/utils/xp.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { calcXp, calcLevel, calcXpToNext, calcLevelBarPct, STAR_XP } from '../../utils/xp'

describe('STAR_XP 상수', () => {
  it('1성=10, 2성=20, 3성=30', () => {
    expect(STAR_XP[1]).toBe(10)
    expect(STAR_XP[2]).toBe(20)
    expect(STAR_XP[3]).toBe(30)
  })
})

describe('calcXp', () => {
  it('빈 맵 → 0', () => {
    expect(calcXp({})).toBe(0)
  })
  it('단일 레슨 1성 → 10', () => {
    expect(calcXp({ 'lesson-1': 1 })).toBe(10)
  })
  it('단일 레슨 2성 → 20', () => {
    expect(calcXp({ 'lesson-1': 2 })).toBe(20)
  })
  it('단일 레슨 3성 → 30', () => {
    expect(calcXp({ 'lesson-1': 3 })).toBe(30)
  })
  it('복합: 1성+2성+3성 → 60', () => {
    expect(calcXp({ a: 1, b: 2, c: 3 })).toBe(60)
  })
})

describe('calcLevel', () => {
  it('0 XP → Lv1',   () => expect(calcLevel(0)).toBe(1))
  it('99 XP → Lv1',  () => expect(calcLevel(99)).toBe(1))
  it('100 XP → Lv2', () => expect(calcLevel(100)).toBe(2))
  it('249 XP → Lv2', () => expect(calcLevel(249)).toBe(2))
  it('250 XP → Lv3', () => expect(calcLevel(250)).toBe(3))
  it('499 XP → Lv3', () => expect(calcLevel(499)).toBe(3))
  it('500 XP → Lv4', () => expect(calcLevel(500)).toBe(4))
  it('659 XP → Lv4', () => expect(calcLevel(659)).toBe(4))
  it('660 XP → Lv5', () => expect(calcLevel(660)).toBe(5))
  it('700 XP → Lv5', () => expect(calcLevel(700)).toBe(5))
})

describe('calcXpToNext', () => {
  it('Lv1: 50 XP → 50 남음',   () => expect(calcXpToNext(50)).toBe(50))
  it('Lv2: 150 XP → 100 남음', () => expect(calcXpToNext(150)).toBe(100))
  it('Lv3: 300 XP → 200 남음', () => expect(calcXpToNext(300)).toBe(200))
  it('Lv4: 520 XP → 140 남음', () => expect(calcXpToNext(520)).toBe(140))
  it('Lv5: 660 XP → null',     () => expect(calcXpToNext(660)).toBeNull())
  it('Lv5: 700 XP → null',     () => expect(calcXpToNext(700)).toBeNull())
})

describe('calcLevelBarPct', () => {
  it('Lv1 시작(0 XP) → 0%',    () => expect(calcLevelBarPct(0, 1)).toBe(0))
  it('Lv2 중간(175 XP) → 50%', () => expect(calcLevelBarPct(175, 2)).toBe(50))
  it('Lv5 도달(660 XP) → 100%',() => expect(calcLevelBarPct(660, 5)).toBe(100))
})
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run src/test/utils/xp.test.ts
```
Expected: FAIL — `Cannot find module '../../utils/xp'`

- [ ] **Step 3: xp.ts 구현**

`src/utils/xp.ts`:
```typescript
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 660] as const

export const STAR_XP = { 1: 10, 2: 20, 3: 30 } as const

export function calcXp(stars: Record<string, 1 | 2 | 3>): number {
  return Object.values(stars).reduce((sum, s) => sum + STAR_XP[s], 0)
}

export function calcLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

export function calcXpToNext(xp: number): number | null {
  const level = calcLevel(xp)
  if (level >= 5) return null
  return LEVEL_THRESHOLDS[level] - xp
}

export function calcLevelBarPct(xp: number, level: number): number {
  if (level >= 5) return 100
  const start = LEVEL_THRESHOLDS[level - 1]
  const end = LEVEL_THRESHOLDS[level]
  return Math.round(((xp - start) / (end - start)) * 100)
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/utils/xp.test.ts
```
Expected: PASS — 16개 모두 통과

- [ ] **Step 5: 커밋**

```bash
git add src/utils/xp.ts src/test/utils/xp.test.ts
git commit -m "feat: add xp/level calculation utilities with tests"
```

---

## Task 2: 타입 업데이트

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: AppStorage + AppContextValue 수정**

`src/types/index.ts`의 `AppStorage` 인터페이스를 다음으로 교체:
```typescript
export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
  lessonProgress: string[]
  lessonStars: Record<string, 1 | 2 | 3>   // 신규
}
```

`AppContextValue` 인터페이스를 다음으로 교체:
```typescript
export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  markLessonDone: (id: string, stars: 1 | 2 | 3) => void  // stars 파라미터 추가
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
  totalXp: number
  currentLevel: number
  xpToNextLevel: number | null
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```
Expected: 에러 발생 (아직 AppContext와 LessonSession이 새 타입을 구현하지 않아서). 에러 목록 확인 후 다음 Task에서 수정.

---

## Task 3: AppContext 업데이트

**Files:**
- Modify: `src/context/AppContext.tsx`
- Modify: `src/test/context/AppContext.test.tsx`

### 3-A: AppContext 구현

- [ ] **Step 1: DEFAULT_STORAGE에 lessonStars 추가**

`src/context/AppContext.tsx`의 `DEFAULT_STORAGE`를 교체:
```typescript
const DEFAULT_STORAGE: AppStorage = {
  streak: 0,
  lastStudiedDate: '',
  alphabetProgress: [],
  wordProgress: [],
  lessonProgress: [],
  lessonStars: {},
}
```

- [ ] **Step 2: import 추가**

파일 상단 import에 xp 유틸 추가:
```typescript
import { calcXp, calcLevel, calcXpToNext } from '../utils/xp'
```
기존 import 바로 아래에 추가:
```typescript
import { useMemo } from 'react'
```
(기존 `import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'`에 `useMemo` 추가)

- [ ] **Step 3: markLessonDone 시그니처 변경**

기존 `markLessonDone` 함수 전체를 교체:
```typescript
function markLessonDone(id: string, stars: 1 | 2 | 3) {
  setProgress(prev => {
    const prevStars = (prev.lessonStars[id] ?? 0) as 0 | 1 | 2 | 3
    const newStars = Math.max(prevStars, stars) as 1 | 2 | 3
    return {
      ...prev,
      lessonProgress: prev.lessonProgress.includes(id)
        ? prev.lessonProgress
        : [...prev.lessonProgress, id],
      lessonStars: { ...prev.lessonStars, [id]: newStars },
    }
  })
}
```

- [ ] **Step 4: computed values 추가**

`isPhraseUnlocked` 함수 정의 바로 다음에 추가:
```typescript
const totalXp = useMemo(() => calcXp(progress.lessonStars), [progress.lessonStars])
const currentLevel = useMemo(() => calcLevel(totalXp), [totalXp])
const xpToNextLevel = useMemo(() => calcXpToNext(totalXp), [totalXp])
```

- [ ] **Step 5: Provider value 업데이트**

`AppContext.Provider value={...}`를 교체:
```tsx
<AppContext.Provider value={{
  progress,
  markAlphabetDone,
  markWordDone,
  markLessonDone,
  updateStreak,
  isPhraseUnlocked,
  totalXp,
  currentLevel,
  xpToNextLevel,
}}>
```

### 3-B: AppContext 테스트 업데이트

- [ ] **Step 6: TestConsumer에 lessonStars 출력 추가 + 테스트 수정**

`src/test/context/AppContext.test.tsx` 전체를 교체:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { AppProvider, useApp } from '../../context/AppContext'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-13'))
})

function TestConsumer({ action }: { action?: (ctx: ReturnType<typeof useApp>) => void }) {
  const ctx = useApp()
  if (action) action(ctx)
  return (
    <div>
      <span data-testid="streak">{ctx.progress.streak}</span>
      <span data-testid="alphabet">{ctx.progress.alphabetProgress.join(',')}</span>
      <span data-testid="word">{ctx.progress.wordProgress.join(',')}</span>
      <span data-testid="unlocked">{String(ctx.isPhraseUnlocked())}</span>
      <span data-testid="totalXp">{ctx.totalXp}</span>
      <span data-testid="currentLevel">{ctx.currentLevel}</span>
      <span data-testid="xpToNextLevel">{ctx.xpToNextLevel ?? 'null'}</span>
    </div>
  )
}

describe('AppContext', () => {
  it('초기 상태: 스트릭 0, 진도 빈 배열', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('streak').textContent).toBe('0')
    expect(getByTestId('alphabet').textContent).toBe('')
  })

  it('markAlphabetDone: 알파벳 진도 추가', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => ctx.markAlphabetDone('A'))
    expect(getByTestId('alphabet').textContent).toBe('A')
  })

  it('markAlphabetDone: 중복 추가 방지', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => { ctx.markAlphabetDone('A'); ctx.markAlphabetDone('A') })
    expect(getByTestId('alphabet').textContent).toBe('A')
  })

  it('isPhraseUnlocked: 단어 50개 미만이면 false', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('unlocked').textContent).toBe('false')
  })

  it('updateStreak: 첫 학습이면 streak 1', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => ctx.updateStreak())
    expect(getByTestId('streak').textContent).toBe('1')
  })

  it('markLessonDone: lessonProgress에 id 추가, lessonStars 기록', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 3))
    expect(ctx.progress.lessonProgress).toContain('fruit-1')
    expect(ctx.progress.lessonStars['fruit-1']).toBe(3)
  })

  it('markLessonDone: 리플레이 시 더 높은 별점만 반영', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 2))
    act(() => ctx.markLessonDone('fruit-1', 1))  // 낮은 점수로 재시도
    expect(ctx.progress.lessonStars['fruit-1']).toBe(2)  // 기존 2성 유지
  })

  it('markLessonDone: 리플레이 시 더 낮은 별점 무시, 더 높은 별점 반영', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 2))
    act(() => ctx.markLessonDone('fruit-1', 3))  // 높은 점수로 재시도
    expect(ctx.progress.lessonStars['fruit-1']).toBe(3)  // 3성으로 업데이트
  })

  it('totalXp: lessonStars에서 파생', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => { ctx.markLessonDone('fruit-1', 3); ctx.markLessonDone('fruit-2', 2) })
    expect(getByTestId('totalXp').textContent).toBe('50')  // 30+20
  })

  it('currentLevel: XP 0이면 Lv1', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('currentLevel').textContent).toBe('1')
  })

  it('xpToNextLevel: Lv1 초기 상태에서 100', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('xpToNextLevel').textContent).toBe('100')
  })
})
```

- [ ] **Step 7: 테스트 전체 통과 확인**

```bash
npx vitest run src/test/context/AppContext.test.tsx
```
Expected: PASS — 11개 모두 통과

- [ ] **Step 8: 커밋**

```bash
git add src/types/index.ts src/context/AppContext.tsx src/test/context/AppContext.test.tsx
git commit -m "feat: add lessonStars storage and computed XP/level to AppContext"
```

---

## Task 4: LessonSession — wrongCount 추가

**Files:**
- Modify: `src/pages/LessonSession.tsx`
- Create: `src/test/pages/LessonSession.test.tsx`

### 4-A: LessonSession.tsx 수정

- [ ] **Step 1: import 추가**

`src/pages/LessonSession.tsx` 상단 import에 추가:
```typescript
import { STAR_XP } from '../utils/xp'
```

- [ ] **Step 2: wrongCount state 추가**

`const [showExit, setShowExit] = useState(false)` 바로 위에 추가:
```typescript
const [wrongCount, setWrongCount] = useState(0)
```

- [ ] **Step 3: handleWrong에 wrongCount 증가 추가**

기존 `handleWrong`을 교체:
```typescript
const handleWrong = useCallback((challenge: LessonChallenge) => {
  setWrongCount(c => c + 1)
  setRetryQueue(prev => [...prev, { ...challenge }])
}, [])
```

- [ ] **Step 4: advance() 완료 분기 수정**

`advance()` 함수의 마지막 else 분기를 교체:
```typescript
} else {
  const stars: 1 | 2 | 3 = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
  if (lessonId) markLessonDone(lessonId, stars)
  updateStreak()
  navigate('/complete', { state: { stars, xpGained: STAR_XP[stars] } })
}
```

### 4-B: LessonSession 테스트 (최소)

- [ ] **Step 5: 테스트 작성**

`src/test/pages/LessonSession.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'

// 복잡한 quiz 컴포넌트 mock
vi.mock('../../components/FlashCard', () => ({
  FlashCard: ({ onNext }: { onNext: () => void }) => (
    <button onClick={onNext} data-testid="flash-next">다음</button>
  ),
}))
vi.mock('../../components/quiz/MatchingQuiz', () => ({
  MatchingQuiz: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete} data-testid="matching-complete">완료</button>
  ),
}))
vi.mock('../../components/quiz/ImageChoiceQuiz', () => ({
  ImageChoiceQuiz: ({ onCorrect, onWrong }: { onCorrect: () => void; onWrong: () => void }) => (
    <div>
      <button onClick={onCorrect} data-testid="correct">정답</button>
      <button onClick={onWrong} data-testid="wrong">오답</button>
    </div>
  ),
}))
vi.mock('../../components/quiz/ListenChoiceQuiz', () => ({
  ListenChoiceQuiz: ({ onCorrect }: { onCorrect: () => void }) => (
    <button onClick={onCorrect} data-testid="listen-correct">정답</button>
  ),
}))
vi.mock('../../components/quiz/SentenceBuilderQuiz', () => ({
  SentenceBuilderQuiz: ({ onCorrect }: { onCorrect: () => void }) => (
    <button onClick={onCorrect} data-testid="sentence-correct">정답</button>
  ),
}))
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn() }),
}))

beforeEach(() => {
  localStorage.clear()
})

// LessonSession을 동적 import해서 mock 이후에 불러옴
async function renderLesson(lessonId: string) {
  const { LessonSession } = await import('../../pages/LessonSession')
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/lesson/${lessonId}`]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonSession />} />
          <Route path="/complete" element={<div data-testid="complete-page">완료</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('LessonSession', () => {
  it('유효한 lessonId로 렌더링 성공', async () => {
    await renderLesson('fruit-1')
    expect(screen.queryByText('레슨을 찾을 수 없습니다')).not.toBeInTheDocument()
  })

  it('잘못된 lessonId → 에러 메시지', async () => {
    await renderLesson('nonexistent')
    expect(screen.getByText('레슨을 찾을 수 없습니다')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: 테스트 실행**

```bash
npx vitest run src/test/pages/LessonSession.test.tsx
```
Expected: PASS — 2개 통과

- [ ] **Step 7: 전체 테스트 실행 (기존 테스트 회귀 확인)**

```bash
npx vitest run --passWithNoTests
```
Expected: 기존 61개 + 신규 2개 = 63개 이상 통과

- [ ] **Step 8: 커밋**

```bash
git add src/pages/LessonSession.tsx src/test/pages/LessonSession.test.tsx
git commit -m "feat: track wrongCount in LessonSession and pass stars/xpGained to navigate state"
```

---

## Task 5: Complete 페이지 — 별 + XP + 레벨 바

**Files:**
- Create: `src/test/pages/Complete.test.tsx`
- Modify: `src/pages/Complete.tsx`

### 5-A: Complete 테스트 먼저

- [ ] **Step 1: 실패 테스트 작성**

`src/test/pages/Complete.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { Complete } from '../../pages/Complete'

function renderComplete(state?: { stars: 1 | 2 | 3; xpGained: number }) {
  const initialEntries = state
    ? [{ pathname: '/complete', state }]
    : ['/complete']
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/complete" element={<Complete />} />
          <Route path="/" element={<div>홈</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Complete — state 없이 직접 접근', () => {
  it('별 카드가 렌더링되지 않음', () => {
    renderComplete()
    expect(screen.queryByTestId('star-card')).not.toBeInTheDocument()
  })

  it('홈으로 버튼 존재', () => {
    renderComplete()
    expect(screen.getByText('홈으로')).toBeInTheDocument()
  })
})

describe('Complete — 3성 state로 접근', () => {
  it('별 3개 모두 채워진 별(★) 렌더링', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    const starCard = screen.getByTestId('star-card')
    expect(starCard.textContent).toContain('★★★')
  })

  it('+30 XP 텍스트 표시', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    expect(screen.getByText('+30 XP')).toBeInTheDocument()
  })

  it('레벨 바 렌더링', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    expect(screen.getByTestId('level-bar')).toBeInTheDocument()
  })
})

describe('Complete — 1성 state로 접근', () => {
  it('별 1개 채워진 별, 2개 빈 별(☆) 렌더링', () => {
    renderComplete({ stars: 1, xpGained: 10 })
    const starCard = screen.getByTestId('star-card')
    expect(starCard.textContent).toContain('★☆☆')
  })

  it('+10 XP 텍스트 표시', () => {
    renderComplete({ stars: 1, xpGained: 10 })
    expect(screen.getByText('+10 XP')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run src/test/pages/Complete.test.tsx
```
Expected: FAIL — star-card, level-bar data-testid 없음

### 5-B: Complete.tsx 구현

- [ ] **Step 3: Complete.tsx 전체 교체**

`src/pages/Complete.tsx`:
```tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { calcLevelBarPct } from '../utils/xp'

interface CompleteState {
  stars: 1 | 2 | 3
  xpGained: number
}

function StarDisplay({ stars }: { stars: 1 | 2 | 3 }) {
  return (
    <span>
      {([1, 2, 3] as const).map(n => (n <= stars ? '★' : '☆')).join('')}
    </span>
  )
}

export function Complete() {
  const navigate = useNavigate()
  const location = useLocation()
  const { progress, totalXp, currentLevel, xpToNextLevel } = useApp()
  const state = location.state as CompleteState | null

  const barPct = calcLevelBarPct(totalXp, currentLevel)

  return (
    <div className="min-h-screen bg-surface max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-ink mb-2">오늘 학습 완료!</h2>
      <p className="text-steel mb-6">정말 잘했어요 👏</p>

      {state && (
        <div
          data-testid="star-card"
          className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-4"
        >
          <div className="text-4xl text-yellow-400 mb-1">
            <StarDisplay stars={state.stars} />
          </div>
          <div className="text-2xl font-bold text-primary mt-2">+{state.xpGained} XP</div>
        </div>
      )}

      <div
        data-testid="level-bar"
        className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-4"
      >
        <div className="flex justify-between text-sm text-steel mb-2">
          <span className="font-bold text-ink">Lv.{currentLevel}</span>
          <span>
            {xpToNextLevel === null
              ? 'MAX'
              : `총 ${totalXp} XP · 다음 레벨까지 ${xpToNextLevel} XP`}
          </span>
        </div>
        <div className="w-full h-3 bg-hairline rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${barPct}%` }}
          />
        </div>
      </div>

      <div className="bg-canvas border border-hairline rounded-2xl shadow-sm p-6 w-full mb-8">
        <div className="text-5xl font-bold text-orange-500">🔥 {progress.streak}일</div>
        <div className="text-steel mt-1">연속 학습 중</div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full py-5 bg-primary text-ink font-bold text-2xl rounded-full"
      >
        홈으로
      </button>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/test/pages/Complete.test.tsx
```
Expected: PASS — 7개 모두 통과

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Complete.tsx src/test/pages/Complete.test.tsx
git commit -m "feat: Complete page shows star rating, XP gained, and level bar"
```

---

## Task 6: UnitMap — 레벨 헤더 + 레슨 별 표시

**Files:**
- Modify: `src/pages/UnitMap.tsx`

- [ ] **Step 1: import 추가**

`src/pages/UnitMap.tsx` 상단 import에 추가:
```typescript
import { calcLevelBarPct } from '../utils/xp'
```

- [ ] **Step 2: useApp에서 XP/레벨 destructure**

기존:
```typescript
const { progress } = useApp()
```
교체:
```typescript
const { progress, totalXp, currentLevel, xpToNextLevel } = useApp()
const barPct = calcLevelBarPct(totalXp, currentLevel)
```

- [ ] **Step 3: 헤더에 레벨/XP 바 추가**

기존 헤더 div 전체를 교체:
```tsx
<div className="bg-ink px-4 pt-10 pb-6 text-center text-white">
  <h1 className="text-2xl font-bold">학습 맵</h1>
  <p className="text-white/60 mt-1 text-sm">배운 레슨을 확인하세요</p>
  <div className="mt-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="font-bold">Lv.{currentLevel}</span>
      <span className="text-white/60">
        {xpToNextLevel === null ? 'MAX' : `${totalXp} XP · 다음 레벨까지 ${xpToNextLevel} XP`}
      </span>
    </div>
    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-all duration-300"
        style={{ width: `${barPct}%` }}
      />
    </div>
  </div>
</div>
```

- [ ] **Step 4: 레슨 버튼에 별 표시 추가**

기존 레슨 버튼 내용:
```tsx
{done ? '✓ ' : ''}{lesson.title}
```
교체:
```tsx
{done
  ? `${'★'.repeat(progress.lessonStars[lessonId] ?? 1)}${'☆'.repeat(3 - (progress.lessonStars[lessonId] ?? 1))} ${lesson.title}`
  : lesson.title}
```

- [ ] **Step 5: 전체 테스트 실행**

```bash
npx vitest run --passWithNoTests
```
Expected: 기존 테스트 모두 통과 (회귀 없음)

- [ ] **Step 6: 커밋**

```bash
git add src/pages/UnitMap.tsx
git commit -m "feat: UnitMap shows level/XP progress bar in header and stars on lesson buttons"
```

---

## Task 7: Home — 레벨 XP 한 줄 추가

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: useApp에서 XP/레벨 destructure**

기존:
```typescript
const { progress, isPhraseUnlocked } = useApp()
```
교체:
```typescript
const { progress, isPhraseUnlocked, totalXp, currentLevel } = useApp()
```

- [ ] **Step 2: 전체 레슨 ProgressCard subtitle 수정**

기존:
```tsx
<ProgressCard
  emoji="📚"
  title="전체 레슨"
  subtitle={`총 ${totalLessons}개 레슨`}
  current={doneLessons}
  total={totalLessons}
  onClick={() => navigate('/units')}
/>
```
교체:
```tsx
<ProgressCard
  emoji="📚"
  title="전체 레슨"
  subtitle={`Lv.${currentLevel} · ${totalXp} XP`}
  current={doneLessons}
  total={totalLessons}
  onClick={() => navigate('/units')}
/>
```

- [ ] **Step 3: Home 테스트 + 전체 테스트 실행**

```bash
npx vitest run --passWithNoTests
```
Expected: PASS — 전체 통과. 기존 Home 테스트 중 `subtitle` 텍스트를 검증하는 테스트가 있으면 `총 ${totalLessons}개 레슨` → `Lv.1 · 0 XP` 로 기대값 수정.

> **주의:** `src/test/pages/Home.test.tsx`에 `'총 22개 레슨'` 문자열을 검증하는 케이스가 있는지 확인. 있으면 해당 테스트를 `'Lv.1 · 0 XP'`로 수정한다.

- [ ] **Step 4: 최종 전체 테스트 카운트 확인**

```bash
npx vitest run --passWithNoTests
```
Expected: 76~81개 통과 (기존 61 + xp 16 + AppContext +6 + LessonSession 2 + Complete 7)

- [ ] **Step 5: 타입 체크 + 빌드 확인**

```bash
npx tsc --noEmit && npx vite build
```
Expected: 에러 없음, 빌드 성공

- [ ] **Step 6: 최종 커밋**

```bash
git add src/pages/Home.tsx src/test/pages/Home.test.tsx
git commit -m "feat: Home shows Lv and XP in lesson progress card"
```

---

## 셀프 리뷰

### 스펙 커버리지 체크

| 스펙 요구사항 | 커버하는 Task |
|---|---|
| 오답 0개=3성, 1~2개=2성, 3개+=1성 | Task 4 (LessonSession wrongCount) |
| STAR_XP: 1=10, 2=20, 3=30 | Task 1 (xp.ts) |
| 레벨 임계값 [0,100,250,500,660] | Task 1 (xp.ts) |
| lessonStars: Record<string, 1\|2\|3> | Task 2 (types) + Task 3 (AppContext) |
| 리플레이 시 최고점 유지 | Task 3 (AppContext markLessonDone) |
| XP/레벨 파생 (useMemo) | Task 3 (AppContext computed) |
| navigate('/complete', { state }) | Task 4 (LessonSession) |
| Complete: 별 카드 + XP 카드 + 레벨 바 | Task 5 |
| Complete: state 없으면 별 카드 생략 | Task 5 |
| Complete: xpToNextLevel null → "MAX" | Task 5 |
| UnitMap: 헤더 레벨/XP 바 | Task 6 |
| UnitMap: 레슨 버튼 별 표시 | Task 6 |
| UnitMap: Lv5 MAX 표시 | Task 6 |
| Home: 진도 카드 Lv + XP | Task 7 |
| 목표: 76~81개 테스트 | Task 7 Step 4 |

**갭 없음.** 모든 스펙 요구사항이 Task로 커버됨.

### 타입 일관성

- `markLessonDone(id: string, stars: 1 | 2 | 3)` — Task 2에서 정의, Task 3/4에서 사용 ✓
- `STAR_XP` — Task 1에서 export, Task 4에서 import ✓
- `calcLevelBarPct` — Task 1에서 export, Task 5/6에서 import ✓
- `lessonStars: Record<string, 1 | 2 | 3>` — Task 2에서 정의, Task 3에서 구현 ✓
- `CompleteState { stars: 1|2|3, xpGained: number }` — Task 4 navigate와 Task 5 useLocation 일치 ✓
