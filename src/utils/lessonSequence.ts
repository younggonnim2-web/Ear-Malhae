import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'

export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const { itemIds } = lesson
  const seq: LessonChallenge[] = []

  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
  }

  seq.push({ kind: 'matching' })

  for (let i = 0; i < itemIds.length; i++) {
    seq.push({
      kind: 'image-choice',
      itemId: itemIds[i],
      direction: i % 2 === 0 ? 'en-to-ko' : 'ko-to-en',
    })
  }

  const listenCount = Math.ceil(itemIds.length / 2)
  for (let i = 0; i < listenCount; i++) {
    seq.push({
      kind: 'listen-choice',
      itemId: itemIds[i],
      direction: 'en-to-ko',
    })
  }

  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id })
  }

  return seq
}
