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
  // ── 범용 (진짜 범용 — 어떤 유닛에도 자연스러운 기초 표현) ──────────────
  { id: 'lets-go',       english: "Let's go.",           korean: '가요',                   parts: ['가요'],                        englishParts: ['go'],                       distractors: ['와요', '먹어요', '자요'],        englishDistractors: ['come', 'eat', 'sleep', 'went', 'going'], difficulty: 'basic' },
  { id: 'go-home',       english: 'Go home.',            korean: '집에 가요',              parts: ['집에', '가요'],                englishParts: ['Go', 'home'],               distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run', 'homes', 'at home'], difficulty: 'basic' },

  // ── 일상 표현 (daily) ─────────────────────────────────────────────────
  { id: 'its-big',       english: "It's big.",           korean: '커요',                   parts: ['커요'],                        englishParts: ['big'],                      distractors: ['작아요', '높아요', '낮아요'],    englishDistractors: ['small', 'tall', 'low', 'bigger', 'biggest'],    category: 'daily', difficulty: 'basic' },
  { id: 'its-small',     english: "It's small.",         korean: '작아요',                 parts: ['작아요'],                      englishParts: ['small'],                    distractors: ['커요', '무거워요', '가벼워요'],  englishDistractors: ['big', 'heavy', 'light', 'smaller', 'smallest'], category: 'daily', difficulty: 'basic' },
  { id: 'its-good',      english: "It's good.",          korean: '좋아요',                 parts: ['좋아요'],                      englishParts: ['good'],                     distractors: ['나빠요', '싫어요', '달라요'],    englishDistractors: ['bad', 'dislike', 'different', 'better', 'best'], category: 'daily', difficulty: 'basic' },
  { id: 'its-bad',       english: "It's bad.",           korean: '나빠요',                 parts: ['나빠요'],                      englishParts: ['bad'],                      distractors: ['좋아요', '달라요', '맞아요'],    englishDistractors: ['good', 'different', 'correct', 'worse', 'worst'], category: 'daily', difficulty: 'basic' },
  { id: 'thank-you',     english: 'Thank you.',          korean: '감사해요',               parts: ['감사해요'],                    englishParts: ['thank you'],                distractors: ['미안해요', '좋아요'],           englishDistractors: ['sorry', 'good', 'thanks', 'thanking'],          category: 'daily', difficulty: 'basic' },
  { id: 'im-sorry',      english: "I'm sorry.",          korean: '미안해요',               parts: ['미안해요'],                    englishParts: ['sorry'],                    distractors: ['감사해요', '좋아요'],           englishDistractors: ['thank you', 'good', 'sorrier', 'sorrily'],      category: 'daily', difficulty: 'basic' },
  { id: 'im-sad',        english: "I'm sad.",            korean: '슬퍼요',                 parts: ['슬퍼요'],                      englishParts: ['sad'],                      distractors: ['행복해요', '화났어요'],         englishDistractors: ['happy', 'angry', 'sadly', 'sadder'],            category: 'daily', difficulty: 'basic' },

  // ── 색깔 (color) ──────────────────────────────────────────────────────
  { id: 'its-red',       english: "It's red.",           korean: '빨간색이에요',            parts: ['빨간색이에요'],                englishParts: ['red'],                      distractors: ['파란색이에요', '초록색이에요', '노란색이에요'], englishDistractors: ['blue', 'green', 'yellow', 'redder', 'reddish'], category: 'color', difficulty: 'basic' },
  { id: 'i-like-blue',   english: 'I like blue.',        korean: '나는 파란색이 좋아요',   parts: ['나는 파란색이', '좋아요'],    englishParts: ['I like', 'blue'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['red', 'green', 'blues', 'bluer'],  category: 'color', difficulty: 'basic' },
  { id: 'i-like-red',    english: 'I like red.',         korean: '나는 빨간색이 좋아요',   parts: ['나는 빨간색이', '좋아요'],    englishParts: ['I like', 'red'],            distractors: ['싫어요', '먹어요'],             englishDistractors: ['blue', 'green', 'reds', 'redder'], category: 'color', difficulty: 'basic' },
  { id: 'red-is-my-favorite', english: 'Red is my favorite color.', korean: '빨간색이 제일 좋아요', parts: ['빨간색이', '제일 좋아요'], englishParts: ['Red is', 'my favorite color'], distractors: ['파란색이', '싫어요'], englishDistractors: ['Blue is', 'my favorite colors', 'my least favorite color', 'Red was'], category: 'color', difficulty: 'intermediate' },

  // ── 동물 (animal) ─────────────────────────────────────────────────────
  { id: 'i-like-cats',   english: 'I like cats.',        korean: '나는 고양이가 좋아요',   parts: ['나는 고양이가', '좋아요'],    englishParts: ['I like', 'cats'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['dogs', 'birds', 'liked', 'likes'], category: 'animal', difficulty: 'basic' },
  { id: 'its-a-dog',     english: "It's a dog.",         korean: '강아지예요',              parts: ['강아지예요'],                  englishParts: ['dog'],                      distractors: ['고양이예요', '새예요', '토끼예요'], englishDistractors: ['cat', 'bird', 'rabbit'], category: 'animal', difficulty: 'basic' },
  { id: 'i-see-bird',    english: 'I see a bird.',       korean: '새가 보여요',            parts: ['새가', '보여요'],              englishParts: ['I see', 'a bird'],          distractors: ['날아요', '들려요'],             englishDistractors: ['hear', 'fly', 'birds', 'the bird'],   category: 'animal', difficulty: 'basic' },
  { id: 'i-see-cats-and-dogs', english: 'I see cats and dogs.', korean: '고양이와 강아지가 보여요', parts: ['고양이와', '강아지가', '보여요'], englishParts: ['I see', 'cats', 'and dogs'], distractors: ['새와', '토끼가', '들려요'], englishDistractors: ['birds', 'and rabbits', 'I hear', 'sees', 'saw'], category: 'animal', difficulty: 'intermediate' },

  // ── 음식 (food) ───────────────────────────────────────────────────────
  { id: 'im-hungry',    english: "I'm hungry.",         korean: '나는 배고파요',           parts: ['나는', '배고파요'],            englishParts: ['I am', 'hungry'],           distractors: ['행복해요', '슬퍼요'],           englishDistractors: ['happy', 'sad', 'hungrily', 'hungrier'],          category: 'food', difficulty: 'basic' },
  { id: 'i-like-milk',   english: 'I like milk.',        korean: '나는 우유가 좋아요',     parts: ['나는 우유가', '좋아요'],      englishParts: ['I like', 'milk'],           distractors: ['싫어요', '먹어요'],             englishDistractors: ['bread', 'water', 'milks', 'a milk'], category: 'food', difficulty: 'basic' },
  { id: 'coffee-please', english: 'Coffee, please.',     korean: '커피 주세요!',           parts: ['커피', '주세요'],              englishParts: ['Coffee', 'please'],         distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive', 'Coffees', 'Coffee,'],  category: 'food', difficulty: 'basic' },
  { id: 'water-please',  english: 'Water, please.',      korean: '물 주세요',              parts: ['물', '주세요'],                englishParts: ['Water', 'please'],          distractors: ['마셔요', '받아요'],             englishDistractors: ['drink', 'receive', 'Waters', 'Water,'], category: 'food', difficulty: 'basic' },
  { id: 'i-want-bread',  english: 'I want bread.',       korean: '빵을 원해요',            parts: ['빵을', '원해요'],              englishParts: ['I want', 'bread'],          distractors: ['먹어요', '좋아요'],             englishDistractors: ['eat', 'like', 'breads', 'a bread'],  category: 'food', difficulty: 'basic' },
  { id: 'i-want-bread-and-milk', english: 'I want bread and milk.', korean: '나는 빵과 우유를 원해요', parts: ['나는 빵과', '우유를', '원해요'], englishParts: ['I want', 'bread and', 'milk'], distractors: ['커피와', '주스를', '먹어요'], englishDistractors: ['coffee and', 'juice', 'I like', 'wants', 'wanted'], category: 'food', difficulty: 'intermediate' },
  { id: 'im-hungry-lets-eat', english: "I'm hungry, let's eat.", korean: '배고프니까 먹어요', parts: ['배고프니까', '먹어요'], englishParts: ["I'm hungry,", "let's eat"], distractors: ['자요', '가요'], englishDistractors: ["let's sleep", "let's go", "I was hungry,", "I'm full,"], category: 'food', difficulty: 'intermediate' },

  // ── 숫자 (number) ─────────────────────────────────────────────────────
  { id: 'one-please',    english: 'One, please.',        korean: '하나 주세요',            parts: ['하나', '주세요'],              englishParts: ['One', 'please'],            distractors: ['마셔요', '가져요'],             englishDistractors: ['drink', 'take', 'ones', 'two'],  category: 'number', difficulty: 'basic' },

  // ── 가족 (family) ─────────────────────────────────────────────────────
  { id: 'my-mother',    english: 'She is my mother.',   korean: '그녀는 우리 엄마예요',    parts: ['그녀는 우리', '엄마예요'],    englishParts: ['She is my', 'mother'],      distractors: ['아빠예요', '할아버지예요'],      englishDistractors: ['father', 'grandfather', 'mothers', 'motherly'], category: 'family', difficulty: 'basic' },
  { id: 'i-love-family',english: 'I love my family.',   korean: '나는 가족을 사랑해요',    parts: ['나는 가족을', '사랑해요'],    englishParts: ['I love my', 'family'],      distractors: ['싫어해요', '잊어요'],           englishDistractors: ['hate', 'forget', 'families', 'a family'], category: 'family', difficulty: 'basic' },
  { id: 'my-brother',   english: 'He is my brother.',   korean: '그는 우리 오빠예요',      parts: ['그는 우리', '오빠예요'],      englishParts: ['He is my', 'brother'],      distractors: ['언니예요', '할머니예요'],        englishDistractors: ['sister', 'grandmother', 'brothers', 'a brother'], category: 'family', difficulty: 'basic' },
  { id: 'my-family-is-kind', english: 'My family is kind and funny.', korean: '우리 가족은 친절하고 재미있어요', parts: ['우리 가족은', '친절하고', '재미있어요'], englishParts: ['My family', 'is kind', 'and funny'], distractors: ['나빠요', '무서워요', '지루해요'], englishDistractors: ['is mean', 'and boring', 'My friends', 'was kind', 'and funnily'], category: 'family', difficulty: 'intermediate' },

  // ── 날씨 (weather) ────────────────────────────────────────────────────
  { id: 'its-hot',      english: "It's hot.",           korean: '더워요',                 parts: ['더워요'],                      englishParts: ['hot'],                      distractors: ['추워요', '좋아요', '싫어요'],    englishDistractors: ['cold', 'good', 'dislike', 'hotter', 'hottest'],  category: 'weather', difficulty: 'basic' },
  { id: 'its-cold',     english: "It's cold.",          korean: '추워요',                 parts: ['추워요'],                      englishParts: ['cold'],                     distractors: ['더워요', '좋아요'],             englishDistractors: ['hot', 'good', 'colder', 'coldest'],              category: 'weather', difficulty: 'basic' },
  { id: 'its-sunny',    english: "It's sunny today.",   korean: '오늘은 맑아요',           parts: ['오늘은', '맑아요'],            englishParts: ["It's sunny", 'today'],      distractors: ['흐려요', '추워요'],             englishDistractors: ['cloudy', 'cold', 'sunnier', 'yesterday'],        category: 'weather', difficulty: 'basic' },
  { id: 'its-raining',  english: "It's raining.",       korean: '오늘 비가 와요',          parts: ['오늘', '비가 와요'],           englishParts: ["It's", 'raining'],          distractors: ['맑아요', '눈이 와요'],          englishDistractors: ['sunny', 'snowing', 'rained', 'rains'], category: 'weather', difficulty: 'basic' },
  { id: 'its-windy',    english: "It's very windy.",    korean: '바람이 많이 불어요',       parts: ['바람이 많이', '불어요'],       englishParts: ["It's very", 'windy'],       distractors: ['내려요', '쏟아져요'],           englishDistractors: ['falls', 'pours', 'winding', 'winded'], category: 'weather', difficulty: 'intermediate' },
  { id: 'stay-home-raining', english: "Stay home when it's raining.", korean: '비가 오면 집에 있어요', parts: ['비가 오면', '집에 있어요'], englishParts: ['Stay home', "when it's raining"], distractors: ['나가요', '공원에 가요'], englishDistractors: ["when it's sunny", "when it's windy", 'Go outside', 'Stayed home'], category: 'weather', difficulty: 'intermediate' },
  { id: 'cold-and-windy', english: "It's cold and very windy today.", korean: '오늘은 춥고 바람이 많이 불어요', parts: ['오늘은 춥고', '바람이 많이 불어요'], englishParts: ["It's cold", "and very windy today"], distractors: ['따뜻하고', '비가 많이 와요'], englishDistractors: ["and very sunny today", "and very rainy today", "It was cold", "It's hot"], category: 'weather', difficulty: 'intermediate' },

  // ── 감정 (feeling) ────────────────────────────────────────────────────
  { id: 'im-happy',     english: "I'm happy.",          korean: '나는 행복해요',           parts: ['나는', '행복해요'],            englishParts: ['I am', 'happy'],            distractors: ['슬퍼요', '배고파요'],           englishDistractors: ['sad', 'hungry', 'happily', 'happier'],           category: 'feeling', difficulty: 'basic' },
  { id: 'im-angry',     english: "I'm angry.",          korean: '나는 화가 났어요',         parts: ['나는', '화가 났어요'],         englishParts: ['I am', 'angry'],            distractors: ['짜증이 났어요', '걱정이에요'],   englishDistractors: ['annoyed', 'worried', 'angrily', 'angrier'], category: 'feeling', difficulty: 'basic' },
  { id: 'im-tired',     english: "I'm tired.",          korean: '나는 피곤해요',            parts: ['나는', '피곤해요'],            englishParts: ['I am', 'tired'],            distractors: ['신나요', '화났어요'],           englishDistractors: ['excited', 'angry', 'tiring', 'tried'], category: 'feeling', difficulty: 'basic' },
  { id: 'im-excited',   english: "I'm excited!",        korean: '신나요!',                 parts: ['신나요'],                      englishParts: ['excited'],                  distractors: ['무서워요', '지루해요'],         englishDistractors: ['scared', 'bored', 'exciting', 'excites'], category: 'feeling', difficulty: 'basic' },
  { id: 'tired-because-busy', english: "I'm tired because I'm busy.", korean: '바빠서 피곤해요', parts: ['바빠서', '피곤해요'], englishParts: ["I'm tired", "because I'm busy"], distractors: ['행복해요', '신나요'], englishDistractors: ["because I'm happy", "because I'm free", "I was tired", "I'm tiring"], category: 'feeling', difficulty: 'intermediate' },
  { id: 'happy-and-excited', english: "I'm happy and excited today!", korean: '오늘 행복하고 신나요!', parts: ['오늘', '행복하고 신나요'], englishParts: ["I'm happy", "and excited today"], distractors: ['슬프고', '화가 났어요'], englishDistractors: ["and angry today", "and tired today", "I was happy", "and exciting today"], category: 'feeling', difficulty: 'intermediate' },

  // ── 교통 (transport) ──────────────────────────────────────────────────
  { id: 'take-the-bus', english: 'I go by bus.',        korean: '버스를 타고 가요',         parts: ['버스를 타고', '가요'],         englishParts: ['I go by', 'bus'],           distractors: ['와요', '달려요'],               englishDistractors: ['come', 'run', 'goes', 'went'],    category: 'transport', difficulty: 'basic' },
  { id: 'take-subway',  english: 'Take the subway.',    korean: '지하철을 타요',            parts: ['지하철을', '타요'],            englishParts: ['Take', 'the subway'],       distractors: ['이용해요', '내려요'],           englishDistractors: ['Use', 'Get off', 'Took', 'Taking'], category: 'transport', difficulty: 'basic' },
  { id: 'train-is-fast',english: 'The train is fast.',  korean: '기차는 빨라요',            parts: ['기차는', '빨라요'],            englishParts: ['The train', 'is fast'],     distractors: ['느려요', '좋아요'],             englishDistractors: ['slow', 'good', 'faster', 'fastest'],   category: 'transport', difficulty: 'basic' },
  { id: 'bus-slow-take-subway', english: 'The bus is slow, so take the subway.', korean: '버스가 느려서 지하철을 타요', parts: ['버스가 느려서', '지하철을 타요'], englishParts: ['The bus is slow,', 'so take the subway'], distractors: ['기차를 타요', '걸어요'], englishDistractors: ['so take the bus', 'so go home', 'The train is slow,', 'so took the subway'], category: 'transport', difficulty: 'intermediate' },

  // ── 건강 (health) ─────────────────────────────────────────────────────
  { id: 'i-feel-sick',  english: 'I feel sick.',        korean: '몸이 아파요',              parts: ['몸이', '아파요'],              englishParts: ['I feel', 'sick'],           distractors: ['건강해요', '피곤해요'],         englishDistractors: ['healthy', 'tired', 'sicker', 'sickly'], category: 'health', difficulty: 'basic' },
  { id: 'see-doctor',   english: 'See a doctor.',       korean: '의사를 만나요',            parts: ['의사를', '만나요'],            englishParts: ['See', 'a doctor'],          distractors: ['불러요', '찾아요'],             englishDistractors: ['Call', 'Find', 'Saw', 'Seeing'], category: 'health', difficulty: 'basic' },
  { id: 'take-medicine',english: 'Take your medicine.', korean: '약을 먹어요',              parts: ['약을', '먹어요'],              englishParts: ['Take', 'your medicine'],    distractors: ['사요', '버려요'],               englishDistractors: ['Buy', 'Throw', 'Takes', 'Took'], category: 'health', difficulty: 'basic' },
  { id: 'sick-so-see-doctor', english: 'I feel sick, so I see a doctor.', korean: '몸이 아파서 의사를 만나요', parts: ['몸이 아파서', '의사를 만나요'], englishParts: ['I feel sick,', 'so I see a doctor'], distractors: ['집에 있어요', '자요'], englishDistractors: ['so I stay home', 'so I sleep', 'I felt sick,', 'I feel well,'], category: 'health', difficulty: 'intermediate' },

  // ── 고급 상황별 표현 (Advanced) ──────────────────────────────────────────
  // 테마: 식당 (Dining)
  {
    id: 'adv-dining-allergy',
    english: "I have a severe nut allergy, so please make sure there are no nuts in my salad.",
    korean: "견과류 알레르기가 심해서 샐러드에 견과류가 절대 들어가지 않게 해주세요.",
    parts: ["견과류 알레르기가 심해서", "샐러드에 견과류가", "절대 들어가지 않게 해주세요"],
    englishParts: ["I have a severe nut allergy,", "so please make sure", "there are no nuts in my salad"],
    distractors: ["맛있게 해주세요", "소금을 빼주세요"],
    englishDistractors: ["I love nuts", "add some salt", "no sugar please"],
    difficulty: 'advanced',
    scenario: '식당에서 알레르기 요청할 때',
    dialoguePrompt: 'Any allergies we should know about?',
    category: 'food'
  },
  {
    id: 'adv-dining-side',
    english: "Could I get the dressing on the side? I prefer to add it myself.",
    korean: "드레싱은 따로 주실 수 있나요? 직접 뿌려 먹는 걸 선호해서요.",
    parts: ["드레싱은 따로 주실 수 있나요?", "직접 뿌려 먹는 걸", "선호해서요"],
    englishParts: ["Could I get the dressing on the side?", "I prefer to", "add it myself"],
    distractors: ["포장해 주세요", "빨리 주세요"],
    englishDistractors: ["Pack it up", "Hurry up please", "with extra sauce", "on the top"],
    difficulty: 'advanced',
    scenario: '식당에서 소스 따로 요청할 때',
    dialoguePrompt: 'Would you like the dressing on the salad?',
    category: 'food'
  },
  {
    id: 'adv-dining-steak',
    english: "I'd like my steak medium-rare, and could I swap the fries for a baked potato?",
    korean: "스테이크는 미디엄 레어로 해주시고, 감자튀김을 구운 감자로 바꿀 수 있을까요?",
    parts: ["스테이크는 미디엄 레어로 해주시고,", "감자튀김을", "구운 감자로 바꿀 수 있을까요?"],
    englishParts: ["I'd like my steak medium-rare,", "and could I swap the fries", "for a baked potato?"],
    distractors: ["다 익혀주세요", "밥으로 주세요"],
    englishDistractors: ["Well-done please", "swap for rice", "medium-well", "extra fries"],
    difficulty: 'advanced',
    scenario: '식당에서 스테이크 굽기 및 사이드 변경 요청',
    dialoguePrompt: 'How would you like your steak done?',
    category: 'food'
  },
  {
    id: 'adv-dining-wrong-order',
    english: "I'm sorry, but this isn't what I ordered. I asked for the grilled salmon.",
    korean: "죄송하지만 이건 제가 주문한 게 아니에요. 저는 구운 연어를 주문했어요.",
    parts: ["죄송하지만", "이건 제가 주문한 게 아니에요.", "저는 구운 연어를 주문했어요."],
    englishParts: ["I'm sorry, but", "this isn't what I ordered.", "I asked for the grilled salmon"],
    distractors: ["맛있네요", "계산할게요"],
    englishDistractors: ["It is delicious", "Check please", "the steak is cold", "this is perfect"],
    difficulty: 'advanced',
    scenario: '식당에서 주문한 음식이 잘못 나왔을 때',
    dialoguePrompt: 'Here is your pasta, sir.',
    category: 'food'
  },
  {
    id: 'adv-dining-reservation',
    english: "We have a reservation for four under the name Kim, but one more might join us.",
    korean: "김씨 성함으로 4명 예약했는데, 한 명이 나중에 더 올 수도 있어요.",
    parts: ["김씨 성함으로 4명 예약했는데,", "한 명이 나중에", "더 올 수도 있어요."],
    englishParts: ["We have a reservation for four under the name Kim,", "but one more", "might join us later"],
    distractors: ["예약 안 했어요", "자리가 없어요"],
    englishDistractors: ["No reservation", "No seats left", "under the name Lee", "for two people"],
    difficulty: 'advanced',
    scenario: '식당에서 예약 확인 및 인원 추가 알림',
    dialoguePrompt: 'Welcome, do you have a reservation?',
    category: 'food'
  },

  // 테마: 여행 (Travel)
  {
    id: 'adv-travel-delay',
    english: "My connection was delayed, so I missed my flight. Is there another one tonight?",
    korean: "연결편이 지연되어서 비행기를 놓쳤어요. 오늘 밤에 다른 비행기가 있나요?",
    parts: ["연결편이 지연되어서 비행기를 놓쳤어요.", "오늘 밤에", "다른 비행기가 있나요?"],
    englishParts: ["My connection was delayed, so I missed my flight.", "Is there another one", "tonight?"],
    distractors: ["비행기가 빨라요", "티켓이 비싸요"],
    englishDistractors: ["The flight is fast", "Ticket is expensive", "missed my bus", "delayed by an hour"],
    difficulty: 'advanced',
    scenario: '공항에서 비행기 지연으로 인한 노선 문의',
    dialoguePrompt: 'How can I help you at the counter?',
    category: 'transport'
  },
  {
    id: 'adv-travel-room-issue',
    english: "The air conditioner in my room is making a noise. Could I move to a different room?",
    korean: "제 방 에어컨에서 소음이 나요. 다른 방으로 옮길 수 있을까요?",
    parts: ["제 방 에어컨에서 소음이 나요.", "다른 방으로", "옮길 수 있을까요?"],
    englishParts: ["The air conditioner in my room is making a noise.", "Could I move to", "a different room?"],
    distractors: ["추워요", "방이 깨끗해요"],
    englishDistractors: ["It is cold", "Room is clean", "TV is broken", "another towel please"],
    difficulty: 'advanced',
    scenario: '호텔에서 시설 문제로 방 변경 요청',
    dialoguePrompt: 'Is everything okay with your room?',
    category: 'place'
  },
  {
    id: 'adv-travel-upgrade',
    english: "I was wondering if there are any complimentary upgrades available for my stay.",
    korean: "혹시 제 숙박 기간 동안 이용 가능한 무료 업그레이드가 있는지 궁금합니다.",
    parts: ["혹시 제 숙박 기간 동안", "이용 가능한 무료 업그레이드가", "있는지 궁금합니다."],
    englishParts: ["I was wondering if there are any", "complimentary upgrades available", "for my stay"],
    distractors: ["돈을 더 낼게요", "체크아웃 할게요"],
    englishDistractors: ["I'll pay more", "Check out please", "extra charge", "no vacancy"],
    difficulty: 'advanced',
    scenario: '호텔에서 무료 업그레이드 가능 여부 문의',
    dialoguePrompt: 'Check-in is complete. Here is your key.',
    category: 'place'
  },
  {
    id: 'adv-travel-lost-baggage',
    english: "My luggage hasn't arrived yet. Could you help me file a missing baggage report?",
    korean: "제 짐이 아직 도착하지 않았어요. 수하물 분실 신고를 도와주실 수 있나요?",
    parts: ["제 짐이 아직 도착하지 않았어요.", "수하물 분실 신고를", "도와주실 수 있나요?"],
    englishParts: ["My luggage hasn't arrived yet.", "Could you help me file", "a missing baggage report?"],
    distractors: ["짐이 무거워요", "가방이 예뻐요"],
    englishDistractors: ["Luggage is heavy", "Bag is pretty", "found my bag", "lost my wallet"],
    difficulty: 'advanced',
    scenario: '공항에서 수하물 미도착 신고',
    dialoguePrompt: 'Did you find all your bags at the carousel?',
    category: 'transport'
  },
  {
    id: 'adv-travel-transport',
    english: "Could you tell me the best way to get to the city center using public transportation?",
    korean: "대중교통을 이용해서 시내까지 가는 가장 좋은 방법을 알려주실 수 있나요?",
    parts: ["대중교통을 이용해서", "시내까지 가는", "가장 좋은 방법을 알려주실 수 있나요?"],
    englishParts: ["Could you tell me the best way to", "get to the city center", "using public transportation?"],
    distractors: ["택시를 타세요", "걸어가면 멀어요"],
    englishDistractors: ["Take a taxi", "It is far to walk", "by car", "nearest station"],
    difficulty: 'advanced',
    scenario: '여행지에서 시내 가는 방법 문의',
    dialoguePrompt: 'Where would you like to go from the airport?',
    category: 'place'
  },

  // 테마: 일상 (Daily Life)
  {
    id: 'adv-daily-rejection',
    english: "That sounds great, but I'm swamped with work this week. Maybe next time?",
    korean: "좋은 생각이지만 이번 주는 업무가 너무 많아요. 다음 기회에 할까요?",
    parts: ["좋은 생각이지만", "이번 주는 업무가 너무 많아요.", "다음 기회에 할까요?"],
    englishParts: ["That sounds great, but", "I'm swamped with work this week.", "Maybe next time?"],
    distractors: ["지금 가요", "일이 없어요"],
    englishDistractors: ["Go now", "No work to do", "I'm free", "See you tonight"],
    difficulty: 'advanced',
    scenario: '완곡하게 거절할 때',
    dialoguePrompt: 'Do you want to grab dinner this Thursday?',
    category: 'daily'
  },
  {
    id: 'adv-daily-agree',
    english: "You took the words right out of my mouth! I was about to say the same thing.",
    korean: "제 생각을 그대로 말씀하셨네요! 저도 똑같은 말을 하려던 참이었어요.",
    parts: ["제 생각을 그대로 말씀하셨네요!", "저도 똑같은 말을", "하려던 참이었어요."],
    englishParts: ["You took the words right out of my mouth!", "I was about to say", "the same thing"],
    distractors: ["무슨 말이에요?", "동의하지 않아요"],
    englishDistractors: ["What do you mean?", "I don't agree", "not at all", "say it again"],
    difficulty: 'advanced',
    scenario: '상대방의 말에 적극 공감할 때',
    dialoguePrompt: 'I think this movie is a bit overrated.',
    category: 'daily'
  },
  {
    id: 'adv-daily-netflix',
    english: "Have you seen that new series on Netflix? It starts slow but gets really exciting.",
    korean: "넷플릭스 신작 시리즈 보셨나요? 초반엔 지루한데 갈수록 정말 흥미진진해요.",
    parts: ["넷플릭스 신작 시리즈 보셨나요?", "초반엔 지루한데", "갈수록 정말 흥미진진해요."],
    englishParts: ["Have you seen that new series on Netflix?", "It starts slow", "but gets really exciting"],
    distractors: ["텔레비전 꺼요", "영화 재미없어요"],
    englishDistractors: ["Turn off TV", "Movie is boring", "watched it already", "too long"],
    difficulty: 'advanced',
    scenario: '최신 영상 콘텐츠에 대해 스몰토크 할 때',
    dialoguePrompt: 'Any recommendations for the weekend?',
    category: 'daily'
  },
  {
    id: 'adv-daily-advice',
    english: "If I were in your shoes, I would talk to him directly to clear things up.",
    korean: "제가 당신이라면 오해를 풀기 위해 그와 직접 이야기를 해보겠어요.",
    parts: ["제가 당신이라면", "오해를 풀기 위해", "그와 직접 이야기를 해보겠어요."],
    englishParts: ["If I were in your shoes,", "I would talk to him directly", "to clear things up"],
    distractors: ["그냥 잊으세요", "화내지 마세요"],
    englishDistractors: ["Just forget it", "Don't be angry", "in my head", "walk away"],
    difficulty: 'advanced',
    scenario: '상대방에게 조언을 건넬 때',
    dialoguePrompt: "I'm having a hard time with my co-worker.",
    category: 'daily'
  },
  {
    id: 'adv-daily-opinion',
    english: "In my opinion, the most important thing is to find a balance between work and life.",
    korean: "제 의견으로는 가장 중요한 것은 일과 삶 사이의 균형을 찾는 것입니다.",
    parts: ["제 의견으로는", "가장 중요한 것은", "일과 삶 사이의 균형을 찾는 것입니다."],
    englishParts: ["In my opinion,", "the most important thing is", "to find a balance between work and life"],
    distractors: ["돈이 최고예요", "일만 하세요"],
    englishDistractors: ["Money is best", "Just work", "no balance", "life is hard"],
    difficulty: 'advanced',
    scenario: '자신의 의견을 피력할 때',
    dialoguePrompt: 'What do you think about the new company policy?',
    category: 'daily'
  },

  // ── 고급 트랙 전용 — 공항·교통 ────────────────────────────────────────
  {
    id: 'adv-airport-overbook',
    english: "Is there any compensation for involuntary bumping? I really need to reach my destination today.",
    korean: "강제 탑승 거절에 대한 보상이 있나요? 오늘 꼭 목적지에 도착해야 해요.",
    parts: ["강제 탑승 거절에 대한 보상이 있나요?", "오늘 꼭", "목적지에 도착해야 해요."],
    englishParts: ["Is there any compensation for involuntary bumping?", "I really need to", "reach my destination today"],
    distractors: ["다음 항공편을 기다릴게요", "상관없어요"],
    englishDistractors: ["I'll just wait for the next flight", "No problem at all", "give me a refund only", "take me off the list"],
    difficulty: 'advanced',
    scenario: '항공편 초과 예약으로 탑승 거절될 때',
    dialoguePrompt: "I'm sorry, this flight is overbooked and you've been bumped.",
    category: 'transport',
  },

  // ── 고급 트랙 전용 — 비즈니스 소통 ──────────────────────────────────────
  {
    id: 'adv-biz-deadline',
    english: "I'm afraid we need to push the deadline back by two days due to some unexpected complications.",
    korean: "예상치 못한 문제들로 인해 마감을 이틀 연장해야 할 것 같아요.",
    parts: ["예상치 못한 문제들로 인해", "마감을 이틀", "연장해야 할 것 같아요."],
    englishParts: ["I'm afraid we need to push the deadline back", "by two days", "due to some unexpected complications"],
    distractors: ["제시간에 끝낼게요", "더 빨리 할게요"],
    englishDistractors: ["We'll finish on time", "We can speed up", "extend by a week", "delay was your fault"],
    difficulty: 'advanced',
    scenario: '납기 연장을 요청할 때',
    dialoguePrompt: 'Can you still meet the original deadline?',
    category: 'daily',
  },
  {
    id: 'adv-biz-disagree',
    english: "I see your point, but I'm concerned that cutting costs here could affect the quality of our final product.",
    korean: "말씀하신 바는 이해하지만, 여기서 비용을 줄이면 최종 제품 품질에 영향을 줄까 봐 우려됩니다.",
    parts: ["말씀하신 바는 이해하지만,", "여기서 비용을 줄이면", "최종 제품 품질에 영향을 줄까 봐 우려됩니다."],
    englishParts: ["I see your point, but I'm concerned", "that cutting costs here", "could affect the quality of our final product"],
    distractors: ["완전히 동의해요", "좋은 생각이에요"],
    englishDistractors: ["I completely agree", "That's a great idea", "let's cut everything", "costs don't matter"],
    difficulty: 'advanced',
    scenario: '의견을 정중하게 반대할 때',
    dialoguePrompt: "I think we should go with the cheaper option to save the budget.",
    category: 'daily',
  },
  {
    id: 'adv-biz-proposal',
    english: "I'd like to propose a pilot program so we can test the solution on a small scale before a full rollout.",
    korean: "전면 도입 전에 소규모로 먼저 테스트할 파일럿 프로그램을 제안하고 싶습니다.",
    parts: ["전면 도입 전에", "소규모로 먼저 테스트할", "파일럿 프로그램을 제안하고 싶습니다."],
    englishParts: ["I'd like to propose a pilot program", "so we can test the solution on a small scale", "before a full rollout"],
    distractors: ["그냥 바로 시작해요", "더 연구가 필요해요"],
    englishDistractors: ["Let's launch immediately", "We need more research first", "skip the testing phase", "a full rollout first"],
    difficulty: 'advanced',
    scenario: '해결 방안을 제안할 때',
    dialoguePrompt: 'How do you think we should approach this problem?',
    category: 'daily',
  },

  // ── 고급 트랙 전용 — 뉘앙스·관용구 ──────────────────────────────────────
  {
    id: 'adv-idiom-ballpark',
    english: "I'm just ballparking here, but I'd estimate around three to four weeks depending on how the reviews go.",
    korean: "대략적인 견적이지만, 검토 과정에 따라 3~4주 정도 걸릴 것 같아요.",
    parts: ["대략적인 견적이지만,", "검토 과정에 따라", "3~4주 정도 걸릴 것 같아요."],
    englishParts: ["I'm just ballparking here, but", "I'd estimate around three to four weeks", "depending on how the reviews go"],
    distractors: ["정확히 3주예요", "기간을 말하기 어려워요"],
    englishDistractors: ["Exactly three weeks", "I have no idea", "It's already finished", "could take over a year"],
    difficulty: 'advanced',
    scenario: '대략적인 기간을 추정할 때',
    dialoguePrompt: 'How long will it take to complete the project?',
    category: 'daily',
  },
  {
    id: 'adv-idiom-silver-lining',
    english: "Every cloud has a silver lining — at least we found the bug before the client did.",
    korean: "그래도 좋은 점이 있어요 — 적어도 클라이언트보다 우리가 먼저 버그를 발견했잖아요.",
    parts: ["그래도 좋은 점이 있어요 —", "적어도 클라이언트보다", "우리가 먼저 버그를 발견했잖아요."],
    englishParts: ["Every cloud has a silver lining —", "at least we found the bug", "before the client did"],
    distractors: ["최악이에요", "포기하는 게 나아요"],
    englishDistractors: ["This is an absolute disaster", "Let's just give up", "the client found it first", "it's all our fault"],
    difficulty: 'advanced',
    scenario: '부정적 상황에서 긍정적 측면을 찾을 때',
    dialoguePrompt: 'Everything went wrong on the project today.',
    category: 'daily',
  },
  {
    id: 'adv-idiom-catch22',
    english: "It's a real catch-22 — maybe we should look for internship opportunities to break the cycle.",
    korean: "정말 딜레마 상황이네요 — 인턴십 기회를 찾아서 이 악순환을 끊는 건 어떨까요?",
    parts: ["정말 딜레마 상황이네요 —", "인턴십 기회를 찾아서", "이 악순환을 끊는 건 어떨까요?"],
    englishParts: ["It's a real catch-22 —", "maybe we should look for internship opportunities", "to break the cycle"],
    distractors: ["그냥 취직부터 해요", "포기하세요"],
    englishDistractors: ["Just get hired directly", "Give up completely", "experience doesn't matter", "go back to school instead"],
    difficulty: 'advanced',
    scenario: '딜레마 상황을 표현할 때',
    dialoguePrompt: "We need experience to get the job, but we need the job to get experience.",
    category: 'daily',
  },
]
