const LEVEL_THRESHOLDS = [0, 100, 250, 500, 660] as const

export const STAR_XP = { 1: 10, 2: 20, 3: 30 } as const

export function calcXp(stars: Record<string, 1 | 2 | 3>): number {
  return Object.values(stars).reduce((sum, s) => sum + STAR_XP[s], 0)
}

export function calcLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}

export function calcXpToNext(xp: number): number | null {
  const level = calcLevel(xp)
  if (level >= 5) return null
  return LEVEL_THRESHOLDS[level] - xp
}

export function calcLevelBarPct(xp: number, level: number): number {
  if (level >= 5) return 100
  const start = LEVEL_THRESHOLDS[level - 1]
  const end = LEVEL_THRESHOLDS[level]
  return Math.round(((xp - start) / (end - start)) * 100)
}
