import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const { itemIds } = lesson
  const seq: LessonChallenge[] = []

  // Flash challenges: one for each item
  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
  }

  // Single matching challenge
  seq.push({ kind: 'matching' })

  // Image-choice challenges: one for each item, alternating direction
  for (let i = 0; i < itemIds.length; i++) {
    seq.push({
      kind: 'image-choice',
      itemId: itemIds[i],
      direction: i % 2 === 0 ? 'en-to-ko' : 'ko-to-en',
    })
  }

  // Listen-choice challenges: ceil(N/2) for each item
  const listenCount = Math.ceil(itemIds.length / 2)
  for (let i = 0; i < listenCount; i++) {
    seq.push({
      kind: 'listen-choice',
      itemId: itemIds[i],
      direction: 'en-to-ko',
    })
  }

  // Sentence-builder challenges: always 2, cycling through sentences based on lessonIndex
  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id })
  }

  return seq
}
