export interface Section {
  id: string
  title: string
  subtitle: string
  bg: string
  border: string
  text: string
  unitIds: string[]
}

export const SECTIONS: Section[] = [
  {
    id: 'beginner',
    title: '입문',
    subtitle: '알파벳과 기초 단어를 배워요',
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-600',
    unitIds: ['alphabet', 'number'],
  },
  {
    id: 'basic',
    title: '기초',
    subtitle: '자연과 색깔을 표현할 수 있어요',
    bg: 'bg-green-500',
    border: 'border-green-400',
    text: 'text-green-600',
    unitIds: ['fruit', 'animal', 'color', 'body'],
  },
  {
    id: 'intermediate',
    title: '생활영어',
    subtitle: '일상 표현을 말할 수 있어요',
    bg: 'bg-orange-500',
    border: 'border-orange-400',
    text: 'text-orange-600',
    unitIds: ['food', 'daily', 'place'],
  },
]
