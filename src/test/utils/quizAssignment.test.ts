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

  it('index 3: 다시 image-choice, ko-to-en (3개 순환)', () => {
    expect(getQuizAssignment(3)).toEqual({ type: 'image-choice', direction: 'ko-to-en' })
  })

  it('index 6: 세 번째 순환 시작, en-to-ko', () => {
    expect(getQuizAssignment(6)).toEqual({ type: 'image-choice', direction: 'en-to-ko' })
  })

  it('index 9: 네 번째 순환 시작, ko-to-en', () => {
    expect(getQuizAssignment(9)).toEqual({ type: 'image-choice', direction: 'ko-to-en' })
  })
})
