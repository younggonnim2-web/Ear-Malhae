import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SentenceBuilderQuiz } from '../../components/quiz/SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'

const sentence = SENTENCES.find(s => s.id === 'coffee-please')!
// { english: 'Coffee, please.', korean: '커피 주세요!', parts: ['커피','주세요'], distractors: ['마셔요','받아요'] }

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
    expect(screen.getByText('마셔요')).toBeInTheDocument()
    expect(screen.getByText('받아요')).toBeInTheDocument()
  })

  it('정답 순서로 탭 후 확인 → 2000ms 후 onCorrect 자동 호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(onCorrect).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(2000))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 탭 제출 → 정답 안내 표시 + 다음 버튼으로 수동 진행', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/정답:/i)).toBeInTheDocument()
    // 오답 시 자동 진행 없음 — 다음 버튼 클릭 필요
    act(() => vi.advanceTimersByTime(3000))
    expect(onCorrect).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /다음/i }))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('ko-to-en 방향: 영어 타일이 표시된다', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} direction="ko-to-en" />)
    // English tiles from sentence.english split: ['Coffee,', 'please'] (punctuation stripped → ['Coffee', 'please'])
    // plus englishDistractors: ['drink', 'receive']  ← 한국어 distractors와 평행 매핑
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('please')).toBeInTheDocument()
    expect(screen.getByText('drink')).toBeInTheDocument()
    expect(screen.getByText('receive')).toBeInTheDocument()
  })

  it('ko-to-en 방향: 한국어 문장이 표시된다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} direction="ko-to-en" />)
    expect(screen.getByText('커피 주세요!')).toBeInTheDocument()
  })
})
