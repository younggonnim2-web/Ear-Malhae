export type AnswerResult = 'correct' | 'typo' | 'wrong'

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[m][n]
}

function typoThreshold(wordLen: number): number {
  if (wordLen <= 3) return 0
  if (wordLen <= 6) return 1
  return 2
}

export function stripPunct(w: string): string {
  return w.toLowerCase().replace(/[.,!?'"]/g, '')
}

function checkOne(input: string, correct: string): { result: AnswerResult; typoIndices: Set<number> } {
  const inputWords = input.trim().split(/\s+/).map(stripPunct)
  const correctWords = correct.trim().split(/\s+/).map(stripPunct)

  if (Math.abs(inputWords.length - correctWords.length) > 1)
    return { result: 'wrong', typoIndices: new Set() }

  const typoIndices = new Set<number>()
  let hasWrong = false
  const len = Math.max(inputWords.length, correctWords.length)

  for (let i = 0; i < len; i++) {
    const iw = inputWords[i] ?? ''
    const cw = correctWords[i] ?? ''
    if (iw === cw) continue
    if (levenshtein(iw, cw) <= typoThreshold(cw.length)) {
      typoIndices.add(i)
    } else {
      hasWrong = true
    }
  }

  if (hasWrong) return { result: 'wrong', typoIndices: new Set() }
  if (typoIndices.size > 0) return { result: 'typo', typoIndices }
  return { result: 'correct', typoIndices: new Set() }
}

/**
 * 복수 정답 중 가장 좋은 결과를 반환한다.
 * - primary가 모범 정답 (틀렸을 때 노출)
 * - alternatives 중 하나라도 correct/typo면 해당 결과 반환
 * - corrected: 오타 교정 시 보여줄 정답 문자열 (가장 근접한 정답)
 */
export function checkBestAnswer(
  input: string,
  primary: string,
  alternatives: string[] = [],
): { result: AnswerResult; typoIndices: Set<number>; corrected: string } {
  const all = [primary, ...alternatives]

  let bestResult: AnswerResult = 'wrong'
  let bestTypoIndices = new Set<number>()
  let bestCorrected = primary

  for (const answer of all) {
    const { result, typoIndices } = checkOne(input, answer)
    if (result === 'correct') {
      return { result: 'correct', typoIndices: new Set(), corrected: answer }
    }
    if (result === 'typo' && bestResult === 'wrong') {
      bestResult = 'typo'
      bestTypoIndices = typoIndices
      bestCorrected = answer
    }
  }

  return { result: bestResult, typoIndices: bestTypoIndices, corrected: bestCorrected }
}
