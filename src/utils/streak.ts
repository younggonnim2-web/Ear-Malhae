export function calculateStreak(lastStudiedDate: string, currentStreak: number): number {
  const today = getTodayString()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (lastStudiedDate === today) return currentStreak
  if (lastStudiedDate === yesterday) return currentStreak + 1
  return 1
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}
