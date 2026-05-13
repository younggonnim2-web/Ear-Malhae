import type { StudyItem } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickDistractors<T extends StudyItem>(correct: T, pool: T[], count: number): T[] {
  const others = pool.filter(item => item.id !== correct.id)
  return shuffle(others).slice(0, count)
}

export function buildChoices<T extends StudyItem>(correct: T, pool: T[], count = 4): T[] {
  const distractors = pickDistractors(correct, pool, count - 1)
  return shuffle([correct, ...distractors])
}
