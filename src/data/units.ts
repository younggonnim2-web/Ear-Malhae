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

  // ── 중급 트랙 유닛 ──
  'int-dining': {
    id: 'int-dining', title: '식당 주문', emoji: '🍽️', type: 'sentences',
    lessonIds: ['int-dining-1', 'int-dining-2', 'int-dining-3'],
  },
  'int-hotel': {
    id: 'int-hotel', title: '여행·숙박', emoji: '🏨', type: 'sentences',
    lessonIds: ['int-hotel-1', 'int-hotel-2'],
  },
  'int-social': {
    id: 'int-social', title: '일상 회화', emoji: '💬', type: 'sentences',
    lessonIds: ['int-social-1', 'int-social-2', 'int-social-3'],
  },

  // ── 고급 트랙 유닛 ──
  'adv-airport': {
    id: 'adv-airport', title: '공항·교통', emoji: '✈️', type: 'sentences',
    lessonIds: ['adv-airport-1', 'adv-airport-2'],
  },
  'adv-biz': {
    id: 'adv-biz', title: '감정·공감', emoji: '❤️', type: 'sentences',
    lessonIds: ['adv-biz-1', 'adv-biz-2', 'adv-biz-3'],
  },
  'adv-idiom': {
    id: 'adv-idiom', title: '일상 대화', emoji: '💬', type: 'sentences',
    lessonIds: ['adv-idiom-1', 'adv-idiom-2', 'adv-idiom-3'],
  },

  // ── 중급 신규 유닛 ──
  'int-shopping': {
    id: 'int-shopping', title: '쇼핑', emoji: '🛍️', type: 'sentences',
    lessonIds: ['int-shopping-1', 'int-shopping-2'],
  },
  'int-directions': {
    id: 'int-directions', title: '길 찾기', emoji: '🗺️', type: 'sentences',
    lessonIds: ['int-directions-1', 'int-directions-2'],
  },
  'int-transport': {
    id: 'int-transport', title: '대중교통', emoji: '🚆', type: 'sentences',
    lessonIds: ['int-transport-1', 'int-transport-2'],
  },
  'int-bank': {
    id: 'int-bank', title: '은행', emoji: '🏦', type: 'sentences',
    lessonIds: ['int-bank-1', 'int-bank-2'],
  },
  'int-hospital': {
    id: 'int-hospital', title: '병원', emoji: '🏥', type: 'sentences',
    lessonIds: ['int-hospital-1', 'int-hospital-2'],
  },
  'int-phone': {
    id: 'int-phone', title: '전화 통화', emoji: '📞', type: 'sentences',
    lessonIds: ['int-phone-1', 'int-phone-2'],
  },

  // ── 고급 신규 유닛 ──
  'adv-meeting': {
    id: 'adv-meeting', title: '회의', emoji: '📋', type: 'sentences',
    lessonIds: ['adv-meeting-1', 'adv-meeting-2'],
  },
  'adv-email': {
    id: 'adv-email', title: '이메일', emoji: '📧', type: 'sentences',
    lessonIds: ['adv-email-1', 'adv-email-2'],
  },
  'adv-negotiate': {
    id: 'adv-negotiate', title: '협상', emoji: '🤝', type: 'sentences',
    lessonIds: ['adv-negotiate-1', 'adv-negotiate-2'],
  },
  'adv-news': {
    id: 'adv-news', title: '뉴스·시사', emoji: '📰', type: 'sentences',
    lessonIds: ['adv-news-1', 'adv-news-2'],
  },
  'adv-health': {
    id: 'adv-health', title: '건강 생활', emoji: '🏃', type: 'sentences',
    lessonIds: ['adv-health-1', 'adv-health-2'],
  },
  'adv-tech': {
    id: 'adv-tech', title: '기술', emoji: '💻', type: 'sentences',
    lessonIds: ['adv-tech-1', 'adv-tech-2'],
  },
}

export const UNIT_ORDER = [
  'alphabet','daily',
  'number','fruit','animal',
  'color','body','food','place',
  'family','weather','feeling',
  'transport','health',
]
