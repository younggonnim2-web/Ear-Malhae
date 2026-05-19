# HANDOFF — Easy English App (Ear-Malhae)

> 최종 업데이트: 2026-05-19
> 상태: Phase 4 완료, 커밋 완료
> 테스트: **116개 전체 통과**
> 개발 서버: `http://localhost:5174`

---

## 현재 상태 요약

| 단계 | 상태 | 산출물 |
|------|------|--------|
| PRD + 옵션 탐색 | ✅ 완료 | `docs/prd/`, `docs/plans/` |
| 사이트맵 + 디자인 리뷰 | ✅ 완료 | `docs/wireframes/`, `docs/design-reviews/` |
| Phase 1: Duolingo 구조 | ✅ 완료 | Unit→Lesson→Challenge 구조 |
| Phase 2: Star+XP + 섹션 UI | ✅ 완료 | LearningPath, SectionPath, FillBlankQuiz |
| Phase 3: 섹션 5단계 재편 | ✅ 완료 | rookie/explorer/traveler/challenger/master |
| Phase 4: 퀴즈 UX + 데이터 품질 | ✅ 완료 | 116개 테스트 통과 |

---

## Phase 2 누적 구현

### 1. 듀오링고 스타일 퀴즈 전면 재설계

#### ImageChoiceQuiz (`src/components/quiz/ImageChoiceQuiz.tsx`)
- **cards 모드**: 이모지 카드 3개 + 번호 배지 + 선택→확인→결과→다음 플로우
- **list 모드**: CharacterBubble + 번호 리스트
- 카드 선택 시 해당 단어 영어 발음

#### ListenChoiceQuiz (`src/components/quiz/ListenChoiceQuiz.tsx`)
- 정사각형 파란 버튼 2개: 🔊 (보통 속도) + 🐢 (0.5배속)
- 칩 스타일 선택지 (rounded-full)

#### SentenceBuilderQuiz (`src/components/quiz/SentenceBuilderQuiz.tsx`)
- 타일 전용 (타이핑 모드 제거)
- **양방향**: `direction: 'en-to-ko' | 'ko-to-en'`
- 타일 클릭 시 `sentence.englishParts[idx]` 매핑으로 영어 발음
- `onWrong` prop → 오답 시 retryQueue 적재

#### FillBlankQuiz (`src/components/quiz/FillBlankQuiz.tsx`) — 신규
- 영어 문장 + 한국어 빈칸 + 3개 선택지 (Tier 1부터 등장)

#### MatchingQuiz, CharacterBubble, TagBadge
- 번호 배지 순차 부여 (왼쪽 1~N, 오른쪽 N+1~2N)
- CharacterBubble: onSpeak 있으면 세로, 없으면 가로
- TagBadge: 새로운 단어(보라) / 어려운 연습(빨강) / 새로운 패턴(주황)

### 2. 레슨 시퀀스 4단계 난이도 (`src/utils/lessonSequence.ts`)

| Tier | 특성 | 총 문제 수 (N=5) |
|------|------|----------------|
| 0 | 카드+이미지 중심 | 19 |
| 1 | 역방향 이미지 추가 | 22 |
| 2 | 양방향 전체 | 26 |
| 3 | 듣기+문장 중심 | 23 |

- `effectiveTier = Math.min(sectionBaseTier + completionCount, 3)`

### 3. Star + XP 시스템

#### `src/utils/xp.ts`
```typescript
STAR_XP = { 1: 10, 2: 20, 3: 30 }
LEVEL_THRESHOLDS = [0, 100, 250, 500, 660]  // Lv1~5
```

#### `src/context/AppContext.tsx`
- `markLessonDone(id, stars: 1|2|3)` — 오답 수 기반 별점 저장
- `lessonStars: Record<string, 1|2|3>` — 레슨별 최고 별점 유지
- `totalXp / currentLevel / xpToNextLevel` — useMemo 파생
- `lessonCompletionCount: Record<string, number>` — 반복 횟수 (Tier 결정)

#### `src/pages/LessonSession.tsx`
- `wrongCount` state: 0개=3성, 1~2개=2성, 3개+=1성
- `navigate('/complete', { state: { stars, xpGained } })`

#### `src/pages/Complete.tsx`
- 별점 카드 (★/☆) + +N XP 카드 + 레벨 진행 바

### 4. 학습 경로 UI

#### `src/pages/LearningPath.tsx` (`/`)
- 섹션 카드 목록 (세로 스크롤)
- 활성: 파란 배경 + 진행률 바 + "계속하기"
- 잠김: 회색 + 🔒 유닛 수 + "섹션 N(으)로 이동하기"
- 완료: 초록 + "다시 연습하기"

#### `src/pages/SectionPath.tsx` (`/section/:sectionId`)
- 섹션 색상 스티키 헤더
- 유닛별 구분선 pill (이모지 + 유닛명)
- 지그재그 레슨 버블 (ZIGZAG = [50, 67, 50, 33])
- 버블 상태: 🔒 잠김 / ▶ 현재(pulse) / 이모지 미완료 / 이모지 완료(초록)
- 별점 3개 표시

---

## Phase 3 — 섹션 구조 재편 (2026-05-19)

### 섹션 구조 (`src/data/sections.ts`)

**변경 이유**: 기존 주제 기반 4섹션 → 듀오링고와 같이 섹션=난이도 대분류, 유닛=주제 소분류로 재편.

**현재 구조** (5개 난이도 섹션):

| 섹션 ID | 이름 | 포함 유닛 | baseTier |
|---------|------|---------|----------|
| `rookie` | 입문 | alphabet, daily | 0 |
| `explorer` | 탐험가 | number, fruit, animal | 1 |
| `traveler` | 여행자 | color, body, food, place | 1 |
| `challenger` | 도전자 | family, weather, feeling | 2 |
| `master` | 마스터 | transport, health | 2 |

**baseTier**: 섹션 기본 난이도. `effectiveTier = Math.min(baseTier + completionCount, 3)`로 재수강 시 상승.

### JumpTest (`src/pages/JumpTest.tsx`)
- 섹션 건너뛰기 테스트 (`/jump-test/:idx`)
- 인트로 화면 (섹션 이름 + 설명)
- 영어 fill-blank 문제 10개
- 통과 시 해당 섹션 잠금 해제

---

## Phase 4 — 퀴즈 UX + 데이터 품질 (2026-05-19)

### 4-1. 퀴즈 확인 플로우 통일
- **모든 퀴즈**: 선택 → 확인 버튼 → 피드백 → 다음 (즉시 자동 판정 제거)
- ImageChoiceQuiz: 선택 후 자동 넘어가기 제거, 확인 버튼 필수

### 4-2. WordItem.sentence 필드 추가 (`src/types/index.ts`, `src/data/words.ts`)

형용사/상태 단어에 `sentence?: string` 필드 추가:

| 카테고리 | 패턴 | 예시 |
|----------|------|------|
| weather | "It's [word]" | `foggy` → `"It's foggy"` |
| feeling | "I'm [word]" | `angry` → `"I'm angry"` |
| daily (형용사) | "It's/I'm [word]" | `good` → `"It's good"` |
| health (상태) | 개별 | `sick` → `"I'm sick"`, `fever` → `"I have a fever"` |

퀴즈 레이블/질문에서 `item.sentence ?? item.word` 사용:
- `ImageChoiceQuiz`: `getChoiceLabel`, `getQuestionWord`
- `ListenChoiceQuiz`: `getChoiceLabel`, TTS 발화 word

### 4-3. SentenceItem.category 필드 추가 (`src/types/index.ts`, `src/data/sentences.ts`)

`SentenceItem.category?: WordItem['category']` — 문장을 유닛에 태그:

| category | 문장 예시 |
|----------|-----------|
| (없음 = 범용) | "It's hot", "Thank you", "Let's go" 등 9개 |
| color | "It's red", "I like blue", "I like red" |
| animal | "I like cats", "It's a dog", "I see a bird" |
| food | "I like milk", "Coffee please", "Water please", "I want bread" |
| number | "One, please" |
| family | "She is my mother", "I love my family", "He is my brother" |
| weather | "It's sunny today", "It's raining", "It's very windy" |
| feeling | "I'm angry", "I'm tired", "I'm excited" |
| transport | "I go by bus", "Take the subway", "The train is fast" |
| health | "I feel sick", "See a doctor", "Take your medicine" |

총 35개 문장 (9 범용 + 카테고리별 3개씩 10카테고리 = 26개 + 1개 number).

### 4-4. relevantSentences 필터링 (`src/pages/LessonSession.tsx`)

```typescript
const relevantSentences = useMemo(() => {
  const unitId = lesson?.unitId
  if (!unitId) return SENTENCES
  return SENTENCES.filter(s => !s.category || s.category === unitId)
}, [lesson?.unitId])
```

감정 유닛에서 색상/날씨 문장이 섞이던 문제 해결.

### 4-5. reviewItems 범위 축소 (`src/pages/LessonSession.tsx`)

```typescript
// 같은 섹션에서 현재 유닛 앞 유닛만 복습
const currentUnitIdx = currentSection.unitIds.indexOf(lesson.unitId)
const sameSectionPrev = currentSection.unitIds.slice(0, currentUnitIdx)
if (sameSectionPrev.length > 0) {
  return WORDS.filter(w => sameSectionPrev.includes(w.category))
}
// 섹션 첫 유닛: 직전 섹션 마지막 유닛만
if (sectionIndex > 0) {
  const prevSection = SECTIONS[sectionIndex - 1]
  const lastUnitId = prevSection.unitIds[prevSection.unitIds.length - 1]
  return WORDS.filter(w => w.category === lastUnitId)
}
```

**이전**: 모든 선행 섹션 단어 → 감정 유닛에서 color 단어가 복습으로 등장  
**현재**: 같은 섹션 이전 유닛만 (섹션 첫 유닛이면 직전 섹션 마지막 유닛만)

### 4-6. Distractor 품질 개선 (`src/utils/quizHelpers.ts`, `src/data/sentences.ts`)

- 의미적 유사 카테고리 우선: `RELATED_CATEGORIES` 맵 참조
- 빈칸 단어와 distractors 반드시 같은 품사/형태
- **복수 정답 방지**: 소유격(우리/나의/그의) → 빈칸을 명사("오빠예요")로 이동

### 4-7. fill-blank 복수 정답 수정 (`src/data/sentences.ts`)

가족 문장 blank 위치 변경:
```
변경 전: "그는 [우리] 오빠예요" (우리/나의/그의 모두 정답 가능)
변경 후: "그는 우리 [오빠예요]" (distractors: 언니예요, 할머니예요)
```

### 4-8. unitSeed 문장 오프셋 (`src/utils/lessonSequence.ts`)

`unitSeed(unitId)` = unitId 문자코드 합산 → 유닛마다 다른 fill-blank 문장 시작점.

---

## 섹션 구조 (현재)

| 섹션 ID | 이름 | 유닛 | baseTier |
|---------|------|------|----------|
| `rookie` | 입문 | alphabet, daily | 0 |
| `explorer` | 탐험가 | number, fruit, animal | 1 |
| `traveler` | 여행자 | color, body, food, place | 1 |
| `challenger` | 도전자 | family, weather, feeling | 2 |
| `master` | 마스터 | transport, health | 2 |

---

## 라우팅

```
/                    → LearningPath (섹션 카드 목록)
/section/:sectionId  → SectionPath (유닛별 레슨 경로)
/lesson/:lessonId    → LessonSession
/complete            → Complete (별점 + XP + 레벨)
/jump-test/:idx      → JumpTest (섹션 건너뛰기 테스트)
/units               → UnitMap
/alphabet            → AlphabetList
/words               → WordList
```

---

## 핵심 파일 위치

| 파일 | 설명 |
|------|------|
| `src/data/sections.ts` | 5개 섹션 정의 (baseTier 포함) |
| `src/data/words.ts` | 130개 단어 (sentence? 필드 포함) |
| `src/data/sentences.ts` | 35개 문장 (category? 필드 포함) |
| `src/utils/lessonSequence.ts` | buildChallengeSequence (Tier 0~3) |
| `src/utils/quizHelpers.ts` | buildChoices, RELATED_CATEGORIES |
| `src/pages/LessonSession.tsx` | 레슨 실행 (relevantSentences, reviewItems) |
| `src/pages/JumpTest.tsx` | 섹션 건너뛰기 테스트 |
| `src/pages/LearningPath.tsx` | 섹션 카드 목록 |
| `src/pages/SectionPath.tsx` | 유닛별 레슨 경로 |

---

## 파일 구조

```
src/
├── components/
│   ├── CharacterBubble.tsx
│   ├── FlashCard.tsx
│   ├── ProgressBar.tsx
│   ├── ProgressCard.tsx
│   ├── PronunciationStep.tsx
│   ├── StreakCard.tsx
│   ├── TagBadge.tsx
│   └── quiz/
│       ├── FillBlankQuiz.tsx       ← Phase 2 신규
│       ├── ImageChoiceQuiz.tsx     ← Phase 4 수정
│       ├── ListenChoiceQuiz.tsx    ← Phase 4 수정
│       ├── MatchingQuiz.tsx
│       ├── QuizStep.tsx
│       └── SentenceBuilderQuiz.tsx
├── context/
│   └── AppContext.tsx              ← Phase 2 수정
├── data/
│   ├── alphabet.ts
│   ├── lessons.ts
│   ├── sections.ts                 ← Phase 3 재편, Phase 4 baseTier
│   ├── sentences.ts                ← Phase 4 category 태그 + distractor 수정
│   ├── units.ts
│   └── words.ts                    ← Phase 4 sentence? 필드 추가
├── pages/
│   ├── AlphabetList.tsx
│   ├── Complete.tsx                ← Phase 2 재작성
│   ├── Home.tsx                    ← Phase 2 수정
│   ├── JumpTest.tsx                ← Phase 3 신규
│   ├── LearningPath.tsx            ← Phase 2 신규, Phase 3 수정
│   ├── LessonSession.tsx           ← Phase 2, Phase 4 수정
│   ├── SectionPath.tsx             ← Phase 2 신규
│   ├── StudySession.tsx
│   ├── UnitMap.tsx                 ← Phase 2 수정
│   └── WordList.tsx
├── types/
│   ├── index.ts                    ← Phase 4 수정 (sentence?, category?)
│   └── lesson.ts
└── utils/
    ├── cn.ts
    ├── lessonSequence.ts           ← Phase 2, Phase 4 수정 (unitSeed)
    ├── quizAssignment.ts
    ├── quizHelpers.ts              ← Phase 4 수정 (RELATED_CATEGORIES)
    ├── streak.ts
    └── xp.ts                      ← Phase 2 신규
```

---

## 다음 단계 후보

1. **레슨 완료 후 네비게이션**: `/complete` → 홈 대신 해당 섹션 경로(`/section/:id`)로 복귀
2. **섹션 잠금 해제 애니메이션**: 섹션 완료 시 축하 이펙트
3. **가이드북 기능**: SectionPath 우상단 버튼 → 해당 유닛 단어 목록
4. **숫자 유닛 레슨 데이터**: 현재 `number` 유닛 레슨 없음
5. **오프라인 지원**: PWA + Service Worker
