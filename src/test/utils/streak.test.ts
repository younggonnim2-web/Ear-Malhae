import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateStreak, getTodayString } from '../../utils/streak'

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13'))
  })

  it('당일 재학습이면 스트릭 유지', () => {
    expect(calculateStreak('2026-05-13', 5)).toBe(5)
  })

  it('어제 학습했으면 스트릭 +1', () => {
    expect(calculateStreak('2026-05-12', 5)).toBe(6)
  })

  it('이틀 이상 공백이면 스트릭 1로 리셋', () => {
    expect(calculateStreak('2026-05-10', 5)).toBe(1)
  })

  it('첫 학습(빈 날짜)이면 스트릭 1', () => {
    expect(calculateStreak('', 0)).toBe(1)
  })
})

describe('getTodayString', () => {
  it('YYYY-MM-DD 형식 반환', () => {
    vi.setSystemTime(new Date('2026-05-13'))
    expect(getTodayString()).toBe('2026-05-13')
  })
})
