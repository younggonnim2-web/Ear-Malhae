# Handoff — Easy English App (2026-05-14)

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
| STEP 1: 아이디어 검증 | ✅ 완료 | `docs/prd/` |
| STEP 2: 옵션 탐색 | ✅ 완료 | `docs/plans/easy-english-app-options.md` |
| STEP 3: 플랜 작성 | ✅ 완료 | `docs/plans/easy-english-app.md` |
| STEP 3.5: 사이트맵 와이어프레임 | ✅ 완료 | `docs/wireframes/easy-english-app-sitemap.html` |
| STEP 4 UX: 디자인 리뷰 | ✅ 완료 | `docs/design-reviews/easy-english-app.md` |
| STEP 4 ENG: 엔지니어링 리뷰 | ✅ 완료 | 플랜에 반영 완료 (12개 결정) |
| STEP 5 Phase 1: Duolingo Unit→Lesson 구조 | ✅ 완료 | 61개 테스트 통과, 커밋 `df05a25` |
| **STEP 5 Phase 2: Star + XP 시스템** | 🟡 **설계 완료 — 구현 플랜 작성 중** | 스펙 승인됨 |

---

## 3. 다음 작업: Star + XP 시스템 구현 플랜 작성

### 현재까지 완료된 것
- 브레인스토밍 + 설계 완료 (스펙 승인됨)
- 스펙 문서: `docs/superpowers/specs/2026-05-14-star-xp-system-design.md`
- **바로 `writing-plans` 스킬 호출로 구현 플랜 작성하면 됨**

### 설계 핵심 결정사항

| 항목 | 결정 |
|------|------|
| 별 계산 기준 | 오답 0개=3성, 1~2개=2성, 3개+=1성 (retryQueue 기반) |
| XP | 1성=10, 2성=20, 3성=30 XP |
| 레벨 임계값 | `[0, 100, 250, 500, 660]` (Lv1~5) |
| Lv.5 조건 | 22레슨 전부 3성 = 660 XP (최고 달성) |
| 데이터 | `lessonStars: Record<string, 1\|2\|3>` 추가, XP는 파생 |
| UI 노출 위치 | Complete / UnitMap 헤더 / Home / UnitMap 레슨 버튼 |

### 변경 예정 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/utils/xp.ts` | **신규** — calcXp, calcLevel, calcXpToNext |
| `src/types/index.ts` | AppStorage.lessonStars, AppContextValue computed 필드 추가 |
| `src/context/AppContext.tsx` | markLessonDone(id, stars), totalXp/currentLevel/xpToNextLevel |
| `src/pages/LessonSession.tsx` | wrongCount state, navigate('/complete', { state }) |
| `src/pages/Complete.tsx` | 별 카드 + XP 카드 + 레벨 바 |
| `src/pages/UnitMap.tsx` | 헤더 레벨/XP 바, 레슨 버튼 별 표시 |
| `src/pages/Home.tsx` | 진도 카드에 Lv + XP 한 줄 추가 |
| `src/test/utils/xp.test.ts` | **신규** — xp 유틸 테스트 ~10개 |

### 테스트 목표
기존 61개 + 신규 15~20개 = **76~81개 전체 통과**

---

## 4. Phase 2 나머지 후보 (구현 순서 미결정)

| # | 기능 | 상태 |
|---|------|------|
| 1 | **Star + XP 시스템** | 🟡 설계 완료, 구현 플랜 작성 중 |
| 2 | 학습 통계 화면 (일별 완료 레슨, 스트릭 캘린더) | ⏳ 대기 |
| 3 | 발음 피드백 (Web Speech API Recognition) | ⏳ 대기 |
| 4 | 회화 모드 잠금 해제 조건 조정 | ⏳ 대기 |

---

## 5. Phase 1 구현 요약 (2026-05-14 완료)

- **테스트:** 61개 전체 통과 (12개 테스트 파일)
- **빌드:** 191.27 kB JS / 12.74 kB CSS
- 신규: `Unit → Lesson → Challenge` 구조, `UnitMap` + `LessonSession` 페이지
- 참조: `docs/CHANGELOG.md` Duolingo Phase 1 섹션

---

## 6. 핵심 파일 위치

| 파일 | 설명 |
|------|------|
| `docs/superpowers/specs/2026-05-14-star-xp-system-design.md` | Phase 2 Star+XP 설계 스펙 |
| `docs/plans/easy-english-app.md` | MVP 구현 플랜 (Phase 1 기준) |
| `docs/wireframes/easy-english-app-sitemap.html` | 인터랙티브 사이트맵 |
| `docs/CHANGELOG.md` | 구현 이력 전체 |
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

---

## 8. 작업 재개 시 첫 번째 메시지 예시

```
Ear-Malhae 프로젝트 이어서 진행.
HANDOFF.md 읽어서 현재 상태 파악해줘.
다음 작업: Star + XP 시스템 구현 플랜 작성 (writing-plans 스킬).
```
