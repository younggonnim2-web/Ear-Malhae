export interface Section {
  id: string
  title: string
  subtitle: string
  message: string
  bg: string
  border: string
  text: string
  unitIds: string[]
}

export const SECTIONS: Section[] = [
  {
    id: 'rookie',
    title: '입문',
    subtitle: '알파벳과 기본 인사를 배워요',
    message: 'Hello!',
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-600',
    unitIds: ['alphabet', 'daily'],
  },
  {
    id: 'explorer',
    title: '탐험가',
    subtitle: '기초 단어를 익혀요',
    message: "I'm starting to learn English.",
    bg: 'bg-green-500',
    border: 'border-green-400',
    text: 'text-green-600',
    unitIds: ['number', 'fruit', 'animal'],
  },
  {
    id: 'traveler',
    title: '여행자',
    subtitle: '자연·신체·음식을 표현해요',
    message: 'I know some words in English.',
    bg: 'bg-teal-500',
    border: 'border-teal-400',
    text: 'text-teal-600',
    unitIds: ['color', 'body', 'food', 'place'],
  },
  {
    id: 'challenger',
    title: '도전자',
    subtitle: '가족·날씨·감정을 말해요',
    message: 'I can speak with people a little.',
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    text: 'text-orange-600',
    unitIds: ['family', 'weather', 'feeling'],
  },
  {
    id: 'master',
    title: '마스터',
    subtitle: '교통과 건강을 영어로 말해요',
    message: 'I can participate in daily life in English.',
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-600',
    unitIds: ['transport', 'health'],
  },
]
