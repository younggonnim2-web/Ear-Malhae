// src/data/lessons.ts
import type { Lesson } from '../types/lesson'

export const LESSONS_MAP: Record<string, Lesson> = {
  // ── 알파벳 ──
  'alphabet-1': { id: 'alphabet-1', unitId: 'alphabet', title: 'A ~ E', itemIds: ['A','B','C','D','E'] },
  'alphabet-2': { id: 'alphabet-2', unitId: 'alphabet', title: 'F ~ J', itemIds: ['F','G','H','I','J'] },
  'alphabet-3': { id: 'alphabet-3', unitId: 'alphabet', title: 'K ~ O', itemIds: ['K','L','M','N','O'] },
  'alphabet-4': { id: 'alphabet-4', unitId: 'alphabet', title: 'P ~ T', itemIds: ['P','Q','R','S','T'] },
  'alphabet-5': { id: 'alphabet-5', unitId: 'alphabet', title: 'U ~ Z', itemIds: ['U','V','W','X','Y','Z'] },
  // ── 과일 ──
  'fruit-1': { id: 'fruit-1', unitId: 'fruit', title: '과일 1', itemIds: ['apple','banana','grape','orange','strawberry'] },
  'fruit-2': { id: 'fruit-2', unitId: 'fruit', title: '과일 2', itemIds: ['watermelon','lemon','peach','mango','cherry'] },
  // ── 동물 ──
  'animal-1': { id: 'animal-1', unitId: 'animal', title: '동물 1', itemIds: ['cat','dog','bird','fish','rabbit'] },
  'animal-2': { id: 'animal-2', unitId: 'animal', title: '동물 2', itemIds: ['bear','elephant','lion','tiger','pig'] },
  'animal-3': { id: 'animal-3', unitId: 'animal', title: '동물 3', itemIds: ['monkey','horse','cow','sheep','duck'] },
  // ── 색깔 ──
  'color-1': { id: 'color-1', unitId: 'color', title: '색깔 1', itemIds: ['red','blue','green','yellow','white'] },
  'color-2': { id: 'color-2', unitId: 'color', title: '색깔 2', itemIds: ['black','pink','purple','brown','gray'] },
  // ── 신체 ──
  'body-1': { id: 'body-1', unitId: 'body', title: '신체 1', itemIds: ['eye','ear','nose','mouth','hand','foot'] },
  'body-2': { id: 'body-2', unitId: 'body', title: '신체 2', itemIds: ['head','hair','arm','leg','finger','toe'] },
  // ── 음식 ──
  'food-1': { id: 'food-1', unitId: 'food', title: '음식 1', itemIds: ['milk','egg','rice','bread','cake','juice'] },
  'food-2': { id: 'food-2', unitId: 'food', title: '음식 2', itemIds: ['water','soup','pizza','cookie','cheese','carrot'] },
  // ── 숫자 ──
  'number-1': { id: 'number-1', unitId: 'number', title: '숫자 1', itemIds: ['one','two','three','four','five'] },
  'number-2': { id: 'number-2', unitId: 'number', title: '숫자 2', itemIds: ['six','seven','eight','nine','ten'] },
  // ── 일상 표현 ──
  'daily-1': { id: 'daily-1', unitId: 'daily', title: '일상 표현 1', itemIds: ['hello','bye','yes','no','good'] },
  'daily-2': { id: 'daily-2', unitId: 'daily', title: '일상 표현 2', itemIds: ['bad','big','small','hot','cold'] },
  'daily-3': { id: 'daily-3', unitId: 'daily', title: '일상 표현 3', itemIds: ['happy','sad','thank-you','sorry','please'] },
  // ── 장소 ──
  'place-1': { id: 'place-1', unitId: 'place', title: '장소', itemIds: ['home','school','park','shop','hospital','library'] },
}
