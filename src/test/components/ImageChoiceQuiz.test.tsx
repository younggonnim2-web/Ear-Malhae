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

  it('정답 선택 후 다음 버튼 클릭 시 onCorrect 호출', () => {
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('사과'))
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오답 선택 시 onCorrect 미호출', () => {
    const onCorrect = vi.fn()
    render(<ImageChoiceQuiz item={correct} choices={choices} direction="en-to-ko" onCorrect={onCorrect} />)
    fireEvent.click(screen.getByText('바나나'))
    expect(onCorrect).not.toHaveBeenCalled()
  })

  it('allowNextOnWrong: 오답 시 다음 버튼 표시 + onNext 호출', () => {
    const onNext = vi.fn()
    render(
      <ImageChoiceQuiz
        item={correct} choices={choices} direction="en-to-ko"
        onCorrect={vi.fn()} allowNextOnWrong onNext={onNext}
      />
    )
    fireEvent.click(screen.getByText('바나나'))
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
