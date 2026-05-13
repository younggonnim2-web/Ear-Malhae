# Easy English App — 설계 문서

> 작성일: 2026-04-15
> 상태: 설계 승인 완료
> PRD: `docs/prd/easy-english-app.md`

---

## 1. 개요

영어 초보자(초등 저학년·노년층)가 하루 5분, 부담 없이 알파벳과 기초 단어를 익히고 나아가 기초 회화까지 배우는 웹앱.
로그인 없이 바로 시작, 진도는 localStorage에 저장.

**학습 로드맵:**
- Phase 1 (MVP): 알파벳 26자 + 기초 단어 100개
- Phase 2: 기초 회화 문장 (인사, 자기소개, 일상 표현 등)

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | React 18 + Vite | 가장 빠른 MVP, 설정 최소 |
| 스타일 | Tailwind CSS | 빠른 UI 구성 |
| 상태 관리 | React Context + localStorage | 서버 불필요, 단순한 상태 |
| 음성 | Web Speech API (TTS) | 브라우저 내장, 추가 비용 없음 |
| 배포 | GitHub Pages 또는 Netlify | 무료 |
| 언어 | TypeScript | 타입 안전성 |

---

## 3. 화면 구조

```
/ (홈)
├── /alphabet             알파벳 단원 목록
│   └── /alphabet/:id     알파벳 학습 세션 (A, B, C...)
├── /words                단어 카테고리 목록
│   └── /words/:id        단어 학습 세션
├── /phrases              회화 단원 목록 (Phase 2)
│   └── /phrases/:id      회화 학습 세션 (Phase 2)
└── /complete             완료 화면
```

**내비게이션 패턴:**
- 학습 세션(`/alphabet/:id`, `/words/:id`) 헤더 우측: `✕` 버튼
- `✕` 탭 시 확인 다이얼로그: "지금 나가면 이 세션의 학습 진도가 저장되지 않습니다. 나가시겠어요?" (취소 / 나가기)
- "나가기" 선택 시 → 이전 목록 화면으로 이동 (진도 저장 없음)
- 브라우저 뒤로가기는 동일하게 다이얼로그 없이 나가지 않도록 `beforeunload` / React Router `useBlocker` 사용

---

## 3-X. 사용자 여정 & 감정 아크

온보딩 없음 — URL 접속 즉시 홈 화면.

| 단계 | 사용자 행동 | 감정 | 플랜이 지원하는 것 |
|------|-----------|------|-----------------|
| 1 | 처음 URL 접속 | "이게 뭐지?" | 홈: 타이틀 헤더 "🌟 Easy English" + "지금 시작해보세요 ▶" |
| 2 | "시작" 버튼 탭 | "그냥 해볼까" | 알파벳 세션 자동 진입 |
| 3 | FlashCard — 🍎 사과/apple 봄 | "아 이거구나" | 이모지 72px + 큰 글씨 + 발음 버튼 |
| 4 | 발음 듣기 탭 | "영어가 이렇게 들리는구나" | Web Speech TTS |
| 5 | Step 2 퀴즈 진입 | "해볼 수 있을 것 같아" | 4지선다 |
| 6 | 첫 번째 문제 틀림 | 😟 "에구..." | 격려 메시지 + 정답 강조 (빨간 막지 않음) |
| 7 | 계속 진행해서 세션 완료 | "다 풀었어!" | 복습 라운드 or 완료 화면 |
| 8 | 복습 라운드 (틀린 것만) | "한 번 더 해볼게" | 주황 헤더 + N개 복습 |
| 9 | 완료 화면 | 🎉 "해냈다!" | 축하 이모지 + 스트릭 업데이트 |
| 10 | 다음날 재접속 | "어제 했던 거 이어서" | 스트릭 카드 🔥 2일째 |

**5초 첫인상:** 타이틀과 "시작" 버튼 — 생각할 필요 없음. 한 번만 탭하면 학습 시작.

**5분 행동 패턴:** 3단계(보기→퀴즈→발음)가 단어 1개에 약 1분. 10개면 10분. PRD "5분" 목표 = 알파벳 1개(5~6단어) 또는 단어 5개 세션.

**장기 관계 (5회 이상 재방문):** 스트릭 카드가 핵심 감정 앵커. 🔥 N일 숫자가 매일 커지는 것이 주요 리텐션 훅.

---

## 4. 화면별 설계

### 4-1. 홈 화면 (`/`)

**역할:** 진도 요약 + 오늘 학습 시작 진입점

**시각적 위계 (상단→하단):**
1. 앱 타이틀 헤더 (파란 배경 `#2196F3`, "🌟 Easy English", 흰 글씨, 36px)
2. 스트릭 카드 (🔥 N일째 연속 학습 — 가장 먼저 보이는 감정적 보상)
3. 진도 카드 2개 (알파벳 12/26 / 단어 0/100) — 2열 배치
4. 회화 카드 1개 (🔒 잠금 상태, 희미한 회색 표시)
5. "오늘 학습 시작 ▶" 버튼 (전체 너비, 52px, `#2196F3`)

**구성 요소:**
- 앱 타이틀 헤더 (파란 배경, "🌟 Easy English")
- 스트릭 카드 (🔥 N일째 연속 학습)
- 알파벳 카드 (진도 표시: 12/26)
- 단어 카드 (진도 표시: 0/100)
- 회화 카드 (진도 표시: 0/30, 🔒 단어 50개 이상 완료 시 잠금 해제)
- "오늘 학습 시작" 버튼 → 알파벳 미완료 항목이 있으면 알파벳으로, 모두 완료 시 단어로 자동 이동

**상태:**
- `streak`: 연속 학습 일수 (localStorage)
- `lastStudiedDate`: 마지막 학습 날짜 (streak 계산용)
- `alphabetProgress`: 완료한 알파벳 ID 배열
- `wordProgress`: 완료한 단어 ID 배열
- `phraseProgress`: 완료한 회화 ID 배열 (Phase 2)

**홈 화면 특수 상태:**
- **첫 실행 (진도 없음):** 스트릭 카드 숨김, 진도 카드는 "0/26", "0/100" 표시, "오늘 학습 시작" 버튼 텍스트 → "지금 시작해보세요 ▶" (더 따뜻한 초대)
- **알파벳 전체 완료:** 알파벳 카드에 "✅ 완료!" 배지, "오늘 학습 시작"이 단어 세션으로 자동 연결
- **전체 완료 (단어 100개 이상):** "🎉 모두 배웠어요! 회화에 도전해보세요" 안내 문구 + 회화 카드 잠금 해제 강조

---

### 4-1b. 알파벳 목록 (`/alphabet`)

**세션 아키텍처:**
- **"오늘 학습 시작" 버튼** → 다음 미완료 항목 5개를 배치로 묶어 세션 시작. 진행 표시: "단어 3 / 5"
- **개별 타일 탭** → 해당 1개 항목만 세션 시작. 진행 표시: "단어 1 / 1" 또는 "Step 보기 / 퀴즈 / 발음"
- 세션은 React Router `state`로 항목 배열을 전달: `navigate('/alphabet/session', { state: { items: [...] } })`
- `StudySession.tsx`는 route state에서 `items: StudyItem[]`을 받아 처리 (route `:id`는 단원 이름 표시용)

**레이아웃:** 4열 타일 그리드
- 타일 크기: 약 72×72px (화면 너비 480px 기준: `(480 - 32px 좌우패딩) / 4 ≈ 112px`)
- 각 타일: 알파벳 대문자 (28px bold) + 이모지 (24px) 아래에 배치
- 완료 항목: 초록 배경 `#4CAF50` + 흰 체크 오버레이 (완전 초록, 반투명 아님)
- 미완료: 흰 배경 + `#E0E0E0` 테두리
- 탭 → 해당 알파벳 1개 세션 (`navigate('/alphabet/session', { state: { items: [item] } })`)

**헤더:** "`< 홈으로`" 뒤로가기 + "알파벳 (12/26 완료)" 타이틀

---

### 4-1c. 단어 목록 (`/words`)

**레이아웃:** 카테고리 섹션 헤더 + 4열 타일 그리드 (카테고리별 반복)
- 섹션 헤더: 카테고리 이름 (emoji + 한글, 예: "🍎 과일") + 완료 수 (3/10)
- 단어 타일: 영어 단어 (14px bold) + 이모지 (20px) — 알파벳 타일보다 작은 이유: 100개
- 완료/미완료 스타일은 알파벳과 동일
- 탭 → 해당 단어 1개 세션 시작

**헤더:** "`< 홈으로`" 뒤로가기 + "단어 (0/100 완료)" 타이틀

---

### 4-2. 학습 세션 화면 (`/alphabet/:id`, `/words/:id`)

3단계로 구성. 각 단계는 동일한 URL에서 `step` state로 관리.

**세션 헤더 (항상 고정 표시):**
- 좌측: `✕` 버튼 (나가기) — 탭 시 확인 다이얼로그
  - 다이얼로그: "지금 나가면 이 세션의 학습 진도가 저장되지 않습니다. 나가시겠어요?"
  - 버튼: [취소] [나가기]
  - "나가기" → 이전 목록 화면으로 이동
- 중앙: 현재 단원명 (예: "A — Apple" 또는 "과일 단어")
- 우측: 진행 카운터 ("3 / 10")
- `useBlocker` (React Router v6)로 세션 중 뒤로가기도 동일 다이얼로그 노출

**진행 표시줄:**
- 헤더 아래 전체 너비 프로그레스 바 (파란색 `#2196F3`)
- Step 표시: "Step 1 보기" / "Step 2 퀴즈" / "Step 3 발음" (탭 스타일 인디케이터)

#### Step 1 — 카드 보기

- 큰 이모지 (72px)
- 영어 단어 (36px bold, 자간 넓게)
- 구분선
- 한글 뜻 (22px)
- "🔊 발음 듣기" 버튼 → Web Speech API TTS 실행
- "다음 ▶" 버튼 → Step 2로 이동

#### Step 2 — 퀴즈 (4가지 유형 순환)

세션 내 단어별로 아래 4가지 유형을 순환 배정한다 (`wordIndex % 4`). 각 유형은 **영어→한글 / 한글→영어 방향을 번갈아** 노출한다 (`wordIndex % 2`).

---

**유형 A — 그림 보고 선택 (4지선다)**

- 상단: 이모지 (60px)
- 방향에 따라 질문 분기:
  - 영어→한글: "이 그림의 뜻은?" → 한글 보기 4개
  - 한글→영어: "이 그림에 맞는 영어는?" → 영어 보기 4개
- 보기 구성: 정답 1개 + 오답 3개 (같은 카테고리 내 랜덤, 부족 시 전체 랜덤)
- 정답: 초록 배경 + "✓ 정답이에요! 잘했어요 👍"
- 오답: 빨간 테두리 + 정답 강조 + 격려 메시지

---

**유형 B — 단어 매칭**

**레이아웃:** 2열 고정 — 영어 단어 3개는 왼쪽 열, 한글 뜻 3개는 오른쪽 열 (행 순서는 랜덤)
```
[ apple  ]    [ 개     ]
[ dog    ]    [ 사과   ]
[ cat    ]    [ 고양이 ]
```
- 영어 카드 탭 (파란 테두리 강조) → 오른쪽 열 한글 카드 탭으로 짝 맞추기
- 짝이 맞으면 두 카드 초록 배경으로 고정 + 연결선 효과 (CSS line)
- 틀리면 두 카드 붉게 flash 후 선택 취소 (0.4초 shake 없이 — 노년층에 덜 혼란)
- 3쌍 전부 완료 시 "다음 ▶" 활성화
- 현재 단어 포함 같은 카테고리에서 2개 추가 선택 (부족 시 전체 랜덤)

---

**유형 C — 소리 듣고 선택 (4지선다)**

- 상단: 큰 스피커 아이콘 + "🔊 다시 듣기" 버튼 (자동 1회 재생)
- 방향에 따라 질문 분기:
  - 영어 발음 듣고 → 한글 뜻 4개 중 선택
  - 영어 발음 듣고 → 영어 단어 4개 중 선택 (철자 인식)
- 보기 구성: 정답 1개 + 오답 3개 (같은 카테고리 내 랜덤)
- 정답/오답 피드백은 유형 A와 동일

---

**유형 D — 문장 조합 (타일 선택 + 직접 타이핑)**

두 가지 입력 방법을 동시에 제공한다. 확인 버튼 클릭 시 마지막으로 사용한 방법으로 평가한다.

**① 타일 선택 (기본)**
- 상단: 완성할 영어 문장 표시 (예: "Coffee, please.")
- 한글 단어 타일 4~6개 배치 (정답 타일 + 오답 타일 섞여 있음)
- 사용자가 타일을 순서대로 탭 → 상단 문장 슬롯에 쌓임
- 잘못 탭한 타일: 상단 슬롯에서 탭하면 다시 내려옴
- 평가: 순서·단어 완전 일치

**② 직접 타이핑**
- 구분선 아래 텍스트 입력 필드 ("또는 직접 입력해보세요")
- 타이핑 시작 → 타일 슬롯 초기화, 타이핑 입력을 우선 평가
- 평가: **퍼지 매칭 (Levenshtein 유사도 기반)**

**퍼지 매칭 평가 분기:**

| 결과 | 조건 | 피드백 |
|------|------|--------|
| 완벽 정답 | 정규화 후 완전 일치 | "✓ 완벽해요! 👍" (초록) |
| 유사 정답 | 유사도 ≥ 75% | "거의 맞아요! 정확한 표현: Coffee, please." (파란 안내) |
| 오답 | 유사도 < 75% | "정답: Coffee, please." (빨간 안내) |

정규화 규칙: 소문자 변환 + 구두점 제거 + 앞뒤 공백 제거

```typescript
// src/utils/fuzzyMatch.ts
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, '').trim()
}

// Levenshtein distance
export function levenshtein(a: string, b: string): number { ... }

export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(normalize(a), normalize(b)) / maxLen
}

export type MatchResult = 'exact' | 'fuzzy' | 'wrong'
export function evaluateTyped(typed: string, correct: string): MatchResult {
  const sim = similarity(typed, correct)
  if (sim === 1) return 'exact'
  if (sim >= 0.75) return 'fuzzy'
  return 'wrong'
}
```

**공통 오답 처리:** 어떤 입력 방법이든 틀려도 정답 확인 후 진행 가능

**데이터:** `/src/data/sentences.ts` (20개 기초 문장)

```typescript
interface SentenceItem {
  id: string           // "coffee-please"
  english: string      // "Coffee, please."
  parts: string[]      // ["커피", "주세요"]   ← 정답 타일 (순서대로)
  distractors: string[] // ["설탕", "물"]      ← 오답 타일
}
```

---

**공통 규칙**
- 정답 확인 후 "다음 ▶" 버튼 활성화 → Step 3으로 이동
- 오답이어도 정답을 확인한 뒤 진행 가능 (틀려도 막지 않음)
- **오답 항목은 세션 내 `wrongItems: string[]`에 ID를 추가**

#### Step 3 — 발음 듣기

- Step 1과 동일한 카드 레이아웃
- "🔊 발음 다시 듣기" 버튼 (자동 1회 재생)
- "완료 ✓" 버튼 → 해당 항목 완료 처리 후 다음 항목 또는 **복습 라운드**

**진행 표시줄:**
- 상단에 항상 표시: "단어 3 / 10" + 파란 프로그레스 바
- 현재 Step 표시: "Step 1 보기" / "Step 2 퀴즈" / "Step 3 발음"

---

### 4-3. 오답 복습 라운드 (세션 완료 후 자동 진입)

세션(알파벳 또는 단어 세션)이 끝났을 때 `wrongItems.length > 0`이면 완료 화면 대신 복습 라운드로 이동한다.

**진입 조건:** 세션 내 틀린 항목 1개 이상

**구성:**
- 헤더: 주황색 배경 + "🔁 틀린 문제 다시 풀기"
- 상단 안내: "N개를 틀렸어요. 다시 한 번 풀어봐요!"
- 진행 표시줄: "복습 1 / N" (N = 틀린 항목 수)
- 퀴즈 유형: **유형 A (그림 보고 선택)** 고정 — 복습은 단순하게
- 방향: `en-to-ko` 고정
- 또 틀려도 격려 메시지 + 정답 확인 후 다음 진행 (재복습 없음)
- 마지막 항목 완료 → 완료 화면

**상태:**
```typescript
// StudySession.tsx 내부 state
type SessionPhase = 'study' | 'review'
const [phase, setPhase] = useState<SessionPhase>('study')
const [wrongItems, setWrongItems] = useState<string[]>([])  // 오답 항목 ID
```

**전환 로직:**
```typescript
// 세션 마지막 항목 Step 3 완료 시
if (wrongItems.length > 0) {
  setPhase('review')   // 복습 라운드 진입
} else {
  navigate('/complete') // 바로 완료
}
```

---

### 4-4. 완료 화면 (`/complete`)

- 축하 이모지 (🎉)
- 오늘 학습한 항목 수
- 업데이트된 스트릭
- "홈으로" 버튼

---

## 4-X. 상호작용 상태 테이블 (Interaction States)

모든 화면과 주요 컴포넌트의 로딩·빈 상태·오류·성공 상태를 정의한다.

| 화면 / 컴포넌트 | LOADING | EMPTY | ERROR | SUCCESS |
|---------------|---------|-------|-------|---------|
| **홈 화면** | 없음 (데이터 즉시 표시) | 첫 실행: 스트릭 숨김, "지금 시작해보세요 ▶" 버튼 | localStorage 읽기 실패: 초기값(streak=0, progress=[])으로 동작 | 스트릭 업데이트 시 🔥 숫자 변경 |
| **AlphabetList** | 없음 (정적 데이터) | 해당 없음 (항상 26개) | 해당 없음 | 전체 완료: "✅ 모두 완료!" 섹션 표시 |
| **WordList** | 없음 (정적 데이터) | 해당 없음 (항상 100개) | 해당 없음 | 카테고리 완료: 섹션 헤더에 "✅" 표시 |
| **FlashCard (Step 1)** | 없음 (동기 렌더) | 해당 없음 | 해당 없음 | 발음 버튼 탭 후 TTS 실행 중 버튼 비활성화 |
| **TTS (useSpeech)** | 스피커 아이콘 애니메이션 (pulse) | 해당 없음 | 미지원 브라우저: "이 기기에서는 발음 기능을 지원하지 않습니다" 안내 + 학습은 계속 진행 | 발음 종료 후 버튼 다시 활성화 |
| **ImageChoiceQuiz** | 해당 없음 | 해당 없음 | 해당 없음 | 정답: 초록 배경 + "✓ 정답이에요! 잘했어요 👍" |
| **MatchingQuiz** | 해당 없음 | 해당 없음 | 해당 없음 | 3쌍 완료: "다음 ▶" 활성화 |
| **ListenChoiceQuiz** | TTS 로딩 중 선택지 비활성화 | 해당 없음 | TTS 실패: "발음을 들을 수 없습니다. 단어: [word]" 텍스트 표시 후 진행 가능 | 정답: 동일 (유형 A) |
| **SentenceBuilderQuiz** | 해당 없음 | 타일 선택 0개 상태: "확인" 버튼 비활성화 | 해당 없음 | exact: 초록 + "완벽해요!" / fuzzy: 파란 + "거의 맞아요!" |
| **ReviewRound** | 없음 | `wrongItems.length === 0` → 진입 안 함 | 해당 없음 | 마지막 항목 완료 → `/complete` 이동 |
| **Complete** | 없음 | 해당 없음 | 해당 없음 | 🎉 + 학습 수 + 스트릭 |

**확인 다이얼로그 (세션 이탈):**
- 사용자가 `✕` 또는 뒤로가기 탭 시 표시
- 배경 오버레이 (반투명 검정)
- 카드: "지금 나가면 이 세션의 학습 진도가 저장되지 않습니다. 나가시겠어요?"
- 버튼: [취소 — 학습 계속] / [나가기 — 흰 배경 빨간 글씨]

---

## 5. 콘텐츠 데이터 구조

### 알파벳 (`/src/data/alphabet.ts`)

```typescript
interface AlphabetItem {
  id: string        // "A", "B", ...
  letter: string    // "A"
  sound: string     // "에이"
  emoji: string     // "🍎"
  exampleWord: string  // "apple"
  meaning: string   // "사과"
}
```

### 문장 (`/src/data/sentences.ts`)

```typescript
interface SentenceItem {
  id: string
  english: string      // 완성 목표 문장
  parts: string[]      // 정답 한글 타일 (순서대로)
  distractors: string[] // 오답 타일 (2~3개)
}
```

**기초 문장 20개 (학습 단어 기반):**
- 인사: Hello! / Good morning! / Thank you! / Sorry!
- 음식/음료: Coffee, please. / I like milk. / I want bread.
- 동물: I like cats. / It's a dog. / I see a bird.
- 색깔: It's red. / I like blue.
- 숫자/크기: It's big. / It's small. / One, please.
- 장소/일상: Go home. / I'm happy. / It's hot. / It's cold.

---

### 단어 (`/src/data/words.ts`)

```typescript
interface WordItem {
  id: string        // "apple", "dog", ...
  word: string      // "apple"
  meaning: string   // "사과"
  emoji: string     // "🍎"
  category: string  // "fruit" | "animal" | "color" | "body" | "food"
}
```

**단어 카테고리 (100개):**
- 과일 (fruit): apple, banana, grape, orange, strawberry, watermelon, lemon, peach, mango, cherry (10개)
- 동물 (animal): cat, dog, bird, fish, rabbit, bear, elephant, lion, tiger, pig, monkey, horse, cow, sheep, duck (15개)
- 색깔 (color): red, blue, green, yellow, white, black, pink, purple, orange, brown (10개)
- 신체 (body): eye, ear, nose, mouth, hand, foot, head, hair, arm, leg, finger, toe (12개)
- 음식 (food): milk, egg, rice, bread, cake, juice, water, soup, pizza, cookie, cheese, carrot (12개)
- 숫자 (number): one, two, three, four, five, six, seven, eight, nine, ten (10개)
- 일상 (daily): hello, bye, yes, no, good, bad, big, small, hot, cold, happy, sad, thank you, sorry, please (15개)
- 장소 (place): home, school, park, shop, hospital, library (6개)

### 회화 (`/src/data/phrases.ts`) — Phase 2

```typescript
interface PhraseItem {
  id: string           // "greeting-1"
  english: string      // "Hello! How are you?"
  korean: string       // "안녕하세요! 어떻게 지내세요?"
  category: string     // "greeting" | "intro" | "daily"
  emoji: string        // "👋"
}
```

**회화 카테고리 (30개):**
- 인사 (greeting): Hello, Good morning, Good night, How are you?, I'm fine, Nice to meet you (6개)
- 자기소개 (intro): My name is..., I am ... years old, I'm from Korea, I like ..., I can... (8개)
- 일상 표현 (daily): Thank you, Sorry, Please, Excuse me, Yes/No, I don't know, Help me (8개)
- 쇼핑/장소 (place): How much?, I want this, Where is ...?, I'm hungry, Let's go (8개)

---

## 6. 상태 관리

### localStorage 스키마

```typescript
interface AppStorage {
  streak: number                    // 연속 학습 일수
  lastStudiedDate: string           // "2026-04-15" 형식
  alphabetProgress: string[]        // 완료한 알파벳 ID 배열 (["A","B","C"])
  wordProgress: string[]            // 완료한 단어 ID 배열 (["apple","dog"])
  phraseProgress: string[]          // 완료한 회화 ID 배열 (Phase 2)
}
```

### Context 구조

```
AppContext
├── progress: AppStorage
├── markAlphabetDone(id: string): void
├── markWordDone(id: string): void
├── markPhraseDone(id: string): void   // Phase 2
├── updateStreak(): void
└── isPhraseUnlocked(): boolean        // wordProgress.length >= 50
```

---

## 7. 컴포넌트 구조

```
src/
├── main.tsx
├── App.tsx                    라우터 설정
├── context/
│   └── AppContext.tsx          전역 상태 (progress, streak)
├── data/
│   ├── alphabet.ts             알파벳 26개 데이터
│   ├── words.ts                단어 100개 데이터
│   ├── sentences.ts            기초 문장 20개 데이터 (Phase 1)
│   └── phrases.ts              회화 30개 데이터 (Phase 2)
├── pages/
│   ├── Home.tsx
│   ├── AlphabetList.tsx
│   ├── WordList.tsx
│   ├── PhraseList.tsx          Phase 2
│   ├── StudySession.tsx        알파벳/단어/회화 공용 학습 세션
│   └── Complete.tsx
├── components/
│   ├── FlashCard.tsx           Step 1 카드 보기
│   ├── QuizStep.tsx            Step 2 퀴즈 (유형 분기 담당)
│   │   ├── ImageChoiceQuiz.tsx   유형 A — 그림 보고 선택
│   │   ├── MatchingQuiz.tsx      유형 B — 단어 매칭
│   │   ├── ListenChoiceQuiz.tsx  유형 C — 소리 듣고 선택
│   │   └── SentenceBuilderQuiz.tsx 유형 D — 문장 조합 (타일 선택)
│   ├── PronunciationStep.tsx   Step 3 발음
│   ├── ProgressBar.tsx
│   ├── StreakCard.tsx
│   └── ProgressCard.tsx       홈의 진도 카드 (잠금 상태 포함)
└── hooks/
    └── useSpeech.ts            Web Speech API TTS 훅
```

**파일 크기 기준:** 각 파일 200줄 이하 유지

---

## 8. 디자인 시스템

### 8-1. 타이포그래피

**폰트:** Noto Sans KR (Google Fonts)
- `<link>` 태그로 `index.html`에 로드: weight 400, 700만 포함 (파일 크기 최소화)
- Tailwind `tailwind.config.ts`에 `fontFamily: { sans: ['Noto Sans KR', 'sans-serif'] }` 추가

| 용도 | 크기 | 굵기 | Tailwind 클래스 |
|------|------|------|----------------|
| 앱 타이틀 | 28px | Bold | `text-2xl font-bold` |
| 영어 단어 (FlashCard) | 36px | Bold | `text-4xl font-bold tracking-widest` |
| 이모지 (FlashCard) | 72px | — | `text-7xl` |
| 이모지 (퀴즈) | 60px | — | `text-6xl` |
| 한글 뜻 | 22px | Regular | `text-2xl` (Tailwind 24px, 가장 근접) |
| 본문 / 버튼 텍스트 | 18px | Bold | `text-lg font-bold` |
| 서브 텍스트 | 16px | Regular | `text-base` |
| 진행 카운터 | 14px | Regular | `text-sm` |

> 한글 뜻 22px는 Tailwind `text-2xl`(24px)로 대체 — 2px 차이, 가독성 동일.

### 8-2. 색상 시스템

```css
/* index.css에 CSS 변수로 정의 */
:root {
  --color-primary:   #1565C0;  /* #2196F3 → 더 짙은 파랑 (대비비 7.1:1 ✓) */
  --color-success:   #4CAF50;
  --color-error:     #F44336;
  --color-bg:        #FAFAFA;
  --color-card:      #FFFFFF;
  --color-text:      #212121;
  --color-text-sub:  #757575;
  --color-border:    #E0E0E0;
}
```

> **⚠️ 색상 수정:** 원래 `#2196F3`의 흰 배경 대비비는 4.49:1 (WCAG AA 4.5:1 기준 미달).
> `#1565C0`으로 변경 → 대비비 7.1:1 (AAA 충족). 버튼 텍스트(흰색)도 확보됨.
> Tailwind에서는 커스텀 색상으로 등록: `colors: { primary: '#1565C0', ... }`

### 8-3. 간격 시스템 (Tailwind 기준)

| 역할 | 값 | Tailwind 클래스 |
|------|-----|----------------|
| 화면 좌우 패딩 | 16px | `px-4` |
| 카드 내부 패딩 | 20px | `p-5` |
| 요소 간 간격 | 12px | `gap-3` |
| 섹션 간 간격 | 24px | `gap-6` |
| 버튼 세로 패딩 | 14px (높이 52px 확보) | `py-3.5` |

### 8-4. 컴포넌트 규격

| 컴포넌트 | 최소 크기 | Border radius | 비고 |
|---------|---------|--------------|------|
| 버튼 (Primary) | 전체 너비 × 52px | `rounded-xl` (12px) | 배경 `--color-primary` |
| 퀴즈 선택지 버튼 | 전체 너비 × 52px | `rounded-xl` | 4개 수직 배치 |
| 카드 (FlashCard) | 전체 너비 × auto | `rounded-2xl` (16px) | 흰 배경 + 그림자 `shadow-md` |
| 진도 카드 (홈) | 절반 너비 × auto | `rounded-2xl` | 2열 그리드 |
| 알파벳/단어 타일 | (너비-32px)/4 × same | `rounded-xl` | 4열 그리드 |
| 타이핑 입력 필드 | 전체 너비 × 48px | `rounded-lg` (8px) | 테두리 `--color-border` |
| 매칭 카드 | (너비-48px)/2 × 52px | `rounded-xl` | 2열, 탭 인터랙션 |

### 8-5. UI 원칙 (기존 유지 + 확장)

- 최대 너비: 480px (모바일 우선, 데스크탑에서 `mx-auto`)
- 버튼 최소 높이: 52px (큰 터치 영역 — 노년층 손가락 크기)
- 배경: `#FAFAFA`, 카드: `#FFFFFF`
- 정답: `#4CAF50`, 오답: `#F44336`
- 모든 인터랙티브 요소 최소 터치 영역: 44×44px
- 그림자: `shadow-md` (카드) / `shadow-sm` (버튼 hover)

---

## 9. 오류 처리

- Web Speech API 미지원 브라우저: "이 브라우저는 발음 기능을 지원하지 않습니다" 안내 + 학습은 계속 진행 가능
- localStorage 저장 실패: 에러 무시, 세션 내 메모리 상태로 동작

---

## 10. Phase 2 — 기초 회화 (MVP 이후)

회화 학습은 단어 50개 이상 완료 후 잠금 해제.

**회화 학습 방식 (단어와 동일한 3단계):**
- Step 1: 문장 카드 보기 (영어 + 한국어 + 발음 버튼)
- Step 2: 빈칸 채우기 또는 순서 맞추기 (단어 퀴즈와 차별화)
- Step 3: 발음 듣고 따라하기

> 회화 Step 2 퀴즈 방식은 Phase 2 설계 시 별도 확정.

---

## 10-X. 반응형 & 접근성 (a11y)

### 반응형

- **모바일 우선:** 최대 너비 480px, `mx-auto`로 데스크탑 중앙 정렬
- **iOS Safari 하단 바:** `padding-bottom: env(safe-area-inset-bottom)` 적용 — 특히 "다음 ▶" "완료 ✓" 버튼이 홈 인디케이터에 가리지 않도록. `index.css`에 전역 설정:
  ```css
  body { padding-bottom: env(safe-area-inset-bottom, 0px); }
  ```
- **데스크탑 브라우저:** 480px 중앙 정렬, 마우스 hover 상태에서도 52px 버튼 유효
- **landscape 모드 (가로):** 학습 세션에서 이모지 크기 72px → 40px로 축소 (`landscape:text-5xl`)하여 화면 잘림 방지

### 접근성 (ARIA & 키보드)

**퀴즈 선택지 버튼:**
```tsx
<button
  role="radio"
  aria-checked={isSelected}
  aria-label={`선택지: ${option}`}
>
```

**발음 버튼:**
```tsx
<button aria-label="발음 듣기" aria-live="polite">
  🔊 발음 듣기
</button>
```
TTS 재생 중: `aria-busy="true"`, 완료: `aria-busy="false"`

**매칭 퀴즈 카드:**
```tsx
<button
  role="option"
  aria-selected={isSelected}
  aria-label={`${side === 'en' ? '영어' : '한글'}: ${text}`}
>
```

**진행 표시줄:**
```tsx
<div
  role="progressbar"
  aria-valuenow={currentIndex}
  aria-valuemax={totalItems}
  aria-label={`${currentIndex}번째 / 총 ${totalItems}개`}
/>
```

**키보드 내비게이션:**
- 퀴즈 선택지: 숫자 키 1-4로 선택 가능 (`keydown` 이벤트)
- Enter: 선택 확인 / "다음" 버튼 트리거
- Escape: 세션 이탈 다이얼로그 표시

**색상 대비:**
- 본문 `#212121` on `#FFFFFF`: 16.1:1 ✅
- Primary `#1565C0` on `#FFFFFF`: 7.1:1 ✅ (Pass 5에서 수정)
- 정답 `#4CAF50` on `#FFFFFF`: 2.5:1 ❌ — 배경으로만 사용, 텍스트 색상은 `#FFFFFF` 또는 `#1B5E20`으로 표시

**reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-shake { animation: none; }
}
```

---

## 11. 비 범위 (전체 제외)

- 사용자 계정 / 로그인
- AI 발음 교정 (Web Speech Recognition 기반 검토는 Phase 2 이후)
- 소셜 기능 (랭킹, 공유)
- 다크 모드
- 다국어 지원

---

## 12. 다음 단계

스펙 승인 후 → `writing-plans` 스킬로 구현 플랜 작성
