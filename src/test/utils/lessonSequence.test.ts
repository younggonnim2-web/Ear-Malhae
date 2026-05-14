import { describe, it, expect } from 'vitest'
import { buildChallengeSequence } from '../../utils/lessonSequence'
import { LESSONS_MAP } from '../../data/lessons'
import { SENTENCES } from '../../data/sentences'

const wordLesson = LESSONS_MAP['fruit-1']    // 5 items, words
const alphaLesson = LESSONS_MAP['alphabet-1'] // alphabet

describe('buildChallengeSequence — words', () => {
  it('flash count equals item count', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'flash')).toHaveLength(5)
  })

  it('flash is immediately followed by cards image-choice for same item', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    for (let i = 0; i < seq.length - 1; i++) {
      if (seq[i].kind === 'flash') {
        expect(seq[i + 1].kind).toBe('image-choice')
        expect(seq[i + 1].displayMode).toBe('cards')
        expect(seq[i + 1].itemId).toBe(seq[i].itemId)
      }
    }
  })

  it('stage-1 cards use ko-to-en direction', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const cards = seq.filter(c => c.kind === 'image-choice' && c.displayMode === 'cards')
    expect(cards.every(c => c.direction === 'ko-to-en')).toBe(true)
  })

  it('stage-3 list choices use en-to-ko direction', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const list = seq.filter(c => c.kind === 'image-choice' && c.displayMode === 'list')
    expect(list.every(c => c.direction === 'en-to-ko')).toBe(true)
  })

  it('has exactly one matching challenge after stage-1', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    expect(matchIdx).toBeGreaterThan(9) // after 5 flash + 5 image-choice
  })

  it('listen-choice count is ceil(N/2) = 3', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'listen-choice')).toHaveLength(3)
  })

  it('has exactly 2 sentence-builder challenges', () => {
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq.filter(c => c.kind === 'sentence-builder')).toHaveLength(2)
  })

  it('sentence IDs differ between lessons', () => {
    const seq0 = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    const seq1 = buildChallengeSequence(wordLesson, 1, SENTENCES, 'words')
    const ids0 = seq0.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    const ids1 = seq1.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    expect(ids0).not.toEqual(ids1)
  })

  it('total count for 5-item words lesson is 19', () => {
    // 5 flash + 5 cards(ko-to-en) + 1 matching + 3 listen + 3 list(en-to-ko) + 2 sentence = 19
    const seq = buildChallengeSequence(wordLesson, 0, SENTENCES, 'words')
    expect(seq).toHaveLength(19)
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
