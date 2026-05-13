/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'

window.SpeechSynthesisUtterance = class {
  text = ''
  lang = ''
  rate = 1
} as unknown as typeof SpeechSynthesisUtterance

Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    speaking: false,
    getVoices: () => [],
  },
  writable: true,
})
