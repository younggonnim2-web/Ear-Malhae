import type { StudyItem } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function pickDistractors<T extends StudyItem>(correct: T, pool: T[], count: number): T[] {
  const others = pool.filter(item => item.id !== correct.id)
  return shuffle(others).slice(0, count)
}

export function buildChoices<T extends StudyItem>(correct: T, pool: T[], count = 4): T[] {
  const distractors = pickDistractors(correct, pool, count - 1)
  return shuffle([correct, ...distractors])
}
