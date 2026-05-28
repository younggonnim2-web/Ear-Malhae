export function playCorrectSound(): void {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    // C5→E5→G5→C6 상행 아르페지오, 각 음 0.09s 간격
    const notes: [number, number, number][] = [
      [523, 0,    0.18],  // C5
      [659, 0.09, 0.18],  // E5
      [784, 0.18, 0.18],  // G5
      [1047, 0.27, 0.45], // C6 (마지막 음 길게)
    ]

    for (const [freq, delay, duration] of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.4, now + delay + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration)
      osc.start(now + delay)
      osc.stop(now + delay + duration)
    }

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // Web Audio API unavailable
  }
}
