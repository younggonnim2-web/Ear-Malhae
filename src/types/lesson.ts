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
  | 'speak-sentence'  // 문장 또는 문장 내 핵심 단어 발음 (sentence 트랙용)
  | 'sentence-pick'
  | 'dialogue-choice'
  | 'listen-type'

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
  /** speak-sentence 전용: undefined면 문장 전체, 숫자면 englishParts[N]의 핵심 단어만 발음 */
  partIndex?: number
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
