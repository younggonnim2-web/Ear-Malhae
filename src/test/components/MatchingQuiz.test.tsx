import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MatchingQuiz } from '../../components/quiz/MatchingQuiz'
import type { WordItem } from '../../types'

const items: WordItem[] = [
  { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' },
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
]

describe('MatchingQuiz', () => {
  it('영어 3개 + 한글 3개 렌더링', () => {
    render(<MatchingQuiz items={items} onComplete={vi.fn()} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('사과')).toBeInTheDocument()
  })

  it('오답 선택 시 animate-flash 클래스 적용', () => {
    render(<MatchingQuiz items={items} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('apple'))
    fireEvent.click(screen.getByText('바나나'))  // 오답
    const wrongBtn = screen.getByText('바나나')
    expect(wrongBtn.className).toContain('animate-flash')
  })

  it('올바른 짝 선택 시 onComplete 호출 (3쌍 완료 후)', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<MatchingQuiz items={items} onComplete={onComplete} />)

    fireEvent.click(screen.getByText('apple'))
    fireEvent.click(screen.getByText('사과'))
    fireEvent.click(screen.getByText('banana'))
    fireEvent.click(screen.getByText('바나나'))
    fireEvent.click(screen.getByText('grape'))
    fireEvent.click(screen.getByText('포도'))

    vi.advanceTimersByTime(600)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
