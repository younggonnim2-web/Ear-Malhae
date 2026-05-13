# Handoff — Easy English App (2026-05-13)

> 다른 컴퓨터(맥북)에서 이 작업을 이어받을 때 참조하는 문서.
> 폴더명: `Test-project-template` → **`Ear-Malhae`** 로 변경됨.

---

## 1. 프로젝트 개요

**앱명:** Easy English  
**대상:** 초등 저학년 + 노년층  
**목표:** 알파벳 26자 + 단어 100개를 3단계(카드 → 퀴즈 → 발음)로 학습하는 React 18 웹앱 MVP

**Tech Stack:**
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3 (커스텀 컬러 `primary: #1565C0`)
- React Router v6 (`:id` param 라우팅)
- Vitest + React Testing Library
- Web Speech API (TTS)

---

## 2. 현재 상태

| 단계 | 상태 | 산출물 |
|------|------|--------|
| STEP 1: 아이디어 검증 (office-hours) | ✅ 완료 | `docs/prd/` |
| STEP 2: 옵션 탐색 (brainstorming) | ✅ 완료 | `docs/plans/easy-english-app-options.md` |
| STEP 3: 플랜 작성 (writing-plans) | ✅ 완료 | `docs/plans/easy-english-app.md` |
| STEP 3.5: 사이트맵 와이어프레임 | ✅ 완료 | `docs/wireframes/easy-english-app-sitemap.html` |
| STEP 4 UX: 디자인 리뷰 (plan-design-review) | ✅ 완료 | `docs/design-reviews/easy-english-app.md` |
| STEP 4 ENG: 엔지니어링 리뷰 (plan-eng-review) | ✅ 완료 | 플랜에 반영 완료 (12개 결정) |
| **STEP 4.5: Figma 화면 설계** | 🔴 **미완료 — 다음 작업** | 12개 화면 |
| STEP 5: 코드 구현 (subagent-driven-development) | ⏳ 대기 | Figma 승인 후 진행 |

---

## 3. 다음 작업: Figma 화면 설계 (12개 화면)

코드 구현 전 Figma에서 화면을 직접 확인하고 승인하는 워크플로. (사용자 명시 결정)

### 설계할 화면 목록

| # | 화면명 | 경로/상태 |
|---|--------|----------|
| 1 | Home | `/` |
| 2 | AlphabetList | `/alphabet` |
| 3 | WordList | `/words` |
| 4 | StudySession — FlashCard | `step=view` |
| 5 | StudySession — ImageChoiceQuiz | `step=quiz, type A` |
| 6 | StudySession — MatchingQuiz | `step=quiz, type B` |
| 7 | StudySession — ListenChoiceQuiz | `step=quiz, type C` |
| 8 | StudySession — SentenceBuilderQuiz | `step=quiz, type D` |
| 9 | StudySession — PronunciationStep | `step=speak` |
| 10 | StudySession — Exit Dialog | X버튼 → 확인 다이얼로그 |
| 11 | StudySession — Review Round | `phase=review` (오답 재학습) |
| 12 | Complete | `/complete` |

### Figma 작업 워크플로
```
fd 에이전트 (설계 명세) → 사용자 승인
→ fb 에이전트 × N 병렬 (화면별 batch commands)
→ 메인 (순차 batch_execute + 텍스트 수정)
→ sr 에이전트 (논리 검수 1회)
```

### Figma MCP 연결 방법 (맥북)
1. `figma-mcp` 를 맥북에 설치 (arinspunk/claude-talk-to-figma-mcp)
2. 소켓 서버 실행: `bun run socket` (port 3055)
3. `~/.claude/mcp.json` 에 맥북 경로로 ClaudeTalkToFigma 등록
4. Figma 플러그인 (`src/claude_mcp_plugin/manifest.json`) 연결
5. 채널 ID 를 Claude에게 전달

---

## 4. 엔지니어링 리뷰에서 결정된 12가지 사항

플랜 파일(`docs/plans/easy-english-app.md`)에 모두 반영 완료.

| ID | 결정 내용 |
|----|----------|
| D0-A | 현행 범위 유지 (40+ 파일 전체 구현) |
| D1-A | `:id` 라우팅 유지 (`/alphabet/:id`, `/words/:id`) |
| D1-B | X버튼 + `useBlocker` Task 11 (StudySession)에 삽입 |
| D1-C | `QuizStep` Props에 `wordIndex: number` + `onWrong?: () => void` 추가 |
| D1-D | `ImageChoiceQuiz` Props에 `allowNextOnWrong?: boolean` + `onNext?: () => void` 추가 |
| D2-A | `MatchingQuiz` 오답 애니메이션: `animate-shake` → `animate-flash` |
| D2-B | Tailwind 커스텀 컬러: `primary: '#1565C0'` (WCAG AAA 7.1:1) |
| D3-A | 테스트 GAP 모두 플랜에 추가 (35+개 테스트) |
| — | `buildChoices` useMemo deps: `[item.id, fallbackPool.length]` |
| — | `SentenceBuilderQuiz`: 로컬 `shuffle()` 제거 → `quizHelpers` import |
| — | `PronunciationStep` useEffect deps: `[item.id, speak, isSupported]` |
| — | Noto Sans KR preconnect + display=swap in `index.html` |

---

## 5. 미해결 TODO

`TODOS.md` 참조.

- **TODO-1** ✅ RESOLVED — MatchingQuiz flash 애니메이션 (플랜에 반영됨)
- **TODO-2** ⏳ Phase 2 — Noto Sans KR 로드 성능 Lighthouse 측정 (배포 후)

---

## 6. 핵심 파일 위치

| 파일 | 설명 |
|------|------|
| `docs/plans/easy-english-app.md` | 구현 플랜 (Task 1-14, 전체 코드 포함) |
| `docs/wireframes/easy-english-app-sitemap.html` | 인터랙티브 사이트맵 (브라우저에서 열기) |
| `docs/design-reviews/easy-english-app.md` | UX/디자인 리뷰 결과 |
| `TODOS.md` | 미해결 항목 |
| `HANDOFF.md` | 이 문서 |

---

## 7. 맥북 환경 설정 (Claude Code)

### `~/.claude/mcp.json` 수정 예시
```json
{
  "mcpServers": {
    "ClaudeTalkToFigma": {
      "command": "/Users/{username}/.bun/bin/bun",
      "args": ["run", "/Users/{username}/figma-mcp/dist/talk_to_figma_mcp/server.js"],
      "env": {
        "WS_URL": "ws://localhost:3055"
      }
    }
  }
}
```

### Claude Code 세션 시작 순서
1. 소켓 서버 먼저 실행: `cd ~/figma-mcp && bun run socket`
2. Figma 플러그인 연결 + 채널 ID 확보
3. Claude Code 실행 (이 폴더에서)
4. 채널 ID 전달 → Figma 설계 작업 시작

---

## 8. 작업 재개 시 첫 번째 메시지 예시

```
Ear-Malhae 프로젝트 이어서 진행.
HANDOFF.md 읽어서 현재 상태 파악해줘.
다음 작업: Figma 화면 설계 12개 화면.
채널 ID: [여기에 채널 ID 입력]
```
