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
  category: 'fruit' | 'animal' | 'color' | 'body' | 'food' | 'number' | 'daily' | 'place' | 'family' | 'weather' | 'feeling' | 'transport' | 'health'
  sentence?: string
}

export type StudyItem = AlphabetItem | WordItem

export function isWordItem(item: StudyItem): item is WordItem {
  return 'category' in item
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface AppStorage {
  streak: number
  lastStudiedDate: string
  alphabetProgress: string[]
  wordProgress: string[]
  lessonProgress: string[]
  lessonStars: Record<string, 1 | 2 | 3>
  lessonCompletionCount: Record<string, number>
  onboardingDone: boolean
  difficultyLevel: DifficultyLevel
}

export interface AppContextValue {
  progress: AppStorage
  markAlphabetDone: (id: string) => void
  markWordDone: (id: string) => void
  markLessonDone: (id: string, stars: 1 | 2 | 3) => void
  updateStreak: () => void
  isPhraseUnlocked: () => boolean
  skipToSection: (lessonIds: string[]) => void
  setDifficulty: (level: DifficultyLevel) => void
  totalXp: number
  currentLevel: number
  xpToNextLevel: number | null
}

export type QuizType = 'image-choice' | 'matching' | 'listen-choice' | 'sentence-builder'

export interface SentenceItem {
  id: string
  english: string
  korean: string
  parts: string[]
  distractors: string[]
  englishDistractors: string[]
  englishParts: string[]
  category?: WordItem['category']
  difficulty?: 'basic' | 'intermediate' | 'advanced'
  scenario?: string
  dialoguePrompt?: string
}
export type QuizDirection = 'en-to-ko' | 'ko-to-en'

export interface QuizAssignment {
  type: QuizType
  direction: QuizDirection
}

export type { ChallengeKind, ChallengeTag, LessonChallenge, Lesson, Unit } from './lesson'
