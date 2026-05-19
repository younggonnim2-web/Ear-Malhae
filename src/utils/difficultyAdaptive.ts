import type { AppStorage, DifficultyLevel } from '../types'

export interface AdaptiveSuggestion {
  type: 'upgrade' | 'downgrade'
  from: DifficultyLevel
  to: DifficultyLevel
}

export function checkAdaptiveDifficulty(
  progress: AppStorage,
  sectionLessonIds: string[],
): AdaptiveSuggestion | null {
  const { difficultyLevel, lessonStars, lessonCompletionCount, lessonProgress } = progress

  const completedInSection = sectionLessonIds.filter(id => lessonProgress.includes(id))
  if (completedInSection.length < 3) return null

  const last3 = completedInSection.slice(-3)
  const stars = last3.map(id => lessonStars[id] ?? 0)
  const counts = last3.map(id => lessonCompletionCount[id] ?? 0)
  const avgStars = stars.reduce((a, b) => a + b, 0) / stars.length

  if (stars.every(s => s === 3) && counts.every(c => c <= 1) && difficultyLevel !== 'advanced') {
    const to: DifficultyLevel = difficultyLevel === 'beginner' ? 'intermediate' : 'advanced'
    return { type: 'upgrade', from: difficultyLevel, to }
  }

  if (avgStars <= 1.5 && difficultyLevel !== 'beginner') {
    const to: DifficultyLevel = difficultyLevel === 'advanced' ? 'intermediate' : 'beginner'
    return { type: 'downgrade', from: difficultyLevel, to }
  }

  return null
}
