import type { SentenceItem } from '../types'

// category 없음 = 모든 유닛에 범용으로 사용 가능한 일상 표현
// category 있음 = 해당 유닛 학습 시에만 노출
//
// 데이터 규칙:
//   - parts[i]: 한국어 자연 어순 기준 (fill-blank 화면에 표시되는 순서)
//   - englishParts[i]: 영어 자연 어순 기준 (영어 fill-blank 화면에 표시되는 순서)
//   - 두 배열은 어순이 다를 수 있음 (한국어 SOV vs 영어 SVO)
//   - distractors[i] ↔ englishDistractors[i] 는 평행 매핑 유지 (오답 음성 출력용)
export const SENTENCES: SentenceItem[] = [
  // ── 범용 (일상·기초) ─────────────────────────────────────────────────
  { id: 'its-hot',       english: "It's hot.",           korean: '더워요',                 parts: ['더워요'],                      englishParts: ['hot'],                      distractors: ['추워요', '좋아요', '싫어요'],    englishDistractors: ['cold', 'good', 'dislike'] },
  { id: 'its-cold',      english: "It's cold.",          korean: '추워요',                 parts: ['추워요'],                      englishParts: ['cold'],                     distractors: ['더워요', '좋아요'],             englishDistractors: ['hot', 'good'] },
  { id: 'its-big',       english: "It's big.",           korean: '커요',                   parts: ['커요'],                        englishParts: ['big'],                      distractors: ['작아요', '높아요', '낮아요'],    englishDistractors: ['small', 'tall', 'low'] },
  { id: 'its-small',     english: "It's small.",         korean: '작아요',                 parts: ['작아요'],                      englishParts: ['small'],                    distractors: ['커요', '무거워요', '가벼워요'],  englishDistractors: ['big', 'heavy', 'light'] },
  { id: 'im-happy',      english: "I'm happy.",          korean: '나는 행복해요',           parts: ['나는', '행복해요'],            englishParts: ['I am', 'happy'],            distractors: ['슬퍼요', '배고파요'],           englishDistractors: ['sad', 'hungry'] },
  { id: 'im-hungry',     english: "I'm hungry.",         korean: '나는 배고파요',           parts: ['나는', '배고파요'],            englishParts: ['I am', 'hungry'],           distractors: ['행복해요', '슬퍼요'],           englishDistractors: ['happy', 'sad'] },
  { id: 'thank-you',     english: 'Thank you.',          korean: '감사해요',               parts: ['감사해요'],                    englishParts: ['thank you'],                distractors: ['미안해요', '좋아요'],           englishDistractors: ['sorry', 'good'] },
  { id: 'lets-go',       english: "Let's go.",           korean: '가요',                   parts: ['가요'],                        englishParts: ['go'],                       distractors: ['와요', '먹어요', '자요'],        englishDistractors: ['come', 'eat', 'sleep'] },
  { id: 'go-home',       english: 'Go home.',            korean: '집에 가요',              parts: ['집에', '가요'],                englishParts: ['Go', 'home'],               distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run'] },

  // ── 색깔 (color) ──────────────────────────────────────────────────────
  { id: 'its-red',       english: "It's red.",           korean: '빨간색이에요',            parts: ['빨간색이에요'],                englishParts: ['red'],                      distractors: ['파란색이에요', '초록색이에요', '노란색이에요'], englishDistractors: ['blue', 'green', 'yellow'], category: 'color' },
  { id: 'i-like-blue',   english: 'I like blue.',        korean: '나는 파란색이 좋아요',   parts: ['나는 파란색이', '좋아요'],    englishParts: ['I like', 'blue'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['red', 'green'],  category: 'color' },
  { id: 'i-like-red',    english: 'I like red.',         korean: '나는 빨간색이 좋아요',   parts: ['나는 빨간색이', '좋아요'],    englishParts: ['I like', 'red'],            distractors: ['싫어요', '먹어요'],             englishDistractors: ['blue', 'green'], category: 'color' },

  // ── 동물 (animal) ─────────────────────────────────────────────────────
  { id: 'i-like-cats',   english: 'I like cats.',        korean: '나는 고양이가 좋아요',   parts: ['나는 고양이가', '좋아요'],    englishParts: ['I like', 'cats'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['dogs', 'birds'], category: 'animal' },
  { id: 'its-a-dog',     english: "It's a dog.",         korean: '강아지예요',              parts: ['강아지예요'],                  englishParts: ['dog'],                      distractors: ['고양이예요', '새예요', '토끼예요'], englishDistractors: ['cat', 'bird', 'rabbit'], category: 'animal' },
  { id: 'i-see-bird',    english: 'I see a bird.',       korean: '새가 보여요',            parts: ['새가', '보여요'],              englishParts: ['I see', 'a bird'],          distractors: ['날아요', '들려요'],             englishDistractors: ['hear', 'fly'],   category: 'animal' },

  // ── 음식 (food) ───────────────────────────────────────────────────────
  { id: 'i-like-milk',   english: 'I like milk.',        korean: '나는 우유가 좋아요',     parts: ['나는 우유가', '좋아요'],      englishParts: ['I like', 'milk'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['bread', 'water'], category: 'food' },
  { id: 'coffee-please', english: 'Coffee, please.',     korean: '커피 주세요!',           parts: ['커피', '주세요'],              englishParts: ['Coffee', 'please'],         distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive'],  category: 'food' },
  { id: 'water-please',  english: 'Water, please.',      korean: '물 주세요',              parts: ['물', '주세요'],                englishParts: ['Water', 'please'],          distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive'], category: 'food' },
  { id: 'i-want-bread',  english: 'I want bread.',       korean: '빵을 원해요',            parts: ['빵을', '원해요'],              englishParts: ['I want', 'bread'],          distractors: ['먹어요', '좋아요'],             englishDistractors: ['eat', 'like'],  category: 'food' },

  // ── 숫자 (number) ─────────────────────────────────────────────────────
  { id: 'one-please',    english: 'One, please.',        korean: '하나 주세요',            parts: ['하나', '주세요'],              englishParts: ['One', 'please'],            distractors: ['마셔요', '가져요'],             englishDistractors: ['drink', 'take'],  category: 'number' },

  // ── 가족 (family) ─────────────────────────────────────────────────────
  { id: 'my-mother',    english: 'She is my mother.',   korean: '그녀는 우리 엄마예요',    parts: ['그녀는 우리', '엄마예요'],    englishParts: ['She is my', 'mother'],      distractors: ['아빠예요', '할아버지예요'],      englishDistractors: ['father', 'grandfather'], category: 'family' },
  { id: 'i-love-family',english: 'I love my family.',   korean: '나는 가족을 사랑해요',    parts: ['나는 가족을', '사랑해요'],    englishParts: ['I love my', 'family'],      distractors: ['싫어해요', '잊어요'],           englishDistractors: ['hate', 'forget'], category: 'family' },
  { id: 'my-brother',   english: 'He is my brother.',   korean: '그는 우리 오빠예요',      parts: ['그는 우리', '오빠예요'],      englishParts: ['He is my', 'brother'],      distractors: ['언니예요', '할머니예요'],        englishDistractors: ['sister', 'grandmother'], category: 'family' },

  // ── 날씨 (weather) ────────────────────────────────────────────────────
  { id: 'its-sunny',    english: "It's sunny today.",   korean: '오늘은 맑아요',           parts: ['오늘은', '맑아요'],            englishParts: ["It's sunny", 'today'],      distractors: ['흐려요', '추워요'],             englishDistractors: ['cloudy', 'cold'], category: 'weather' },
  { id: 'its-raining',  english: "It's raining.",       korean: '오늘 비가 와요',          parts: ['오늘', '비가 와요'],           englishParts: ["It's", 'raining'],          distractors: ['맑아요', '눈이 와요'],          englishDistractors: ['sunny', 'snowing'], category: 'weather' },
  { id: 'its-windy',    english: "It's very windy.",    korean: '바람이 많이 불어요',       parts: ['바람이 많이', '불어요'],       englishParts: ["It's very", 'windy'],       distractors: ['내려요', '쏟아져요'],           englishDistractors: ['falls', 'pours'], category: 'weather' },

  // ── 감정 (feeling) ────────────────────────────────────────────────────
  { id: 'im-angry',     english: "I'm angry.",          korean: '나는 화가 났어요',         parts: ['나는', '화가 났어요'],         englishParts: ['I am', 'angry'],            distractors: ['짜증이 났어요', '걱정이에요'],   englishDistractors: ['annoyed', 'worried'], category: 'feeling' },
  { id: 'im-tired',     english: "I'm tired.",          korean: '나는 피곤해요',            parts: ['나는', '피곤해요'],            englishParts: ['I am', 'tired'],            distractors: ['신나요', '화났어요'],           englishDistractors: ['excited', 'angry'], category: 'feeling' },
  { id: 'im-excited',   english: "I'm excited!",        korean: '신나요!',                 parts: ['신나요'],                      englishParts: ['excited'],                  distractors: ['무서워요', '지루해요'],         englishDistractors: ['scared', 'bored'], category: 'feeling' },

  // ── 교통 (transport) ──────────────────────────────────────────────────
  { id: 'take-the-bus', english: 'I go by bus.',        korean: '버스를 타고 가요',         parts: ['버스를 타고', '가요'],         englishParts: ['I go by', 'bus'],           distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run'],    category: 'transport' },
  { id: 'take-subway',  english: 'Take the subway.',    korean: '지하철을 타요',            parts: ['지하철을', '타요'],            englishParts: ['Take', 'the subway'],       distractors: ['이용해요', '내려요'],           englishDistractors: ['Use', 'Get off'], category: 'transport' },
  { id: 'train-is-fast',english: 'The train is fast.',  korean: '기차는 빨라요',            parts: ['기차는', '빨라요'],            englishParts: ['The train', 'is fast'],     distractors: ['느려요', '좋아요'],             englishDistractors: ['slow', 'good'],   category: 'transport' },

  // ── 건강 (health) ─────────────────────────────────────────────────────
  { id: 'i-feel-sick',  english: 'I feel sick.',        korean: '몸이 아파요',              parts: ['몸이', '아파요'],              englishParts: ['I feel', 'sick'],           distractors: ['건강해요', '피곤해요'],         englishDistractors: ['healthy', 'tired'], category: 'health' },
  { id: 'see-doctor',   english: 'See a doctor.',       korean: '의사를 만나요',            parts: ['의사를', '만나요'],            englishParts: ['See', 'a doctor'],          distractors: ['불러요', '찾아요'],             englishDistractors: ['Call', 'Find'], category: 'health' },
  { id: 'take-medicine',english: 'Take your medicine.', korean: '약을 먹어요',              parts: ['약을', '먹어요'],              englishParts: ['Take', 'your medicine'],    distractors: ['사요', '버려요'],               englishDistractors: ['Buy', 'Throw'], category: 'health' },
]
