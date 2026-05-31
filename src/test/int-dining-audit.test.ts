
import { describe, it, expect } from 'vitest';
import { buildChallengeSequence } from '../utils/lessonSequence';
import { LESSONS_MAP } from '../data/lessons';
import { SENTENCES } from '../data/sentences';

describe('int-dining-1 audit', () => {
  it('should have correct sequence for Tier 0', () => {
    const lesson = LESSONS_MAP['int-dining-1'];
    const sequence = buildChallengeSequence(lesson, 0, SENTENCES, 'sentences', 0);

    // Tier 0 구성:
    //   dialogue-choice × N (dialoguePrompt 보유 문장만)
    //   sentence-pick × 4
    //   fill-blank × 4
    //   translate-type × 1
    //   sentence-builder × 4
    //   speak-sentence × 1 (핵심 단어)
    const dialogueCount = sequence.filter(c => c.kind === 'dialogue-choice').length
    expect(sequence.filter(c => c.kind === 'sentence-pick').length).toBe(4)
    expect(sequence.filter(c => c.kind === 'fill-blank').length).toBe(4)
    expect(sequence.filter(c => c.kind === 'translate-type').length).toBe(1)
    expect(sequence.filter(c => c.kind === 'sentence-builder').length).toBe(4)
    expect(sequence.filter(c => c.kind === 'speak-sentence').length).toBeGreaterThanOrEqual(1)

    // 순서 검증: dialogue-choice → sentence-pick → fill-blank → translate-type → sentence-builder → speak-sentence
    expect(sequence[0].kind).toBe('dialogue-choice')
    expect(sequence[dialogueCount].kind).toBe('sentence-pick')
    expect(sequence[dialogueCount + 4].kind).toBe('fill-blank')
  });

  it('should have situational distractors and dialogue prompts', () => {
    const s1 = SENTENCES.find(s => s.id === 'dining-get-menu');
    expect(s1?.dialoguePrompt).toBeDefined();
    expect(s1?.englishDistractors).toContain("Check, please");
  });
});
