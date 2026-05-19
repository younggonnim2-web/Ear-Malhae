import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'
import { shuffle } from './quizHelpers'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
  unitType: 'alphabet' | 'words' = 'words',
  completionCount = 0,
): LessonChallenge[] {
  return unitType === 'alphabet'
    ? buildAlphabetSequence(lesson.itemIds)
    : buildWordsSequence(lesson.itemIds, lessonIndex, allSentences, completionCount)
}

/**
 * 단어 레슨 시퀀스 — 완료 횟수에 따라 4단계 난이도 티어
 *
 * Tier 0 (첫 학습): 카드+이미지 중심, 문장 입문
 *   cards(ko-to-en)×N | list(ko-to-en)×⌈N/2⌉ | listen×⌈N/2⌉ |
 *   sb(en-to-ko)×2 | list(ko-to-en)×⌊N/2⌋ | sb(en-to-ko)×1 | matching | sb(ko-to-en)×2  = 19
 *
 * Tier 1 (2회차): 카드 제거, 역방향 이미지 추가, 듣기 전체 아이템, 문장 +1
 *   list(ko-to-en)×N | listen×N | list(en-to-ko)×⌈N/2⌉ |
 *   sb(en-to-ko)×3 | matching | sb(ko-to-en)×3  = 20
 *
 * Tier 2 (3회차): 이미지 양방향 전체, 문장 강화
 *   list(ko-to-en)×N | list(en-to-ko)×N | listen×N |
 *   sb(en-to-ko)×3 | matching | sb(ko-to-en)×4  = 23
 *
 * Tier 3 (4회차+): 듣기+문장 중심, 시각 단서 최소화
 *   listen(ko-to-en)×N | listen(en-to-ko)×N |
 *   sb(en-to-ko)×4 | matching | sb(ko-to-en)×5  = 20
 */
function buildWordsSequence(
  itemIds: string[],
  lessonIndex: number,
  allSentences: SentenceItem[],
  completionCount: number,
): LessonChallenge[] {
  const tier = Math.min(completionCount, 3)
  const seq: LessonChallenge[] = []
  const N = itemIds.length
  const half = Math.ceil(N / 2)

  function pickSentences(count: number, offset: number): SentenceItem[] {
    return Array.from({ length: count }, (_, i) =>
      allSentences[(lessonIndex * 5 + offset + i) % allSentences.length]
    )
  }

  if (tier === 0) {
    const firstHalf = itemIds.slice(0, half)
    const secondHalf = itemIds.slice(half)

    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'cards', tag: '새로운 단어' })

    for (const id of shuffle([...firstHalf]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })

    for (const id of shuffle([...firstHalf]))
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })

    for (const s of pickSentences(2, 0))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    for (const id of shuffle([...secondHalf]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })

    for (const s of pickSentences(1, 2))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(2, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
  }

  if (tier === 1) {
    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })

    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })

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
    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'ko-to-en', displayMode: 'list' })

    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'image-choice', itemId: id, direction: 'en-to-ko', displayMode: 'list' })

    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })

    for (const s of pickSentences(3, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    for (const s of pickSentences(3, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(4, 6))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
  }

  if (tier === 3) {
    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'ko-to-en' })

    for (const id of shuffle([...itemIds]))
      seq.push({ kind: 'listen-choice', itemId: id, direction: 'en-to-ko' })

    for (const s of pickSentences(3, 0))
      seq.push({ kind: 'fill-blank', sentenceId: s.id, blankIndex: s.parts.length > 1 ? 1 : 0, tag: '새로운 패턴' })

    for (const s of pickSentences(4, 3))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'en-to-ko', tag: '새로운 단어' })

    seq.push({ kind: 'matching' })

    for (const s of pickSentences(5, 7))
      seq.push({ kind: 'sentence-builder', sentenceId: s.id, direction: 'ko-to-en', tag: '어려운 연습' })
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

  for (const itemId of itemIds) {
    seq.push({ kind: 'image-choice', itemId, direction: 'en-to-ko', displayMode: 'cards' })
  }

  seq.push({ kind: 'matching' })

  for (const itemId of itemIds) {
    seq.push({ kind: 'listen-choice', itemId, direction: 'en-to-ko' })
  }

  return seq
}
