# Project Rules Changelog

> 이 프로젝트 템플릿(`CLAUDE.md` 및 관련 룰)의 변경 이력.
> 새 항목 추가 시 최신순(상단)으로 작성한다.
> 글로벌 룰(`~/.claude/rules/`) 변경 이력은 `~/.claude/rules/CHANGELOG.md` 참조.

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
