import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SECTIONS, type Section } from '../data/sections'
import { UNITS_MAP } from '../data/units'

const SECTION_MESSAGES: Record<string, string> = {
  beginner:     '안녕하세요! 알파벳과 기초 단어를 배워요.',
  basic:        '과일·동물·색깔·신체를 말할 수 있어요!',
  intermediate: '일상 표현을 자신 있게 말해봐요.',
}

function getSectionLessonIds(section: Section): string[] {
  return section.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? [])
}

type SectionState = 'active' | 'locked' | 'completed'

export function LearningPath() {
  const navigate = useNavigate()
  const { progress } = useApp()
  const completedSet = new Set(progress.lessonProgress)

  const allLessonIds = SECTIONS.flatMap(s => getSectionLessonIds(s))
  const currentLessonId = allLessonIds.find(id => !completedSet.has(id))

  function getSectionState(section: Section): SectionState {
    const ids = getSectionLessonIds(section)
    if (ids.length === 0) return 'locked'
    if (ids.every(id => completedSet.has(id))) return 'completed'
    if (ids.some(id => completedSet.has(id)) || ids[0] === currentLessonId)
      return 'active'
    // check if first lesson of section is reachable
    const firstId = ids[0]
    const firstIdx = allLessonIds.indexOf(firstId)
    if (firstIdx === 0) return 'active'
    return completedSet.has(allLessonIds[firstIdx - 1]) ? 'active' : 'locked'
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-canvas border-b border-hairline px-4 py-3 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦉</span>
          <span className="font-black text-ink text-lg">쉬운 영어</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-orange-500 font-bold">🔥 {progress.streak}</span>
          <span className="text-yellow-500 font-bold">⚡ {progress.lessonProgress.length * 10}</span>
        </div>
      </div>

      {/* 섹션 카드 목록 */}
      <div className="max-w-md mx-auto p-4 flex flex-col gap-4 pb-24">
        {SECTIONS.map((section, idx) => {
          const state = getSectionState(section)
          const ids = getSectionLessonIds(section)
          const doneCount = ids.filter(id => completedSet.has(id)).length
          const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0

          return (
            <SectionCard
              key={section.id}
              section={section}
              num={idx + 1}
              state={state}
              pct={pct}
              message={SECTION_MESSAGES[section.id] ?? ''}
              onNavigate={() => navigate(`/section/${section.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface CardProps {
  section: Section
  num: number
  state: SectionState
  pct: number
  message: string
  onNavigate: () => void
}

function SectionCard({ section, num, state, pct, message, onNavigate }: CardProps) {
  const isActive = state === 'active'
  const isLocked = state === 'locked'

  return (
    <div className={[
      'rounded-3xl border-2 p-5 flex gap-4 items-start',
      isActive  && 'bg-blue-50 border-blue-200',
      isLocked  && 'bg-gray-50 border-gray-200 opacity-80',
      state === 'completed' && 'bg-green-50 border-green-200',
    ].filter(Boolean).join(' ')}>

      {/* 왼쪽: 텍스트 + 진행률 + 버튼 */}
      <div className="flex-1 flex flex-col gap-3">
        <div>
          <p className="text-xs font-bold text-steel uppercase tracking-widest">섹션 {num}</p>
          <p className={`text-xl font-black mt-0.5 ${isLocked ? 'text-gray-400' : 'text-ink'}`}>
            {section.title}
          </p>
        </div>

        {/* 진행률 바 (활성/완료만) */}
        {!isLocked && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white rounded-full border border-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isActive ? 'bg-primary' : 'bg-green-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-steel font-semibold">{pct}%</span>
          </div>
        )}

        {/* 잠긴 섹션: 유닛 수 */}
        {isLocked && (
          <p className="text-sm text-gray-400 flex items-center gap-1">
            🔒 {section.unitIds.length}개 유닛
          </p>
        )}

        {/* 버튼 */}
        <button
          onClick={onNavigate}
          className={[
            'py-3 rounded-2xl text-sm font-bold transition-colors',
            isActive  && 'bg-primary text-white hover:bg-primary/90',
            isLocked  && 'border-2 border-gray-300 text-gray-400 bg-transparent',
            state === 'completed' && 'border-2 border-green-400 text-green-600 bg-transparent',
          ].filter(Boolean).join(' ')}
        >
          {isActive  && '계속하기'}
          {isLocked  && `섹션 ${num}(으)로 이동하기`}
          {state === 'completed' && '다시 연습하기'}
        </button>
      </div>

      {/* 오른쪽: 말풍선 + 부엉이 */}
      <div className="flex flex-col items-center gap-1 min-w-[96px]">
        <div className={[
          'rounded-2xl px-3 py-2 text-xs font-semibold text-center leading-snug max-w-[100px]',
          isLocked ? 'bg-gray-200 text-gray-400' : 'bg-white border border-gray-200 text-ink shadow-sm',
        ].join(' ')}>
          {message}
        </div>
        <span className={`text-5xl select-none ${isLocked ? 'grayscale opacity-50' : ''}`}>🦉</span>
      </div>
    </div>
  )
}
