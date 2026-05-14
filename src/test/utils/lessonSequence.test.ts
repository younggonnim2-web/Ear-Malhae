import { describe, it, expect } from 'vitest'
import { buildChallengeSequence } from '../../utils/lessonSequence'
import { LESSONS_MAP } from '../../data/lessons'
import { SENTENCES } from '../../data/sentences'

const lesson = LESSONS_MAP['fruit-1'] // 5 items

describe('buildChallengeSequence', () => {
  it('flash count equals item count and order preserved', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const flashes = seq.filter(c => c.kind === 'flash')
    expect(flashes).toHaveLength(5)
    expect(flashes.map(c => c.itemId)).toEqual(lesson.itemIds)
  })

  it('flash is immediately followed by image-choice for same item', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    for (let i = 0; i < seq.length - 1; i++) {
      if (seq[i].kind === 'flash') {
        expect(seq[i + 1].kind).toBe('image-choice')
        expect(seq[i + 1].itemId).toBe(seq[i].itemId)
      }
    }
  })

  it('has exactly one matching challenge', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
  })

  it('matching appears after all flash+image-choice pairs (stage 2)', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    const lastFlashIdx = [...seq].reverse().findIndex(c => c.kind === 'flash')
    expect(matchIdx).toBeGreaterThan(seq.length - 1 - lastFlashIdx)
  })

  it('image-choice has N en-to-ko + ceil(N/2) ko-to-en = 8 total for N=5', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const choices = seq.filter(c => c.kind === 'image-choice')
    const enToKo = choices.filter(c => c.direction === 'en-to-ko')
    const koToEn = choices.filter(c => c.direction === 'ko-to-en')
    expect(enToKo).toHaveLength(5)
    expect(koToEn).toHaveLength(3)
    expect(choices).toHaveLength(8)
  })

  it('listen-choice count is ceil(N/2) = 3', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'listen-choice')).toHaveLength(3)
  })

  it('listen-choice and ko-to-en image-choice are interleaved in stage 3', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const matchIdx = seq.findIndex(c => c.kind === 'matching')
    const stage3 = seq.slice(matchIdx + 1).filter(c => c.kind !== 'sentence-builder')
    expect(stage3[0].kind).toBe('listen-choice')
    expect(stage3[1].kind).toBe('image-choice')
    expect(stage3[1].direction).toBe('ko-to-en')
  })

  it('has exactly 2 sentence-builder challenges', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'sentence-builder')).toHaveLength(2)
  })

  it('sentence IDs differ between lessons', () => {
    const seq0 = buildChallengeSequence(lesson, 0, SENTENCES)
    const seq1 = buildChallengeSequence(lesson, 1, SENTENCES)
    const ids0 = seq0.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    const ids1 = seq1.filter(c => c.kind === 'sentence-builder').map(c => c.sentenceId)
    expect(ids0).not.toEqual(ids1)
  })

  it('total challenge count for 5-item lesson is 19', () => {
    // 5 flash + 5 image-choice(en-to-ko) + 1 matching + 3 listen + 3 image-choice(ko-to-en) + 2 sentence = 19
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq).toHaveLength(19)
  })
})
