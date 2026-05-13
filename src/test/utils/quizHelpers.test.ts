import { describe, it, expect } from 'vitest'
import { shuffle, pickDistractors, buildChoices } from '../../utils/quizHelpers'
import type { WordItem } from '../../types'

const pool: WordItem[] = [
  { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' },
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
  { id: 'orange', word: 'orange', meaning: '오렌지', emoji: '🍊', category: 'fruit' },
  { id: 'lemon', word: 'lemon', meaning: '레몬', emoji: '🍋', category: 'fruit' },
]

describe('shuffle', () => {
  it('같은 요소를 포함하되 순서가 바뀔 수 있음', () => {
    const result = shuffle(pool)
    expect(result).toHaveLength(pool.length)
    expect(result).toEqual(expect.arrayContaining(pool))
  })

  it('원본 배열을 변경하지 않음', () => {
    const original = [...pool]
    shuffle(pool)
    expect(pool).toEqual(original)
  })
})

describe('pickDistractors', () => {
  it('정답을 제외한 N개 반환', () => {
    const result = pickDistractors(pool[0], pool, 3)
    expect(result).toHaveLength(3)
    expect(result.find(i => i.id === 'apple')).toBeUndefined()
  })
})

describe('buildChoices', () => {
  it('정답 포함 4개 반환', () => {
    const result = buildChoices(pool[0], pool, 4)
    expect(result).toHaveLength(4)
    expect(result.find(i => i.id === 'apple')).toBeDefined()
  })
})
