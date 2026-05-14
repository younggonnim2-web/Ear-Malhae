export interface AlphabetItem {
  id: string
  letter: string
  sound: string
  emoji: string
  exampleWord: string
  meaning: string
}

export interface WordItem {
  id: string
  word: string
  meaning: string
  emoji: string
  category: 'fruit' | 'animal' | 'color' | 'body' | 'food' | 'number' | 'daily' | 'place'
}

export type StudyItem = AlphabetItem | WordItem

export function isWordItem(item: StudyItem): item is WordItem {
  return 'category' in item
}

export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
  lessonProgress: string[]
}

export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  markLessonDone: (id: string) => void
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
}

export type QuizType = 'image-choice' | 'matching' | 'listen-choice' | 'sentence-builder'

export interface SentenceItem {
  id: string
  english: string
  parts: string[]
  distractors: string[]
}
export type QuizDirection = 'en-to-ko' | 'ko-to-en'

export interface QuizAssignment {
  type: QuizType
  direction: QuizDirection
}

export type { ChallengeKind, LessonChallenge, Lesson, Unit } from './lesson'
