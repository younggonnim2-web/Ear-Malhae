import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'

vi.mock('../../components/FlashCard', () => ({
  FlashCard: ({ onNext }: { onNext: () => void }) => (
    <button onClick={onNext} data-testid="flash-next">다음</button>
  ),
}))
vi.mock('../../components/quiz/MatchingQuiz', () => ({
  MatchingQuiz: ({ onComplete }: { onComplete: () => void }) => (
    <button onClick={onComplete} data-testid="matching-complete">완료</button>
  ),
}))
vi.mock('../../components/quiz/ImageChoiceQuiz', () => ({
  ImageChoiceQuiz: ({ onCorrect, onWrong }: { onCorrect: () => void; onWrong: () => void }) => (
    <div>
      <button onClick={onCorrect} data-testid="correct">정답</button>
      <button onClick={onWrong} data-testid="wrong">오답</button>
    </div>
  ),
}))
vi.mock('../../components/quiz/ListenChoiceQuiz', () => ({
  ListenChoiceQuiz: ({ onCorrect }: { onCorrect: () => void }) => (
    <button onClick={onCorrect} data-testid="listen-correct">정답</button>
  ),
}))
vi.mock('../../components/quiz/SentenceBuilderQuiz', () => ({
  SentenceBuilderQuiz: ({ onCorrect }: { onCorrect: () => void }) => (
    <button onClick={onCorrect} data-testid="sentence-correct">정답</button>
  ),
}))
vi.mock('../../hooks/useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn(), isSpeaking: false }),
}))

beforeEach(() => {
  localStorage.clear()
})

async function renderLesson(lessonId: string) {
  const { LessonSession } = await import('../../pages/LessonSession')
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/lesson/${lessonId}`]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonSession />} />
          <Route path="/complete" element={<div data-testid="complete-page">완료</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('LessonSession', () => {
  it('유효한 lessonId로 렌더링 성공', async () => {
    await renderLesson('fruit-1')
    expect(screen.queryByText('레슨을 찾을 수 없습니다')).not.toBeInTheDocument()
  })

  it('잘못된 lessonId → 에러 메시지', async () => {
    await renderLesson('nonexistent')
    expect(screen.getByText('레슨을 찾을 수 없습니다')).toBeInTheDocument()
  })
})
