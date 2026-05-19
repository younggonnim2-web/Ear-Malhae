import { describe, it, expect } from 'vitest'
import { checkAdaptiveDifficulty } from '../../utils/difficultyAdaptive'
import type { AppStorage } from '../../types'

function makeProgress(overrides: Partial<AppStorage> = {}): AppStorage {
  return {
    streak: 0,
    lastStudiedDate: '',
    alphabetProgress: [],
    wordProgress: [],
    lessonProgress: [],
    lessonStars: {},
    lessonCompletionCount: {},
    onboardingDone: true,
    difficultyLevel: 'beginner',
    ...overrides,
  }
}

const sectionIds = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4']

describe('checkAdaptiveDifficulty', () => {
  it('3개 미만 완료 → null 반환', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3 },
      lessonCompletionCount: { 'lesson-1': 1, 'lesson-2': 1 },
    })
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })

  it('마지막 3개 모두 ★★★ 첫 완료 → 업그레이드 제안 (beginner→intermediate)', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3, 'lesson-3': 3 },
      lessonCompletionCount: { 'lesson-1': 1, 'lesson-2': 1, 'lesson-3': 1 },
      difficultyLevel: 'beginner',
    })
    const result = checkAdaptiveDifficulty(progress, sectionIds)
    expect(result).toEqual({ type: 'upgrade', from: 'beginner', to: 'intermediate' })
  })

  it('intermediate에서 ★★★ 3개 첫 완료 → advanced 제안', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3, 'lesson-3': 3 },
      lessonCompletionCount: { 'lesson-1': 1, 'lesson-2': 1, 'lesson-3': 1 },
      difficultyLevel: 'intermediate',
    })
    const result = checkAdaptiveDifficulty(progress, sectionIds)
    expect(result).toEqual({ type: 'upgrade', from: 'intermediate', to: 'advanced' })
  })

  it('이미 advanced → 업그레이드 제안 없음', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3, 'lesson-3': 3 },
      lessonCompletionCount: { 'lesson-1': 1, 'lesson-2': 1, 'lesson-3': 1 },
      difficultyLevel: 'advanced',
    })
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })

  it('재플레이 포함 → 업그레이드 제안 없음', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3, 'lesson-3': 3 },
      lessonCompletionCount: { 'lesson-1': 2, 'lesson-2': 1, 'lesson-3': 1 },
      difficultyLevel: 'beginner',
    })
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })

  it('평균 별점 1.5 이하 → 다운그레이드 제안 (intermediate→beginner)', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 1, 'lesson-2': 2, 'lesson-3': 1 },
      lessonCompletionCount: { 'lesson-1': 2, 'lesson-2': 2, 'lesson-3': 2 },
      difficultyLevel: 'intermediate',
    })
    const result = checkAdaptiveDifficulty(progress, sectionIds)
    expect(result).toEqual({ type: 'downgrade', from: 'intermediate', to: 'beginner' })
  })

  it('advanced에서 낮은 별점 → intermediate 제안', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 1, 'lesson-2': 1, 'lesson-3': 1 },
      lessonCompletionCount: { 'lesson-1': 2, 'lesson-2': 2, 'lesson-3': 2 },
      difficultyLevel: 'advanced',
    })
    const result = checkAdaptiveDifficulty(progress, sectionIds)
    expect(result).toEqual({ type: 'downgrade', from: 'advanced', to: 'intermediate' })
  })

  it('이미 beginner → 다운그레이드 제안 없음', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 1, 'lesson-2': 1, 'lesson-3': 1 },
      lessonCompletionCount: { 'lesson-1': 2, 'lesson-2': 2, 'lesson-3': 2 },
      difficultyLevel: 'beginner',
    })
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })

  it('평균 별점 2 → 제안 없음', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'lesson-3'],
      lessonStars: { 'lesson-1': 2, 'lesson-2': 2, 'lesson-3': 2 },
      lessonCompletionCount: { 'lesson-1': 2, 'lesson-2': 2, 'lesson-3': 2 },
      difficultyLevel: 'intermediate',
    })
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })

  it('섹션에 없는 레슨은 무시', () => {
    const progress = makeProgress({
      lessonProgress: ['lesson-1', 'lesson-2', 'outside-lesson'],
      lessonStars: { 'lesson-1': 3, 'lesson-2': 3, 'outside-lesson': 3 },
      lessonCompletionCount: { 'lesson-1': 1, 'lesson-2': 1, 'outside-lesson': 1 },
      difficultyLevel: 'beginner',
    })
    // only 2 in sectionIds → null
    expect(checkAdaptiveDifficulty(progress, sectionIds)).toBeNull()
  })
})
