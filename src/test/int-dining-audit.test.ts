
import { describe, it, expect } from 'vitest';
import { buildChallengeSequence } from '../utils/lessonSequence';
import { LESSONS_MAP } from '../data/lessons';
import { SENTENCES } from '../data/sentences';

describe('int-dining-1 audit', () => {
  it('should have correct sequence for Tier 0', () => {
    const lesson = LESSONS_MAP['int-dining-1'];
    const sequence = buildChallengeSequence(lesson, 0, SENTENCES, 'sentences', 0);
    
    // Tier 0: dialogue-choice (4) -> sentence-pick (4) -> sentence-builder (4)
    expect(sequence.length).toBe(12);
    expect(sequence[0].kind).toBe('dialogue-choice');
    expect(sequence[4].kind).toBe('sentence-pick');
    expect(sequence[8].kind).toBe('sentence-builder');
  });

  it('should have situational distractors and dialogue prompts', () => {
    const s1 = SENTENCES.find(s => s.id === 'dining-get-menu');
    expect(s1?.dialoguePrompt).toBeDefined();
    expect(s1?.englishDistractors).toContain("Check, please");
  });
});
