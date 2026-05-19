import { cn } from '../utils/cn'
import type { ChallengeTag } from '../types/lesson'

export function TagBadge({ tag }: { tag: ChallengeTag }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-sm font-bold',
      tag === '새로운 단어' && 'text-purple-600',
      tag === '새로운 패턴' && 'text-orange-500',
      tag === '어려운 연습' && 'text-red-500',
    )}>
      {tag === '새로운 단어' && '✦'}
      {tag === '새로운 패턴' && '◆'}
      {tag === '어려운 연습' && '★'}
      {' '}{tag}
    </span>
  )
}
