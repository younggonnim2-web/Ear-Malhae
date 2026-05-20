// src/types/lesson.ts
import type { QuizDirection } from './index'

export type ChallengeKind =
  | 'flash'
  | 'matching'
  | 'image-choice'
  | 'listen-choice'
  | 'sentence-builder'
  | 'fill-blank'
  | 'speak-check'
  | 'sentence-pick'
  | 'dialogue-choice'

export type ChallengeTag = '새로운 단어' | '어려운 연습' | '새로운 패턴' | '복습'

export interface LessonChallenge {
  kind: ChallengeKind
  itemId?: string
  direction?: QuizDirection
  sentenceId?: string
  displayMode?: 'cards' | 'list'
  tag?: ChallengeTag
  blankIndex?: number
  listenBuild?: boolean
  fillDir?: 'ko' | 'en'
  keyboardInput?: boolean
  distractorCount?: number
  skipped?: boolean
}

export interface Lesson {
  id: string
  unitId: string
  title: string
  itemIds: string[]
  sentenceIds?: string[]  // sentence-type 레슨용
}

export interface Unit {
  id: string
  title: string
  emoji: string
  type: 'alphabet' | 'words' | 'sentences'
  lessonIds: string[]
}
