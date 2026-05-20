import type { SentenceItem } from '../types'

// category 없음 = 모든 유닛에 범용으로 사용 가능한 일상 표현
// category 있음 = 해당 유닛 학습 시에만 노출
//
// 데이터 규칙:
//   - parts[i]: 한국어 자연 어순 기준 (fill-blank 화면에 표시되는 순서)
//   - englishParts[i]: 영어 자연 어순 기준 (영어 fill-blank 화면에 표시되는 순서)
//   - 두 배열은 어순이 다를 수 있음 (한국어 SOV vs 영어 SVO)
//   - distractors[i] ↔ englishDistractors[i]: 앞 distractors.length 개는 TTS 매핑 유지 (오답 음성 출력용)
//   - englishDistractors는 distractors보다 많을 수 있음: 초과분은 고급 티어용 문법/철자 유사 오답
export const SENTENCES: SentenceItem[] = [
  // ── 범용 (일상·기초) ─────────────────────────────────────────────────
  { id: 'its-hot',       english: "It's hot.",           korean: '더워요',                 parts: ['더워요'],                      englishParts: ['hot'],                      distractors: ['추워요', '좋아요', '싫어요'],    englishDistractors: ['cold', 'good', 'dislike', 'hotter', 'hottest'] },
  { id: 'its-cold',      english: "It's cold.",          korean: '추워요',                 parts: ['추워요'],                      englishParts: ['cold'],                     distractors: ['더워요', '좋아요'],             englishDistractors: ['hot', 'good', 'colder', 'coldest'] },
  { id: 'its-big',       english: "It's big.",           korean: '커요',                   parts: ['커요'],                        englishParts: ['big'],                      distractors: ['작아요', '높아요', '낮아요'],    englishDistractors: ['small', 'tall', 'low', 'bigger', 'biggest'] },
  { id: 'its-small',     english: "It's small.",         korean: '작아요',                 parts: ['작아요'],                      englishParts: ['small'],                    distractors: ['커요', '무거워요', '가벼워요'],  englishDistractors: ['big', 'heavy', 'light', 'smaller', 'smallest'] },
  { id: 'im-happy',      english: "I'm happy.",          korean: '나는 행복해요',           parts: ['나는', '행복해요'],            englishParts: ['I am', 'happy'],            distractors: ['슬퍼요', '배고파요'],           englishDistractors: ['sad', 'hungry', 'happily', 'happier'] },
  { id: 'im-hungry',     english: "I'm hungry.",         korean: '나는 배고파요',           parts: ['나는', '배고파요'],            englishParts: ['I am', 'hungry'],           distractors: ['행복해요', '슬퍼요'],           englishDistractors: ['happy', 'sad', 'hungrily', 'hungrier'] },
  { id: 'thank-you',     english: 'Thank you.',          korean: '감사해요',               parts: ['감사해요'],                    englishParts: ['thank you'],                distractors: ['미안해요', '좋아요'],           englishDistractors: ['sorry', 'good', 'thanks', 'thanking'] },
  { id: 'lets-go',       english: "Let's go.",           korean: '가요',                   parts: ['가요'],                        englishParts: ['go'],                       distractors: ['와요', '먹어요', '자요'],        englishDistractors: ['come', 'eat', 'sleep', 'went', 'going'] },
  { id: 'go-home',       english: 'Go home.',            korean: '집에 가요',              parts: ['집에', '가요'],                englishParts: ['Go', 'home'],               distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run', 'homes', 'at home'] },

  // ── 색깔 (color) ──────────────────────────────────────────────────────
  { id: 'its-red',       english: "It's red.",           korean: '빨간색이에요',            parts: ['빨간색이에요'],                englishParts: ['red'],                      distractors: ['파란색이에요', '초록색이에요', '노란색이에요'], englishDistractors: ['blue', 'green', 'yellow', 'redder', 'reddish'], category: 'color' },
  { id: 'i-like-blue',   english: 'I like blue.',        korean: '나는 파란색이 좋아요',   parts: ['나는 파란색이', '좋아요'],    englishParts: ['I like', 'blue'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['red', 'green', 'blues', 'bluer'],  category: 'color' },
  { id: 'i-like-red',    english: 'I like red.',         korean: '나는 빨간색이 좋아요',   parts: ['나는 빨간색이', '좋아요'],    englishParts: ['I like', 'red'],            distractors: ['싫어요', '먹어요'],             englishDistractors: ['blue', 'green', 'reds', 'redder'], category: 'color' },
  { id: 'red-is-my-favorite', english: 'Red is my favorite color.', korean: '빨간색이 제일 좋아요', parts: ['빨간색이', '제일 좋아요'], englishParts: ['Red is', 'my favorite color'], distractors: ['파란색이', '싫어요'], englishDistractors: ['Blue is', 'my favorite colors', 'my least favorite color', 'Red was'], category: 'color' },

  // ── 동물 (animal) ─────────────────────────────────────────────────────
  { id: 'i-like-cats',   english: 'I like cats.',        korean: '나는 고양이가 좋아요',   parts: ['나는 고양이가', '좋아요'],    englishParts: ['I like', 'cats'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['dogs', 'birds', 'liked', 'likes'], category: 'animal' },
  { id: 'its-a-dog',     english: "It's a dog.",         korean: '강아지예요',              parts: ['강아지예요'],                  englishParts: ['dog'],                      distractors: ['고양이예요', '새예요', '토끼예요'], englishDistractors: ['cat', 'bird', 'rabbit'], category: 'animal' },
  { id: 'i-see-bird',    english: 'I see a bird.',       korean: '새가 보여요',            parts: ['새가', '보여요'],              englishParts: ['I see', 'a bird'],          distractors: ['날아요', '들려요'],             englishDistractors: ['hear', 'fly', 'birds', 'the bird'],   category: 'animal' },
  { id: 'i-see-cats-and-dogs', english: 'I see cats and dogs.', korean: '고양이와 강아지가 보여요', parts: ['고양이와', '강아지가', '보여요'], englishParts: ['I see', 'cats', 'and dogs'], distractors: ['새와', '토끼가', '들려요'], englishDistractors: ['birds', 'and rabbits', 'I hear', 'sees', 'saw'], category: 'animal' },

  // ── 음식 (food) ───────────────────────────────────────────────────────
  { id: 'i-like-milk',   english: 'I like milk.',        korean: '나는 우유가 좋아요',     parts: ['나는 우유가', '좋아요'],      englishParts: ['I like', 'milk'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['bread', 'water', 'milks', 'a milk'], category: 'food' },
  { id: 'coffee-please', english: 'Coffee, please.',     korean: '커피 주세요!',           parts: ['커피', '주세요'],              englishParts: ['Coffee', 'please'],         distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive', 'Coffees', 'Coffee,'],  category: 'food' },
  { id: 'water-please',  english: 'Water, please.',      korean: '물 주세요',              parts: ['물', '주세요'],                englishParts: ['Water', 'please'],          distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive', 'Waters', 'Water,'], category: 'food' },
  { id: 'i-want-bread',  english: 'I want bread.',       korean: '빵을 원해요',            parts: ['빵을', '원해요'],              englishParts: ['I want', 'bread'],          distractors: ['먹어요', '좋아요'],             englishDistractors: ['eat', 'like', 'breads', 'a bread'],  category: 'food' },
  { id: 'i-want-bread-and-milk', english: 'I want bread and milk.', korean: '나는 빵과 우유를 원해요', parts: ['나는 빵과', '우유를', '원해요'], englishParts: ['I want', 'bread and', 'milk'], distractors: ['커피와', '주스를', '먹어요'], englishDistractors: ['coffee and', 'juice', 'I like', 'wants', 'wanted'], category: 'food' },
  { id: 'im-hungry-lets-eat', english: "I'm hungry, let's eat.", korean: '배고프니까 먹어요', parts: ['배고프니까', '먹어요'], englishParts: ["I'm hungry,", "let's eat"], distractors: ['자요', '가요'], englishDistractors: ["let's sleep", "let's go", "I was hungry,", "I'm full,"], category: 'food' },

  // ── 숫자 (number) ─────────────────────────────────────────────────────
  { id: 'one-please',    english: 'One, please.',        korean: '하나 주세요',            parts: ['하나', '주세요'],              englishParts: ['One', 'please'],            distractors: ['마셔요', '가져요'],             englishDistractors: ['drink', 'take', 'ones', 'two'],  category: 'number' },

  // ── 가족 (family) ─────────────────────────────────────────────────────
  { id: 'my-mother',    english: 'She is my mother.',   korean: '그녀는 우리 엄마예요',    parts: ['그녀는 우리', '엄마예요'],    englishParts: ['She is my', 'mother'],      distractors: ['아빠예요', '할아버지예요'],      englishDistractors: ['father', 'grandfather', 'mothers', 'motherly'], category: 'family' },
  { id: 'i-love-family',english: 'I love my family.',   korean: '나는 가족을 사랑해요',    parts: ['나는 가족을', '사랑해요'],    englishParts: ['I love my', 'family'],      distractors: ['싫어해요', '잊어요'],           englishDistractors: ['hate', 'forget', 'families', 'a family'], category: 'family' },
  { id: 'my-brother',   english: 'He is my brother.',   korean: '그는 우리 오빠예요',      parts: ['그는 우리', '오빠예요'],      englishParts: ['He is my', 'brother'],      distractors: ['언니예요', '할머니예요'],        englishDistractors: ['sister', 'grandmother', 'brothers', 'a brother'], category: 'family' },
  { id: 'my-family-is-kind', english: 'My family is kind and funny.', korean: '우리 가족은 친절하고 재미있어요', parts: ['우리 가족은', '친절하고', '재미있어요'], englishParts: ['My family', 'is kind', 'and funny'], distractors: ['나빠요', '무서워요', '지루해요'], englishDistractors: ['is mean', 'and boring', 'My friends', 'was kind', 'and funnily'], category: 'family' },

  // ── 날씨 (weather) ────────────────────────────────────────────────────
  { id: 'its-sunny',    english: "It's sunny today.",   korean: '오늘은 맑아요',           parts: ['오늘은', '맑아요'],            englishParts: ["It's sunny", 'today'],      distractors: ['흐려요', '추워요'],             englishDistractors: ['cloudy', 'cold', 'sunnier', 'yesterday'], category: 'weather' },
  { id: 'its-raining',  english: "It's raining.",       korean: '오늘 비가 와요',          parts: ['오늘', '비가 와요'],           englishParts: ["It's", 'raining'],          distractors: ['맑아요', '눈이 와요'],          englishDistractors: ['sunny', 'snowing', 'rained', 'rains'], category: 'weather' },
  { id: 'its-windy',    english: "It's very windy.",    korean: '바람이 많이 불어요',       parts: ['바람이 많이', '불어요'],       englishParts: ["It's very", 'windy'],       distractors: ['내려요', '쏟아져요'],           englishDistractors: ['falls', 'pours', 'winding', 'winded'], category: 'weather' },
  { id: 'stay-home-raining', english: "Stay home when it's raining.", korean: '비가 오면 집에 있어요', parts: ['비가 오면', '집에 있어요'], englishParts: ['Stay home', "when it's raining"], distractors: ['나가요', '공원에 가요'], englishDistractors: ["when it's sunny", "when it's windy", 'Go outside', 'Stayed home'], category: 'weather' },
  { id: 'cold-and-windy', english: "It's cold and very windy today.", korean: '오늘은 춥고 바람이 많이 불어요', parts: ['오늘은 춥고', '바람이 많이 불어요'], englishParts: ["It's cold", "and very windy today"], distractors: ['따뜻하고', '비가 많이 와요'], englishDistractors: ["and very sunny today", "and very rainy today", "It was cold", "It's hot"], category: 'weather' },

  // ── 감정 (feeling) ────────────────────────────────────────────────────
  { id: 'im-angry',     english: "I'm angry.",          korean: '나는 화가 났어요',         parts: ['나는', '화가 났어요'],         englishParts: ['I am', 'angry'],            distractors: ['짜증이 났어요', '걱정이에요'],   englishDistractors: ['annoyed', 'worried', 'angrily', 'angrier'], category: 'feeling' },
  { id: 'im-tired',     english: "I'm tired.",          korean: '나는 피곤해요',            parts: ['나는', '피곤해요'],            englishParts: ['I am', 'tired'],            distractors: ['신나요', '화났어요'],           englishDistractors: ['excited', 'angry', 'tiring', 'tried'], category: 'feeling' },
  { id: 'im-excited',   english: "I'm excited!",        korean: '신나요!',                 parts: ['신나요'],                      englishParts: ['excited'],                  distractors: ['무서워요', '지루해요'],         englishDistractors: ['scared', 'bored', 'exciting', 'excites'], category: 'feeling' },
  { id: 'tired-because-busy', english: "I'm tired because I'm busy.", korean: '바빠서 피곤해요', parts: ['바빠서', '피곤해요'], englishParts: ["I'm tired", "because I'm busy"], distractors: ['행복해요', '신나요'], englishDistractors: ["because I'm happy", "because I'm free", "I was tired", "I'm tiring"], category: 'feeling' },
  { id: 'happy-and-excited', english: "I'm happy and excited today!", korean: '오늘 행복하고 신나요!', parts: ['오늘', '행복하고 신나요'], englishParts: ["I'm happy", "and excited today"], distractors: ['슬프고', '화가 났어요'], englishDistractors: ["and angry today", "and tired today", "I was happy", "and exciting today"], category: 'feeling' },

  // ── 교통 (transport) ──────────────────────────────────────────────────
  { id: 'take-the-bus', english: 'I go by bus.',        korean: '버스를 타고 가요',         parts: ['버스를 타고', '가요'],         englishParts: ['I go by', 'bus'],           distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run', 'goes', 'went'],    category: 'transport' },
  { id: 'take-subway',  english: 'Take the subway.',    korean: '지하철을 타요',            parts: ['지하철을', '타요'],            englishParts: ['Take', 'the subway'],       distractors: ['이용해요', '내려요'],           englishDistractors: ['Use', 'Get off', 'Took', 'Taking'], category: 'transport' },
  { id: 'train-is-fast',english: 'The train is fast.',  korean: '기차는 빨라요',            parts: ['기차는', '빨라요'],            englishParts: ['The train', 'is fast'],     distractors: ['느려요', '좋아요'],             englishDistractors: ['slow', 'good', 'faster', 'fastest'],   category: 'transport' },
  { id: 'bus-slow-take-subway', english: 'The bus is slow, so take the subway.', korean: '버스가 느려서 지하철을 타요', parts: ['버스가 느려서', '지하철을 타요'], englishParts: ['The bus is slow,', 'so take the subway'], distractors: ['기차를 타요', '걸어요'], englishDistractors: ['so take the bus', 'so go home', 'The train is slow,', 'so took the subway'], category: 'transport' },

  // ── 건강 (health) ─────────────────────────────────────────────────────
  { id: 'i-feel-sick',  english: 'I feel sick.',        korean: '몸이 아파요',              parts: ['몸이', '아파요'],              englishParts: ['I feel', 'sick'],           distractors: ['건강해요', '피곤해요'],         englishDistractors: ['healthy', 'tired', 'sicker', 'sickly'], category: 'health' },
  { id: 'see-doctor',   english: 'See a doctor.',       korean: '의사를 만나요',            parts: ['의사를', '만나요'],            englishParts: ['See', 'a doctor'],          distractors: ['불러요', '찾아요'],             englishDistractors: ['Call', 'Find', 'Saw', 'Seeing'], category: 'health' },
  { id: 'take-medicine',english: 'Take your medicine.', korean: '약을 먹어요',              parts: ['약을', '먹어요'],              englishParts: ['Take', 'your medicine'],    distractors: ['사요', '버려요'],               englishDistractors: ['Buy', 'Throw', 'Takes', 'Took'], category: 'health' },
  { id: 'sick-so-see-doctor', english: 'I feel sick, so I see a doctor.', korean: '몸이 아파서 의사를 만나요', parts: ['몸이 아파서', '의사를 만나요'], englishParts: ['I feel sick,', 'so I see a doctor'], distractors: ['집에 있어요', '자요'], englishDistractors: ['so I stay home', 'so I sleep', 'I felt sick,', 'I feel well,'], category: 'health' },
]
