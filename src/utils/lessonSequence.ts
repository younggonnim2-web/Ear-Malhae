import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem, WordItem } from '../types'
import { shuffle } from './quizHelpers'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
  unitType: 'alphabet' | 'words' = 'words',
  completionCount = 0,
  sectionBaseTier = 0,
  reviewItems: WordItem[] = [],
  difficultyOffset = 0,
): LessonChallenge[] {
  return unitType === 'alphabet'
    ? buildAlphabetSequence(lesson.itemIds)
    : buildWordsSequence(lesson.itemIds, lessonIndex, lesson.unitId, allSentences, completionCount, sectionBaseTier, reviewItems, difficultyOffset)
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

  function pickSentences(count: number, offset: number): SentenceItem[] {
    return Array.from({ length: count }, (_, i) =>
      allSentences[(seed + lessonIndex * 5 + offset + i) % allSentences.length]
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

    // Phase 3: 문장 연습
    for (const s of pickSentences(2, 0))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(2, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
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

    for (const s of pickSentences(2, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    for (const s of pickSentences(3, 2))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(3, 5))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
  }

  if (tier === 2) {
    // [list(ko-to-en), listen, list(en-to-ko)] 3연속 교차
    for (const id of shuffle([...itemIds])) {
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })
      seq.push({ kind: 'image-choice', itemId: id, direction: 'en-to-ko', displayMode: 'list' })
    }

    for (const id of shuffle([...itemIds]).slice(0, 2))
      seq.push({ kind: 'speak-check', itemId: id, tag: '어려운 연습' })

    for (const s of pickSentences(3, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    for (const s of pickSentences(3, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(4, 6))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
  }

  if (tier === 3) {
    // [listen(ko-to-en), listen(en-to-ko)] 쌍 교차
    for (const id of shuffle([...itemIds])) {
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'en-to-ko' })
    }

    for (const id of shuffle([...itemIds]).slice(0, 3))
      seq.push({ kind: 'speak-check', itemId: id, tag: '어려운 연습' })

    for (const s of pickSentences(3, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    for (const s of pickSentences(4, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(5, 7))
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
