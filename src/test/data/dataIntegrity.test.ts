import { describe, it, expect } from 'vitest'
import { LESSONS_MAP } from '../../data/lessons'
import { WORDS } from '../../data/words'
import { ALPHABET } from '../../data/alphabet'
import { SENTENCES } from '../../data/sentences'

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

  it('모든 문장: parts.length === englishParts.length (위치 매핑 평행)', () => {
    for (const s of SENTENCES) {
      expect(
        s.parts.length,
        `sentence "${s.id}": parts.length(${s.parts.length}) !== englishParts.length(${s.englishParts.length})`,
      ).toBe(s.englishParts.length)
    }
  })

  it('모든 문장: englishDistractors.length >= distractors.length (앞 N개는 TTS 매핑, 나머지는 고급 오답)', () => {
    for (const s of SENTENCES) {
      expect(
        s.englishDistractors.length,
        `sentence "${s.id}": englishDistractors(${s.englishDistractors.length}) < distractors(${s.distractors.length})`,
      ).toBeGreaterThanOrEqual(s.distractors.length)
    }
  })

  it('모든 문장: 모든 parts/distractors 타일에 영어 매핑이 존재', () => {
    for (const s of SENTENCES) {
      s.englishParts.forEach((ep, i) => {
        expect(ep, `sentence "${s.id}": englishParts[${i}] 비어있음 (parts[${i}]="${s.parts[i]}")`).toBeTruthy()
      })
      s.englishDistractors.forEach((ed, i) => {
        expect(ed, `sentence "${s.id}": englishDistractors[${i}] 비어있음 (distractors[${i}]="${s.distractors[i]}")`).toBeTruthy()
      })
    }
  })

  it('모든 문장: 단일 알파벳 영어 매핑 금지 (TTS letter-name 발음 방지)', () => {
    // 단일 알파벳 (예: 'I', 'A')은 macOS TTS가 "Capital I" 같이 letter-name으로 읽음.
    // 학습 친화적인 단어/구문(예: 'I am')으로 풀어 작성할 것.
    for (const s of SENTENCES) {
      ;[...s.englishParts, ...s.englishDistractors].forEach((text, i) => {
        const trimmed = text.trim()
        expect(
          trimmed.length > 1 || !/^[A-Za-z]$/.test(trimmed),
          `sentence "${s.id}": 단일 알파벳 "${trimmed}" 사용 — TTS가 letter-name으로 읽음. 'I' → 'I am' 식으로 풀어 쓸 것 (index ${i})`,
        ).toBe(true)
      })
    }
  })
})
