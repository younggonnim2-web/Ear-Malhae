// src/data/units.ts
import type { Unit } from '../types/lesson'

export const UNITS_MAP: Record<string, Unit> = {
  alphabet: {
    id: 'alphabet', title: '알파벳', emoji: '🔤', type: 'alphabet',
    lessonIds: ['alphabet-1','alphabet-2','alphabet-3','alphabet-4','alphabet-5'],
  },
  daily: {
    id: 'daily', title: '일상 표현', emoji: '👋', type: 'words',
    lessonIds: ['daily-1','daily-2','daily-3'],
  },
  number: {
    id: 'number', title: '숫자', emoji: '🔢', type: 'words',
    lessonIds: ['number-1','number-2'],
  },
  fruit: {
    id: 'fruit', title: '과일', emoji: '🍎', type: 'words',
    lessonIds: ['fruit-1','fruit-2'],
  },
  animal: {
    id: 'animal', title: '동물', emoji: '🐱', type: 'words',
    lessonIds: ['animal-1','animal-2','animal-3'],
  },
  color: {
    id: 'color', title: '색깔', emoji: '🌈', type: 'words',
    lessonIds: ['color-1','color-2'],
  },
  body: {
    id: 'body', title: '신체', emoji: '🦶', type: 'words',
    lessonIds: ['body-1','body-2'],
  },
  food: {
    id: 'food', title: '음식', emoji: '🍚', type: 'words',
    lessonIds: ['food-1','food-2'],
  },
  place: {
    id: 'place', title: '장소', emoji: '🏠', type: 'words',
    lessonIds: ['place-1'],
  },
  // 신규 유닛
  family: {
    id: 'family', title: '가족', emoji: '👨‍👩‍👧‍👦', type: 'words',
    lessonIds: ['family-1','family-2'],
  },
  weather: {
    id: 'weather', title: '날씨', emoji: '🌤️', type: 'words',
    lessonIds: ['weather-1','weather-2'],
  },
  feeling: {
    id: 'feeling', title: '감정', emoji: '😊', type: 'words',
    lessonIds: ['feeling-1','feeling-2'],
  },
  transport: {
    id: 'transport', title: '교통', emoji: '🚌', type: 'words',
    lessonIds: ['transport-1','transport-2'],
  },
  health: {
    id: 'health', title: '건강', emoji: '💊', type: 'words',
    lessonIds: ['health-1','health-2'],
  },
}

export const UNIT_ORDER = [
  'alphabet','daily',
  'number','fruit','animal',
  'color','body','food','place',
  'family','weather','feeling',
  'transport','health',
]
