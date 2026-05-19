# HANDOFF — Phase 3: Star+XP 시스템 + 섹션 구조 재편

> 최종 업데이트: 2026-05-19
> 상태: 전체 구현 완료, 커밋 완료
> 테스트: **109개 전체 통과**
> 개발 서버: `http://localhost:5174`

---

## Phase 2 누적 구현 (이전 세션 완료)

### 1. 듀오링고 스타일 퀴즈 전면 재설계

#### ImageChoiceQuiz (`src/components/quiz/ImageChoiceQuiz.tsx`)
- **cards 모드**: 이모지 카드 3개 + 번호 배지 + 2단계 플로우 (선택→확인→결과→다음)
  - 카드 선택 시 해당 단어 영어 발음
- **list 모드**: CharacterBubble + 번호 리스트 + 즉시 정답 처리

#### ListenChoiceQuiz (`src/components/quiz/ListenChoiceQuiz.tsx`)
- 정사각형 파란 버튼 2개: 🔊 (보통 속도) + 🐢 (0.5배속)
- 칩 스타일 선택지 (rounded-full)

#### SentenceBuilderQuiz (`src/components/quiz/SentenceBuilderQuiz.tsx`)
- 타일 전용 (타이핑 모드 제거)
- **양방향**: `direction: 'en-to-ko' | 'ko-to-en'`
- 타일 클릭 시 `sentence.englishParts[idx]` 매핑으로 영어 발음
- `onWrong` prop → 오답 시 retryQueue 적재

#### FillBlankQuiz (`src/components/quiz/FillBlankQuiz.tsx`) — 신규
- 새로운 패턴 유형 (Tier 1부터 등장)
- 영어 문장 + 한국어 빈칸 + 3개 선택지

#### MatchingQuiz, CharacterBubble, TagBadge
- 번호 배지 순차 부여 (왼쪽 1~N, 오른쪽 N+1~2N)
- CharacterBubble: onSpeak 있으면 세로, 없으면 가로
- TagBadge: 새로운 단어(보라) / 어려운 연습(빨강) / 새로운 패턴(주황)

### 2. 레슨 시퀀스 4단계 난이도 진행 (`src/utils/lessonSequence.ts`)

| Tier | 완료 횟수 | 총 문제 수 (N=5) |
|------|----------|-----------------|
| 0 | 첫 학습 | 19 |
| 1 | 2회차 | 22 |
| 2 | 3회차 | 26 |
| 3 | 4회차+ | 23 |

- 각 스테이지 내 아이템 랜덤 셔플
- 문장 선택은 lessonIndex 기반 결정론적

### 3. Star + XP 시스템

#### `src/utils/xp.ts` — 신규
```typescript
STAR_XP = { 1: 10, 2: 20, 3: 30 }
LEVEL_THRESHOLDS = [0, 100, 250, 500, 660]  // Lv1~5
calcXp(stars) / calcLevel(xp) / calcXpToNext(xp) / calcLevelBarPct(xp, level)
```

#### `src/context/AppContext.tsx`
- `markLessonDone(id, stars: 1|2|3)` — 오답 수 기반 별점 저장
- `lessonStars: Record<string, 1|2|3>` — 레슨별 최고 별점 유지
- `totalXp / currentLevel / xpToNextLevel` — useMemo 파생

#### `src/pages/LessonSession.tsx`
- `wrongCount` state 추가
- 오답 0개=3성, 1~2개=2성, 3개+=1성
- `navigate('/complete', { state: { stars, xpGained } })`

#### `src/pages/Complete.tsx` — 전면 재작성
- 별점 카드 (★/☆ 표시) + +N XP 카드 + 레벨 진행 바
- state 없이 직접 접근 시 별 카드 생략

#### `src/pages/UnitMap.tsx`
- 헤더에 Lv.N + XP 진행 바
- 완료 레슨 버튼에 별점 표시 (★☆☆ 형식)

#### `src/pages/Home.tsx`
- 전체 레슨 ProgressCard subtitle → `Lv.{N} · {XP} XP`

### 4. 학습 경로 UI (Duolingo 스타일)

#### `src/pages/LearningPath.tsx` — 전면 재작성 (`/`)
- 섹션 카드 목록 (세로 스크롤)
- 활성: 파란 배경 + 진행률 바 + "계속하기"
- 잠김: 회색 + 🔒 유닛 수 + "섹션 N(으)로 이동하기"
- 완료: 초록 + "다시 연습하기"
- 우측 부엉이 + 말풍선

#### `src/pages/SectionPath.tsx` — 신규 (`/section/:sectionId`)
- 섹션 색상 스티키 헤더
- 유닛별 구분선 pill (이모지 + 유닛명)
- 지그재그 레슨 버블 (ZIGZAG = [50, 67, 50, 33])
- 버블 상태: 🔒 잠김 / ▶ 현재(pulse) / 이모지 미완료 / 이모지 완료(초록)
- 별점 3개 표시

---

## Phase 3 — 이번 세션 변경 (2026-05-19)

### 섹션 구조 재편 (`src/data/sections.ts`)

**변경 이유**: 기존 섹션이 주제별로만 구분되어 있어 난이도 대분류 역할 미흡.
듀오링고와 같이 섹션(대분류)=난이도 기반, 유닛(소분류)=주제 기반으로 재편.

**이전 구조** (4개 주제 섹션):
```
기초    → [alphabet, number]
자연    → [fruit, animal]
색깔과신체 → [color, body]
일상생활  → [food, daily, place]
```

**현재 구조** (3개 난이도 섹션):

| 섹션 ID | 이름 | 색상 | 포함 유닛 (개수) |
|---------|------|------|----------------|
| `beginner` | 입문 | 파랑 | alphabet, number (2개) |
| `basic` | 기초 | 초록 | fruit, animal, color, body (4개) |
| `intermediate` | 생활영어 | 주황 | food, daily, place (3개) |

**코드 변경 범위**:
- `src/data/sections.ts` — 섹션 ID/title/unitIds 전면 재편
- `src/pages/LearningPath.tsx` — SECTION_MESSAGES 키 업데이트

**호환성**: 9개 unit(alphabet~place) 데이터는 변경 없음. 섹션 ID가 바뀌었으므로 기존 localStorage의 섹션 관련 데이터가 있다면 초기화 필요.

---

## 현재 파일 구조

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
│       ├── FillBlankQuiz.tsx
│       ├── ImageChoiceQuiz.tsx
│       ├── ListenChoiceQuiz.tsx
│       ├── MatchingQuiz.tsx
│       ├── QuizStep.tsx
│       └── SentenceBuilderQuiz.tsx
├── context/
│   └── AppContext.tsx
├── data/
│   ├── alphabet.ts
│   ├── lessons.ts
│   ├── sections.ts        ← Phase 3 수정
│   ├── sentences.ts
│   ├── units.ts
│   └── words.ts
├── pages/
│   ├── AlphabetList.tsx
│   ├── Complete.tsx        ← Phase 2 재작성
│   ├── Home.tsx            ← Phase 2 수정
│   ├── LearningPath.tsx   ← Phase 2 신규 / Phase 3 수정
│   ├── LessonSession.tsx   ← Phase 2 수정
│   ├── SectionPath.tsx    ← Phase 2 신규
│   ├── StudySession.tsx
│   ├── UnitMap.tsx         ← Phase 2 수정
│   └── WordList.tsx
├── types/
│   ├── index.ts
│   └── lesson.ts
└── utils/
    ├── cn.ts
    ├── lessonSequence.ts
    ├── quizAssignment.ts
    ├── quizHelpers.ts
    ├── streak.ts
    └── xp.ts              ← Phase 2 신규
```

---

## 라우팅

```
/                    → LearningPath (섹션 카드 목록)
/section/:sectionId  → SectionPath (유닛별 레슨 경로)
/lesson/:lessonId    → LessonSession
/complete            → Complete (별점 + XP + 레벨)
/units               → UnitMap
/alphabet            → AlphabetList
/alphabet/:id        → StudySession (mode=alphabet)
/words               → WordList
/words/:id           → StudySession (mode=words)
```

---

## 다음 단계 후보

1. **레슨 완료 후 네비게이션 개선**: `/complete` → 홈 대신 해당 섹션 경로(`/section/:id`)로 복귀
2. **섹션 잠금 해제 애니메이션**: 섹션 완료 시 축하 이펙트
3. **가이드북 기능**: SectionPath 우상단 "가이드북" 버튼 → 해당 유닛 단어 목록
4. **레슨 버블 아이콘 다양화**: 트로피(체크포인트), 보물상자(보너스) 등
5. **숫자 유닛 레슨 데이터 추가**: 현재 `number` 유닛 레슨 없음
6. **섹션 잠금 UI 개선**: 잠긴 섹션 클릭 불가 처리 (현재는 클릭 가능)
7. **SectionPath → LearningPath 뒤로가기**: 헤더 버튼 동작 확인
