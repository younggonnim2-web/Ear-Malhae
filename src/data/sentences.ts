import type { SentenceItem } from '../types'

export const SENTENCES: SentenceItem[] = [
  { id: 'coffee-please',  english: 'Coffee, please.',    korean: '커피 주세요!',           parts: ['커피', '주세요'],          distractors: ['설탕', '물'],        englishDistractors: ['tea', 'sugar'] },
  { id: 'i-like-cats',   english: 'I like cats.',        korean: '나는 고양이가 좋아요',   parts: ['나는', '고양이가', '좋아요'], distractors: ['개', '새'],          englishDistractors: ['dogs', 'birds'] },
  { id: 'its-a-dog',     english: "It's a dog.",         korean: '강아지예요',              parts: ['강아지예요'],               distractors: ['고양이', '새', '토끼'], englishDistractors: ['cat', 'bird'] },
  { id: 'i-like-milk',   english: 'I like milk.',        korean: '나는 우유가 좋아요',     parts: ['나는', '우유가', '좋아요'], distractors: ['빵', '물'],          englishDistractors: ['water', 'juice'] },
  { id: 'its-red',       english: "It's red.",           korean: '빨간색이에요',            parts: ['빨간색이에요'],             distractors: ['파란색', '초록색', '노란색'], englishDistractors: ['blue', 'green'] },
  { id: 'i-like-blue',   english: 'I like blue.',        korean: '나는 파란색이 좋아요',   parts: ['나는', '파란색이', '좋아요'], distractors: ['빨간색', '초록색'],  englishDistractors: ['red', 'green'] },
  { id: 'go-home',       english: 'Go home.',            korean: '집에 가요',              parts: ['집에', '가요'],             distractors: ['학교', '공원'],      englishDistractors: ['school', 'now'] },
  { id: 'im-happy',      english: "I'm happy.",          korean: '나는 행복해요',           parts: ['나는', '행복해요'],         distractors: ['슬퍼요', '배고파요'], englishDistractors: ['sad', 'tired'] },
  { id: 'its-hot',       english: "It's hot.",           korean: '더워요',                 parts: ['더워요'],                   distractors: ['추워요', '좋아요', '싫어요'], englishDistractors: ['cold', 'good'] },
  { id: 'one-please',    english: 'One, please.',        korean: '하나 주세요',            parts: ['하나', '주세요'],           distractors: ['둘', '셋'],          englishDistractors: ['two', 'more'] },
  { id: 'i-want-bread',  english: 'I want bread.',       korean: '빵을 원해요',            parts: ['빵을', '원해요'],           distractors: ['우유', '케이크'],    englishDistractors: ['milk', 'cake'] },
  { id: 'its-big',       english: "It's big.",           korean: '커요',                   parts: ['커요'],                    distractors: ['작아요', '높아요', '낮아요'], englishDistractors: ['small', 'old'] },
  { id: 'its-cold',      english: "It's cold.",          korean: '추워요',                 parts: ['추워요'],                   distractors: ['더워요', '좋아요'],  englishDistractors: ['hot', 'nice'] },
  { id: 'thank-you',     english: 'Thank you.',          korean: '감사해요',               parts: ['감사해요'],                 distractors: ['미안해요', '좋아요'], englishDistractors: ['sorry', 'yes'] },
  { id: 'i-see-bird',    english: 'I see a bird.',       korean: '새가 보여요',            parts: ['새가', '보여요'],           distractors: ['고양이', '개'],      englishDistractors: ['dog', 'fish'] },
  { id: 'water-please',  english: 'Water, please.',      korean: '물 주세요',              parts: ['물', '주세요'],             distractors: ['커피', '우유'],      englishDistractors: ['juice', 'milk'] },
  { id: 'its-small',     english: "It's small.",         korean: '작아요',                 parts: ['작아요'],                   distractors: ['커요', '무거워요', '가벼워요'], englishDistractors: ['big', 'tall'] },
  { id: 'i-like-red',    english: 'I like red.',         korean: '나는 빨간색이 좋아요',   parts: ['나는', '빨간색이', '좋아요'], distractors: ['파란색', '초록색'],  englishDistractors: ['blue', 'pink'] },
  { id: 'lets-go',       english: "Let's go.",           korean: '가요',                   parts: ['가요'],                    distractors: ['와요', '먹어요', '자요'], englishDistractors: ['stop', 'wait'] },
  { id: 'im-hungry',     english: "I'm hungry.",         korean: '나는 배고파요',           parts: ['나는', '배고파요'],         distractors: ['행복해요', '슬퍼요'], englishDistractors: ['full', 'happy'] },
]
