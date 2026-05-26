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
  {
    id: 'int-move',
    title: '이동·쇼핑',
    subtitle: '길 찾기·쇼핑·대중교통을 해결해요',
    message: "How do I get to the train station?",
    bg: 'bg-cyan-500',
    border: 'border-cyan-400',
    text: 'text-cyan-600',
    unitIds: ['int-shopping', 'int-directions', 'int-transport'],
    baseTier: 1,
  },
  {
    id: 'int-service',
    title: '생활 서비스',
    subtitle: '은행·병원·전화를 영어로 해결해요',
    message: "I'd like to open a bank account.",
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-600',
    unitIds: ['int-bank', 'int-hospital', 'int-phone'],
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
    title: '감정·공감',
    subtitle: '기쁨·걱정·위로를 영어로 말해요',
    message: "I'm so proud of you!",
    bg: 'bg-violet-500',
    border: 'border-violet-400',
    text: 'text-violet-600',
    unitIds: ['adv-biz'],
    baseTier: 2,
  },
  {
    id: 'adv-idiom',
    title: '일상 대화',
    subtitle: '자연스러운 일상 표현을 배워요',
    message: "It's been so long!",
    bg: 'bg-purple-500',
    border: 'border-purple-400',
    text: 'text-purple-600',
    unitIds: ['adv-idiom'],
    baseTier: 3,
  },
  {
    id: 'adv-business',
    title: '비즈니스',
    subtitle: '회의·이메일·협상을 영어로 해요',
    message: "Let's go over today's agenda.",
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-700',
    unitIds: ['adv-meeting', 'adv-email', 'adv-negotiate'],
    baseTier: 2,
  },
  {
    id: 'adv-society',
    title: '사회·문화',
    subtitle: '뉴스·건강·기술을 자연스럽게',
    message: "I couldn't agree more.",
    bg: 'bg-slate-600',
    border: 'border-slate-500',
    text: 'text-slate-700',
    unitIds: ['adv-news', 'adv-health', 'adv-tech'],
    baseTier: 3,
  },
]

export function getSectionsForDifficulty(level: DifficultyLevel): Section[] {
  if (level === 'advanced') return ADVANCED_SECTIONS
  if (level === 'intermediate') return INTERMEDIATE_SECTIONS
  return SECTIONS
}
