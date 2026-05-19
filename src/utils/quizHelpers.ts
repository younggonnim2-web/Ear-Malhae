import type { StudyItem, WordItem } from '../types'
import { isWordItem } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 의미적으로 연관된 카테고리 매핑 (오답 선택 시 우선 참조)
const RELATED_CATEGORIES: Partial<Record<WordItem['category'], Array<WordItem['category']>>> = {
  family:    ['daily'],
  daily:     ['family'],
  fruit:     ['food'],
  food:      ['fruit'],
  body:      ['health'],
  health:    ['body'],
  place:     ['transport'],
  transport: ['place'],
  weather:   ['feeling'],
  feeling:   ['weather'],
}

export function pickDistractors<T extends StudyItem>(correct: T, pool: T[], count: number): T[] {
  const others = pool.filter(item => item.id !== correct.id)

  if (!isWordItem(correct)) {
    return shuffle(others).slice(0, count)
  }

  const relatedCats: Array<WordItem['category']> = RELATED_CATEGORIES[correct.category] ?? []

  const sameCategory = shuffle(
    others.filter(item => isWordItem(item) && (item as WordItem).category === correct.category)
  ) as T[]
  const related = shuffle(
    others.filter(item => isWordItem(item) && relatedCats.includes((item as WordItem).category))
  ) as T[]
  const unrelated = shuffle(
    others.filter(item => {
      if (!isWordItem(item)) return true
      const cat = (item as WordItem).category
      return cat !== correct.category && !relatedCats.includes(cat)
    })
  ) as T[]

  return [...sameCategory, ...related, ...unrelated].slice(0, count)
}

export function buildChoices<T extends StudyItem>(correct: T, pool: T[], count = 4): T[] {
  const distractors = pickDistractors(correct, pool, count - 1)
  return shuffle([correct, ...distractors])
}
