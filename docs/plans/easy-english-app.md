# Easy English App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** React 18 웹앱으로 초등 저학년·노년층이 알파벳 26자 + 단어 100개를 3단계(카드→퀴즈→발음) 학습하는 Easy English MVP를 구현한다.

**Architecture:** React SPA with React Router v6. AppContext가 localStorage 기반 진도·스트릭 상태를 전역 관리한다. 퀴즈는 4가지 유형(그림 보고 선택 / 단어 매칭 / 소리 듣고 선택 / 문장 조합)을 단어 인덱스 기준으로 순환하며(`wordIndex % 4`), 영어→한글 / 한글→영어 방향을 번갈아 노출한다(`wordIndex % 2`). Web Speech API가 TTS 발음을 담당한다.

**세션 아키텍처:** `StudySession.tsx`는 React Router URL params(`:id`)로 단일 항목을 받아 view→quiz→speak 3단계를 처리한다. 경로: `/alphabet/:id`, `/words/:id`. "오늘 학습 시작" 버튼은 다음 미완료 항목으로 직접 이동. 오답 발생 시 `wrongItems` 배열에 누적, 세션 종료 후 review phase 자동 진입. 세션 헤더: X버튼 클릭 → 확인 다이얼로그 + `useBlocker` (뒤로가기 차단).

**디자인 시스템 (design-review 확정):**
- 폰트: Noto Sans KR (400, 700), Google Fonts
- 주 색상: `#1565C0` (원래 `#2196F3` → 대비비 WCAG AAA 충족으로 수정)
- 매칭 퀴즈: 영어 왼쪽 열 / 한글 오른쪽 열 고정
- 학습 세션 헤더: `✕` 나가기 버튼 + 확인 다이얼로그
- AlphabetList / WordList: 4열 타일 그리드
- iOS safe-area: `env(safe-area-inset-bottom)` 필수
- ARIA: 퀴즈 선택지 `role="radio"`, 진행 표시줄 `role="progressbar"`, 키보드 숫자 1-4

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router v6, Vitest, React Testing Library, Web Speech API

---

## 파일 구조

```
(프로젝트 루트)/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── context/
    │   └── AppContext.tsx
    ├── data/
    │   ├── alphabet.ts
    │   ├── words.ts
    │   └── sentences.ts
    ├── hooks/
    │   └── useSpeech.ts
    ├── utils/
    │   ├── streak.ts
    │   ├── quizAssignment.ts
    │   ├── quizHelpers.ts
    │   └── fuzzyMatch.ts
    ├── pages/
    │   ├── Home.tsx
    │   ├── AlphabetList.tsx
    │   ├── WordList.tsx
    │   ├── StudySession.tsx
    │   └── Complete.tsx
    ├── components/
    │   ├── ProgressBar.tsx
    │   ├── StreakCard.tsx
    │   ├── ProgressCard.tsx
    │   ├── FlashCard.tsx
    │   ├── PronunciationStep.tsx
    │   └── quiz/
    │       ├── QuizStep.tsx
    │       ├── ImageChoiceQuiz.tsx
    │       ├── MatchingQuiz.tsx
    │       ├── ListenChoiceQuiz.tsx
    │       └── SentenceBuilderQuiz.tsx
    └── test/
        ├── setup.ts
        ├── utils/
        │   ├── streak.test.ts
        │   ├── quizAssignment.test.ts
        │   └── quizHelpers.test.ts
        ├── context/
        │   └── AppContext.test.tsx
        └── components/
            ├── ImageChoiceQuiz.test.tsx
            ├── MatchingQuiz.test.tsx
            └── StudySession.test.tsx
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: 패키지 설치**

```bash
bun add react react-dom react-router-dom
bun add -d vite @vitejs/plugin-react typescript @types/react @types/react-dom
bun add -d tailwindcss postcss autoprefixer
bun add -d vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: `package.json` 작성**

```json
{
  "name": "easy-english-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 3: `vite.config.ts` 작성**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: `tsconfig.json` 작성**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: `tailwind.config.ts` 작성**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1565C0',  // WCAG AAA 대비비 7.1:1 (design-review 확정)
      },
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'transparent' },
          '30%': { backgroundColor: '#fca5a5' },  // red-300
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-in-out',  // MatchingQuiz 오답 피드백 (design-review Pass 7)
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 6: `postcss.config.js` 작성**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: `index.html` 작성**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Easy English</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: `src/index.css` 작성**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Noto Sans KR', sans-serif;
}
```

- [ ] **Step 9: `src/test/setup.ts` 작성**

```typescript
import '@testing-library/jest-dom'

global.SpeechSynthesisUtterance = class {
  text = ''
  lang = ''
  rate = 1
} as unknown as typeof SpeechSynthesisUtterance

Object.defineProperty(global, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    speaking: false,
    getVoices: () => [],
  },
  writable: true,
})
```

- [ ] **Step 10: 빌드 확인**

```bash
bun run test:run
```

Expected: 0 tests run, 0 failures (아직 테스트 없음)

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js index.html src/
git commit -m "chore: project bootstrap (vite + react + tailwind + vitest)"
```

---

## Task 2: Types + Utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/streak.ts`
- Create: `src/utils/quizAssignment.ts`
- Create: `src/utils/quizHelpers.ts`
- Create: `src/test/utils/streak.test.ts`
- Create: `src/test/utils/quizAssignment.test.ts`
- Create: `src/test/utils/quizHelpers.test.ts`

- [ ] **Step 1: `src/types/index.ts` 작성**

```typescript
export interface AlphabetItem {
  id: string
  letter: string
  sound: string
  emoji: string
  exampleWord: string
  meaning: string
}

export interface WordItem {
  id: string
  word: string
  meaning: string
  emoji: string
  category: 'fruit' | 'animal' | 'color' | 'body' | 'food' | 'number' | 'daily' | 'place'
}

export type StudyItem = AlphabetItem | WordItem

export function isWordItem(item: StudyItem): item is WordItem {
  return 'category' in item
}

export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
}

export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
}

export type QuizType = 'image-choice' | 'matching' | 'listen-choice' | 'sentence-builder'

export interface SentenceItem {
  id: string
  english: string
  parts: string[]
  distractors: string[]
}
export type QuizDirection = 'en-to-ko' | 'ko-to-en'

export interface QuizAssignment {
  type: QuizType
  direction: QuizDirection
}
```

- [ ] **Step 2: `src/test/utils/streak.test.ts` 작성**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateStreak, getTodayString } from '../../utils/streak'

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13'))
  })

  it('당일 재학습이면 스트릭 유지', () => {
    expect(calculateStreak('2026-05-13', 5)).toBe(5)
  })

  it('어제 학습했으면 스트릭 +1', () => {
    expect(calculateStreak('2026-05-12', 5)).toBe(6)
  })

  it('이틀 이상 공백이면 스트릭 1로 리셋', () => {
    expect(calculateStreak('2026-05-10', 5)).toBe(1)
  })

  it('첫 학습(빈 날짜)이면 스트릭 1', () => {
    expect(calculateStreak('', 0)).toBe(1)
  })
})

describe('getTodayString', () => {
  it('YYYY-MM-DD 형식 반환', () => {
    vi.setSystemTime(new Date('2026-05-13'))
    expect(getTodayString()).toBe('2026-05-13')
  })
})
```

- [ ] **Step 3: `src/utils/streak.ts` 작성**

```typescript
export function calculateStreak(lastStudiedDate: string, currentStreak: number): number {
  const today = getTodayString()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (lastStudiedDate === today) return currentStreak
  if (lastStudiedDate === yesterday) return currentStreak + 1
  return 1
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}
```

- [ ] **Step 4: 테스트 실행**

```bash
bun run test:run src/test/utils/streak.test.ts
```

Expected: 4 tests pass

- [ ] **Step 5: `src/test/utils/quizAssignment.test.ts` 작성**

```typescript
import { describe, it, expect } from 'vitest'
import { getQuizAssignment } from '../../utils/quizAssignment'

describe('getQuizAssignment', () => {
  it('index 0: image-choice, en-to-ko', () => {
    expect(getQuizAssignment(0)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })

  it('index 1: matching, ko-to-en', () => {
    expect(getQuizAssignment(1)).toEqual({ type: 'matching', direction: 'ko-to-en' })
  })

  it('index 2: listen-choice, en-to-ko', () => {
    expect(getQuizAssignment(2)).toEqual({ type: 'listen-choice', direction: 'en-to-ko' })
  })

  it('index 3: sentence-builder, ko-to-en', () => {
    expect(getQuizAssignment(3)).toEqual({ type: 'sentence-builder', direction: 'ko-to-en' })
  })

  it('index 4: 다시 image-choice, en-to-ko (순환)', () => {
    expect(getQuizAssignment(4)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })

  it('index 8: 두 번째 순환 시작, en-to-ko', () => {
    expect(getQuizAssignment(8)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })
})
```

- [ ] **Step 6: `src/utils/quizAssignment.ts` 작성**

```typescript
import type { QuizAssignment, QuizType, QuizDirection } from '../types'

const QUIZ_TYPES: QuizType[] = ['image-choice', 'matching', 'listen-choice', 'sentence-builder']

export function getQuizAssignment(wordIndex: number): QuizAssignment {
  const type = QUIZ_TYPES[wordIndex % 4]
  const direction: QuizDirection = wordIndex % 2 === 0 ? 'en-to-ko' : 'ko-to-en'
  return { type, direction }
}
```

- [ ] **Step 7: `src/test/utils/quizHelpers.test.ts` 작성**

```typescript
import { describe, it, expect } from 'vitest'
import { shuffle, pickDistractors, buildChoices } from '../../utils/quizHelpers'
import type { WordItem } from '../../types'

const pool: WordItem[] = [
  { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' },
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
  { id: 'orange', word: 'orange', meaning: '오렌지', emoji: '🍊', category: 'fruit' },
  { id: 'lemon', word: 'lemon', meaning: '레몬', emoji: '🍋', category: 'fruit' },
]

describe('shuffle', () => {
  it('같은 요소를 포함하되 순서가 바뀔 수 있음', () => {
    const result = shuffle(pool)
    expect(result).toHaveLength(pool.length)
    expect(result).toEqual(expect.arrayContaining(pool))
  })

  it('원본 배열을 변경하지 않음', () => {
    const original = [...pool]
    shuffle(pool)
    expect(pool).toEqual(original)
  })
})

describe('pickDistractors', () => {
  it('정답을 제외한 N개 반환', () => {
    const result = pickDistractors(pool[0], pool, 3)
    expect(result).toHaveLength(3)
    expect(result.find(i => i.id === 'apple')).toBeUndefined()
  })
})

describe('buildChoices', () => {
  it('정답 포함 4개 반환', () => {
    const result = buildChoices(pool[0], pool, 4)
    expect(result).toHaveLength(4)
    expect(result.find(i => i.id === 'apple')).toBeDefined()
  })
})
```

- [ ] **Step 8: `src/utils/quizHelpers.ts` 작성**

```typescript
import type { StudyItem } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickDistractors<T extends StudyItem>(correct: T, pool: T[], count: number): T[] {
  const others = pool.filter(item => item.id !== correct.id)
  return shuffle(others).slice(0, count)
}

export function buildChoices<T extends StudyItem>(correct: T, pool: T[], count = 4): T[] {
  const distractors = pickDistractors(correct, pool, count - 1)
  return shuffle([correct, ...distractors])
}
```

- [ ] **Step 9: 테스트 실행**

```bash
bun run test:run
```

Expected: 11 tests pass

- [ ] **Step 10: Commit**

```bash
git add src/types src/utils src/test/utils
git commit -m "feat: types and utility functions (streak, quizAssignment, quizHelpers)"
```

---

## Task 3: Content Data

**Files:**
- Create: `src/data/alphabet.ts`
- Create: `src/data/words.ts`

- [ ] **Step 1: `src/data/alphabet.ts` 작성**

```typescript
import type { AlphabetItem } from '../types'

export const ALPHABET: AlphabetItem[] = [
  { id: 'A', letter: 'A', sound: '에이', emoji: '🍎', exampleWord: 'apple', meaning: '사과' },
  { id: 'B', letter: 'B', sound: '비', emoji: '🐻', exampleWord: 'bear', meaning: '곰' },
  { id: 'C', letter: 'C', sound: '씨', emoji: '🐱', exampleWord: 'cat', meaning: '고양이' },
  { id: 'D', letter: 'D', sound: '디', emoji: '🐶', exampleWord: 'dog', meaning: '개' },
  { id: 'E', letter: 'E', sound: '이', emoji: '🥚', exampleWord: 'egg', meaning: '달걀' },
  { id: 'F', letter: 'F', sound: '에프', emoji: '🐟', exampleWord: 'fish', meaning: '물고기' },
  { id: 'G', letter: 'G', sound: '지', emoji: '🍇', exampleWord: 'grape', meaning: '포도' },
  { id: 'H', letter: 'H', sound: '에이치', emoji: '🏠', exampleWord: 'house', meaning: '집' },
  { id: 'I', letter: 'I', sound: '아이', emoji: '🍦', exampleWord: 'ice cream', meaning: '아이스크림' },
  { id: 'J', letter: 'J', sound: '제이', emoji: '🥤', exampleWord: 'juice', meaning: '주스' },
  { id: 'K', letter: 'K', sound: '케이', emoji: '🔑', exampleWord: 'key', meaning: '열쇠' },
  { id: 'L', letter: 'L', sound: '엘', emoji: '🦁', exampleWord: 'lion', meaning: '사자' },
  { id: 'M', letter: 'M', sound: '엠', emoji: '🌙', exampleWord: 'moon', meaning: '달' },
  { id: 'N', letter: 'N', sound: '엔', emoji: '📝', exampleWord: 'note', meaning: '노트' },
  { id: 'O', letter: 'O', sound: '오', emoji: '🍊', exampleWord: 'orange', meaning: '오렌지' },
  { id: 'P', letter: 'P', sound: '피', emoji: '🐧', exampleWord: 'penguin', meaning: '펭귄' },
  { id: 'Q', letter: 'Q', sound: '큐', emoji: '👸', exampleWord: 'queen', meaning: '여왕' },
  { id: 'R', letter: 'R', sound: '알', emoji: '🐇', exampleWord: 'rabbit', meaning: '토끼' },
  { id: 'S', letter: 'S', sound: '에스', emoji: '☀️', exampleWord: 'sun', meaning: '태양' },
  { id: 'T', letter: 'T', sound: '티', emoji: '🐯', exampleWord: 'tiger', meaning: '호랑이' },
  { id: 'U', letter: 'U', sound: '유', emoji: '☂️', exampleWord: 'umbrella', meaning: '우산' },
  { id: 'V', letter: 'V', sound: '브이', emoji: '🎻', exampleWord: 'violin', meaning: '바이올린' },
  { id: 'W', letter: 'W', sound: '더블유', emoji: '🐋', exampleWord: 'whale', meaning: '고래' },
  { id: 'X', letter: 'X', sound: '엑스', emoji: '🎸', exampleWord: 'xylophone', meaning: '실로폰' },
  { id: 'Y', letter: 'Y', sound: '와이', emoji: '🧶', exampleWord: 'yarn', meaning: '실뭉치' },
  { id: 'Z', letter: 'Z', sound: '지', emoji: '🦓', exampleWord: 'zebra', meaning: '얼룩말' },
]
```

- [ ] **Step 2: `src/data/words.ts` 작성**

```typescript
import type { WordItem } from '../types'

export const WORDS: WordItem[] = [
  // 과일 (10)
  { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' },
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
  { id: 'orange', word: 'orange', meaning: '오렌지', emoji: '🍊', category: 'fruit' },
  { id: 'strawberry', word: 'strawberry', meaning: '딸기', emoji: '🍓', category: 'fruit' },
  { id: 'watermelon', word: 'watermelon', meaning: '수박', emoji: '🍉', category: 'fruit' },
  { id: 'lemon', word: 'lemon', meaning: '레몬', emoji: '🍋', category: 'fruit' },
  { id: 'peach', word: 'peach', meaning: '복숭아', emoji: '🍑', category: 'fruit' },
  { id: 'mango', word: 'mango', meaning: '망고', emoji: '🥭', category: 'fruit' },
  { id: 'cherry', word: 'cherry', meaning: '체리', emoji: '🍒', category: 'fruit' },
  // 동물 (15)
  { id: 'cat', word: 'cat', meaning: '고양이', emoji: '🐱', category: 'animal' },
  { id: 'dog', word: 'dog', meaning: '개', emoji: '🐶', category: 'animal' },
  { id: 'bird', word: 'bird', meaning: '새', emoji: '🐦', category: 'animal' },
  { id: 'fish', word: 'fish', meaning: '물고기', emoji: '🐟', category: 'animal' },
  { id: 'rabbit', word: 'rabbit', meaning: '토끼', emoji: '🐇', category: 'animal' },
  { id: 'bear', word: 'bear', meaning: '곰', emoji: '🐻', category: 'animal' },
  { id: 'elephant', word: 'elephant', meaning: '코끼리', emoji: '🐘', category: 'animal' },
  { id: 'lion', word: 'lion', meaning: '사자', emoji: '🦁', category: 'animal' },
  { id: 'tiger', word: 'tiger', meaning: '호랑이', emoji: '🐯', category: 'animal' },
  { id: 'pig', word: 'pig', meaning: '돼지', emoji: '🐷', category: 'animal' },
  { id: 'monkey', word: 'monkey', meaning: '원숭이', emoji: '🐒', category: 'animal' },
  { id: 'horse', word: 'horse', meaning: '말', emoji: '🐴', category: 'animal' },
  { id: 'cow', word: 'cow', meaning: '소', emoji: '🐮', category: 'animal' },
  { id: 'sheep', word: 'sheep', meaning: '양', emoji: '🐑', category: 'animal' },
  { id: 'duck', word: 'duck', meaning: '오리', emoji: '🦆', category: 'animal' },
  // 색깔 (10)
  { id: 'red', word: 'red', meaning: '빨강', emoji: '🔴', category: 'color' },
  { id: 'blue', word: 'blue', meaning: '파랑', emoji: '🔵', category: 'color' },
  { id: 'green', word: 'green', meaning: '초록', emoji: '🟢', category: 'color' },
  { id: 'yellow', word: 'yellow', meaning: '노랑', emoji: '🟡', category: 'color' },
  { id: 'white', word: 'white', meaning: '하양', emoji: '⚪', category: 'color' },
  { id: 'black', word: 'black', meaning: '검정', emoji: '⚫', category: 'color' },
  { id: 'pink', word: 'pink', meaning: '분홍', emoji: '🩷', category: 'color' },
  { id: 'purple', word: 'purple', meaning: '보라', emoji: '🟣', category: 'color' },
  { id: 'brown', word: 'brown', meaning: '갈색', emoji: '🟤', category: 'color' },
  { id: 'gray', word: 'gray', meaning: '회색', emoji: '🩶', category: 'color' },
  // 신체 (12)
  { id: 'eye', word: 'eye', meaning: '눈', emoji: '👁️', category: 'body' },
  { id: 'ear', word: 'ear', meaning: '귀', emoji: '👂', category: 'body' },
  { id: 'nose', word: 'nose', meaning: '코', emoji: '👃', category: 'body' },
  { id: 'mouth', word: 'mouth', meaning: '입', emoji: '👄', category: 'body' },
  { id: 'hand', word: 'hand', meaning: '손', emoji: '✋', category: 'body' },
  { id: 'foot', word: 'foot', meaning: '발', emoji: '🦶', category: 'body' },
  { id: 'head', word: 'head', meaning: '머리', emoji: '🗣️', category: 'body' },
  { id: 'hair', word: 'hair', meaning: '머리카락', emoji: '💇', category: 'body' },
  { id: 'arm', word: 'arm', meaning: '팔', emoji: '💪', category: 'body' },
  { id: 'leg', word: 'leg', meaning: '다리', emoji: '🦵', category: 'body' },
  { id: 'finger', word: 'finger', meaning: '손가락', emoji: '☝️', category: 'body' },
  { id: 'toe', word: 'toe', meaning: '발가락', emoji: '🦶', category: 'body' },
  // 음식 (12)
  { id: 'milk', word: 'milk', meaning: '우유', emoji: '🥛', category: 'food' },
  { id: 'egg', word: 'egg', meaning: '달걀', emoji: '🥚', category: 'food' },
  { id: 'rice', word: 'rice', meaning: '밥', emoji: '🍚', category: 'food' },
  { id: 'bread', word: 'bread', meaning: '빵', emoji: '🍞', category: 'food' },
  { id: 'cake', word: 'cake', meaning: '케이크', emoji: '🎂', category: 'food' },
  { id: 'juice', word: 'juice', meaning: '주스', emoji: '🧃', category: 'food' },
  { id: 'water', word: 'water', meaning: '물', emoji: '💧', category: 'food' },
  { id: 'soup', word: 'soup', meaning: '국', emoji: '🍲', category: 'food' },
  { id: 'pizza', word: 'pizza', meaning: '피자', emoji: '🍕', category: 'food' },
  { id: 'cookie', word: 'cookie', meaning: '쿠키', emoji: '🍪', category: 'food' },
  { id: 'cheese', word: 'cheese', meaning: '치즈', emoji: '🧀', category: 'food' },
  { id: 'carrot', word: 'carrot', meaning: '당근', emoji: '🥕', category: 'food' },
  // 숫자 (10)
  { id: 'one', word: 'one', meaning: '하나', emoji: '1️⃣', category: 'number' },
  { id: 'two', word: 'two', meaning: '둘', emoji: '2️⃣', category: 'number' },
  { id: 'three', word: 'three', meaning: '셋', emoji: '3️⃣', category: 'number' },
  { id: 'four', word: 'four', meaning: '넷', emoji: '4️⃣', category: 'number' },
  { id: 'five', word: 'five', meaning: '다섯', emoji: '5️⃣', category: 'number' },
  { id: 'six', word: 'six', meaning: '여섯', emoji: '6️⃣', category: 'number' },
  { id: 'seven', word: 'seven', meaning: '일곱', emoji: '7️⃣', category: 'number' },
  { id: 'eight', word: 'eight', meaning: '여덟', emoji: '8️⃣', category: 'number' },
  { id: 'nine', word: 'nine', meaning: '아홉', emoji: '9️⃣', category: 'number' },
  { id: 'ten', word: 'ten', meaning: '열', emoji: '🔟', category: 'number' },
  // 일상 (15)
  { id: 'hello', word: 'hello', meaning: '안녕', emoji: '👋', category: 'daily' },
  { id: 'bye', word: 'bye', meaning: '잘 가', emoji: '🙋', category: 'daily' },
  { id: 'yes', word: 'yes', meaning: '네', emoji: '✅', category: 'daily' },
  { id: 'no', word: 'no', meaning: '아니요', emoji: '❌', category: 'daily' },
  { id: 'good', word: 'good', meaning: '좋아요', emoji: '👍', category: 'daily' },
  { id: 'bad', word: 'bad', meaning: '나빠요', emoji: '👎', category: 'daily' },
  { id: 'big', word: 'big', meaning: '커요', emoji: '🔝', category: 'daily' },
  { id: 'small', word: 'small', meaning: '작아요', emoji: '🔅', category: 'daily' },
  { id: 'hot', word: 'hot', meaning: '뜨거워요', emoji: '🔥', category: 'daily' },
  { id: 'cold', word: 'cold', meaning: '차가워요', emoji: '🧊', category: 'daily' },
  { id: 'happy', word: 'happy', meaning: '행복해요', emoji: '😊', category: 'daily' },
  { id: 'sad', word: 'sad', meaning: '슬퍼요', emoji: '😢', category: 'daily' },
  { id: 'thank-you', word: 'thank you', meaning: '감사해요', emoji: '🙏', category: 'daily' },
  { id: 'sorry', word: 'sorry', meaning: '미안해요', emoji: '😔', category: 'daily' },
  { id: 'please', word: 'please', meaning: '부탁해요', emoji: '🥺', category: 'daily' },
  // 장소 (6)
  { id: 'home', word: 'home', meaning: '집', emoji: '🏠', category: 'place' },
  { id: 'school', word: 'school', meaning: '학교', emoji: '🏫', category: 'place' },
  { id: 'park', word: 'park', meaning: '공원', emoji: '🌳', category: 'place' },
  { id: 'shop', word: 'shop', meaning: '가게', emoji: '🏪', category: 'place' },
  { id: 'hospital', word: 'hospital', meaning: '병원', emoji: '🏥', category: 'place' },
  { id: 'library', word: 'library', meaning: '도서관', emoji: '📚', category: 'place' },
]

export const WORD_CATEGORIES = ['fruit', 'animal', 'color', 'body', 'food', 'number', 'daily', 'place'] as const
export type WordCategory = typeof WORD_CATEGORIES[number]

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  fruit: '과일',
  animal: '동물',
  color: '색깔',
  body: '신체',
  food: '음식',
  number: '숫자',
  daily: '일상',
  place: '장소',
}

export function getWordsByCategory(category: WordCategory): WordItem[] {
  return WORDS.filter(w => w.category === category)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data
git commit -m "feat: content data (26 alphabet + 100 words)"
```

---

## Task 4: AppContext

**Files:**
- Create: `src/context/AppContext.tsx`
- Create: `src/test/context/AppContext.test.tsx`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/test/context/AppContext.test.tsx
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
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
bun run test:run src/test/context/AppContext.test.tsx
```

Expected: FAIL (AppContext not found)

- [ ] **Step 3: `src/context/AppContext.tsx` 작성**

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppStorage, AppContextValue } from '../types'
import { calculateStreak, getTodayString } from '../utils/streak'

const STORAGE_KEY = 'easy-english-progress'

const DEFAULT_STORAGE: AppStorage = {
  streak: 0,
  lastStudiedDate: '',
  alphabetProgress: [],
  wordProgress: [],
}

function loadStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_STORAGE, ...JSON.parse(raw) } : DEFAULT_STORAGE
  } catch {
    return DEFAULT_STORAGE
  }
}

function saveStorage(data: AppStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // in-memory state continues working
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AppStorage>(loadStorage)

  useEffect(() => {
    saveStorage(progress)
  }, [progress])

  function markAlphabetDone(id: string) {
    setProgress(prev => {
      if (prev.alphabetProgress.includes(id)) return prev
      return { ...prev, alphabetProgress: [...prev.alphabetProgress, id] }
    })
  }

  function markWordDone(id: string) {
    setProgress(prev => {
      if (prev.wordProgress.includes(id)) return prev
      return { ...prev, wordProgress: [...prev.wordProgress, id] }
    })
  }

  function updateStreak() {
    setProgress(prev => ({
      ...prev,
      streak: calculateStreak(prev.lastStudiedDate, prev.streak),
      lastStudiedDate: getTodayString(),
    }))
  }

  function isPhraseUnlocked() {
    return progress.wordProgress.length >= 50
  }

  return (
    <AppContext.Provider value={{ progress, markAlphabetDone, markWordDone, updateStreak, isPhraseUnlocked }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

```bash
bun run test:run src/test/context/AppContext.test.tsx
```

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/context src/test/context
git commit -m "feat: AppContext with localStorage persistence and streak logic"
```

---

## Task 5: useSpeech Hook

**Files:**
- Create: `src/hooks/useSpeech.ts`

- [ ] **Step 1: `src/hooks/useSpeech.ts` 작성**

```typescript
import { useCallback } from 'react'

interface UseSpeechResult {
  speak: (text: string, lang?: string) => void
  isSupported: boolean
}

export function useSpeech(): UseSpeechResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  return { speak, isSupported }
}
```

- [ ] **Step 2: `src/test/hooks/useSpeech.test.ts` 작성**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeech } from '../../hooks/useSpeech'

describe('useSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isSupported: speechSynthesis 있으면 true', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(true)
  })

  it('speak: speechSynthesis.speak 호출', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('apple'))
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
  })

  it('speak: 이전 발음 cancel 후 새 utterance', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('apple'))
    act(() => result.current.speak('banana'))
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 3: 테스트 실행**

```bash
bun run test:run src/test/hooks/useSpeech.test.ts
```

Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/hooks src/test/hooks
git commit -m "feat: useSpeech hook + tests (Web Speech API TTS wrapper)"
```

---

## Task 6: 공통 UI 컴포넌트

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/StreakCard.tsx`
- Create: `src/components/ProgressCard.tsx`
- Create: `src/components/FlashCard.tsx`
- Create: `src/components/PronunciationStep.tsx`

- [ ] **Step 1: `src/components/ProgressBar.tsx` 작성**

```typescript
interface Props {
  current: number
  total: number
  step: 'view' | 'quiz' | 'speak'
}

const STEP_LABELS = { view: '보기', quiz: '퀴즈', speak: '발음' } as const

export function ProgressBar({ current, total, step }: Props) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)
  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{current} / {total}</span>
        <span className="text-primary font-semibold">Step {STEP_LABELS[step]}</span>
      </div>
      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/components/StreakCard.tsx` 작성**

```typescript
interface Props {
  streak: number
}

export function StreakCard({ streak }: Props) {
  return (
    <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md p-4 text-center">
      <div className="text-4xl">🔥</div>
      <div className="text-3xl font-bold text-orange-500 mt-1">{streak}일째</div>
      <div className="text-sm text-gray-400 mt-1">연속 학습 중</div>
    </div>
  )
}
```

- [ ] **Step 3: `src/components/ProgressCard.tsx` 작성**

```typescript
interface Props {
  emoji: string
  title: string
  subtitle: string
  current: number
  total: number
  locked?: boolean
  onClick?: () => void
}

export function ProgressCard({ emoji, title, subtitle, current, total, locked, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        enabled:active:bg-gray-50"
      style={{ borderColor: locked ? '#E0E0E0' : '#BBDEFB', background: locked ? '#F5F5F5' : '#FFFFFF' }}
    >
      <span className="text-4xl">{locked ? '🔒' : emoji}</span>
      <div className="flex-1">
        <div className="text-lg font-bold text-gray-800">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
      </div>
      <div className="text-sm font-semibold px-3 py-1 rounded-full bg-primary text-white">
        {current}/{total}
      </div>
    </button>
  )
}
```

- [ ] **Step 4: `src/components/FlashCard.tsx` 작성**

```typescript
import type { StudyItem } from '../types'
import { isWordItem } from '../types'
import { useSpeech } from '../hooks/useSpeech'

interface Props {
  item: StudyItem
  onNext: () => void
}

export function FlashCard({ item, onNext }: Props) {
  const { speak, isSupported } = useSpeech()
  const word = isWordItem(item) ? item.word : item.exampleWord
  const meaning = item.meaning

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="bg-gray-100 rounded-3xl p-8 w-full flex flex-col items-center gap-4">
        <span className="text-7xl">{item.emoji}</span>
        <span className="text-4xl font-bold tracking-widest text-gray-900">{word}</span>
        <div className="w-10 h-1 bg-primary rounded-full" />
        <span className="text-2xl text-gray-600">{meaning}</span>
      </div>
      {isSupported && (
        <button
          onClick={() => speak(word)}
          className="w-full py-4 bg-blue-50 text-primary text-xl font-semibold rounded-2xl"
        >
          🔊 발음 듣기
        </button>
      )}
      <button
        onClick={onNext}
        className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl"
      >
        다음 ▶
      </button>
    </div>
  )
}
```

- [ ] **Step 5: `src/components/PronunciationStep.tsx` 작성**

```typescript
import { useEffect } from 'react'
import type { StudyItem } from '../types'
import { isWordItem } from '../types'
import { useSpeech } from '../hooks/useSpeech'

interface Props {
  item: StudyItem
  onComplete: () => void
}

export function PronunciationStep({ item, onComplete }: Props) {
  const { speak, isSupported } = useSpeech()
  const word = isWordItem(item) ? item.word : item.exampleWord

  useEffect(() => {
    if (isSupported) speak(word)
  }, [item.id, speak, isSupported])

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="bg-gray-100 rounded-3xl p-8 w-full flex flex-col items-center gap-4">
        <span className="text-7xl">{item.emoji}</span>
        <span className="text-4xl font-bold tracking-widest text-gray-900">{word}</span>
        <div className="w-10 h-1 bg-primary rounded-full" />
        <span className="text-2xl text-gray-600">{item.meaning}</span>
      </div>
      {isSupported && (
        <button
          onClick={() => speak(word)}
          className="w-full py-4 bg-blue-50 text-primary text-xl font-semibold rounded-2xl"
        >
          🔊 발음 다시 듣기
        </button>
      )}
      {!isSupported && (
        <p className="text-sm text-gray-400 text-center">이 브라우저는 발음 기능을 지원하지 않습니다</p>
      )}
      <button
        onClick={onComplete}
        className="w-full py-4 bg-green-500 text-white text-xl font-bold rounded-2xl"
      >
        완료 ✓
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ProgressBar.tsx src/components/StreakCard.tsx src/components/ProgressCard.tsx src/components/FlashCard.tsx src/components/PronunciationStep.tsx
git commit -m "feat: shared UI components (ProgressBar, StreakCard, ProgressCard, FlashCard, PronunciationStep)"
```

---

## Task 7: ImageChoiceQuiz (퀴즈 유형 A)

**Files:**
- Create: `src/components/quiz/ImageChoiceQuiz.tsx`
- Create: `src/test/components/ImageChoiceQuiz.test.tsx`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/test/components/ImageChoiceQuiz.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageChoiceQuiz } from '../../components/quiz/ImageChoiceQuiz'
import type { WordItem } from '../../types'

const correct: WordItem = { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' }
const choices: WordItem[] = [
  correct,
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
  { id: 'lemon', word: 'lemon', meaning: '레몬', emoji: '🍋', category: 'fruit' },
]

describe('ImageChoiceQuiz', () => {
  it('en-to-ko: 한글 보기 4개 렌더링', () => {
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={vi.fn()} />)
    expect(screen.getByText('사과')).toBeInTheDocument()
    expect(screen.getByText('바나나')).toBeInTheDocument()
  })

  it('ko-to-en: 영어 보기 4개 렌더링', () => {
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="ko-to-en" onCorrect={vi.fn()} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
  })

  it('정답 선택 시 onCorrect 호출 (800ms 후)', async () => {
    vi.useFakeTimers()
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('사과'))
    vi.advanceTimersByTime(800)
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 선택 시 onCorrect 미호출', () => {
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('바나나'))
    expect(onCorrect).not.toHaveBeenCalled()
  })

  it('allowNextOnWrong: 오답 시 다음 버튼 표시 + onNext 호출', () => {
    const onNext = vi.fn()
    render(
      <ImageChoiceQuiz
        item={correct} choices={choices} direction="en-to-ko"
        onCorrect={vi.fn()} allowNextOnWrong onNext={onNext}
      />
    )
    fireEvent.click(screen.getByText('바나나'))
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
bun run test:run src/test/components/ImageChoiceQuiz.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `src/components/quiz/ImageChoiceQuiz.tsx` 작성**

```typescript
import { useState } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  allowNextOnWrong?: boolean  // 복습 라운드: 오답 시에도 다음으로 진행
  onNext?: () => void          // allowNextOnWrong=true 시 다음 버튼 핸들러
}

function getChoiceLabel(item: StudyItem, direction: QuizDirection): string {
  if (direction === 'en-to-ko') return item.meaning
  return isWordItem(item) ? item.word : item.letter
}

function getQuestion(direction: QuizDirection): string {
  return direction === 'en-to-ko' ? '이 그림의 뜻은?' : '이 그림에 맞는 영어는?'
}

export function ImageChoiceQuiz({ item, choices, direction, onCorrect, allowNextOnWrong, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(id: string) {
    if (answered) return
    setSelected(id)
    setAnswered(true)
    if (id === item.id) setTimeout(onCorrect, 800)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <span className="text-6xl">{item.emoji}</span>
      <p className="text-xl text-gray-500">{getQuestion(direction)}</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {choices.map(choice => {
          const isCorrect = choice.id === item.id
          const isSelected = choice.id === selected
          let cls = 'py-5 text-xl font-bold rounded-2xl border-2 transition-colors '
          if (!answered) cls += 'border-gray-200 bg-white text-gray-800'
          else if (isCorrect) cls += 'border-green-500 bg-green-50 text-green-800'
          else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700'
          else cls += 'border-gray-100 bg-white text-gray-300'
          return (
            <button key={choice.id} className={cls} onClick={() => handleSelect(choice.id)}>
              {getChoiceLabel(choice, direction)}
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`text-lg font-medium ${selected === item.id ? 'text-green-600' : 'text-gray-600'}`}>
          {selected === item.id
            ? '✓ 정답이에요! 잘했어요 👍'
            : `정답은 "${getChoiceLabel(item, direction)}"이에요. 괜찮아요! 👏`}
        </p>
      )}
      {answered && selected !== item.id && allowNextOnWrong && (
        <button onClick={onNext} className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl">
          다음 ▶
        </button>
      )}
      {answered && selected !== item.id && !allowNextOnWrong && (
        <button onClick={onCorrect} className="w-full py-4 bg-primary text-white text-xl font-bold rounded-2xl">
          다음 ▶
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

```bash
bun run test:run src/test/components/ImageChoiceQuiz.test.tsx
```

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/quiz/ImageChoiceQuiz.tsx src/test/components/ImageChoiceQuiz.test.tsx
git commit -m "feat: ImageChoiceQuiz (quiz type A — image + 4-choice, allowNextOnWrong)"
```

---

## Task 8: MatchingQuiz (퀴즈 유형 B)

**Files:**
- Create: `src/components/quiz/MatchingQuiz.tsx`
- Create: `src/test/components/MatchingQuiz.test.tsx`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/test/components/MatchingQuiz.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchingQuiz } from '../../components/quiz/MatchingQuiz'
import type { WordItem } from '../../types'

const items: WordItem[] = [
  { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' },
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
]

describe('MatchingQuiz', () => {
  it('영어 3개 + 한글 3개 렌더링', () => {
    render(<MatchingQuiz items={items} onComplete={vi.fn()} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('사과')).toBeInTheDocument()
  })

  it('오답 선택 시 animate-flash 클래스 적용', () => {
    render(<MatchingQuiz items={items} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('apple'))
    fireEvent.click(screen.getByText('바나나'))  // 오답
    const wrongBtn = screen.getByText('바나나')
    expect(wrongBtn.className).toContain('animate-flash')
  })

  it('올바른 짝 선택 시 onComplete 호출 (3쌍 완료 후)', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MatchingQuiz items={items} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('apple'))
    fireEvent.click(screen.getByText('사과'))
    fireEvent.click(screen.getByText('banana'))
    fireEvent.click(screen.getByText('바나나'))
    fireEvent.click(screen.getByText('grape'))
    fireEvent.click(screen.getByText('포도'))

    vi.advanceTimersByTime(600)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
bun run test:run src/test/components/MatchingQuiz.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `src/components/quiz/MatchingQuiz.tsx` 작성**

```typescript
import { useState, useMemo } from 'react'
import type { StudyItem } from '../../types'
import { isWordItem } from '../../types'
import { shuffle } from '../../utils/quizHelpers'

interface Props {
  items: StudyItem[]
  onComplete: () => void
}

export function MatchingQuiz({ items, onComplete }: Props) {
  const rightItems = useMemo(() => shuffle(items), [items])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)

  function getWord(item: StudyItem): string {
    return isWordItem(item) ? item.word : item.letter
  }

  function handleLeft(id: string) {
    if (matched.has(id)) return
    setSelectedLeft(prev => prev === id ? null : id)
  }

  function handleRight(id: string) {
    if (matched.has(id) || !selectedLeft) return
    if (selectedLeft === id) {
      const next = new Set(matched).add(id)
      setMatched(next)
      setSelectedLeft(null)
      if (next.size === items.length) setTimeout(onComplete, 600)
    } else {
      setWrong(id)
      setTimeout(() => { setWrong(null); setSelectedLeft(null) }, 500)
    }
  }

  function leftCls(id: string): string {
    if (matched.has(id)) return 'border-green-500 bg-green-50 text-green-700'
    if (selectedLeft === id) return 'border-blue-500 bg-blue-50 text-blue-700'
    return 'border-gray-200 bg-white text-gray-800'
  }

  function rightCls(id: string): string {
    if (matched.has(id)) return 'border-green-500 bg-green-50 text-green-700'
    if (wrong === id) return 'border-red-400 bg-red-50 text-red-600 animate-flash'  // flash: design-review Pass 7
    return 'border-gray-200 bg-white text-gray-600'
  }

  return (
    <div className="p-6">
      <p className="text-center text-gray-500 mb-4 text-lg">짝을 맞춰보세요!</p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-3 flex-1">
          {items.map(item => (
            <button key={item.id} onClick={() => handleLeft(item.id)}
              className={`py-5 rounded-2xl border-2 text-xl font-bold transition-colors ${leftCls(item.id)}`}>
              {getWord(item)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {rightItems.map(item => (
            <button key={item.id} onClick={() => handleRight(item.id)}
              className={`py-5 rounded-2xl border-2 text-xl transition-colors ${rightCls(item.id)}`}>
              {item.meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

```bash
bun run test:run src/test/components/MatchingQuiz.test.tsx
```

Expected: 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/quiz/MatchingQuiz.tsx src/test/components/MatchingQuiz.test.tsx
git commit -m "feat: MatchingQuiz (quiz type B — word pair matching, flash feedback)"
```

---

## Task 9: ListenChoiceQuiz + QuizStep (퀴즈 유형 C + 오케스트레이터)

**Files:**
- Create: `src/components/quiz/ListenChoiceQuiz.tsx`
- Create: `src/components/quiz/QuizStep.tsx`

- [ ] **Step 1: `src/components/quiz/ListenChoiceQuiz.tsx` 작성**

```typescript
import { useEffect } from 'react'
import type { StudyItem, QuizDirection } from '../../types'
import { isWordItem } from '../../types'
import { ImageChoiceQuiz } from './ImageChoiceQuiz'

interface Props {
  item: StudyItem
  choices: StudyItem[]
  direction: QuizDirection
  onCorrect: () => void
  speak: (text: string) => void
}

export function ListenChoiceQuiz({ item, choices, direction, onCorrect, speak }: Props) {
  const word = isWordItem(item) ? item.word : item.exampleWord

  useEffect(() => {
    speak(word)
  }, [item.id])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 pt-6">
        <span className="text-6xl">🔊</span>
        <button onClick={() => speak(word)}
          className="px-6 py-3 bg-blue-50 text-blue-700 text-lg font-semibold rounded-2xl">
          다시 듣기
        </button>
        <p className="text-gray-500">소리를 듣고 맞는 답을 고르세요</p>
      </div>
      <ImageChoiceQuiz
        item={item}
        choices={choices}
        direction={direction}
        onCorrect={onCorrect}
      />
    </div>
  )
}
```

- [ ] **Step 2: `src/components/quiz/QuizStep.tsx` 작성**

```typescript
import { useMemo } from 'react'
import type { StudyItem, QuizAssignment } from '../../types'
import { isWordItem } from '../../types'
import { useSpeech } from '../../hooks/useSpeech'
import { buildChoices } from '../../utils/quizHelpers'
import { ImageChoiceQuiz } from './ImageChoiceQuiz'
import { MatchingQuiz } from './MatchingQuiz'
import { ListenChoiceQuiz } from './ListenChoiceQuiz'

interface Props {
  item: StudyItem
  allItems: StudyItem[]
  assignment: QuizAssignment
  wordIndex: number        // 퀴즈 유형·방향 결정 + sentence 선택용
  onComplete: () => void
  onWrong?: () => void     // 오답 시 StudySession의 wrongItems 추적
}

function getSameCategory(item: StudyItem, all: StudyItem[]): StudyItem[] {
  if (!isWordItem(item)) return all
  return all.filter(i => isWordItem(i) && i.category === item.category)
}

export function QuizStep({ item, allItems, assignment, wordIndex, onComplete, onWrong }: Props) {
  const { speak } = useSpeech()
  const pool = getSameCategory(item, allItems)
  const fallbackPool = pool.length >= 4 ? pool : allItems

  // useMemo로 렌더마다 재셔플 방지 (item.id + pool 크기 의존)
  const choices = useMemo(() => buildChoices(item, fallbackPool, 4), [item.id, fallbackPool.length])
  const matchItems = useMemo(() => buildChoices(item, fallbackPool, 3), [item.id, fallbackPool.length])

  function handleCorrect() {
    onComplete()
  }

  function handleWrong() {
    onWrong?.()
  }

  if (assignment.type === 'matching') {
    return <MatchingQuiz items={matchItems} onComplete={handleCorrect} />
  }

  if (assignment.type === 'listen-choice') {
    return (
      <ListenChoiceQuiz
        item={item}
        choices={choices}
        direction={assignment.direction}
        onCorrect={handleCorrect}
        speak={speak}
      />
    )
  }

  // sentence-builder 분기는 Task 10 Step 8에서 추가

  return (
    <ImageChoiceQuiz
      item={item}
      choices={choices}
      direction={assignment.direction}
      onCorrect={handleCorrect}
    />
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/quiz/
git commit -m "feat: ListenChoiceQuiz + QuizStep orchestrator (quiz type C + routing)"
```

---

## Task 10: sentences 데이터 + SentenceBuilderQuiz (유형 D)

**Files:**
- Create: `src/data/sentences.ts`
- Create: `src/components/quiz/SentenceBuilderQuiz.tsx`
- Modify: `src/components/quiz/QuizStep.tsx` (sentence-builder 분기 추가)
- Modify: `src/types/index.ts` (SentenceItem 이미 정의됨)

- [ ] **Step 1: `src/data/sentences.ts` 작성**

```typescript
import type { SentenceItem } from '../types'

export const SENTENCES: SentenceItem[] = [
  { id: 'coffee-please',  english: 'Coffee, please.',    parts: ['커피', '주세요'],          distractors: ['설탕', '물'] },
  { id: 'i-like-cats',   english: 'I like cats.',        parts: ['나는', '고양이가', '좋아요'], distractors: ['개', '새'] },
  { id: 'its-a-dog',     english: "It's a dog.",         parts: ['강아지예요'],               distractors: ['고양이', '새', '토끼'] },
  { id: 'i-like-milk',   english: 'I like milk.',        parts: ['나는', '우유가', '좋아요'], distractors: ['빵', '물'] },
  { id: 'its-red',       english: "It's red.",           parts: ['빨간색이에요'],             distractors: ['파란색', '초록색', '노란색'] },
  { id: 'i-like-blue',   english: 'I like blue.',        parts: ['나는', '파란색이', '좋아요'], distractors: ['빨간색', '초록색'] },
  { id: 'go-home',       english: 'Go home.',            parts: ['집에', '가요'],             distractors: ['학교', '공원'] },
  { id: 'im-happy',      english: "I'm happy.",          parts: ['나는', '행복해요'],         distractors: ['슬퍼요', '배고파요'] },
  { id: 'its-hot',       english: "It's hot.",           parts: ['더워요'],                   distractors: ['추워요', '좋아요', '싫어요'] },
  { id: 'one-please',    english: 'One, please.',        parts: ['하나', '주세요'],           distractors: ['둘', '셋'] },
  { id: 'i-want-bread',  english: 'I want bread.',       parts: ['빵을', '원해요'],           distractors: ['우유', '케이크'] },
  { id: 'its-big',       english: "It's big.",           parts: ['커요'],                    distractors: ['작아요', '높아요', '낮아요'] },
  { id: 'its-cold',      english: "It's cold.",          parts: ['추워요'],                   distractors: ['더워요', '좋아요'] },
  { id: 'thank-you',     english: 'Thank you.',          parts: ['감사해요'],                 distractors: ['미안해요', '좋아요'] },
  { id: 'i-see-bird',    english: 'I see a bird.',       parts: ['새가', '보여요'],           distractors: ['고양이', '개'] },
  { id: 'water-please',  english: 'Water, please.',      parts: ['물', '주세요'],             distractors: ['커피', '우유'] },
  { id: 'its-small',     english: "It's small.",         parts: ['작아요'],                   distractors: ['커요', '무거워요', '가벼워요'] },
  { id: 'i-like-red',    english: 'I like red.',         parts: ['나는', '빨간색이', '좋아요'], distractors: ['파란색', '초록색'] },
  { id: 'lets-go',       english: "Let's go.",           parts: ['가요'],                    distractors: ['와요', '먹어요', '자요'] },
  { id: 'im-hungry',     english: "I'm hungry.",         parts: ['나는', '배고파요'],         distractors: ['행복해요', '슬퍼요'] },
]
```

- [ ] **Step 2: `src/utils/fuzzyMatch.ts` 작성**

```typescript
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, '').trim()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b)
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(na, nb) / maxLen
}

export type MatchResult = 'exact' | 'fuzzy' | 'wrong'

export function evaluateTyped(typed: string, correct: string): MatchResult {
  const sim = similarity(typed, correct)
  if (normalize(typed) === normalize(correct)) return 'exact'
  if (sim >= 0.75) return 'fuzzy'
  return 'wrong'
}
```

- [ ] **Step 3: `src/test/utils/fuzzyMatch.test.ts` 작성 후 FAIL 확인**

```typescript
import { describe, it, expect } from 'vitest'
import { normalize, similarity, evaluateTyped } from '../../utils/fuzzyMatch'

describe('normalize', () => {
  it('소문자 변환 + 구두점 제거', () => {
    expect(normalize('Coffee, please.')).toBe('coffee please')
  })
})

describe('evaluateTyped', () => {
  it('완전 일치 → exact', () => {
    expect(evaluateTyped('Coffee, please.', 'Coffee, please.')).toBe('exact')
  })

  it('대소문자 무시 일치 → exact', () => {
    expect(evaluateTyped('coffee please', 'Coffee, please.')).toBe('exact')
  })

  it('철자 오류 1~2자 → fuzzy', () => {
    expect(evaluateTyped('Coffe please', 'Coffee, please.')).toBe('fuzzy')
  })

  it('완전히 다른 답 → wrong', () => {
    expect(evaluateTyped('I like cats', 'Coffee, please.')).toBe('wrong')
  })

  it('빈 입력 → wrong', () => {
    expect(evaluateTyped('', 'Coffee, please.')).toBe('wrong')
  })
})
```

```bash
bun run test src/test/utils/fuzzyMatch.test.ts
```

Expected: FAIL (파일 없음)

- [ ] **Step 4: `src/utils/fuzzyMatch.ts` 저장 후 PASS 확인**

```bash
bun run test src/test/utils/fuzzyMatch.test.ts
```

Expected: 5 tests pass

- [ ] **Step 5: `src/test/components/SentenceBuilderQuiz.test.tsx` 작성**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SentenceBuilderQuiz } from '../../components/quiz/SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'

const sentence = SENTENCES[0]
// { english: 'Coffee, please.', parts: ['커피','주세요'], distractors: ['설탕','물'] }

describe('SentenceBuilderQuiz — 타일 모드', () => {
  it('영어 목표 문장이 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByText('Coffee, please.')).toBeInTheDocument()
  })

  it('타일 4개가 모두 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByText('커피')).toBeInTheDocument()
    expect(screen.getByText('주세요')).toBeInTheDocument()
    expect(screen.getByText('설탕')).toBeInTheDocument()
    expect(screen.getByText('물')).toBeInTheDocument()
  })

  it('정답 순서로 탭 후 확인 → onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 탭 제출 → 다음 버튼 표시, onCorrect 미호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByRole('button', { name: /다음/i })).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
  })
})

describe('SentenceBuilderQuiz — 타이핑 모드', () => {
  it('입력 필드가 존재한다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByPlaceholderText(/직접 입력/i)).toBeInTheDocument()
  })

  it('정확한 타이핑 → "완벽해요" 피드백 + onCorrect 호출', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'Coffee, please.')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/완벽해요/i)).toBeInTheDocument()
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('유사 타이핑 (오타) → "거의 맞아요" + 정답 안내 표시', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'Coffe please')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/거의 맞아요/i)).toBeInTheDocument()
    expect(screen.getByText(/Coffee, please\./i)).toBeInTheDocument()
    expect(onCorrect).toHaveBeenCalledTimes(1) // 퍼지 정답도 onCorrect 호출
  })

  it('완전 오답 타이핑 → "정답:" 안내, onCorrect 미호출', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'xyz wrong')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/정답:/i)).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: 테스트 실행 → FAIL 확인**

```bash
bun run test src/test/components/SentenceBuilderQuiz.test.tsx
```

Expected: FAIL (컴포넌트 없음)

- [ ] **Step 7: `src/components/quiz/SentenceBuilderQuiz.tsx` 작성**

```typescript
import { useState, useRef } from 'react'
import type { SentenceItem } from '../../types'
import { evaluateTyped } from '../../utils/fuzzyMatch'
import { shuffle } from '../../utils/quizHelpers'  // DRY: 로컬 shuffle 제거

interface Props {
  sentence: SentenceItem
  onCorrect: () => void
}

type InputMode = 'tile' | 'type'

export function SentenceBuilderQuiz({ sentence, onCorrect }: Props) {
  const [tiles] = useState(() => shuffle([...sentence.parts, ...sentence.distractors]))
  const [selected, setSelected] = useState<string[]>([])
  const [typedValue, setTypedValue] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('tile')
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<'exact' | 'fuzzy' | 'wrong' | 'tile-correct' | 'tile-wrong' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTileClick = (tile: string) => {
    if (checked) return
    setInputMode('tile')
    setTypedValue('')
    setSelected(prev => [...prev, tile])
  }

  const handleSlotClick = (index: number) => {
    if (checked) return
    setSelected(prev => prev.filter((_, i) => i !== index))
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedValue(e.target.value)
    if (e.target.value.length > 0) {
      setInputMode('type')
      setSelected([])
    } else {
      setInputMode('tile')
    }
  }

  const handleCheck = () => {
    if (inputMode === 'type') {
      const r = evaluateTyped(typedValue, sentence.english)
      setResult(r)
      setChecked(true)
      if (r === 'exact' || r === 'fuzzy') onCorrect()
    } else {
      const correct = JSON.stringify(selected) === JSON.stringify(sentence.parts)
      setResult(correct ? 'tile-correct' : 'tile-wrong')
      setChecked(true)
      if (correct) onCorrect()
    }
  }

  const hasInput = inputMode === 'tile' ? selected.length > 0 : typedValue.length > 0

  // 선택된 타일 제외: usedCounts로 중복 타일도 정확히 처리
  const usedCounts: Record<string, number> = {}
  for (const t of selected) usedCounts[t] = (usedCounts[t] ?? 0) + 1
  const displayTiles = tiles.filter(t => {
    const used = usedCounts[t] ?? 0
    if (used > 0) { usedCounts[t]!--; return false }
    return true
  })

  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      {/* 목표 문장 */}
      <div className="text-center text-base font-bold text-blue-700 bg-blue-50 rounded-lg p-3">
        {sentence.english}
      </div>

      {/* 타일 슬롯 */}
      <div
        className={`flex flex-wrap gap-2 min-h-[44px] rounded-lg p-2 border border-dashed
          ${inputMode === 'type' ? 'opacity-40' : 'bg-gray-50 border-gray-300'}`}
      >
        {selected.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleSlotClick(i)}
            disabled={checked || inputMode === 'type'}
            className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold"
          >
            {tile}
          </button>
        ))}
      </div>

      {/* 구분선 + 타이핑 입력 */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        또는 직접 입력
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typedValue}
        onChange={handleTypeChange}
        disabled={checked}
        placeholder="직접 입력해보세요"
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base
          focus:border-blue-400 focus:outline-none disabled:bg-gray-50"
      />

      {/* 피드백 */}
      {checked && result && (
        <div className={`text-center text-sm font-bold rounded-lg p-2
          ${result === 'exact' || result === 'tile-correct'
            ? 'text-green-700 bg-green-50'
            : result === 'fuzzy'
            ? 'text-blue-700 bg-blue-50'
            : 'text-red-600 bg-red-50'}`}
        >
          {result === 'exact' && '✓ 완벽해요! 👍'}
          {result === 'tile-correct' && '✓ 완성했어요! 👍'}
          {result === 'fuzzy' && `거의 맞아요! 정확한 표현: ${sentence.english}`}
          {(result === 'wrong' || result === 'tile-wrong') && `정답: ${sentence.english}`}
        </div>
      )}

      {/* 타일 선택 영역 */}
      <div className={`flex flex-wrap gap-2 flex-1 content-start
        ${inputMode === 'type' ? 'opacity-40' : ''}`}
      >
        {displayTiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(tile)}
            disabled={checked || inputMode === 'type'}
            className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm
              font-semibold disabled:opacity-50 hover:border-blue-300"
          >
            {tile}
          </button>
        ))}
      </div>

      {/* 확인 / 다음 버튼 */}
      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!hasInput}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-base
            disabled:bg-gray-300"
        >
          확인
        </button>
      ) : (
        <button
          onClick={onCorrect}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-base"
        >
          다음 ▶
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 8: QuizStep.tsx에 sentence-builder 분기 추가**

`src/components/quiz/QuizStep.tsx` 상단 import 블록에 추가:

```typescript
import { SentenceBuilderQuiz } from './SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'
```

`// sentence-builder 분기는 Task 10 Step 8에서 추가` 주석을 제거하고 그 자리에 추가:

```typescript
  if (assignment.type === 'sentence-builder') {
    const sentence = SENTENCES[wordIndex % SENTENCES.length]
    return <SentenceBuilderQuiz sentence={sentence} onCorrect={handleCorrect} />
  }
```

- [ ] **Step 9: 전체 테스트 실행 → PASS 확인**

```bash
bun run test src/test/utils/fuzzyMatch.test.ts src/test/components/SentenceBuilderQuiz.test.tsx
```

Expected: 9 tests pass (fuzzy 5 + quiz 4)

- [ ] **Step 10: Commit**

```bash
git add src/data/sentences.ts src/utils/fuzzyMatch.ts src/components/quiz/SentenceBuilderQuiz.tsx src/components/quiz/QuizStep.tsx src/test/utils/fuzzyMatch.test.ts src/test/components/SentenceBuilderQuiz.test.tsx
git commit -m "feat: SentenceBuilderQuiz with tile selection + typing (fuzzy match ≥75%)"
```

---

## Task 11: StudySession 페이지

**Files:**
- Create: `src/pages/StudySession.tsx`
- Create: `src/test/components/StudySession.test.tsx`

- [ ] **Step 1: 테스트 작성**

```typescript
// src/test/components/StudySession.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { StudySession } from '../../pages/StudySession'

function renderSession(path: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/alphabet/:id" element={<StudySession mode="alphabet" />} />
          <Route path="/words/:id" element={<StudySession mode="words" />} />
          <Route path="/complete" element={<div>complete</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('StudySession', () => {
  it('알파벳 A: Step 1 FlashCard 렌더링', () => {
    renderSession('/alphabet/A')
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('사과')).toBeInTheDocument()
  })

  it('"다음 ▶" 클릭 시 Step 2로 이동', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(screen.getByText(/퀴즈|맞춰|고르/)).toBeInTheDocument()
  })

  it('X 버튼 클릭 시 나가기 확인 다이얼로그 표시', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByLabelText('학습 나가기'))
    expect(screen.getByText('학습을 나가시겠어요?')).toBeInTheDocument()
    expect(screen.getByText('계속 학습')).toBeInTheDocument()
    expect(screen.getByText('나가기')).toBeInTheDocument()
  })

  it('다이얼로그 "계속 학습" 클릭 시 다이얼로그 닫힘', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByLabelText('학습 나가기'))
    fireEvent.click(screen.getByText('계속 학습'))
    expect(screen.queryByText('학습을 나가시겠어요?')).not.toBeInTheDocument()
  })

  it('존재하지 않는 id: "항목을 찾을 수 없습니다" 표시', () => {
    renderSession('/alphabet/NOTEXIST')
    expect(screen.getByText('항목을 찾을 수 없습니다')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

```bash
bun run test:run src/test/components/StudySession.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `src/pages/StudySession.tsx` 작성**

```typescript
import { useState, useCallback } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
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

  // 브라우저 뒤로가기 차단 (학습 중 실수 방지)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    phase === 'study' && currentLocation.pathname !== nextLocation.pathname
  )

  const allItems: StudyItem[] = mode === 'alphabet' ? ALPHABET : WORDS
  const itemIndex = allItems.findIndex(i => i.id === id)
  const item = allItems[itemIndex]

  if (!item) return <div className="p-8 text-center text-gray-500">항목을 찾을 수 없습니다</div>

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
      // 세션 마지막 항목 완료
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

  // ── 복습 라운드 ──
  if (phase === 'review') {
    const reviewItem = wrongItems[reviewIndex]
    const choices = buildChoices(reviewItem, allItems, 4)
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col max-w-md mx-auto">
        <div className="bg-orange-500 text-white text-center py-3 font-bold text-lg">
          🔁 틀린 문제 다시 풀기
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

  // ── 일반 학습 ──
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* 나가기 확인 다이얼로그 */}
      {(showExitDialog || blocker.state === 'blocked') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 shadow-xl">
            <p className="text-lg font-bold text-gray-800 mb-2">학습을 나가시겠어요?</p>
            <p className="text-sm text-gray-500 mb-4">진도는 저장됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowExitDialog(false); blocker.reset?.() }}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700"
              >
                계속 학습
              </button>
              <button
                onClick={() => { blocker.proceed?.(); navigate('/') }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 헤더: X 버튼 + 진행 표시 */}
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

```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

```bash
bun run test:run src/test/components/StudySession.test.tsx
```

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/StudySession.tsx src/test/components/StudySession.test.tsx
git commit -m "feat: StudySession with X button + useBlocker + review round"
```

---

## Task 12: Home 페이지

**Files:**
- Create: `src/pages/Home.tsx`

- [ ] **Step 1: `src/pages/Home.tsx` 작성**

```typescript
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'
import { WORDS } from '../data/words'
import { StreakCard } from '../components/StreakCard'
import { ProgressCard } from '../components/ProgressCard'

export function Home() {
  const navigate = useNavigate()
  const { progress, isPhraseUnlocked } = useApp()

  function handleStart() {
    const nextAlphabet = ALPHABET.find(a => !progress.alphabetProgress.includes(a.id))
    if (nextAlphabet) { navigate(`/alphabet/${nextAlphabet.id}`); return }
    const nextWord = WORDS.find(w => !progress.wordProgress.includes(w.id))
    if (nextWord) navigate(`/words/${nextWord.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="bg-blue-500 px-4 pt-10 pb-10 text-center text-white">
        <h1 className="text-3xl font-bold">Easy English</h1>
        <p className="text-blue-100 mt-1">오늘도 5분 영어!</p>
      </div>

      <StreakCard streak={progress.streak} />

      <div className="p-4 flex flex-col gap-3 mt-4">
        <ProgressCard
          emoji="🔤"
          title="알파벳"
          subtitle="A ~ Z, 26자"
          current={progress.alphabetProgress.length}
          total={26}
          onClick={() => {
            const next = ALPHABET.find(a => !progress.alphabetProgress.includes(a.id))
            if (next) navigate(`/alphabet/${next.id}`)
          }}
        />
        <ProgressCard
          emoji="📖"
          title="단어"
          subtitle="기초 단어 100개"
          current={progress.wordProgress.length}
          total={100}
          onClick={() => {
            const next = WORDS.find(w => !progress.wordProgress.includes(w.id))
            if (next) navigate(`/words/${next.id}`)
          }}
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

      <div className="px-4 mt-2">
        <button
          onClick={handleStart}
          className="w-full py-5 bg-primary text-white text-2xl font-bold rounded-2xl"
        >
          오늘 학습 시작 ▶
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/test/pages/Home.test.tsx` 작성**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { Home } from '../../pages/Home'

function renderHome() {
  return render(
    <AppProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Home', () => {
  it('제목과 3개 진도 카드 렌더링', () => {
    renderHome()
    expect(screen.getByText('Easy English')).toBeInTheDocument()
    expect(screen.getByText('알파벳')).toBeInTheDocument()
    expect(screen.getByText('단어')).toBeInTheDocument()
    expect(screen.getByText('회화')).toBeInTheDocument()
  })

  it('"오늘 학습 시작" 버튼 존재', () => {
    renderHome()
    expect(screen.getByText('오늘 학습 시작 ▶')).toBeInTheDocument()
  })

  it('회화 카드는 잠금 상태 (단어 50개 미완료)', () => {
    renderHome()
    const lockIcon = screen.getByText('🔒')
    expect(lockIcon).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: 테스트 실행**

```bash
bun run test:run src/test/pages/Home.test.tsx
```

Expected: 3 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/test/pages/Home.test.tsx
git commit -m "feat: Home page + tests (streak, progress cards, smart start button)"
```

---

## Task 13: 목록 페이지 + 완료 화면

**Files:**
- Create: `src/pages/AlphabetList.tsx`
- Create: `src/pages/WordList.tsx`
- Create: `src/pages/Complete.tsx`

- [ ] **Step 1: `src/pages/AlphabetList.tsx` 작성**

```typescript
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ALPHABET } from '../data/alphabet'

export function AlphabetList() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">알파벳</h2>
      <div className="grid grid-cols-4 gap-3">
        {ALPHABET.map(item => {
          const done = progress.alphabetProgress.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/alphabet/${item.id}`)}
              className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-2xl font-bold border-2 transition-colors ${
                done ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-800'
              }`}
            >
              {item.letter}
              {done && <span className="text-xs mt-1">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `src/pages/WordList.tsx` 작성**

```typescript
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { WORDS, WORD_CATEGORIES, CATEGORY_LABELS } from '../data/words'

export function WordList() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">단어</h2>
      {WORD_CATEGORIES.map(cat => {
        const catWords = WORDS.filter(w => w.category === cat)
        const doneCount = catWords.filter(w => progress.wordProgress.includes(w.id)).length
        return (
          <div key={cat} className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">{CATEGORY_LABELS[cat]}</h3>
              <span className="text-sm text-gray-400">{doneCount}/{catWords.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {catWords.map(word => {
                const done = progress.wordProgress.includes(word.id)
                return (
                  <button
                    key={word.id}
                    onClick={() => navigate(`/words/${word.id}`)}
                    className={`p-3 rounded-xl border-2 text-center transition-colors ${
                      done ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    <div className="text-2xl">{word.emoji}</div>
                    <div className="text-sm font-medium mt-1">{word.word}</div>
                    {done && <div className="text-xs text-green-500">✓</div>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: `src/pages/Complete.tsx` 작성**

```typescript
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function Complete() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">오늘 학습 완료!</h2>
      <p className="text-gray-500 mb-6">정말 잘했어요 👏</p>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full mb-8">
        <div className="text-5xl font-bold text-orange-500">🔥 {progress.streak}일</div>
        <div className="text-gray-500 mt-1">연속 학습 중</div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full py-5 bg-primary text-white text-2xl font-bold rounded-2xl"
      >
        홈으로
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/AlphabetList.tsx src/pages/WordList.tsx src/pages/Complete.tsx
git commit -m "feat: AlphabetList, WordList, Complete pages"
```

---

## Task 14: App 라우터 + 최종 빌드

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: `src/App.tsx` 작성**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Home } from './pages/Home'
import { AlphabetList } from './pages/AlphabetList'
import { WordList } from './pages/WordList'
import { StudySession } from './pages/StudySession'
import { Complete } from './pages/Complete'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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

- [ ] **Step 2: `src/main.tsx` 작성**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: 전체 테스트 실행**

```bash
bun run test:run
```

Expected: 35+ tests pass, 0 failures

- [ ] **Step 4: 개발 서버 실행 및 동작 확인**

```bash
bun run dev
```

브라우저에서 `http://localhost:5173` 열어 확인:
- [ ] 홈 화면: 스트릭 카드, 진도 카드 3개, "오늘 학습 시작" 버튼 (bg-primary 색상 확인)
- [ ] 알파벳 A 세션: X버튼 → 다이얼로그 표시 확인
- [ ] 알파벳 A 세션: Step 1 카드 → Step 2 퀴즈 → Step 3 발음 → 다음 알파벳
- [ ] 발음 버튼 클릭 시 TTS 재생 (Chrome 권장)
- [ ] 퀴즈 유형 4가지 순환 확인 (4번째 단어마다 sentence-builder)
- [ ] MatchingQuiz 오답 시 flash 애니메이션 (빨간 배경 0.4초) 확인
- [ ] 완료 화면 → 홈으로 복귀 후 스트릭 증가 확인
- [ ] Noto Sans KR 폰트 로드 확인 (Network 탭에서 fonts.googleapis.com 요청 확인)

- [ ] **Step 5: 프로덕션 빌드**

```bash
bun run build
```

Expected: `dist/` 폴더 생성, 빌드 에러 없음

- [ ] **Step 6: 최종 Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: App router — connect all pages and complete MVP"
```

---

## 스펙 커버리지 검증

| 스펙 요구사항 | 구현 태스크 | 상태 |
|---|---|---|
| 알파벳 26자 학습 (그림 + 소리) | Task 3, 6 (FlashCard + alphabet.ts) | ✅ |
| 기초 단어 100개 (그림·발음) | Task 3, 6 | ✅ |
| 퀴즈 유형 A — 그림 보고 선택 | Task 7 | ✅ |
| 퀴즈 유형 B — 단어 매칭 | Task 8 | ✅ |
| 퀴즈 유형 C — 소리 듣고 선택 | Task 9 | ✅ |
| 퀴즈 유형 D — 문장 조합 (타일 선택) | Task 10 | ✅ |
| 영어↔한글 방향 교차 노출 | Task 2 (quizAssignment) | ✅ |
| 틀려도 진행 가능 | Task 7, 8, 9, 10 | ✅ |
| 세션 완료 후 오답 복습 라운드 | Task 11 (StudySession review phase) | ✅ |
| 스트릭 표시 | Task 4, 12 | ✅ |
| localStorage 진도 저장 | Task 4 | ✅ |
| 회화 기능 잠금 (단어 50개 미만) | Task 4, 12 | ✅ |
| 큰 글씨 / 단순 UI | Task 6~13 (Tailwind) | ✅ |
| 최대 너비 480px 중앙 정렬 | Task 6~13 | ✅ |
| Web Speech API 미지원 안내 | Task 6 (PronunciationStep) | ✅ |


## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests | 1 | ISSUES_RESOLVED | 12 decisions, 0 blockers remaining |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES_RESOLVED | score: 5/10 → 8/10, 7 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**DESIGN:** 5→8/10. 결정: 타일 그리드 4열, X버튼+다이얼로그, 세션 배치방식, 매칭퀴즈 2열고정, Noto Sans KR, #1565C0(대비비수정), ARIA/iOS safe-area 추가.

**ENG (2026-05-13):** 12개 결정. 주요 수정: ① QuizStep Props(wordIndex+onWrong) 타입 에러 수정 ② ImageChoiceQuiz 복습Props 추가 ③ X버튼+useBlocker Task 11 추가 ④ shake→flash 전환(TODO-1 해결) ⑤ primary:#1565C0 Tailwind 커스텀 컬러 등록 ⑥ Noto Sans KR index.html 추가 ⑦ SentenceBuilderQuiz 데드코드+DRY 수정 ⑧ buildChoices useMemo ⑨ 테스트 GAP 보완(useSpeech+Home+StudySession placeholder 교체).

**VERDICT:** Design + Eng Review CLEAR — STEP 5 subagent-driven-development 착수 가능.
