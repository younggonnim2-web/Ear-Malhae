import type { Lesson, LessonChallenge } from '../types/lesson'
import type { SentenceItem } from '../types'

/**
 * Duolingo-style sequence:
 * Stage 1 — introduce each item then immediately quiz it (en-to-ko)
 * Stage 2 — matching to consolidate all items
 * Stage 3 — listen + reverse direction (ko-to-en) interleaved, first half of items
 * Stage 4 — sentence building
 */
export function buildChallengeSequence(
  lesson: Lesson,
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const { itemIds } = lesson
  const seq: LessonChallenge[] = []

  // Stage 1: flash → image-choice(en-to-ko) per item
  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
    seq.push({ kind: 'image-choice', itemId, direction: 'en-to-ko' })
  }

  // Stage 2: matching (consolidate)
  seq.push({ kind: 'matching' })

  // Stage 3: listen + ko-to-en interleaved, first half of items
  const practiceCount = Math.ceil(itemIds.length / 2)
  for (let i = 0; i < practiceCount; i++) {
    seq.push({ kind: 'listen-choice', itemId: itemIds[i], direction: 'en-to-ko' })
    seq.push({ kind: 'image-choice', itemId: itemIds[i], direction: 'ko-to-en' })
  }

  // Stage 4: sentence building
  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id })
  }

  return seq
}
