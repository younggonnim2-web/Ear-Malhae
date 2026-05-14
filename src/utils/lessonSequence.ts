import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
  unitType: 'alphabet' | 'words' = 'words',
): LessonChallenge[] {
  return unitType === 'alphabet'
    ? buildAlphabetSequence(lesson.itemIds)
    : buildWordsSequence(lesson.itemIds, lessonIndex, allSentences)
}

/**
 * 단어 레슨 시퀀스 (듀오링고 스타일)
 * Stage 1: image-choice(cards, ko-to-en) × N        [tag: 새로운 단어]
 * Stage 2: image-choice(list, ko-to-en) × ceil(N/2) (first half of items)
 * Stage 3: listen-choice(ko-to-en) × ceil(N/2)      (first half)
 * Stage 4: sentence-builder(en-to-ko) × 2           [tag: 새로운 단어]
 * Stage 5: image-choice(list, ko-to-en) × floor(N/2)(second half of items)
 * Stage 6: sentence-builder(en-to-ko) × 1           [tag: 새로운 단어]
 * Stage 7: matching × 1
 * Stage 8: sentence-builder(ko-to-en) × 2           [tag: 어려운 연습]
 *
 * For N=5: 5+3+3+2+2+1+1+2 = 19 total
 */
function buildWordsSequence(
  itemIds: string[],
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const seq: LessonChallenge[] = []
  const N = itemIds.length
  const half = Math.ceil(N / 2)
  const firstHalf = itemIds.slice(0, half)
  const secondHalf = itemIds.slice(half)

  // Stage 1: image-choice cards (ko-to-en) per item [tag: 새로운 단어]
  for (const itemId of itemIds) {
    seq.push({ kind: 'image-choice', itemId, direction: 'ko-to-en', displayMode: 'cards', tag: '새로운 단어' })
  }

  // Stage 2: image-choice list (ko-to-en) first half
  for (const itemId of firstHalf) {
    seq.push({ kind: 'image-choice', itemId, direction: 'ko-to-en', displayMode: 'list' })
  }

  // Stage 3: listen-choice (ko-to-en) first half
  for (const itemId of firstHalf) {
    seq.push({ kind: 'listen-choice', itemId, direction: 'ko-to-en' })
  }

  // Stage 4: sentence-builder (en-to-ko) × 2 [tag: 새로운 단어]
  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 3 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id, direction: 'en-to-ko', tag: '새로운 단어' })
  }

  // Stage 5: image-choice list (ko-to-en) second half
  for (const itemId of secondHalf) {
    seq.push({ kind: 'image-choice', itemId, direction: 'ko-to-en', displayMode: 'list' })
  }

  // Stage 6: sentence-builder (en-to-ko) × 1 [tag: 새로운 단어]
  {
    const idx = (lessonIndex * 3 + 2) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id, direction: 'en-to-ko', tag: '새로운 단어' })
  }

  // Stage 7: matching × 1
  seq.push({ kind: 'matching' })

  // Stage 8: sentence-builder (ko-to-en) × 2 [tag: 어려운 연습]
  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id, direction: 'ko-to-en', tag: '어려운 연습' })
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
