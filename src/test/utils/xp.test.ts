import { describe, it, expect } from 'vitest'
import { calcXp, calcLevel, calcXpToNext, calcLevelBarPct, STAR_XP } from '../../utils/xp'

describe('STAR_XP 상수', () => {
  it('1성=10, 2성=20, 3성=30', () => {
    expect(STAR_XP[1]).toBe(10)
    expect(STAR_XP[2]).toBe(20)
    expect(STAR_XP[3]).toBe(30)
  })
})

describe('calcXp', () => {
  it('빈 맵 → 0', () => {
    expect(calcXp({})).toBe(0)
  })
  it('단일 레슨 1성 → 10', () => {
    expect(calcXp({ 'lesson-1': 1 })).toBe(10)
  })
  it('단일 레슨 2성 → 20', () => {
    expect(calcXp({ 'lesson-1': 2 })).toBe(20)
  })
  it('단일 레슨 3성 → 30', () => {
    expect(calcXp({ 'lesson-1': 3 })).toBe(30)
  })
  it('복합: 1성+2성+3성 → 60', () => {
    expect(calcXp({ a: 1, b: 2, c: 3 })).toBe(60)
  })
})

describe('calcLevel', () => {
  it('0 XP → Lv1',   () => expect(calcLevel(0)).toBe(1))
  it('99 XP → Lv1',  () => expect(calcLevel(99)).toBe(1))
  it('100 XP → Lv2', () => expect(calcLevel(100)).toBe(2))
  it('249 XP → Lv2', () => expect(calcLevel(249)).toBe(2))
  it('250 XP → Lv3', () => expect(calcLevel(250)).toBe(3))
  it('499 XP → Lv3', () => expect(calcLevel(499)).toBe(3))
  it('500 XP → Lv4', () => expect(calcLevel(500)).toBe(4))
  it('659 XP → Lv4', () => expect(calcLevel(659)).toBe(4))
  it('660 XP → Lv5', () => expect(calcLevel(660)).toBe(5))
  it('700 XP → Lv5', () => expect(calcLevel(700)).toBe(5))
})

describe('calcXpToNext', () => {
  it('Lv1: 50 XP → 50 남음',   () => expect(calcXpToNext(50)).toBe(50))
  it('Lv2: 150 XP → 100 남음', () => expect(calcXpToNext(150)).toBe(100))
  it('Lv3: 300 XP → 200 남음', () => expect(calcXpToNext(300)).toBe(200))
  it('Lv4: 520 XP → 140 남음', () => expect(calcXpToNext(520)).toBe(140))
  it('Lv5: 660 XP → null',     () => expect(calcXpToNext(660)).toBeNull())
  it('Lv5: 700 XP → null',     () => expect(calcXpToNext(700)).toBeNull())
})

describe('calcLevelBarPct', () => {
  it('Lv1 시작(0 XP) → 0%',    () => expect(calcLevelBarPct(0, 1)).toBe(0))
  it('Lv2 중간(175 XP) → 50%', () => expect(calcLevelBarPct(175, 2)).toBe(50))
  it('Lv5 도달(660 XP) → 100%',() => expect(calcLevelBarPct(660, 5)).toBe(100))
})
