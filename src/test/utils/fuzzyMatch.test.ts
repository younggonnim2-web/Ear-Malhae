import { describe, it, expect } from 'vitest'
import { normalize, similarity, evaluateTyped } from '../../utils/fuzzyMatch'

describe('normalize', () => {
  it('소문자 변환 + 구두점 제거', () => {
    expect(normalize('Coffee, please.')).toBe('coffee please')
  })
})

describe('evaluateTyped', () => {
  it('완전 일치 → exact', () => {
    expect(evaluateTyped('Coffee, please.', 'Coffee, please.')).toBe('exact')
  })

  it('대소문자 무시 일치 → exact', () => {
    expect(evaluateTyped('coffee please', 'Coffee, please.')).toBe('exact')
  })

  it('철자 오류 1~2자 → fuzzy', () => {
    expect(evaluateTyped('Coffe please', 'Coffee, please.')).toBe('fuzzy')
  })

  it('완전히 다른 답 → wrong', () => {
    expect(evaluateTyped('I like cats', 'Coffee, please.')).toBe('wrong')
  })

  it('빈 입력 → wrong', () => {
    expect(evaluateTyped('', 'Coffee, please.')).toBe('wrong')
  })
})
