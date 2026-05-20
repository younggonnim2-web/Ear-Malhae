import { describe, it, expect } from 'vitest'
import { buildChallengeSequence } from '../../utils/lessonSequence'
import { LESSONS_MAP } from '../../data/lessons'
import { SENTENCES } from '../../data/sentences'

const wordLesson = LESSONS_MAP['fruit-1']    // 5 items, words
const alphaLesson = LESSONS_MAP['alphabet-1'] // alphabet

describe('buildChallengeSequence — words', () => {
  it('no flash in words sequence', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'flash')).toHaveLength(0)
  })

  it('stage-1 cards (ko-to-en): one per item, all tagged 새로운 단어', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const cards = seq.filter(c => c.kind === 'image-choice' && c.displayMode === 'cards')
    expect(cards).toHaveLength(5)
    expect(cards.every(c => c.direction === 'ko-to-en')).toBe(true)
    expect(cards.every(c => c.tag === '새로운 단어')).toBe(true)
  })

  it('list choices (ko-to-en): ceil(N/2) only = 3 for N=5', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const list = seq.filter(c => c.kind === 'image-choice' && c.displayMode === 'list')
    expect(list).toHaveLength(3)
    expect(list.every(c => c.direction === 'ko-to-en')).toBe(true)
  })

  it('all cards come before first list choice', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const lastCardIdx = [...seq]
      .map((c, i) => (c.kind === 'image-choice' && c.displayMode === 'cards') ? i : -1)
      .filter(i => i >= 0).at(-1)!
    const firstListIdx = seq.findIndex(c => c.kind === 'image-choice' && c.displayMode === 'list')
    expect(firstListIdx).toBeGreaterThan(lastCardIdx)
  })

  it('listen-choice covers all N items = 5 (firstHalf + secondHalf)', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'listen-choice')).toHaveLength(5)
  })

  it('listen-choice direction is ko-to-en', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const listens = seq.filter(c => c.kind === 'listen-choice')
    expect(listens.every(c => c.direction === 'ko-to-en')).toBe(true)
  })

  it('has 2 sentence-builder en-to-ko challenges tagged 새로운 단어', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const enToKo = seq.filter(c => c.kind === 'sentence-builder' && c.direction === 'en-to-ko')
    expect(enToKo).toHaveLength(2)
    expect(enToKo.every(c => c.tag === '새로운 단어')).toBe(true)
  })

  it('has 2 sentence-builder ko-to-en challenges tagged 어려운 연습', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const koToEn = seq.filter(c => c.kind === 'sentence-builder' && c.direction === 'ko-to-en')
    expect(koToEn).toHaveLength(2)
    expect(koToEn.every(c => c.tag === '어려운 연습')).toBe(true)
  })

  it('has exactly 1 matching challenge', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
  })

  it('matching is NOT last (ko-to-en sentences come after)', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    expect(matchIdx).toBeLessThan(seq.length - 1)
    expect(seq[seq.length - 1].kind).toBe('sentence-builder')
    expect(seq[seq.length - 1].direction).toBe('ko-to-en')
  })

  it('sentence IDs differ between lessons', () => {
    const seq0 = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const seq1 = buildChallengeSequence(wordLesson, 1, SENTENCES, 'words')
    const ids0 = seq0.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    const ids1 = seq1.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    expect(ids0).not.toEqual(ids1)
  })

  it('total count for 5-item words lesson is 18', () => {
    // cards×5 | [list,listen]×3 + listen×2 | sb(en-to-ko)×2 | matching | sb(ko-to-en)×2
    // = 5 + 6 + 2 + 2 + 1 + 2 = 18
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq).toHaveLength(18)
  })
})

describe('buildChallengeSequence — section baseTier', () => {
  it('sectionBaseTier=1 starts at Tier 1 (no cards, has fill-blank)', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 1)
    const cards = seq.filter(c => c.kind === 'image-choice' && c.displayMode === 'cards')
    const fillBlanks = seq.filter(c => c.kind === 'fill-blank')
    expect(cards).toHaveLength(0)
    expect(fillBlanks.length).toBeGreaterThan(0)
  })

  it('sectionBaseTier=2 starts at Tier 2 (en-to-ko list exists, fill-blank exists)', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 2)
    const enToKoList = seq.filter(c => c.kind === 'image-choice' && c.direction === 'en-to-ko' && c.displayMode === 'list')
    expect(enToKoList).toHaveLength(5)
  })

  it('clamps at Tier 3 when baseTier+completionCount exceeds 3', () => {
    const seqA = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 3)
    const seqB = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 5, 2)
    expect(seqA.filter(c => c.kind === 'flash')).toHaveLength(0)
    expect(seqB.filter(c => c.kind === 'flash')).toHaveLength(0)
    expect(seqA.filter(c => c.kind === 'image-choice' && c.displayMode === 'cards')).toHaveLength(0)
    expect(seqB.filter(c => c.kind === 'image-choice' && c.displayMode === 'cards')).toHaveLength(0)
  })
})

describe('buildChallengeSequence — review items', () => {
  const mockReview = [
    { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' as const },
    { id: 'cat', word: 'cat', meaning: '고양이', emoji: '🐱', category: 'animal' as const },
  ]

  it('inserts up to 2 review listen-choice challenges tagged 복습', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 0, mockReview)
    const reviews = seq.filter(c => c.tag === '복습')
    expect(reviews).toHaveLength(2)
    expect(reviews.every(c => c.kind === 'listen-choice')).toBe(true)
    expect(reviews.every(c => c.direction === 'ko-to-en')).toBe(true)
  })

  it('review challenges appear immediately before matching', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 0, mockReview)
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    const beforeMatch = seq[matchIdx - 1]
    const beforeBeforeMatch = seq[matchIdx - 2]
    expect(beforeMatch?.tag).toBe('복습')
    expect(beforeBeforeMatch?.tag).toBe('복습')
  })

  it('no review challenges when reviewItems is empty', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.tag === '복습')).toHaveLength(0)
  })

  it('total count is 18+2=20 with 2 review items', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words', 0, 0, mockReview)
    expect(seq).toHaveLength(20)
  })
})

describe('buildChallengeSequence — alphabet', () => {
  it('all flashes come before any image-choice', () => {
    const seq = buildChallengeSequence(alphaLesson, 0, SENTENCES, 'alphabet')
    const lastFlashIdx = [...seq].map((c, i) => c.kind === 'flash' ? i : -1).filter(i => i >= 0).at(-1)!
    const firstChoiceIdx = seq.findIndex(c => c.kind === 'image-choice')
    expect(firstChoiceIdx).toBeGreaterThan(lastFlashIdx)
  })

  it('image-choice cards use en-to-ko direction', () => {
    const seq = buildChallengeSequence(alphaLesson, 0, SENTENCES, 'alphabet')
    const cards = seq.filter(c => c.kind === 'image-choice')
    expect(cards.every(c => c.direction === 'en-to-ko' && c.displayMode === 'cards')).toBe(true)
  })

  it('has exactly one matching challenge', () => {
    const seq = buildChallengeSequence(alphaLesson, 0, SENTENCES, 'alphabet')
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
  })

  it('listen-choice count equals item count', () => {
    const seq = buildChallengeSequence(alphaLesson, 0, SENTENCES, 'alphabet')
    const flashCount = seq.filter(c => c.kind === 'flash').length
    const listenCount = seq.filter(c => c.kind === 'listen-choice').length
    expect(listenCount).toBe(flashCount)
  })

  it('has no sentence-builder for alphabet', () => {
    const seq = buildChallengeSequence(alphaLesson, 0, SENTENCES, 'alphabet')
    expect(seq.filter(c => c.kind === 'sentence-builder')).toHaveLength(0)
  })
})
