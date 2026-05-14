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
 * Stage 1: flash → 이미지카드(ko-to-en) per item  — 한국어 보고 이미지 고르기
 * Stage 2: matching
 * Stage 3: listen + 리스트(en-to-ko) 교차 per item  — 소리 듣기 + 뜻 고르기
 * Stage 4: sentence-builder × 2
 */
function buildWordsSequence(
  itemIds: string[],
  lessonIndex: number,
  allSentences: SentenceItem[],
): LessonChallenge[] {
  const seq: LessonChallenge[] = []

  for (const itemId of itemIds) {
    seq.push({ kind: 'flash', itemId })
    seq.push({ kind: 'image-choice', itemId, direction: 'ko-to-en', displayMode: 'cards' })
  }

  seq.push({ kind: 'matching' })

  const practiceCount = Math.ceil(itemIds.length / 2)
  for (let i = 0; i < practiceCount; i++) {
    seq.push({ kind: 'listen-choice', itemId: itemIds[i], direction: 'en-to-ko' })
    seq.push({ kind: 'image-choice', itemId: itemIds[i], direction: 'en-to-ko', displayMode: 'list' })
  }

  for (let i = 0; i < 2; i++) {
    const idx = (lessonIndex * 2 + i) % allSentences.length
    seq.push({ kind: 'sentence-builder', sentenceId: allSentences[idx].id })
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
