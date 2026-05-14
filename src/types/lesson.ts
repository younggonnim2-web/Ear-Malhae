// src/types/lesson.ts
import type { QuizDirection } from './index'

export type ChallengeKind =
  | 'flash'
  | 'matching'
  | 'image-choice'
  | 'listen-choice'
  | 'sentence-builder'

export interface LessonChallenge {
  kind: ChallengeKind
  itemId?: string
  direction?: QuizDirection
  sentenceId?: string
}

export interface Lesson {
  id: string
  unitId: string
  title: string
  itemIds: string[]
}

export interface Unit {
  id: string
  title: string
  emoji: string
  type: 'alphabet' | 'words'
  lessonIds: string[]
}
