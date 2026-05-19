import { describe, it, expect } from 'vitest'
import { LESSONS_MAP } from '../../data/lessons'
import { WORDS } from '../../data/words'
import { ALPHABET } from '../../data/alphabet'

const wordIds = new Set(WORDS.map(w => w.id))
const alphabetIds = new Set(ALPHABET.map(a => a.id))

describe('data integrity', () => {
  it('모든 lesson itemId가 words.ts 또는 alphabet.ts에 존재한다', () => {
    for (const [lessonId, lesson] of Object.entries(LESSONS_MAP)) {
      const pool = lesson.unitId === 'alphabet' ? alphabetIds : wordIds
      for (const itemId of lesson.itemIds) {
        expect(pool.has(itemId), `lesson "${lessonId}": itemId "${itemId}" not found`).toBe(true)
      }
    }
  })

  it('words.ts ID 중복 없음', () => {
    const ids = WORDS.map(w => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('alphabet.ts ID 중복 없음', () => {
    const ids = ALPHABET.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
