// src/data/lessons.ts
import type { Lesson } from '../types/lesson'

export const LESSONS_MAP: Record<string, Lesson> = {
  // ── 알파벳 ──
  'alphabet-1': { id: 'alphabet-1', unitId: 'alphabet', title: 'A ~ E', itemIds: ['A','B','C','D','E'] },
  'alphabet-2': { id: 'alphabet-2', unitId: 'alphabet', title: 'F ~ J', itemIds: ['F','G','H','I','J'] },
  'alphabet-3': { id: 'alphabet-3', unitId: 'alphabet', title: 'K ~ O', itemIds: ['K','L','M','N','O'] },
  'alphabet-4': { id: 'alphabet-4', unitId: 'alphabet', title: 'P ~ T', itemIds: ['P','Q','R','S','T'] },
  'alphabet-5': { id: 'alphabet-5', unitId: 'alphabet', title: 'U ~ Z', itemIds: ['U','V','W','X','Y','Z'] },
  // ── 일상 표현 ──
  'daily-1': { id: 'daily-1', unitId: 'daily', title: '인사하기', itemIds: ['hello','bye','yes','no','good'] },
  'daily-2': { id: 'daily-2', unitId: 'daily', title: '형용사', itemIds: ['bad','big','small','hot','cold'] },
  'daily-3': { id: 'daily-3', unitId: 'daily', title: '감사·사과', itemIds: ['happy','sad','thank-you','sorry','please'] },
  // ── 숫자 ──
  'number-1': { id: 'number-1', unitId: 'number', title: '숫자 1~5', itemIds: ['one','two','three','four','five'] },
  'number-2': { id: 'number-2', unitId: 'number', title: '숫자 6~10', itemIds: ['six','seven','eight','nine','ten'] },
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
  // ── 장소 ──
  'place-1': { id: 'place-1', unitId: 'place', title: '장소', itemIds: ['home','school','park','shop','hospital','library'] },
  // ── 가족 ── (신규)
  'family-1': { id: 'family-1', unitId: 'family', title: '가족 1', itemIds: ['mother','father','sister','brother','baby'] },
  'family-2': { id: 'family-2', unitId: 'family', title: '가족 2', itemIds: ['family','grandpa','grandma'] },
  // ── 날씨 ── (신규)
  'weather-1': { id: 'weather-1', unitId: 'weather', title: '날씨 1', itemIds: ['sunny','cloudy','rainy','snowy','windy'] },
  'weather-2': { id: 'weather-2', unitId: 'weather', title: '날씨 2', itemIds: ['warm','cool','foggy'] },
  // ── 감정 ── (신규)
  'feeling-1': { id: 'feeling-1', unitId: 'feeling', title: '감정 1', itemIds: ['angry','tired','excited','scared'] },
  'feeling-2': { id: 'feeling-2', unitId: 'feeling', title: '감정 2', itemIds: ['surprised','bored','worried','nervous'] },
  // ── 교통 ── (신규)
  'transport-1': { id: 'transport-1', unitId: 'transport', title: '교통 1', itemIds: ['bus','car','train','subway','taxi'] },
  'transport-2': { id: 'transport-2', unitId: 'transport', title: '교통 2', itemIds: ['bike','airplane','ship'] },
  // ── 건강 ── (신규)
  'health-1': { id: 'health-1', unitId: 'health', title: '건강 1', itemIds: ['sick','doctor','medicine','fever'] },
  'health-2': { id: 'health-2', unitId: 'health', title: '건강 2', itemIds: ['sleep','exercise','healthy','rest'] },

  // ── 중급 트랙 레슨 (sentence-type) ──
  'int-dining-1': {
    id: 'int-dining-1', unitId: 'int-dining', title: '예약·오주문', itemIds: [],
    sentenceIds: ['adv-dining-reservation', 'adv-dining-wrong-order'],
  },
  'int-dining-2': {
    id: 'int-dining-2', unitId: 'int-dining', title: '특별 요청', itemIds: [],
    sentenceIds: ['adv-dining-allergy', 'adv-dining-side', 'adv-dining-steak'],
  },
  'int-hotel-1': {
    id: 'int-hotel-1', unitId: 'int-hotel', title: '호텔·이동', itemIds: [],
    sentenceIds: ['adv-travel-room-issue', 'adv-travel-upgrade', 'adv-travel-transport'],
  },
  'int-social-1': {
    id: 'int-social-1', unitId: 'int-social', title: '거절·공감', itemIds: [],
    sentenceIds: ['adv-daily-rejection', 'adv-daily-agree', 'adv-daily-netflix'],
  },
  'int-social-2': {
    id: 'int-social-2', unitId: 'int-social', title: '조언·의견', itemIds: [],
    sentenceIds: ['adv-daily-advice', 'adv-daily-opinion'],
  },

  // ── 고급 트랙 레슨 (sentence-type) ──
  'adv-airport-1': {
    id: 'adv-airport-1', unitId: 'adv-airport', title: '지연·분실·오버부킹', itemIds: [],
    sentenceIds: ['adv-travel-delay', 'adv-travel-lost-baggage', 'adv-airport-overbook'],
  },
  'adv-biz-1': {
    id: 'adv-biz-1', unitId: 'adv-biz', title: '마감·반론', itemIds: [],
    sentenceIds: ['adv-biz-deadline', 'adv-biz-disagree'],
  },
  'adv-biz-2': {
    id: 'adv-biz-2', unitId: 'adv-biz', title: '제안·설득', itemIds: [],
    sentenceIds: ['adv-biz-proposal', 'adv-daily-opinion', 'adv-daily-advice'],
  },
  'adv-idiom-1': {
    id: 'adv-idiom-1', unitId: 'adv-idiom', title: '관용구 표현', itemIds: [],
    sentenceIds: ['adv-idiom-ballpark', 'adv-idiom-silver-lining', 'adv-idiom-catch22'],
  },
}
