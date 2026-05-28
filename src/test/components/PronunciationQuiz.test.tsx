import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PronunciationQuiz } from '../../components/quiz/PronunciationQuiz'
import type { WordItem } from '../../types'
import * as recognitionModule from '../../hooks/useSpeechRecognition'

const item: WordItem = { id: 'apple', word: 'apple', meaning: '사과', emoji: '🍎', category: 'fruit' }

function mockRecognition(overrides: Partial<recognitionModule.UseSpeechRecognitionResult> = {}) {
  vi.spyOn(recognitionModule, 'useSpeechRecognition').mockReturnValue({
    startListening: vi.fn(),
    stopListening: vi.fn(),
    transcript: '',
    interimTranscript: '',
    isListening: false,
    isSupported: true,
    error: null,
    reset: vi.fn(),
    ...overrides,
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('PronunciationQuiz', () => {
  it('미지원 기기: 안내 메시지 + 다음 버튼', () => {
    mockRecognition({ isSupported: false })
    const onCorrect = vi.fn()
    render(<PronunciationQuiz item={item} onCorrect={onCorrect} />)
    expect(screen.getByText(/지원하지 않습니다/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('초기: 단어와 말해보세요 버튼 표시', () => {
    mockRecognition()
    render(<PronunciationQuiz item={item} onCorrect={vi.fn()} />)
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('사과')).toBeInTheDocument()
    expect(screen.getByText('🎤 말해보세요')).toBeInTheDocument()
  })

  it('말해보세요 클릭 → startListening 호출', () => {
    const startListening = vi.fn()
    mockRecognition({ startListening })
    render(<PronunciationQuiz item={item} onCorrect={vi.fn()} />)
    fireEvent.click(screen.getByText('🎤 말해보세요'))
    expect(startListening).toHaveBeenCalledTimes(1)
  })

  it('정확한 발음 인식 → 잘하셨어요 표시 + 다음 버튼', async () => {
    const onCorrect = vi.fn()
    mockRecognition({ transcript: 'apple' })
    render(<PronunciationQuiz item={item} onCorrect={onCorrect} />)
    expect(await screen.findByText(/잘하셨어요/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('오인식 → 다시 해볼까요 + 다시 말하기/건너뛰기 표시', async () => {
    mockRecognition({ transcript: 'xxxxxx' })
    render(<PronunciationQuiz item={item} onCorrect={vi.fn()} />)
    expect(await screen.findByText(/다시 해볼까요/)).toBeInTheDocument()
    expect(screen.getByText('🎤 다시 말하기')).toBeInTheDocument()
    expect(screen.getByText('건너뛰기')).toBeInTheDocument()
  })

  it('건너뛰기 클릭 → onCorrect 호출', async () => {
    const onCorrect = vi.fn()
    mockRecognition({ transcript: 'xxxxxx' })
    render(<PronunciationQuiz item={item} onCorrect={onCorrect} />)
    fireEvent.click(await screen.findByText('건너뛰기'))
    expect(onCorrect).toHaveBeenCalledTimes(1)
  })

  it('no-speech 에러 → 오인식 결과 표시', async () => {
    mockRecognition({ error: 'no-speech' })
    render(<PronunciationQuiz item={item} onCorrect={vi.fn()} />)
    expect(await screen.findByText(/다시 해볼까요/)).toBeInTheDocument()
  })

  it('권한 거부 에러 → 마이크 사용 불가 안내 화면 표시', async () => {
    mockRecognition({ error: 'not-allowed' })
    render(<PronunciationQuiz item={item} onCorrect={vi.fn()} />)
    expect(await screen.findByText(/마이크 사용 불가/)).toBeInTheDocument()
  })
})
