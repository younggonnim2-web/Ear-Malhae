# Project Rules Changelog

> 이 프로젝트(`Ear-Malhae`)의 구현 이력.
> 새 항목 추가 시 최신순(상단)으로 작성한다.

---

## 2026-05-19

### Phase 4 — 퀴즈 UX + 데이터 품질 개선

#### 목표
퀴즈 선택지의 UX 불일치(즉시 판정 vs 확인 버튼 혼용), 문법 오류가 있는 오답 선택지, 유닛 무관 문장 노출 등 데이터 품질 문제 일괄 수정.

#### 구현 요약
- **테스트:** 116개 전체 통과 (16개 테스트 파일)
- **빌드:** 정상

#### 구현된 기능

| 항목 | 파일 | 내용 |
|------|------|------|
| 퀴즈 확인 플로우 통일 | `ImageChoiceQuiz.tsx` | 전 퀴즈 선택→확인버튼→피드백 (즉시 판정 제거) |
| WordItem.sentence 필드 | `src/types/index.ts`, `src/data/words.ts` | 형용사/상태 단어에 문장형 추가 ("It's foggy") — weather(8), feeling(8), daily(9), health(4) |
| getChoiceLabel/getQuestionWord 수정 | `ImageChoiceQuiz.tsx`, `ListenChoiceQuiz.tsx` | `item.sentence ?? item.word` 사용 |
| SentenceItem.category 필드 | `src/types/index.ts`, `src/data/sentences.ts` | 유닛별 관련 문장 태그 (10카테고리 + 범용 9개) |
| relevantSentences 필터 | `LessonSession.tsx` | `SENTENCES.filter(s => !s.category \|\| s.category === unitId)` |
| reviewItems 범위 축소 | `LessonSession.tsx` | 같은 섹션 이전 유닛만 (전 섹션 전체 → 범위 축소) |
| Distractor 품질 개선 | `quizHelpers.ts`, `sentences.ts` | 의미적 유사 카테고리 우선, 같은 품사형 강제 |
| 복수 정답 수정 | `sentences.ts` | 소유격 blank → 가족 명사 blank로 위치 변경 |
| unitSeed 오프셋 | `lessonSequence.ts` | unitId 문자코드 합산으로 유닛마다 다른 문장 시작점 |
| 섹션 baseTier | `sections.ts`, `lessonSequence.ts` | sectionBaseTier + completionCount = effectiveTier |

#### WordItem.sentence 필드 상세

형용사/상태 단어는 퀴즈에서 단어 단독이 아닌 문장형으로 표시:
```typescript
{ id: 'foggy', word: 'foggy', meaning: '안개 끼었어요', sentence: "It's foggy" }
{ id: 'angry', word: 'angry', meaning: '화났어요', sentence: "I'm angry" }
{ id: 'sick', word: 'sick', meaning: '아파요', sentence: "I'm sick" }
```

#### SentenceItem.category 필드 상세

```typescript
// 범용 (모든 유닛에 노출)
{ id: 'its-hot', english: "It's hot", korean: '더워요', ... }

// 유닛 전용
{ id: 'its-sunny', english: "It's sunny today", category: 'weather', ... }
{ id: 'coffee-please', english: 'Coffee please', category: 'food', ... }
{ id: 'i-love-family', english: 'I love my family', category: 'family', ... }
```

#### 복수 정답 방지 예시

```
변경 전: "그는 [우리] 오빠예요" — 우리/나의/그의 모두 소유격 → 전부 정답
변경 후: "그는 우리 [오빠예요]" — distractors: 언니예요, 할머니예요
```

---

### Phase 3 — 섹션 5단계 재편 (2026-05-19)

#### 목표
기존 3섹션(입문/기초/생활영어) → 5섹션 난이도 기반 구조로 재편. 듀오링고와 같이 섹션=난이도 대분류, 유닛=주제 소분류.

#### 구현 요약
- **테스트:** 109개 전체 통과
- `src/data/sections.ts` 전면 재작성

#### 섹션 구조 변경

**이전 구조** (3개):
```
beginner     → [alphabet, number]
basic        → [fruit, animal, color, body]
intermediate → [food, daily, place]
```

**현재 구조** (5개):

| 섹션 ID | 이름 | 유닛 | baseTier |
|---------|------|------|----------|
| `rookie` | 입문 | alphabet, daily | 0 |
| `explorer` | 탐험가 | number, fruit, animal | 1 |
| `traveler` | 여행자 | color, body, food, place | 1 |
| `challenger` | 도전자 | family, weather, feeling | 2 |
| `master` | 마스터 | transport, health | 2 |

#### 추가된 기능

| 항목 | 파일 | 내용 |
|------|------|------|
| JumpTest 페이지 | `src/pages/JumpTest.tsx` | 섹션 건너뛰기 테스트 (`/jump-test/:idx`) |
| JumpTest 라우트 | `src/App.tsx` | `/jump-test/:idx` 추가 |
| 단어 확장 | `src/data/words.ts` | 90개 → 130개 (family, weather, feeling, transport, health 추가) |
| 섹션 메시지 | `LearningPath.tsx` | 5개 섹션 키 업데이트 |

---

## 2026-05-14

### Phase 2 — Star+XP 시스템 + Duolingo 섹션 UI

#### 목표
레슨 완료 후 별점(1~3성) 평가와 경험치 시스템 도입. 학습 경로를 Duolingo 스타일 섹션 카드 + 지그재그 버블로 재설계.

#### 구현 요약
- **테스트:** 91개 전체 통과
- **프로덕션 빌드:** 정상

#### 구현된 기능

| Task | 내용 | 파일 |
|------|------|------|
| Star + XP 시스템 | 별점 저장, 레벨 계산 | `src/utils/xp.ts` (신규) |
| AppContext 확장 | markLessonDone, lessonStars, totalXp, currentLevel, lessonCompletionCount | `AppContext.tsx` |
| LessonSession 수정 | wrongCount → stars 계산, navigate('/complete') | `LessonSession.tsx` |
| Complete 재작성 | 별점 카드 + XP 카드 + 레벨 바 | `Complete.tsx` |
| LearningPath 신규 | 섹션 카드 목록 (활성/잠김/완료 상태) | `LearningPath.tsx` |
| SectionPath 신규 | 유닛별 지그재그 레슨 버블 | `SectionPath.tsx` |
| FillBlankQuiz 신규 | 영어 문장 + 한국어 빈칸 + 3개 선택지 | `FillBlankQuiz.tsx` |
| 4단계 난이도 시퀀스 | Tier 0~3 챌린지 빌더 | `lessonSequence.ts` |

#### 새 파일 목록

| 파일 | 역할 |
|------|------|
| `src/utils/xp.ts` | STAR_XP, LEVEL_THRESHOLDS, calcXp/calcLevel |
| `src/pages/LearningPath.tsx` | 섹션 카드 목록 (Duolingo 스타일) |
| `src/pages/SectionPath.tsx` | 유닛별 레슨 경로 (지그재그 버블) |
| `src/components/quiz/FillBlankQuiz.tsx` | 빈칸 채우기 퀴즈 |

#### 아키텍처 결정 사항

- **별점**: 오답 0개=3성, 1~2개=2성, 3개+=1성
- **레벨**: LEVEL_THRESHOLDS = [0, 100, 250, 500, 660] → Lv1~5
- **Tier**: `effectiveTier = Math.min(sectionBaseTier + completionCount, 3)`
- **completionCount**: AppContext의 `lessonCompletionCount[lessonId]` 누적

---

### Phase 1 — Duolingo Unit → Lesson 구조 도입 (2026-05-14)

#### 목표
기존 "항목 하나씩" 학습 구조를 "레슨 묶음 단위" 구조로 전환.
같은 단어를 한 레슨 안에서 Flash → Matching → ImageChoice → ListenChoice → SentenceBuilder 순으로 반복 노출.

#### 구현 요약
- **테스트:** 61개 전체 통과 (12개 테스트 파일)
- **프로덕션 빌드:** 191.27 kB JS / 12.74 kB CSS (gzip: 61.94 kB)

#### 구현된 기능

| Task | 내용 | 커밋 |
|------|------|------|
| T1 | 타입 정의: `Unit`, `Lesson`, `LessonChallenge` (`src/types/lesson.ts`) | bdcd570 |
| T2 | 레슨 데이터 22개 (`src/data/lessons.ts`) + 유닛 9개 (`src/data/units.ts`) | 77f7523 |
| T3 | `buildChallengeSequence()` 유틸 TDD (8개 테스트) | 96a3c1c |
| T4 | AppContext 확장: `markLessonDone`, `isPhraseUnlocked` 레슨 기반 업데이트 | 6b4a6a3 |
| T5 | `LessonSession` 페이지: Flash→Match→Choice→Listen→Sentence, main+retry 2-phase | 1986a5b |
| T6 | `UnitMap` 페이지: 유닛별 레슨 진행 현황, done/next/locked 상태 | 23c77dc |
| T7 | 라우터 `/units`, `/lesson/:lessonId` 추가, `Home.tsx` 레슨 기반 네비게이션 | df05a25 |

#### 새 파일 목록

| 파일 | 역할 |
|------|------|
| `src/types/lesson.ts` | ChallengeKind, LessonChallenge, Lesson, Unit 타입 |
| `src/data/lessons.ts` | LESSONS_MAP — 22레슨 (알파벳5 + 단어17) |
| `src/data/units.ts` | UNITS_MAP + UNIT_ORDER — 9유닛 |
| `src/utils/lessonSequence.ts` | buildChallengeSequence() |
| `src/pages/LessonSession.tsx` | 레슨 세션 페이지 (5종 챌린지) |
| `src/pages/UnitMap.tsx` | 학습 맵 페이지 |

#### 아키텍처 결정 사항

- **챌린지 시퀀스 (N=5):** flash×5 + matching×1 + image-choice×5 + listen-choice×3 + sentence-builder×2 = 16개
- **문장 선택:** `lessonIndex * 2 % allSentences.length` — 레슨마다 다른 문장 노출
- **오답 처리:** 오답 → `retryQueue` 적재 → 메인 완료 후 retry phase

---

## 2026-05-13

### Easy English MVP — 코드 구현 완료

#### 구현 요약
- **Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router v6, Vitest
- **테스트:** 53개 전체 통과 (11개 테스트 파일)
- **프로덕션 빌드:** 190.78 kB JS / 13.62 kB CSS (gzip: 61.65 kB)

#### 구현된 기능
| Task | 내용 | 커밋 |
|------|------|------|
| T1 | 프로젝트 부트스트랩 (Vite + React + Tailwind + Vitest) | 7ef0f47 |
| T2 | Types + Utilities (streak, quizAssignment, quizHelpers) | 00285eb |
| T3 | 콘텐츠 데이터 (알파벳 26자 + 단어 90개) | 9c51f46 |
| T4 | AppContext (localStorage 진도·스트릭) | 77472e5 |
| T5 | useSpeech Hook (Web Speech API TTS) | 9578b7f |
| T6 | 공통 UI 컴포넌트 (ProgressBar, FlashCard 등) | e294e9b |
| T7 | ImageChoiceQuiz (유형 A) | c23b91d |
| T8 | MatchingQuiz (유형 B, animate-flash) | e3ef973 |
| T9 | ListenChoiceQuiz + QuizStep 오케스트레이터 | 237dcb4 |
| T10 | SentenceBuilderQuiz (유형 D) | 1d2f43a |
| T11 | StudySession 페이지 (view→quiz→speak, 복습 라운드) | 74dcfee |
| T12 | Home, AlphabetList, WordList 페이지 | 526f9ac |
| T13 | Complete 페이지 + App.tsx 라우팅 | 9d5d21e |

---

## 작성 규칙

- 날짜: `YYYY-MM-DD`
- 변경 유형: `추가(Added)` / `수정(Changed)` / `삭제(Removed)` / `수정(Fixed)`
- 파일별로 묶어서 기록

### Duolingo Phase 1 — Unit → Lesson 구조 도입 (STEP 5 Phase 1)

#### 목표
기존 "항목 하나씩" 학습 구조를 "레슨 묶음 단위" 구조로 전환.
같은 단어를 한 레슨 안에서 Flash → Matching → ImageChoice → ListenChoice → SentenceBuilder 순으로 반복 노출.

#### 구현 요약
- **테스트:** 61개 전체 통과 (12개 테스트 파일)
- **프로덕션 빌드:** 191.27 kB JS / 12.74 kB CSS (gzip: 61.94 kB)
- **구현 방식:** Subagent-Driven Development (태스크별 서브에이전트 + spec/quality 리뷰)

#### 구현된 기능

| Task | 내용 | 커밋 |
|------|------|------|
| T1 | 타입 정의: `Unit`, `Lesson`, `LessonChallenge` (`src/types/lesson.ts`) | bdcd570, 6be677f |
| T2 | 레슨 데이터 22개 (`src/data/lessons.ts`) + 유닛 9개 (`src/data/units.ts`) | 77f7523 |
| T3 | `buildChallengeSequence()` 유틸 TDD (8개 테스트) | 96a3c1c, caa9f7c |
| T4 | AppContext 확장: `markLessonDone`, `isPhraseUnlocked` 레슨 기반 업데이트 | 6b4a6a3 |
| T5 | `LessonSession` 페이지: Flash→Match→Choice→Listen→Sentence, main+retry 2-phase | 1986a5b |
| T6 | `UnitMap` 페이지: 유닛별 레슨 진행 현황, done/next/locked 상태 | 23c77dc |
| T7 | 라우터 `/units`, `/lesson/:lessonId` 추가, `Home.tsx` 레슨 기반 네비게이션 | df05a25 |
| fix | `SentenceBuilderQuiz` 테스트 fake timers 적용 (auto-advance 동작 반영) | b70bc67 |

#### 새 파일 목록

| 파일 | 역할 |
|------|------|
| `src/types/lesson.ts` | ChallengeKind, LessonChallenge, Lesson, Unit 타입 |
| `src/data/lessons.ts` | LESSONS_MAP — 22레슨 (알파벳5 + 단어17) |
| `src/data/units.ts` | UNITS_MAP + UNIT_ORDER — 9유닛 |
| `src/utils/lessonSequence.ts` | buildChallengeSequence() |
| `src/test/utils/lessonSequence.test.ts` | 시퀀스 생성기 테스트 8개 |
| `src/pages/LessonSession.tsx` | 레슨 세션 페이지 (5종 챌린지) |
| `src/pages/UnitMap.tsx` | 학습 맵 페이지 |

#### 수정된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/types/index.ts` | `AppStorage.lessonProgress`, `AppContextValue.markLessonDone` 추가 |
| `src/context/AppContext.tsx` | markLessonDone (immutable), isPhraseUnlocked 레슨 기반 (10개 word lesson) |
| `src/components/quiz/ImageChoiceQuiz.tsx` | `onWrong?: () => void` prop 추가 |
| `src/App.tsx` | /units, /lesson/:lessonId 라우트 추가 |
| `src/pages/Home.tsx` | 레슨 기반 네비게이션, 전체 레슨 진행 카드 |
| `src/test/components/SentenceBuilderQuiz.test.tsx` | fake timers + fireEvent.change 적용 |

#### 아키텍처 결정 사항

- **챌린지 시퀀스 (5항목 기준):** flash×5 + matching×1 + image-choice×5 + listen-choice×3 + sentence-builder×2 = 16개
- **문장 선택:** `lessonIndex * 2 % allSentences.length` — 레슨마다 다른 문장 노출
- **오답 처리:** image-choice 오답 → `retryQueue` 적재 → 메인 시퀀스 완료 후 retry phase
- **isPhraseUnlocked 기준:** word lesson 10개 완료 (fruit-1/2, animal-1/2/3, color-1/2, body-1/2, food-1)
- **하위 호환:** 기존 `/alphabet/:id`, `/words/:id` 라우트 유지

#### 다음 단계 후보

- Phase 2: 레슨 완료 후 별(Star) 평가 + 경험치 시스템
- Phase 2: 학습 통계 화면 (일별 완료 레슨, 스트릭 캘린더)
- Phase 2: 발음 피드백 (Web Speech API Recognition)
- 회화 모드 잠금 해제 조건 조정 (현재 word lesson 10개)

---

## 2026-05-13

### Easy English MVP — 코드 구현 완료 (STEP 5)

#### 구현 요약
- **Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router v6, Vitest
- **테스트:** 53개 전체 통과 (11개 테스트 파일)
- **프로덕션 빌드:** 190.78 kB JS / 13.62 kB CSS (gzip: 61.65 kB)

#### 구현된 기능
| Task | 내용 | 커밋 |
|------|------|------|
| T1 | 프로젝트 부트스트랩 (Vite + React + Tailwind + Vitest) | 7ef0f47 |
| T2 | Types + Utilities (streak, quizAssignment, quizHelpers) | 00285eb |
| T3 | 콘텐츠 데이터 (알파벳 26자 + 단어 90개) | 9c51f46 |
| T4 | AppContext (localStorage 진도·스트릭) | 77472e5 |
| T5 | useSpeech Hook (Web Speech API TTS) | 9578b7f |
| T6 | 공통 UI 컴포넌트 (ProgressBar, FlashCard 등) | e294e9b |
| T7 | ImageChoiceQuiz (유형 A) | c23b91d |
| T8 | MatchingQuiz (유형 B, animate-flash) | e3ef973 |
| T9 | ListenChoiceQuiz + QuizStep 오케스트레이터 | 237dcb4 |
| T10 | SentenceBuilderQuiz (유형 D, fuzzy match) | 1d2f43a |
| T11 | StudySession 페이지 (view→quiz→speak, 복습 라운드) | 74dcfee |
| T12 | Home, AlphabetList, WordList 페이지 | 526f9ac |
| T13 | Complete 페이지 + App.tsx 라우팅 | 9d5d21e |

#### 참고 사항
- 단어 수: 90개 (플랜 목표 100개 대비 — 플랜 실제 데이터 기준)
- `useBlocker` (브라우저 뒤로가기 차단): BrowserRouter에서 정상 동작, MemoryRouter 테스트 환경에서는 제외됨

---

## 2026-04-28

### 출처
기획 텍스트와 실제 구현 화면 간 괴리 문제 해소 — 브라우저에서 바로 열 수 있는 인터랙티브 HTML 사이트맵 단계 추가.

### 추가(Added)

| 항목 | 위치 | 내용 |
|---|---|---|
| `sitemap-wireframe` 스킬 신규 생성 | `.claude/skills/sitemap-wireframe/SKILL.md` | `writing-plans` 완료 후 `docs/wireframes/{slug}-sitemap.html` 생성. ① 화면 간 클릭 인터랙션(연결 화면 하이라이트), ② 화면별 상태 탭(Default/Loading/Empty/Error) 포함 |
| STEP 3.5 삽입 | `CLAUDE.md` §2 필수 워크플로 | `writing-plans` → `sitemap-wireframe` → `plan-design-review` 순서로 변경. 사이트맵 승인 전 디자인 리뷰 및 개발 착수 금지 조건 추가 |
| 킥오프 파이프라인 6→7단계 확장 | `.claude/commands/kickoff.md` | `sitemap-wireframe` 단계 삽입, 이후 `plan-design-review` 진행 |

### 수정(Changed)

| 항목 | 위치 | 내용 |
|---|---|---|
| 산출물 위치 규약에 `wireframes` 추가 | `CLAUDE.md` §4 | `docs/wireframes/{feature}-sitemap.html` 경로 명시 |

---

## 2026-04-21

### 출처
[Claude Design System Prompt](https://gist.github.com/hqman/f46d5479a5b663c282c94faa8be866de) 분석 — LLM 행동 패턴 개선 원칙 적용.

### CLAUDE.md

| 항목 | 위치 | 내용 | 태그 |
|---|---|---|---|
| `채우기 콘텐츠 추가 금지` | §3 금지 사항 | 더미 텍스트/임의 통계/불필요한 섹션을 사용자 승인 없이 추가 금지 | `#6` |

---

## 작성 규칙

- 날짜: `YYYY-MM-DD`
- 변경 유형: `추가(Added)` / `수정(Changed)` / `삭제(Removed)` / `수정(Fixed)`
- 출처: 변경의 근거(링크, 이슈, 실험 결과 등) 명시
- 파일별로 묶어서 기록
