import '@testing-library/jest-dom'

global.SpeechSynthesisUtterance = class {
  text = ''
  lang = ''
  rate = 1
} as unknown as typeof SpeechSynthesisUtterance

Object.defineProperty(global, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    speaking: false,
    getVoices: () => [],
  },
  writable: true,
})
