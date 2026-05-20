import type { DifficultyLevel } from '../types'

export interface Section {
  id: string
  title: string
  subtitle: string
  message: string
  bg: string
  border: string
  text: string
  unitIds: string[]
  baseTier: number
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
    baseTier: 0,
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
    baseTier: 1,
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
    baseTier: 1,
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
    baseTier: 2,
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
    baseTier: 2,
  },
]

// ── 중급 트랙 ─────────────────────────────────────────────────────────────
export const INTERMEDIATE_SECTIONS: Section[] = [
  {
    id: 'int-dining',
    title: '식당 주문',
    subtitle: '주문·요청·불만을 영어로 말해요',
    message: "I'd like to order, please.",
    bg: 'bg-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-600',
    unitIds: ['int-dining'],
    baseTier: 1,
  },
  {
    id: 'int-hotel',
    title: '여행·숙박',
    subtitle: '호텔 서비스와 이동을 해결해요',
    message: 'Could I move to a different room?',
    bg: 'bg-teal-500',
    border: 'border-teal-400',
    text: 'text-teal-600',
    unitIds: ['int-hotel'],
    baseTier: 1,
  },
  {
    id: 'int-social',
    title: '일상 회화',
    subtitle: '거절·공감·의견을 자연스럽게',
    message: "You took the words right out of my mouth!",
    bg: 'bg-rose-500',
    border: 'border-rose-400',
    text: 'text-rose-600',
    unitIds: ['int-social'],
    baseTier: 2,
  },
]

// ── 고급 트랙 ─────────────────────────────────────────────────────────────
export const ADVANCED_SECTIONS: Section[] = [
  {
    id: 'adv-airport',
    title: '공항·교통',
    subtitle: '항공 지연·수하물·오버부킹을 해결해요',
    message: 'Is there any compensation for bumping?',
    bg: 'bg-indigo-500',
    border: 'border-indigo-400',
    text: 'text-indigo-600',
    unitIds: ['adv-airport'],
    baseTier: 2,
  },
  {
    id: 'adv-biz',
    title: '비즈니스 소통',
    subtitle: '반론·제안·설득을 논리적으로',
    message: "I'd like to propose a pilot program.",
    bg: 'bg-violet-500',
    border: 'border-violet-400',
    text: 'text-violet-600',
    unitIds: ['adv-biz'],
    baseTier: 2,
  },
  {
    id: 'adv-idiom',
    title: '뉘앙스·관용구',
    subtitle: '원어민이 쓰는 표현으로 말해요',
    message: "Every cloud has a silver lining.",
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-600',
    unitIds: ['adv-idiom'],
    baseTier: 3,
  },
]

export function getSectionsForDifficulty(level: DifficultyLevel): Section[] {
  if (level === 'advanced') return ADVANCED_SECTIONS
  if (level === 'intermediate') return INTERMEDIATE_SECTIONS
  return SECTIONS
}
