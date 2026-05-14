import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpeech } from '../../hooks/useSpeech'

describe('useSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('isSupported: speechSynthesis 있으면 true', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(true)
  })

  it('speak: speechSynthesis.speak 호출', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('apple'))
    act(() => vi.runAllTimers())
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1)
  })

  it('speak: 이전 발음 cancel 후 새 utterance', () => {
    const { result } = renderHook(() => useSpeech())
    act(() => result.current.speak('apple'))
    act(() => result.current.speak('banana'))
    act(() => vi.runAllTimers())
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(2)
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(2)
  })
})
