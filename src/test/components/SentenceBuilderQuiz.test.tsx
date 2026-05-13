import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SentenceBuilderQuiz } from '../../components/quiz/SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'

const sentence = SENTENCES[0]
// { english: 'Coffee, please.', parts: ['커피','주세요'], distractors: ['설탕','물'] }

describe('SentenceBuilderQuiz — 타일 모드', () => {
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

  it('정답 순서로 탭 후 확인 → onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 탭 제출 → 다음 버튼 표시, onCorrect 미호출', () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('주세요'))
    fireEvent.click(screen.getByText('커피'))
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByRole('button', { name: /다음/i })).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
  })
})

describe('SentenceBuilderQuiz — 타이핑 모드', () => {
  it('입력 필드가 존재한다', () => {
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={vi.fn()} />)
    expect(screen.getByPlaceholderText(/직접 입력/i)).toBeInTheDocument()
  })

  it('정확한 타이핑 → "완벽해요" 피드백 + onCorrect 호출', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'Coffee, please.')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/완벽해요/i)).toBeInTheDocument()
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('유사 타이핑 (오타) → "거의 맞아요" + 정답 안내 표시', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'Coffe please')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/거의 맞아요/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Coffee, please\./i).length).toBeGreaterThan(0)
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('완전 오답 타이핑 → "정답:" 안내, onCorrect 미호출', async () => {
    const onCorrect = vi.fn()
    render(<SentenceBuilderQuiz sentence={sentence} onCorrect={onCorrect} />)
    await userEvent.type(screen.getByPlaceholderText(/직접 입력/i), 'xyz wrong')
    fireEvent.click(screen.getByRole('button', { name: /확인/i }))
    expect(screen.getByText(/정답:/i)).toBeInTheDocument()
    expect(onCorrect).not.toHaveBeenCalled()
  })
})
