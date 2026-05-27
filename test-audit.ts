
import { buildChallengeSequence } from './src/utils/lessonSequence';
import { LESSONS_MAP } from './src/data/lessons';
import { SENTENCES } from './src/data/sentences';

const lesson = LESSONS_MAP['int-dining-1'];
const sequence = buildChallengeSequence(lesson, 0, SENTENCES, 'sentences', 0);

console.log('--- int-dining-1 Tier 0 Sequence ---');
sequence.forEach((c, i) => {
  console.log(`${i + 1}. [${c.kind}] sentenceId: ${c.sentenceId} tag: ${c.tag}`);
});

const s1 = SENTENCES.find(s => s.id === 'dining-get-menu');
console.log('\n--- Sentence Details: dining-get-menu ---');
console.log('Dialogue Prompt:', s1?.dialoguePrompt);
console.log('English:', s1?.english);
console.log('Distractors:', s1?.englishDistractors);
