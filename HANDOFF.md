# Handoff — Easy English App (2026-05-19)

> 다른 컴퓨터(맥북)에서 이 작업을 이어받을 때 참조하는 문서.

---

## 1. 프로젝트 개요

**앱명:** Easy English (Ear-Malhae)
**GitHub:** https://github.com/younggonnim2-web/Ear-Malhae
**대상:** 초등 저학년 + 노년층 (한국인 영어 학습자)
**목표:** 알파벳 + 단어 130개를 Duolingo 스타일 5단계 섹션으로 학습하는 React 18 웹앱

**Tech Stack:**
- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS 3 (커스텀 컬러 `primary: #1565C0`)
- React Router v6
- Vitest + React Testing Library
- Web Speech API (TTS)

---

## 2. 현재 상태 (2026-05-19 기준)

| 단계 | 상태 | 산출물 |
|------|------|--------|
| PRD + 옵션 탐색 | ✅ 완료 | `docs/prd/`, `docs/plans/` |
| 사이트맵 + 디자인 리뷰 | ✅ 완료 | `docs/wireframes/`, `docs/design-reviews/` |
| Phase 1: Duolingo 구조 | ✅ 완료 | Unit→Lesson→Challenge 구조 |
| Phase 2: Star+XP + 섹션 UI | ✅ 완료 | LearningPath, SectionPath, FillBlankQuiz |
| Phase 3: 섹션 5단계 재편 | ✅ 완료 | rookie/explorer/traveler/challenger/master |
| Phase 4: 퀴즈 UX + 데이터 품질 | ✅ 완료 | 116개 테스트 통과 |
| **Phase 5: 난이도 선택 + 적응형 시스템** | ✅ **완료** | 139개 테스트 통과 |

**테스트:** 139개 전체 통과
**빌드:** 정상 (TypeScript 오류 0)

---

## 3. 섹션 구조 (현재)

| 섹션 ID | 이름 | 유닛 | baseTier |
|---------|------|------|----------|
| `rookie` | 입문 | alphabet, daily | 0 |
| `explorer` | 탐험가 | number, fruit, animal | 1 |
| `traveler` | 여행자 | color, body, food, place | 1 |
| `challenger` | 도전자 | family, weather, feeling | 2 |
| `master` | 마스터 | transport, health | 2 |

---

## 4. Phase 6 버그픽스 + UX 개선 (2026-05-19 세션)

| 항목 | 변경 내용 |
|------|----------|
| Distractor pool 개선 | `allItems`(전체) → `lessonItems`(같은 레슨) 우선 — 의미적 연관성 확보 |
| 알파벳 시퀀스 셔플 | image-choice·listen-choice를 flash와 다른 순서로 출제 |
| 말해보기 스킵 기능 | idle 단계에서 "지금은 넘길게요" → 3문제 뒤 재출제 |
| 녹음 중 파형 애니메이션 | 이퀄라이저 7개 막대 바 (animate-sound-bar) |
| Speech Recognition 타임아웃 | 8초 후 자동 stop → "소리가 잘 안 들렸어요" 결과 |
| 마이크 권한 차단 처리 | not-allowed 에러 → "마이크 사용 불가" 안내 화면 (기존: 자동 넘김) |
| TTS 이중 재생 방지 | StrictMode 이중 effect → `useRef`로 최초 1회만 재생 |
| 네트워크 접근 허용 | `vite.config.ts` `host: true` → 스마트폰 IP 접속 가능 |
| GitHub 리모트 연결 | `https://github.com/younggonnim2-web/Ear-Malhae` |

**테스트:** 139개 전체 통과
**빌드:** 정상 (TypeScript 오류 0)

---

## 5. Phase 5 주요 변경사항

| 항목 | 변경 내용 |
|------|----------|
| 온보딩 화면 | 앱 첫 진입 시 3단계 난이도 선택 (`/onboarding`) |
| DifficultyLevel | `'beginner' \| 'intermediate' \| 'advanced'` → difficultyOffset 0/1/2 |
| 난이도 Tier 공식 | `effectiveTier = min(difficultyOffset + sectionBaseTier + completionCount, 3)` |
| 알파벳 투명 처리 | 비입문자: `effectiveCompletedSet`에 alphabet IDs 자동 포함 (뱃지 없이 완전 비노출) |
| 적응형 난이도 | 연속 3회 만점 → 업그레이드 제안, 평균 ≤1.5★ → 다운그레이드 제안 |
| DifficultyModal | Complete/LearningPath에서 난이도 변경 바텀시트 모달 |
| Tier 0 비율 조정 | secondHalf image-list → listen-choice (시각 42%, 청각 26%, 능동 32%) |
| 기존 사용자 처리 | lessonProgress > 0 이면 온보딩 자동 스킵 |

---

## 5. 난이도 시스템 설계 원칙

- **섹션 건너뛰기 없음**: 모든 난이도는 섹션 1(입문)부터 시작
- **문제 형식만 달라짐**: difficultyOffset이 Tier를 올려 고급 문제 유형 먼저 출제
- **알파벳은 비입문자에게 invisible**: UI에서 완전히 숨김 (스킵 뱃지 없음)

---

## 6. 핵심 파일 위치

| 파일 | 설명 |
|------|------|
| `src/types/index.ts` | DifficultyLevel, AppStorage, AppContextValue 타입 |
| `src/context/AppContext.tsx` | setDifficulty, effectiveCompletedSet, loadStorage |
| `src/pages/Onboarding.tsx` | 첫 진입 난이도 선택 화면 |
| `src/components/DifficultyModal.tsx` | 난이도 변경 모달 (적응형 제안 포함) |
| `src/utils/difficultyAdaptive.ts` | checkAdaptiveDifficulty — 업/다운그레이드 감지 |
| `src/utils/lessonSequence.ts` | buildChallengeSequence (difficultyOffset 파라미터) |
| `src/data/sections.ts` | 5개 섹션 정의 (baseTier 포함) |
| `src/data/words.ts` | 130개 단어 (sentence? 필드 포함) |
| `src/data/sentences.ts` | 35개 문장 (category? 필드 포함) |
| `src/pages/LessonSession.tsx` | 레슨 실행 (difficultyOffset → buildChallengeSequence) |
| `src/pages/LearningPath.tsx` | 섹션 카드 목록 (effectiveCompletedSet, DifficultyModal) |
| `src/pages/SectionPath.tsx` | 유닛별 레슨 경로 (alphabet 필터링) |
| `src/pages/JumpTest.tsx` | 섹션 건너뛰기 테스트 |

---

## 7. 라우팅

```
/                    → LearningPath (섹션 카드 목록)
/onboarding          → Onboarding (첫 진입 난이도 선택)
/section/:sectionId  → SectionPath (유닛별 레슨 경로)
/lesson/:lessonId    → LessonSession
/complete            → Complete (별점 + XP + 레벨 + 적응형 제안)
/jump/:sectionId     → JumpTest (섹션 건너뛰기 테스트)
/units               → UnitMap
/alphabet            → AlphabetList
/words               → WordList
```

---

## 8. 작업 재개 시 첫 번째 메시지 예시

```
Ear-Malhae 프로젝트 이어서 진행.
HANDOFF.md 읽어서 현재 상태 파악해줘.
```
