import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { AppProvider, useApp } from '../../context/AppContext'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-13'))
})

function TestConsumer({ action }: { action?: (ctx: ReturnType<typeof useApp>) => void }) {
  const ctx = useApp()
  if (action) action(ctx)
  return (
    <div>
      <span data-testid="streak">{ctx.progress.streak}</span>
      <span data-testid="alphabet">{ctx.progress.alphabetProgress.join(',')}</span>
      <span data-testid="word">{ctx.progress.wordProgress.join(',')}</span>
      <span data-testid="unlocked">{String(ctx.isPhraseUnlocked())}</span>
    </div>
  )
}

describe('AppContext', () => {
  it('초기 상태: 스트릭 0, 진도 빈 배열', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('streak').textContent).toBe('0')
    expect(getByTestId('alphabet').textContent).toBe('')
  })

  it('markAlphabetDone: 알파벳 진도 추가', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => ctx.markAlphabetDone('A'))
    expect(getByTestId('alphabet').textContent).toBe('A')
  })

  it('markAlphabetDone: 중복 추가 방지', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => { ctx.markAlphabetDone('A'); ctx.markAlphabetDone('A') })
    expect(getByTestId('alphabet').textContent).toBe('A')
  })

  it('isPhraseUnlocked: 단어 50개 미만이면 false', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('unlocked').textContent).toBe('false')
  })

  it('updateStreak: 첫 학습이면 streak 1', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => ctx.updateStreak())
    expect(getByTestId('streak').textContent).toBe('1')
  })
})
