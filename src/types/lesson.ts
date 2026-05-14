// src/types/lesson.ts
import type { QuizDirection } from './index'

export type ChallengeKind =
  | 'flash'
  | 'matching'
  | 'image-choice'
  | 'listen-choice'
  | 'sentence-builder'

export type ChallengeTag = '새로운 단어' | '어려운 연습'

export interface LessonChallenge {
  kind: ChallengeKind
  itemId?: string
  direction?: QuizDirection
  sentenceId?: string
  displayMode?: 'cards' | 'list'
  tag?: ChallengeTag
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
