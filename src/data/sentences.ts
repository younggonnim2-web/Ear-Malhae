import type { SentenceItem } from '../types'

export const SENTENCES: SentenceItem[] = [
  { id: 'coffee-please',  english: 'Coffee, please.',    parts: ['커피', '주세요'],          distractors: ['설탕', '물'] },
  { id: 'i-like-cats',   english: 'I like cats.',        parts: ['나는', '고양이가', '좋아요'], distractors: ['개', '새'] },
  { id: 'its-a-dog',     english: "It's a dog.",         parts: ['강아지예요'],               distractors: ['고양이', '새', '토끼'] },
  { id: 'i-like-milk',   english: 'I like milk.',        parts: ['나는', '우유가', '좋아요'], distractors: ['빵', '물'] },
  { id: 'its-red',       english: "It's red.",           parts: ['빨간색이에요'],             distractors: ['파란색', '초록색', '노란색'] },
  { id: 'i-like-blue',   english: 'I like blue.',        parts: ['나는', '파란색이', '좋아요'], distractors: ['빨간색', '초록색'] },
  { id: 'go-home',       english: 'Go home.',            parts: ['집에', '가요'],             distractors: ['학교', '공원'] },
  { id: 'im-happy',      english: "I'm happy.",          parts: ['나는', '행복해요'],         distractors: ['슬퍼요', '배고파요'] },
  { id: 'its-hot',       english: "It's hot.",           parts: ['더워요'],                   distractors: ['추워요', '좋아요', '싫어요'] },
  { id: 'one-please',    english: 'One, please.',        parts: ['하나', '주세요'],           distractors: ['둘', '셋'] },
  { id: 'i-want-bread',  english: 'I want bread.',       parts: ['빵을', '원해요'],           distractors: ['우유', '케이크'] },
  { id: 'its-big',       english: "It's big.",           parts: ['커요'],                    distractors: ['작아요', '높아요', '낮아요'] },
  { id: 'its-cold',      english: "It's cold.",          parts: ['추워요'],                   distractors: ['더워요', '좋아요'] },
  { id: 'thank-you',     english: 'Thank you.',          parts: ['감사해요'],                 distractors: ['미안해요', '좋아요'] },
  { id: 'i-see-bird',    english: 'I see a bird.',       parts: ['새가', '보여요'],           distractors: ['고양이', '개'] },
  { id: 'water-please',  english: 'Water, please.',      parts: ['물', '주세요'],             distractors: ['커피', '우유'] },
  { id: 'its-small',     english: "It's small.",         parts: ['작아요'],                   distractors: ['커요', '무거워요', '가벼워요'] },
  { id: 'i-like-red',    english: 'I like red.',         parts: ['나는', '빨간색이', '좋아요'], distractors: ['파란색', '초록색'] },
  { id: 'lets-go',       english: "Let's go.",           parts: ['가요'],                    distractors: ['와요', '먹어요', '자요'] },
  { id: 'im-hungry',     english: "I'm hungry.",         parts: ['나는', '배고파요'],         distractors: ['행복해요', '슬퍼요'] },
]
