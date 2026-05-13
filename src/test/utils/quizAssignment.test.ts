import { describe, it, expect } from 'vitest'
import { getQuizAssignment } from '../../utils/quizAssignment'

describe('getQuizAssignment', () => {
  it('index 0: image-choice, en-to-ko', () => {
    expect(getQuizAssignment(0)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })

  it('index 1: matching, ko-to-en', () => {
    expect(getQuizAssignment(1)).toEqual({ type: 'matching', direction: 'ko-to-en' })
  })

  it('index 2: listen-choice, en-to-ko', () => {
    expect(getQuizAssignment(2)).toEqual({ type: 'listen-choice', direction: 'en-to-ko' })
  })

  it('index 3: sentence-builder, ko-to-en', () => {
    expect(getQuizAssignment(3)).toEqual({ type: 'sentence-builder', direction: 'ko-to-en' })
  })

  it('index 4: 다시 image-choice, en-to-ko (순환)', () => {
    expect(getQuizAssignment(4)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })

  it('index 8: 두 번째 순환 시작, en-to-ko', () => {
    expect(getQuizAssignment(8)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })
})
