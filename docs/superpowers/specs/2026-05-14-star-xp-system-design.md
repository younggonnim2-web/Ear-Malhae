# Star + XP 시스템 설계 (Phase 2)

> 작성일: 2026-05-14  
> 상태: 승인됨

---

## 1. 개요

레슨 완료 후 오답 수 기반으로 1~3성을 부여하고, 성에 따라 XP를 지급한다.
누적 XP로 1~5레벨을 산정하여 Complete / UnitMap / Home 화면에 노출한다.

---

## 2. 별 평가 기준

| 오답 수 (retryQueue 누적) | 별점 | XP |
|--------------------------|------|----|
| 0개                      | ★★★  | 30 |
| 1~2개                    | ★★☆  | 20 |
| 3개 이상                 | ★☆☆  | 10 |

- 오답 수는 `LessonSession`의 `wrongCount` state로 추적
- 리플레이 시 기존 별점보다 높을 때만 `lessonStars` 업데이트 (최고점 유지)

---

## 3. 레벨 시스템

| 레벨 | 누적 XP 범위 |
|------|-------------|
| Lv.1 | 0 ~ 99      |
| Lv.2 | 100 ~ 249   |
| Lv.3 | 250 ~ 499   |
| Lv.4 | 500 ~ 899   |
| Lv.5 | 900+        |

임계값 배열: `[0, 100, 250, 500, 900]`

---

## 4. 데이터 모델

### 4-1. AppStorage (src/types/index.ts)

```typescript
export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
  lessonProgress: string[]                    // 기존 유지 (하위 호환)
  lessonStars: Record<string, 1 | 2 | 3>     // 신규
}
```

기존 localStorage에 `lessonStars`가 없으면 `loadStorage()`의 spread가 `{}` 기본값으로 자동 채운다.

### 4-2. AppContextValue (src/types/index.ts)

```typescript
export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  markLessonDone: (id: string, stars: 1 | 2 | 3) => void  // stars 파라미터 추가
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
  totalXp: number           // computed
  currentLevel: number      // 1~5, computed
  xpToNextLevel: number | null  // null = 최고 레벨(Lv5)
}
```

---

## 5. 신규 유틸리티 (src/utils/xp.ts)

```typescript
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900] as const
const STAR_XP = { 1: 10, 2: 20, 3: 30 } as const

export function calcXp(stars: Record<string, 1 | 2 | 3>): number
export function calcLevel(xp: number): number        // 1~5
export function calcXpToNext(xp: number): number | null  // null = Lv5
```

---

## 6. 변경 파일 목록

### 신규
| 파일 | 역할 |
|------|------|
| `src/utils/xp.ts` | XP 계산, 레벨 계산 순수 함수 |
| `src/test/utils/xp.test.ts` | xp 유틸 테스트 |

### 수정
| 파일 | 변경 내용 |
|------|----------|
| `src/types/index.ts` | `AppStorage.lessonStars`, `AppContextValue` computed 필드 추가 |
| `src/context/AppContext.tsx` | `markLessonDone(id, stars)`, `totalXp` / `currentLevel` / `xpToNextLevel` computed |
| `src/pages/LessonSession.tsx` | `wrongCount` state 추가, `navigate('/complete', { state })` |
| `src/pages/Complete.tsx` | 별 카드 + XP 카드 + 레벨 바 추가 |
| `src/pages/UnitMap.tsx` | 헤더에 레벨/XP 바, 레슨 버튼에 별 표시 |
| `src/pages/Home.tsx` | 진도 카드에 Lv + XP 한 줄 추가 |
| `src/test/utils/xp.test.ts` | 신규 |
| `src/test/context/AppContext.test.tsx` | `markLessonDone` 시그니처 변경 반영 |
| `src/test/pages/LessonSession.test.tsx` | `wrongCount` + navigate state 검증 |
| `src/test/pages/Complete.test.tsx` | state 유/무 분기 렌더 검증 |

---

## 7. 로직 상세

### LessonSession.tsx
```typescript
const [wrongCount, setWrongCount] = useState(0)

const handleWrong = useCallback((challenge: LessonChallenge) => {
  setWrongCount(c => c + 1)
  setRetryQueue(prev => [...prev, { ...challenge }])
}, [])

// advance() — 레슨 완료 분기
// STAR_XP는 src/utils/xp.ts에서 import
const stars: 1 | 2 | 3 = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
markLessonDone(lessonId, stars)
updateStreak()
navigate('/complete', { state: { stars, xpGained: STAR_XP[stars] } })
```

### AppContext.tsx — markLessonDone
```typescript
function markLessonDone(id: string, stars: 1 | 2 | 3) {
  setProgress(prev => {
    const prevStars = prev.lessonStars[id] ?? 0
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

### AppContext.tsx — computed values
```typescript
const totalXp = useMemo(() => calcXp(progress.lessonStars), [progress.lessonStars])
const currentLevel = useMemo(() => calcLevel(totalXp), [totalXp])
const xpToNextLevel = useMemo(() => calcXpToNext(totalXp), [totalXp])
```

---

## 8. UI 상세

### Complete 페이지
```
🎉 오늘 학습 완료!

★ ★ ★            ← navigation state.stars 기반 (★/☆ 혼합)
+30 XP

총 XP: 120 / 250  ← xpToNextLevel이 null이면 "MAX" 표시
Lv.2 ████████░░░░

🔥 3일 연속 학습 중

[홈으로]
```
navigation state 없이 직접 접근 시 별/XP 카드 련더링 생략.

### UnitMap 페이지 헤더
```
학습 맵                    Lv.2
██████████░░░░░  120 XP  (다음 레벨까지 130 XP)
```
Lv.5(최고 레벨) 시: XP 바 100% + "MAX" 텍스트 표시, xpToNextLevel 문구 생략.

### UnitMap 레슨 버튼
- 완료: `✓ ★★★ 레슨1` (채워진 별 / 빈 별 조합)
- 다음: 기존 primary 스타일 유지
- 잠금: 기존 muted 스타일 유지

### Home 페이지
기존 진도 카드에 한 줄 추가:
```
Lv.2 · 120 XP
레슨 진행: 3/22
```

---

## 9. 테스트 계획

### 신규 (src/test/utils/xp.test.ts) — 약 10개
- `calcXp`: 빈 맵 → 0, 단일 레슨 1/2/3성, 복합, 리플레이 최고점
- `calcLevel`: 경계값 (0, 99, 100, 249, 250, 499, 500, 899, 900)
- `calcXpToNext`: Lv1~4 양수, Lv5 null

### 수정 (기존 테스트) — 약 5~10개
- `AppContext.test.tsx`: `markLessonDone(id, stars)` 시그니처
- `LessonSession.test.tsx`: wrongCount 누적 + navigate state
- `Complete.test.tsx`: state 유/무 분기

**목표: 기존 61개 + 신규 15~20개 = 76~81개 전체 통과**

---

## 10. 제외 범위 (YAGNI)

- 별점 달성 애니메이션 (Phase 3)
- 리더보드 / 소셜 기능
- XP 부스트 아이템
- 일일 XP 한도
