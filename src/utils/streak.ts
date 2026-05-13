export function calculateStreak(lastStudiedDate: string, currentStreak: number): number {
  const today = getTodayString()
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const yesterday = d.toISOString().split('T')[0]

  if (!lastStudiedDate) return 1
  if (lastStudiedDate === today) return currentStreak
  if (lastStudiedDate === yesterday) return currentStreak + 1
  return 1
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}
