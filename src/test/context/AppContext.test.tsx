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
      <span data-testid="totalXp">{ctx.totalXp}</span>
      <span data-testid="currentLevel">{ctx.currentLevel}</span>
      <span data-testid="xpToNextLevel">{ctx.xpToNextLevel ?? 'null'}</span>
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

  it('markLessonDone: lessonProgress에 id 추가, lessonStars 기록', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 3))
    expect(ctx.progress.lessonProgress).toContain('fruit-1')
    expect(ctx.progress.lessonStars['fruit-1']).toBe(3)
  })

  it('markLessonDone: 리플레이 시 더 높은 별점만 반영', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 2))
    act(() => ctx.markLessonDone('fruit-1', 1))
    expect(ctx.progress.lessonStars['fruit-1']).toBe(2)
  })

  it('markLessonDone: 리플레이 시 더 높은 별점 업데이트', () => {
    let ctx!: ReturnType<typeof useApp>
    render(<AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>)
    act(() => ctx.markLessonDone('fruit-1', 2))
    act(() => ctx.markLessonDone('fruit-1', 3))
    expect(ctx.progress.lessonStars['fruit-1']).toBe(3)
  })

  it('totalXp: lessonStars에서 파생', () => {
    let ctx!: ReturnType<typeof useApp>
    const { getByTestId } = render(
      <AppProvider><TestConsumer action={c => { ctx = c }} /></AppProvider>
    )
    act(() => { ctx.markLessonDone('fruit-1', 3); ctx.markLessonDone('fruit-2', 2) })
    expect(getByTestId('totalXp').textContent).toBe('50')
  })

  it('currentLevel: XP 0이면 Lv1', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('currentLevel').textContent).toBe('1')
  })

  it('xpToNextLevel: Lv1 초기 상태에서 100', () => {
    const { getByTestId } = render(<AppProvider><TestConsumer /></AppProvider>)
    expect(getByTestId('xpToNextLevel').textContent).toBe('100')
  })
})
