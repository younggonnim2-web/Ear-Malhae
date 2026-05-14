import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SentenceBuilderQuiz } from '../../components/quiz/SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'

const sentence = SENTENCES[0]
// { english: 'Coffee, please.', korean: '커피 주세요!', parts: ['커피','주세요'], distractors: ['설탕','물'] }

describe('SentenceBuilderQuiz — 타일 모드', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('영어 목표 문장이 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByText('Coffee, please.')).toBeInTheDocument()
  })

  it('타일 4개가 모두 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByText('커피')).toBeInTheDocument()
    expect(screen.getByText('주세요')).toBeInTheDocument()
    expect(screen.getByText('설탕')).toBeInTheDocument()
    expect(screen.getByText('물')).toBeInTheDocument()
  })

  it('정답 순서로 탭 후 확인 → 1200ms 후 onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(onCorrect).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1200))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 탭 제출 → 정답 안내 표시 + 1200ms 후 onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/정답:/i)).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1200))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('ko-to-en 방향: 영어 타일이 표시된다', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} direction="ko-to-en" />)
    // English tiles from sentence.english split: ['Coffee,', 'please'] (punctuation stripped → ['Coffee', 'please'])
    // plus englishDistractors: ['tea', 'sugar']
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('please')).toBeInTheDocument()
    expect(screen.getByText('tea')).toBeInTheDocument()
    expect(screen.getByText('sugar')).toBeInTheDocument()
  })

  it('ko-to-en 방향: 한국어 문장이 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} direction="ko-to-en" />)
    expect(screen.getByText('커피 주세요!')).toBeInTheDocument()
  })
})
