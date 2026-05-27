import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem, WordItem } from '../types'
import { shuffle } from './quizHelpers'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
  unitType: 'alphabet' | 'words' | 'sentences' = 'words',
  completionCount = 0,
  sectionBaseTier = 0,
  reviewItems: WordItem[] = [],
  difficultyOffset = 0,
): LessonChallenge[] {
  if (unitType === 'alphabet') return buildAlphabetSequence(lesson.itemIds)
  if (unitType === 'sentences') return buildSentenceSequence(lesson, allSentences, completionCount)
  return buildWordsSequence(lesson.itemIds, lessonIndex, lesson.unitId, allSentences, completionCount, sectionBaseTier, reviewItems, difficultyOffset)
}

/**
 * 문장형 레슨 시퀀스 (중급·고급 트랙 전용)
 * 단어 플래시카드 없이 문장 상황 → 선택 → 구성 → 빈칸 순서로 진행
 *
 * Tier 0: dialogue-choice → sentence-pick(en-to-ko) → sentence-builder(en-to-ko)
 * Tier 1: dialogue-choice → sentence-pick(ko-to-en) → sentence-builder(ko-to-en)
 * Tier 2+: dialogue-choice → fill-blank(keyboard) → sentence-builder(listen-build)
 */
function buildSentenceSequence(
  lesson: Lesson,
  allSentences: SentenceItem[],
  completionCount: number,
): LessonChallenge[] {
  const ids = lesson.sentenceIds ?? []
  const sentences = ids.map(id => allSentences.find(s => s.id === id)!).filter(Boolean)
  const tier = Math.min(completionCount, 2)
  const seq: LessonChallenge[] = []

  // 핵심 단어 발음용 partIndex 찾기: 가장 짧고 공백 없는 englishParts 인덱스 우선
  function findKeyPartIndex(s: SentenceItem): number {
    let best = -1
    let bestLen = Infinity
    for (let i = 0; i < s.englishParts.length; i++) {
      const ep = s.englishParts[i]
      if (!ep || ep.includes(' ')) continue
      if (ep.length > 1 && ep.length < bestLen) {
        best = i
        bestLen = ep.length
      }
    }
    return best
  }

  if (tier === 0) {
    // 상황 이해 → 번역 선택 → 빈칸 채우기 → 문장 구성
    for (const s of sentences)
      if (s.dialoguePrompt)
        seq.push({ kind: 'dialogue-choice', sentenceId: s.id, tag: '새로운 패턴' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })
    for (const s of sentences)
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, fillDir: 'ko', tag: '새로운 단어' })
    for (const s of sentences.slice(0, 1))
      seq.push({ kind: 'translate-type', sentenceId: s.id, tag: '어려운 연습' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어', distractorCount: 2 })
    // 말해보기: 핵심 단어 1문제 (가장 짧은 단어 englishPart)
    if (sentences[0]) {
      const partIdx = findKeyPartIndex(sentences[0])
      if (partIdx >= 0)
        seq.push({ kind: 'speak-sentence', sentenceId: sentences[0].id, partIndex: partIdx, tag: '어려운 연습' })
    }
  }

  if (tier === 1) {
    // 역방향 번역 선택 → 빈칸 채우기 → 듣고 타이핑 → 역방향 구성
    for (const s of sentences)
      if (s.dialoguePrompt)
        seq.push({ kind: 'dialogue-choice', sentenceId: s.id, tag: '새로운 패턴' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'ko-to-en', tag: '새로운 패턴' })
    for (const s of sentences)
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, fillDir: 'ko', tag: '새로운 패턴' })
    for (const s of sentences.slice(0, 1))
      seq.push({ kind: 'listen-type', sentenceId: s.id, tag: '어려운 연습' })
    for (const s of sentences.slice(0, 1))
      seq.push({ kind: 'translate-type', sentenceId: s.id, tag: '어려운 연습' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습', distractorCount: 3 })
    // 말해보기: 핵심 단어 1 + 문장 전체 1
    if (sentences[0]) {
      const partIdx = findKeyPartIndex(sentences[0])
      if (partIdx >= 0)
        seq.push({ kind: 'speak-sentence', sentenceId: sentences[0].id, partIndex: partIdx, tag: '어려운 연습' })
    }
    if (sentences[1] ?? sentences[0])
      seq.push({ kind: 'speak-sentence', sentenceId: (sentences[1] ?? sentences[0]).id, tag: '어려운 연습' })
  }

  if (tier >= 2) {
    // 번역 선택 → 영어 직접 입력 → 듣고 타이핑 × 2 → 오디오 듣고 구성
    for (const s of sentences)
      if (s.dialoguePrompt)
        seq.push({ kind: 'dialogue-choice', sentenceId: s.id, tag: '새로운 패턴' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'ko-to-en', tag: '새로운 패턴' })
    for (const s of sentences)
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.englishParts.length > 1 ? 1 : 0, fillDir: 'en', keyboardInput: true, tag: '어려운 연습' })
    for (const s of sentences.slice(0, 2))
      seq.push({ kind: 'listen-type', sentenceId: s.id, tag: '어려운 연습' })
    for (const s of sentences.slice(0, 2))
      seq.push({ kind: 'translate-type', sentenceId: s.id, tag: '어려운 연습' })
    for (const s of sentences)
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', listenBuild: true, tag: '어려운 연습', distractorCount: 3 })
    // 말해보기: 핵심 단어 1 + 문장 전체 1 (tier 1과 동일 구성)
    if (sentences[0]) {
      const partIdx = findKeyPartIndex(sentences[0])
      if (partIdx >= 0)
        seq.push({ kind: 'speak-sentence', sentenceId: sentences[0].id, partIndex: partIdx, tag: '어려운 연습' })
    }
    if (sentences[1] ?? sentences[0])
      seq.push({ kind: 'speak-sentence', sentenceId: (sentences[1] ?? sentences[0]).id, tag: '어려운 연습' })
  }

  return seq
}

/**
 * 단어 레슨 시퀀스 — 완료 횟수에 따라 4단계 난이도 티어
 * 각 티어는 다른 유형을 연속으로 쌓지 않고 아이템 단위로 교차(interleave) 배치한다.
 *
 * Tier 0 (첫 학습): 카드 소개 후 [list+listen] 쌍 교차
 *   cards×N | [list,listen]×⌈N/2⌉ | listen×⌊N/2⌋ | sb(en-to-ko)×2 | matching | sb(ko-to-en)×2  = 18 (N=5)
 *
 * Tier 1 (2회차): [list,listen] 쌍 교차, 역방향 list
 *   [list,listen]×N | list(en-to-ko)×⌈N/2⌉ | fill×2 | sb(en-to-ko)×3 | matching | sb(ko-to-en)×3 = 22 (N=5)
 *
 * Tier 2 (3회차): [list,listen,list(en)] 3연속 교차, speak 추가
 *   [list,listen,list(en)]×N | speak×2 | fill×3 | sb(en-to-ko)×3 | matching | sb(ko-to-en)×4 = 28 (N=5)
 *
 * Tier 3 (4회차+): [listen,listen(en)] 쌍 교차, speak 강화
 *   [listen,listen(en)]×N | speak×3 | fill×3 | sb(en-to-ko)×4 | matching | sb(ko-to-en)×5 = 26 (N=5)
 */
function buildReviewChallenges(reviewItems: WordItem[]): LessonChallenge[] {
  return shuffle([...reviewItems])
    .slice(0, 2)
    .map(item => ({ kind: 'listen-choice' as const, itemId: item.id, direction: 'ko-to-en' as const, tag: '복습' as const }))
}

// 유닛 ID → 결정론적 숫자 (각 유닛이 다른 문장 풀을 참조하도록)
function unitSeed(unitId: string): number {
  return unitId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function buildWordsSequence(
  itemIds: string[],
  lessonIndex: number,
  unitId: string,
  allSentences: SentenceItem[],
  completionCount: number,
  sectionBaseTier: number,
  reviewItems: WordItem[],
  difficultyOffset = 0,
): LessonChallenge[] {
  const tier = Math.min(difficultyOffset + sectionBaseTier + completionCount, 3)
  const seq: LessonChallenge[] = []
  const N = itemIds.length
  const half = Math.ceil(N / 2)
  const seed = unitSeed(unitId)

  const usedSentenceIds = new Set<string>()

  function pickSentences(count: number, offset: number): SentenceItem[] {
    // 난이도별 문장 풀 결정
    let pool: SentenceItem[]
    if (difficultyOffset >= 2) {
      // 고급: advanced 우선, 부족하면 전체 폴백
      const adv = allSentences.filter(s => s.difficulty === 'advanced')
      pool = adv.length >= 2 ? adv : allSentences
    } else if (difficultyOffset >= 1) {
      // 중급: basic + intermediate (advanced 제외)
      const nonAdv = allSentences.filter(s => s.difficulty !== 'advanced')
      pool = nonAdv.length > 0 ? nonAdv : allSentences
    } else {
      // 초급: basic만
      const basic = allSentences.filter(s => s.difficulty === 'basic' || !s.difficulty)
      pool = basic.length > 0 ? basic : allSentences
    }
    // 이미 이번 세션에서 사용한 문장은 제외 — 부족하면 전체 풀로 폴백
    const unused = pool.filter(s => !usedSentenceIds.has(s.id))
    const source = unused.length >= count ? unused : pool
    const result = Array.from({ length: count }, (_, i) =>
      source[(seed + lessonIndex * 5 + offset + i) % source.length]
    )
    result.forEach(s => usedSentenceIds.add(s.id))
    return result
  }

  // dialoguePrompt가 있는 고급 문장만 — Tier 2/3 dialogue-choice용
  function pickDialogueSentences(count: number, offset: number): SentenceItem[] {
    const pool = allSentences.filter(s => !!s.dialoguePrompt)
    if (pool.length === 0) return []
    return Array.from({ length: count }, (_, i) =>
      pool[(seed + lessonIndex * 5 + offset + i) % pool.length]
    )
  }

  if (tier === 0) {
    // Phase 1: 전체 카드 소개
    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'cards', tag: '새로운 단어' })

    // Phase 2: [list, listen] 쌍 교차 — 처음 half 아이템은 둘 다, 나머지는 listen만
    const shuf0 = shuffle([...itemIds])
    for (let i = 0; i < N; i++) {
      if (i < half) {
        seq.push({ kind: 'image-choice', itemId: shuf0[i], direction: 'ko-to-en', displayMode: 'list' })
        seq.push({ kind: 'listen-choice', itemId: shuf0[i], direction: 'ko-to-en' })
      } else {
        seq.push({ kind: 'listen-choice', itemId: shuf0[i], direction: 'ko-to-en' })
      }
    }

    // Phase 3: 문장 연습 (tier 0 — distractor 1개: 핵심 오답만)
    for (const s of pickSentences(2, 0))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어', distractorCount: 1 })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(2, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습', distractorCount: 1 })
  }

  if (tier === 1) {
    // [list(ko-to-en), listen] 쌍 교차
    for (const id of shuffle([...itemIds])) {
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })
    }

    // 역방향 list (절반)
    for (const id of shuffle([...itemIds.slice(0, half)]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'en-to-ko', displayMode: 'list' })

    // 문장 번역 선택형 1문제 (en-to-ko: 영어 보고 한국어 선택)
    for (const s of pickSentences(1, 0))
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 패턴' })

    for (const s of pickSentences(1, 1))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    // tier 1 — distractor 2개
    for (const s of pickSentences(3, 2))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어', distractorCount: 2 })

    for (const id of shuffle([...itemIds]).slice(0, 2))
      seq.push({ kind: 'type-word', itemId: id, tag: '어려운 연습' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(3, 5))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습', distractorCount: 2 })
  }

  if (tier === 2) {
    // [list(ko-to-en), listen, list(en-to-ko)] 3연속 교차
    for (const id of shuffle([...itemIds])) {
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })
      seq.push({ kind: 'image-choice', itemId: id, direction: 'en-to-ko', displayMode: 'list' })
    }

    for (const id of shuffle([...itemIds]).slice(0, 3))
      seq.push({ kind: 'type-word', itemId: id, tag: '어려운 연습' })

    for (const id of shuffle([...itemIds]).slice(0, 2))
      seq.push({ kind: 'speak-check', itemId: id, tag: '어려운 연습' })

    // 대화 상황 선택형 (고급 문장 있을 때만)
    for (const s of pickDialogueSentences(1, 0))
      seq.push({ kind: 'dialogue-choice', sentenceId: s.id, tag: '새로운 패턴' })

    // 문장 번역 선택형 2문제 (양방향)
    for (const s of pickSentences(1, 0))
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 패턴' })
    for (const s of pickSentences(1, 1))
      seq.push({ kind: 'sentence-pick', sentenceId: s.id, direction: 'ko-to-en', tag: '새로운 패턴' })

    for (const s of pickSentences(3, 2))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    // tier 2 — distractor 3개
    for (const s of pickSentences(2, 5))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어', distractorCount: 3 })

    // Listen & Build: 오디오만 듣고 영어 타일 배열 (텍스트 힌트 없음)
    for (const s of pickSentences(1, 7))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', listenBuild: true, tag: '어려운 연습', distractorCount: 3 })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(4, 8))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습', distractorCount: 3 })
  }

  if (tier === 3) {
    // [listen(ko-to-en), listen(en-to-ko)] 쌍 교차
    for (const id of shuffle([...itemIds])) {
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'en-to-ko' })
    }

    for (const id of shuffle([...itemIds]).slice(0, 3))
      seq.push({ kind: 'speak-check', itemId: id, tag: '어려운 연습' })

    // 대화 상황 선택형 2문제 (고급 문장 있을 때만)
    for (const s of pickDialogueSentences(2, 0))
      seq.push({ kind: 'dialogue-choice', sentenceId: s.id, tag: '새로운 패턴' })

    // tier 3 — fill-blank: 영어 직접 타이핑 (keyboardInput), distractor 전체 사용
    for (const s of pickSentences(3, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.englishParts.length > 1 ? 1 : 0, fillDir: 'en', keyboardInput: true, tag: '새로운 패턴' })

    for (const s of pickSentences(4, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    // Listen & Build 2문제 — 텍스트 힌트 없이 오디오만
    for (const s of pickSentences(2, 7))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', listenBuild: true, tag: '어려운 연습' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(5, 9))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
  }

  // 이전 섹션 복습 문제 — matching 직전에 삽입
  if (reviewItems.length > 0) {
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    if (matchIdx >= 0) {
      seq.splice(matchIdx, 0, ...buildReviewChallenges(reviewItems))
    }
  }

  return seq
}

/**
 * 알파벳 레슨 시퀀스
 * Stage 1: 전체 flash  — 알파벳 소개
 * Stage 2: 이미지카드(en-to-ko) per item  — 예시단어 보고 그림 고르기
 * Stage 3: matching
 * Stage 4: listen-choice per item  — 소리 듣고 맞추기
 * (문장 연습 없음)
 */
function buildAlphabetSequence(itemIds: string[]): LessonChallenge[] {
  const seq: LessonChallenge[] = []

  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
  }

  for (const itemId of shuffle([...itemIds])) {
    seq.push({ kind: 'image-choice', itemId, direction: 'en-to-ko', displayMode: 'cards' })
  }

  seq.push({ kind: 'matching' })

  for (const itemId of shuffle([...itemIds])) {
    seq.push({ kind: 'listen-choice', itemId, direction: 'en-to-ko' })
  }

  return seq
}
