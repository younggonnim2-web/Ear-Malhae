import { describe, it, expect } from 'vitest'
import { buildChallengeSequence } from '../../utils/lessonSequence'
import { LESSONS_MAP } from '../../data/lessons'
import { SENTENCES } from '../../data/sentences'

const lesson = LESSONS_MAP['fruit-1'] // 5 items

describe('buildChallengeSequence', () => {
  it('flash challenges equal item count', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const flashes = seq.filter(c => c.kind === 'flash')
    expect(flashes).toHaveLength(5)
    expect(flashes.map(c => c.itemId)).toEqual(lesson.itemIds)
  })

  it('has exactly one matching challenge', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'matching')).toHaveLength(1)
  })

  it('image-choice count equals item count', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'image-choice')).toHaveLength(5)
  })

  it('image-choice alternates direction', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    const choices = seq.filter(c => c.kind === 'image-choice')
    expect(choices[0].direction).toBe('en-to-ko')
    expect(choices[1].direction).toBe('ko-to-en')
    expect(choices[2].direction).toBe('en-to-ko')
  })

  it('listen-choice count is ceil(N/2)', () => {
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq.filter(c => c.kind === 'listen-choice')).toHaveLength(3)
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

  it('total challenge count for 5-item lesson is 16', () => {
    // 5 flash + 1 matching + 5 image-choice + 3 listen-choice + 2 sentence = 16
    const seq = buildChallengeSequence(lesson, 0, SENTENCES)
    expect(seq).toHaveLength(16)
  })
})
