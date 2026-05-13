export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\w\s]/g, '').trim()
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b)
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(na, nb) / maxLen
}

export type MatchResult = 'exact' | 'fuzzy' | 'wrong'

export function evaluateTyped(typed: string, correct: string): MatchResult {
  const sim = similarity(typed, correct)
  if (normalize(typed) === normalize(correct)) return 'exact'
  if (sim >= 0.75) return 'fuzzy'
  return 'wrong'
}
