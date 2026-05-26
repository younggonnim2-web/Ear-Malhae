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
    id: 'int-dining-1', unitId: 'int-dining', title: '예약·기본 주문', itemIds: [],
    sentenceIds: ['dining-have-reservation', 'dining-get-menu', 'dining-get-water', 'dining-not-my-order'],
  },
  'int-dining-2': {
    id: 'int-dining-2', unitId: 'int-dining', title: '특별 요청·포장', itemIds: [],
    sentenceIds: ['dining-no-ice', 'dining-to-go', 'dining-check-please'],
  },
  'int-hotel-1': {
    id: 'int-hotel-1', unitId: 'int-hotel', title: '체크인·시설 안내', itemIds: [],
    sentenceIds: ['hotel-have-reservation', 'hotel-where-is', 'hotel-wake-up-call'],
  },
  'int-hotel-2': {
    id: 'int-hotel-2', unitId: 'int-hotel', title: '서비스 요청·불만', itemIds: [],
    sentenceIds: ['hotel-wifi', 'hotel-extra-towels', 'hotel-late-checkout', 'hotel-noisy', 'hotel-room-service'],
  },
  'int-social-1': {
    id: 'int-social-1', unitId: 'int-social', title: '공감·동의', itemIds: [],
    sentenceIds: ['social-no-problem', 'social-sounds-good', 'social-maybe-next-time'],
  },
  'int-social-2': {
    id: 'int-social-2', unitId: 'int-social', title: '권유·의견', itemIds: [],
    sentenceIds: ['social-i-think', 'social-you-should'],
  },
  'int-social-3': {
    id: 'int-social-3', unitId: 'int-social', title: '대화 이어가기', itemIds: [],
    sentenceIds: ['social-how-was', 'social-me-too', 'social-really', 'social-take-care', 'social-by-the-way'],
  },
  'int-dining-3': {
    id: 'int-dining-3', unitId: 'int-dining', title: '주문 심화·계산', itemIds: [],
    sentenceIds: ['dining-recommend', 'dining-allergy-gluten', 'dining-well-done', 'dining-split-bill', 'dining-refill'],
  },

  // ── 고급 트랙 레슨 (sentence-type) ──
  'adv-airport-1': {
    id: 'adv-airport-1', unitId: 'adv-airport', title: '지연·분실·오버부킹', itemIds: [],
    sentenceIds: ['adv-travel-delay', 'adv-travel-lost-baggage', 'adv-airport-overbook'],
  },
  'adv-airport-2': {
    id: 'adv-airport-2', unitId: 'adv-airport', title: '입출국·탑승 수속', itemIds: [],
    sentenceIds: ['adv-customs-nothing', 'adv-visit-purpose', 'adv-connecting-flight', 'adv-checked-bags', 'adv-window-seat'],
  },
  'adv-biz-1': {
    id: 'adv-biz-1', unitId: 'adv-biz', title: '감정 표현', itemIds: [],
    sentenceIds: ['adv-feeling-proud', 'adv-feeling-cheer'],
  },
  'adv-biz-2': {
    id: 'adv-biz-2', unitId: 'adv-biz', title: '공감·조언', itemIds: [],
    sentenceIds: ['adv-feeling-sympathy', 'adv-daily-advice', 'adv-daily-opinion'],
  },
  'adv-biz-3': {
    id: 'adv-biz-3', unitId: 'adv-biz', title: '위로·격려', itemIds: [],
    sentenceIds: ['adv-things-better', 'adv-you-can-do', 'adv-worry-fine', 'adv-hang-in-there', 'adv-proud-of-you'],
  },
  'adv-idiom-1': {
    id: 'adv-idiom-1', unitId: 'adv-idiom', title: '일상 표현', itemIds: [],
    sentenceIds: ['adv-daily-netflix', 'adv-chat-recommend', 'adv-chat-catchup'],
  },
  'adv-idiom-2': {
    id: 'adv-idiom-2', unitId: 'adv-idiom', title: '반응·표현', itemIds: [],
    sentenceIds: ['adv-daily-rejection', 'adv-daily-agree'],
  },
  'adv-idiom-3': {
    id: 'adv-idiom-3', unitId: 'adv-idiom', title: '자연스러운 표현', itemIds: [],
    sentenceIds: ['adv-kidding', 'adv-no-way', 'adv-hang-on', 'adv-fair-enough', 'adv-figured-out'],
  },

  // ── 중급: 쇼핑 ──
  'int-shopping-1': {
    id: 'int-shopping-1', unitId: 'int-shopping', title: '기본 쇼핑', itemIds: [],
    sentenceIds: ['shopping-excuse-me', 'shopping-how-much', 'shopping-other-colors', 'shopping-try-on', 'shopping-size'],
  },
  'int-shopping-2': {
    id: 'int-shopping-2', unitId: 'int-shopping', title: '결제·반품', itemIds: [],
    sentenceIds: ['shopping-credit-card', 'shopping-receipt', 'shopping-gift-wrap', 'shopping-too-expensive', 'shopping-refund'],
  },

  // ── 중급: 길 찾기 ──
  'int-directions-1': {
    id: 'int-directions-1', unitId: 'int-directions', title: '길 묻기', itemIds: [],
    sentenceIds: ['directions-how-get-to', 'directions-turn-left', 'directions-straight', 'directions-bus-stop', 'directions-how-far'],
  },
  'int-directions-2': {
    id: 'int-directions-2', unitId: 'int-directions', title: '교통 안내', itemIds: [],
    sentenceIds: ['directions-excuse-walking', 'directions-on-right', 'directions-subway', 'directions-take-a-cab'],
  },

  // ── 중급: 대중교통 ──
  'int-transport-1': {
    id: 'int-transport-1', unitId: 'int-transport', title: '탑승·환승', itemIds: [],
    sentenceIds: ['transport-one-ticket', 'transport-does-stop', 'transport-how-many-stops', 'transport-transfer', 'transport-get-off'],
  },
  'int-transport-2': {
    id: 'int-transport-2', unitId: 'int-transport', title: '좌석·도착', itemIds: [],
    sentenceIds: ['transport-late', 'transport-which-platform', 'transport-reserved-seat', 'transport-arrival'],
  },

  // ── 중급: 은행 ──
  'int-bank-1': {
    id: 'int-bank-1', unitId: 'int-bank', title: '은행 기본', itemIds: [],
    sentenceIds: ['bank-open-account', 'bank-exchange', 'bank-withdraw', 'bank-transfer', 'bank-fee'],
  },
  'int-bank-2': {
    id: 'int-bank-2', unitId: 'int-bank', title: '계좌·카드', itemIds: [],
    sentenceIds: ['bank-balance', 'bank-pin', 'bank-lost-card', 'bank-minimum'],
  },

  // ── 중급: 병원 ──
  'int-hospital-1': {
    id: 'int-hospital-1', unitId: 'int-hospital', title: '진료·증상', itemIds: [],
    sentenceIds: ['hospital-appointment', 'hospital-headache', 'hospital-fever', 'hospital-allergy', 'hospital-test'],
  },
  'int-hospital-2': {
    id: 'int-hospital-2', unitId: 'int-hospital', title: '처방·보험', itemIds: [],
    sentenceIds: ['hospital-prescription', 'hospital-insurance', 'hospital-specialist', 'hospital-pharmacy'],
  },

  // ── 중급: 전화 통화 ──
  'int-phone-1': {
    id: 'int-phone-1', unitId: 'int-phone', title: '전화 기본', itemIds: [],
    sentenceIds: ['phone-is-this', 'phone-hold-on', 'phone-can-you-repeat', 'phone-call-back', 'phone-message'],
  },
  'int-phone-2': {
    id: 'int-phone-2', unitId: 'int-phone', title: '전화 심화', itemIds: [],
    sentenceIds: ['phone-wrong-number', 'phone-speak-up', 'phone-available', 'phone-conference'],
  },

  // ── 고급: 회의 ──
  'adv-meeting-1': {
    id: 'adv-meeting-1', unitId: 'adv-meeting', title: '회의 진행', itemIds: [],
    sentenceIds: ['adv-meeting-agenda', 'adv-meeting-discuss', 'adv-meeting-next-steps', 'adv-meeting-postpone', 'adv-meeting-on-track'],
  },
  'adv-meeting-2': {
    id: 'adv-meeting-2', unitId: 'adv-meeting', title: '회의 정리', itemIds: [],
    sentenceIds: ['adv-meeting-input', 'adv-meeting-deadline', 'adv-meeting-follow-up', 'adv-meeting-minutes', 'adv-meeting-decision'],
  },

  // ── 고급: 이메일 ──
  'adv-email-1': {
    id: 'adv-email-1', unitId: 'adv-email', title: '이메일 기본', itemIds: [],
    sentenceIds: ['adv-email-followup', 'adv-email-attached', 'adv-email-clarify', 'adv-email-confirm', 'adv-email-deadline'],
  },
  'adv-email-2': {
    id: 'adv-email-2', unitId: 'adv-email', title: '이메일 심화', itemIds: [],
    sentenceIds: ['adv-email-appreciate', 'adv-email-update', 'adv-email-loop', 'adv-email-convenient', 'adv-email-priority'],
  },

  // ── 고급: 협상 ──
  'adv-negotiate-1': {
    id: 'adv-negotiate-1', unitId: 'adv-negotiate', title: '협상 기본', itemIds: [],
    sentenceIds: ['adv-negotiate-offer', 'adv-negotiate-middle', 'adv-negotiate-counter', 'adv-negotiate-acceptable', 'adv-negotiate-terms'],
  },
  'adv-negotiate-2': {
    id: 'adv-negotiate-2', unitId: 'adv-negotiate', title: '협상 타결', itemIds: [],
    sentenceIds: ['adv-negotiate-deal', 'adv-negotiate-flexible', 'adv-negotiate-bottom-line', 'adv-negotiate-agree', 'adv-negotiate-finalize'],
  },

  // ── 고급: 뉴스·시사 ──
  'adv-news-1': {
    id: 'adv-news-1', unitId: 'adv-news', title: '뉴스 읽기', itemIds: [],
    sentenceIds: ['adv-news-headline', 'adv-news-opinion', 'adv-news-source', 'adv-news-agree', 'adv-news-impact'],
  },
  'adv-news-2': {
    id: 'adv-news-2', unitId: 'adv-news', title: '뉴스 토론', itemIds: [],
    sentenceIds: ['adv-news-surprised', 'adv-news-controversial', 'adv-news-follow', 'adv-news-turn-out', 'adv-news-local'],
  },

  // ── 고급: 건강 생활 ──
  'adv-health-1': {
    id: 'adv-health-1', unitId: 'adv-health', title: '건강 관리', itemIds: [],
    sentenceIds: ['adv-health-lifestyle', 'adv-health-mental', 'adv-health-workout', 'adv-health-diet', 'adv-health-checkup'],
  },
  'adv-health-2': {
    id: 'adv-health-2', unitId: 'adv-health', title: '건강 습관', itemIds: [],
    sentenceIds: ['adv-health-stress', 'adv-health-habit', 'adv-health-sleep', 'adv-health-prevention', 'adv-health-balance'],
  },

  // ── 고급: 기술 ──
  'adv-tech-1': {
    id: 'adv-tech-1', unitId: 'adv-tech', title: '기술 문제', itemIds: [],
    sentenceIds: ['adv-tech-update', 'adv-tech-backup', 'adv-tech-crash', 'adv-tech-share', 'adv-tech-setting'],
  },
  'adv-tech-2': {
    id: 'adv-tech-2', unitId: 'adv-tech', title: '기술 대화', itemIds: [],
    sentenceIds: ['adv-tech-password', 'adv-tech-download', 'adv-tech-sync', 'adv-tech-connection', 'adv-tech-ai'],
  },
}
