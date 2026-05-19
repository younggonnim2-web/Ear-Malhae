import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageChoiceQuiz } from '../../components/quiz/ImageChoiceQuiz'
import type { WordItem } from '../../types'

const correct: WordItem = { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' }
const choices: WordItem[] = [
  correct,
  { id: 'banana', word: 'banana', meaning: '바나나', emoji: '🍌', category: 'fruit' },
  { id: 'grape', word: 'grape', meaning: '포도', emoji: '🍇', category: 'fruit' },
  { id: 'lemon', word: 'lemon', meaning: '레몬', emoji: '🍋', category: 'fruit' },
]

describe('ImageChoiceQuiz', () => {
  it('en-to-ko: 한글 보기 4개 렌더링', () => {
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={vi.fn()} />)
    expect(screen.getByText('사과')).toBeInTheDocument()
    expect(screen.getByText('바나나')).toBeInTheDocument()
  })

  it('ko-to-en: 영어 보기 4개 렌더링', () => {
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="ko-to-en" onCorrect={vi.fn()} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
  })

  it('정답 선택 → 확인 → 다음 순으로 onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('사과'))
    fireEvent.click(screen.getByText('확인 ✓'))
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('선택만으로는 피드백 없음 (확인 버튼 전)', () => {
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('바나나'))
    expect(onCorrect).not.toHaveBeenCalled()
    expect(screen.queryByText('다음 ▶')).not.toBeInTheDocument()
  })

  it('list 모드: 선택 즉시 speak 호출', () => {
    const speak = vi.fn()
    render(
      <ImageChoiceQuiz
        item={correct} choices={choices} direction="ko-to-en"
        onCorrect={vi.fn()} speak={speak} displayMode="list"
      />
    )
    fireEvent.click(screen.getByText('apple'))
    expect(speak).toHaveBeenCalledWith('apple', 'en-US')
  })

  it('cards 모드: 선택 즉시 speak 호출', () => {
    const speak = vi.fn()
    render(
      <ImageChoiceQuiz
        item={correct} choices={choices} direction="ko-to-en"
        onCorrect={vi.fn()} speak={speak} displayMode="cards"
      />
    )
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(speak).toHaveBeenCalled()
  })

  it('allowNextOnWrong: 오답 확인 후 다음 버튼 → onNext 호출', () => {
    const onNext = vi.fn()
    render(
      <ImageChoiceQuiz
        item={correct} choices={choices} direction="en-to-ko"
        onCorrect={vi.fn()} allowNextOnWrong onNext={onNext}
      />
    )
    fireEvent.click(screen.getByText('바나나'))
    fireEvent.click(screen.getByText('확인 ✓'))
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
