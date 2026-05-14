# Project Rules Changelog

> 이 프로젝트 템플릿(`CLAUDE.md` 및 관련 룰)의 변경 이력.
> 새 항목 추가 시 최신순(상단)으로 작성한다.
> 글로벌 룰(`~/.claude/rules/`) 변경 이력은 `~/.claude/rules/CHANGELOG.md` 참조.

---

## 2026-05-14

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
