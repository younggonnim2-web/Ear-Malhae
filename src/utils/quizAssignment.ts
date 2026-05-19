import type { QuizAssignment, QuizType, QuizDirection } from '../types'

const QUIZ_TYPES: QuizType[] = ['image-choice', 'matching', 'listen-choice']

export function getQuizAssignment(wordIndex: number): QuizAssignment {
  const type = QUIZ_TYPES[wordIndex % 3]
  const direction: QuizDirection = wordIndex % 2 === 0 ? 'en-to-ko' : 'ko-to-en'
  return { type, direction }
}
