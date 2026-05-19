import type { SentenceItem } from '../types'

export const SENTENCES: SentenceItem[] = [
  { id: 'coffee-please',  english: 'Coffee, please.',    korean: '커피 주세요!',           parts: ['커피', '주세요'],              englishParts: ['coffee', 'please'],         distractors: ['설탕', '물'],        englishDistractors: ['tea', 'sugar'] },
  { id: 'i-like-cats',   english: 'I like cats.',        korean: '나는 고양이가 좋아요',   parts: ['나는', '고양이가', '좋아요'],  englishParts: ['I', 'cats', 'like'],        distractors: ['개', '새'],          englishDistractors: ['dogs', 'birds'] },
  { id: 'its-a-dog',     english: "It's a dog.",         korean: '강아지예요',              parts: ['강아지예요'],                  englishParts: ['dog'],                      distractors: ['고양이', '새', '토끼'], englishDistractors: ['cat', 'bird'] },
  { id: 'i-like-milk',   english: 'I like milk.',        korean: '나는 우유가 좋아요',     parts: ['나는', '우유가', '좋아요'],    englishParts: ['I', 'milk', 'like'],        distractors: ['빵', '물'],          englishDistractors: ['water', 'juice'] },
  { id: 'its-red',       english: "It's red.",           korean: '빨간색이에요',            parts: ['빨간색이에요'],                englishParts: ['red'],                      distractors: ['파란색', '초록색', '노란색'], englishDistractors: ['blue', 'green'] },
  { id: 'i-like-blue',   english: 'I like blue.',        korean: '나는 파란색이 좋아요',   parts: ['나는', '파란색이', '좋아요'],  englishParts: ['I', 'blue', 'like'],        distractors: ['빨간색', '초록색'],  englishDistractors: ['red', 'green'] },
  { id: 'go-home',       english: 'Go home.',            korean: '집에 가요',              parts: ['집에', '가요'],                englishParts: ['home', 'go'],               distractors: ['학교', '공원'],      englishDistractors: ['school', 'now'] },
  { id: 'im-happy',      english: "I'm happy.",          korean: '나는 행복해요',           parts: ['나는', '행복해요'],            englishParts: ['I', 'happy'],               distractors: ['슬퍼요', '배고파요'], englishDistractors: ['sad', 'tired'] },
  { id: 'its-hot',       english: "It's hot.",           korean: '더워요',                 parts: ['더워요'],                      englishParts: ['hot'],                      distractors: ['추워요', '좋아요', '싫어요'], englishDistractors: ['cold', 'good'] },
  { id: 'one-please',    english: 'One, please.',        korean: '하나 주세요',            parts: ['하나', '주세요'],              englishParts: ['one', 'please'],            distractors: ['둘', '셋'],          englishDistractors: ['two', 'more'] },
  { id: 'i-want-bread',  english: 'I want bread.',       korean: '빵을 원해요',            parts: ['빵을', '원해요'],              englishParts: ['bread', 'want'],            distractors: ['우유', '케이크'],    englishDistractors: ['milk', 'cake'] },
  { id: 'its-big',       english: "It's big.",           korean: '커요',                   parts: ['커요'],                        englishParts: ['big'],                      distractors: ['작아요', '높아요', '낮아요'], englishDistractors: ['small', 'old'] },
  { id: 'its-cold',      english: "It's cold.",          korean: '추워요',                 parts: ['추워요'],                      englishParts: ['cold'],                     distractors: ['더워요', '좋아요'],  englishDistractors: ['hot', 'nice'] },
  { id: 'thank-you',     english: 'Thank you.',          korean: '감사해요',               parts: ['감사해요'],                    englishParts: ['thank you'],                distractors: ['미안해요', '좋아요'], englishDistractors: ['sorry', 'yes'] },
  { id: 'i-see-bird',    english: 'I see a bird.',       korean: '새가 보여요',            parts: ['새가', '보여요'],              englishParts: ['bird', 'see'],              distractors: ['고양이', '개'],      englishDistractors: ['dog', 'fish'] },
  { id: 'water-please',  english: 'Water, please.',      korean: '물 주세요',              parts: ['물', '주세요'],                englishParts: ['water', 'please'],          distractors: ['커피', '우유'],      englishDistractors: ['juice', 'milk'] },
  { id: 'its-small',     english: "It's small.",         korean: '작아요',                 parts: ['작아요'],                      englishParts: ['small'],                    distractors: ['커요', '무거워요', '가벼워요'], englishDistractors: ['big', 'tall'] },
  { id: 'i-like-red',    english: 'I like red.',         korean: '나는 빨간색이 좋아요',   parts: ['나는', '빨간색이', '좋아요'],  englishParts: ['I', 'red', 'like'],         distractors: ['파란색', '초록색'],  englishDistractors: ['blue', 'pink'] },
  { id: 'lets-go',       english: "Let's go.",           korean: '가요',                   parts: ['가요'],                        englishParts: ['go'],                       distractors: ['와요', '먹어요', '자요'], englishDistractors: ['stop', 'wait'] },
  { id: 'im-hungry',     english: "I'm hungry.",         korean: '나는 배고파요',           parts: ['나는', '배고파요'],            englishParts: ['I', 'hungry'],              distractors: ['행복해요', '슬퍼요'], englishDistractors: ['full', 'happy'] },
  // 가족
  { id: 'my-mother',    english: 'She is my mother.',   korean: '그녀는 우리 엄마예요',    parts: ['그녀는', '우리', '엄마예요'],  englishParts: ['She', 'my', 'mother'],      distractors: ['아빠', '언니'],       englishDistractors: ['father', 'sister'] },
  { id: 'i-love-family',english: 'I love my family.',   korean: '나는 가족을 사랑해요',    parts: ['나는', '가족을', '사랑해요'], englishParts: ['I', 'love', 'family'],      distractors: ['친구', '학교'],       englishDistractors: ['friend', 'school'] },
  { id: 'my-brother',   english: 'He is my brother.',   korean: '그는 우리 오빠예요',      parts: ['그는', '우리', '오빠예요'],   englishParts: ['He', 'my', 'brother'],      distractors: ['아빠', '할아버지'],   englishDistractors: ['father', 'grandpa'] },
  // 날씨
  { id: 'its-sunny',    english: "It's sunny today.",   korean: '오늘은 맑아요',           parts: ['오늘은', '맑아요'],            englishParts: ['sunny', 'today'],           distractors: ['흐려요', '추워요'],   englishDistractors: ['cloudy', 'cold'] },
  { id: 'its-raining',  english: "It's raining.",       korean: '비가 와요',               parts: ['비가', '와요'],                englishParts: ['raining', 'It'],            distractors: ['눈', '바람'],         englishDistractors: ['snowing', 'windy'] },
  { id: 'its-windy',    english: "It's very windy.",    korean: '바람이 많이 불어요',       parts: ['바람이', '많이', '불어요'],    englishParts: ['very', 'windy', 'It'],      distractors: ['맑아요', '따뜻해요'], englishDistractors: ['sunny', 'warm'] },
  // 감정
  { id: 'im-angry',     english: "I'm angry.",          korean: '나는 화가 났어요',         parts: ['나는', '화가', '났어요'],      englishParts: ['I', 'am', 'angry'],         distractors: ['슬퍼요', '피곤해요'], englishDistractors: ['sad', 'tired'] },
  { id: 'im-tired',     english: "I'm tired.",          korean: '나는 피곤해요',            parts: ['나는', '피곤해요'],            englishParts: ['I', 'tired'],               distractors: ['신나요', '화났어요'], englishDistractors: ['excited', 'angry'] },
  { id: 'im-excited',   english: "I'm excited!",        korean: '신나요!',                 parts: ['신나요'],                      englishParts: ['excited'],                  distractors: ['무서워요', '지루해요'], englishDistractors: ['scared', 'bored'] },
  // 교통
  { id: 'take-the-bus', english: 'I go by bus.',        korean: '버스를 타고 가요',         parts: ['버스를', '타고', '가요'],      englishParts: ['bus', 'by', 'go'],          distractors: ['기차', '택시'],       englishDistractors: ['train', 'taxi'] },
  { id: 'take-subway',  english: 'Take the subway.',    korean: '지하철을 타요',            parts: ['지하철을', '타요'],            englishParts: ['subway', 'Take'],           distractors: ['버스', '자전거'],     englishDistractors: ['bus', 'bike'] },
  { id: 'train-is-fast',english: 'The train is fast.',  korean: '기차는 빨라요',            parts: ['기차는', '빨라요'],            englishParts: ['train', 'fast'],            distractors: ['버스', '느려요'],     englishDistractors: ['bus', 'slow'] },
  // 건강
  { id: 'i-feel-sick',  english: 'I feel sick.',        korean: '몸이 아파요',              parts: ['몸이', '아파요'],              englishParts: ['I', 'sick', 'feel'],        distractors: ['건강해요', '피곤해요'], englishDistractors: ['healthy', 'tired'] },
  { id: 'see-doctor',   english: 'See a doctor.',       korean: '의사를 만나요',            parts: ['의사를', '만나요'],            englishParts: ['doctor', 'See'],            distractors: ['학교', '공원'],       englishDistractors: ['school', 'park'] },
  { id: 'take-medicine',english: 'Take your medicine.', korean: '약을 먹어요',              parts: ['약을', '먹어요'],              englishParts: ['medicine', 'Take'],         distractors: ['밥', '물'],           englishDistractors: ['food', 'water'] },
]
