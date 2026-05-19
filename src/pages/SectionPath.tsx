import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SECTIONS } from '../data/sections'
import { UNITS_MAP } from '../data/units'
import { LESSONS_MAP } from '../data/lessons'
import type { Unit } from '../types/lesson'
import type { Section } from '../data/sections'

const ZIGZAG = [50, 67, 50, 33, 50, 67, 50, 33]

const ALPHABET_LESSON_IDS = new Set(UNITS_MAP['alphabet']?.lessonIds ?? [])

const ALL_LESSON_IDS = SECTIONS.flatMap(s =>
  s.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? [])
)

function isLocked(lessonId: string, completedSet: Set<string>): boolean {
  const idx = ALL_LESSON_IDS.indexOf(lessonId)
  if (idx <= 0) return false
  return !completedSet.has(ALL_LESSON_IDS[idx - 1])
}

export function SectionPath() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const navigate = useNavigate()
  const { progress } = useApp()

  const isNonBeginner = progress.difficultyLevel !== 'beginner'
  const effectiveCompletedSet = isNonBeginner
    ? new Set([...progress.lessonProgress, ...ALPHABET_LESSON_IDS])
    : new Set(progress.lessonProgress)

  const section = SECTIONS.find(s => s.id === sectionId)
  const sectionIdx = SECTIONS.findIndex(s => s.id === sectionId)
  if (!section) return <div className="p-8 text-steel text-center">섹션을 찾을 수 없습니다</div>

  const currentLessonId = ALL_LESSON_IDS.find(id => !effectiveCompletedSet.has(id))

  // Non-beginners: hide alphabet unit entirely from the lesson path
  const units = section.unitIds
    .filter(uid => !(isNonBeginner && uid === 'alphabet'))
    .map(uid => UNITS_MAP[uid]).filter(Boolean) as Unit[]

  return (
    <div className="min-h-screen bg-surface">
      {/* 스티키 헤더 */}
      <div className={`${section.bg} sticky top-0 z-10`}>
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-white/90 text-sm font-semibold"
          >
            ← 섹션 {sectionIdx + 1}
          </button>
          <p className="text-white font-black text-base">{section.title}</p>
          <div className="w-16" />
        </div>
      </div>

      {/* 경로 */}
      <div className="max-w-md mx-auto pb-32">
        {units.map(unit => (
          <UnitSection
            key={unit.id}
            unit={unit}
            section={section}
            completedSet={effectiveCompletedSet}
            currentLessonId={currentLessonId}
            stars={progress.lessonStars}
            onLessonClick={id => navigate(`/lesson/${id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function UnitSection({ unit, section, completedSet, currentLessonId, stars, onLessonClick }: {
  unit: Unit
  section: Pick<Section, 'bg' | 'border' | 'text'>
  completedSet: Set<string>
  currentLessonId: string | undefined
  stars: Record<string, 1 | 2 | 3>
  onLessonClick: (id: string) => void
}) {
  const SLOT_H = 100

  return (
    <div>
      {/* 유닛 구분선 */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-2">
        <div className="flex-1 h-px bg-hairline" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${section.border} bg-canvas`}>
          <span className="text-base">{unit.emoji}</span>
          <span className={`text-sm font-bold ${section.text}`}>{unit.title}</span>
        </div>
        <div className="flex-1 h-px bg-hairline" />
      </div>

      {/* 레슨 버블 */}
      <div className="relative mx-auto" style={{ height: unit.lessonIds.length * SLOT_H + 24 }}>
        {unit.lessonIds.map((lessonId, lIdx) => {
          const done = completedSet.has(lessonId)
          const isCurrent = lessonId === currentLessonId
          const locked = isLocked(lessonId, completedSet)
          const posX = ZIGZAG[lIdx % ZIGZAG.length]
          const lesson = LESSONS_MAP[lessonId]
          const lessonStars = stars[lessonId] ?? 0

          return (
            <div
              key={lessonId}
              style={{
                position: 'absolute',
                top: lIdx * SLOT_H + 12,
                left: `${posX}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* 연결선 */}
              {lIdx > 0 && (
                <div
                  className="absolute border-l-2 border-dashed border-gray-200"
                  style={{
                    height: SLOT_H - 4,
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              )}

              <LessonNode
                emoji={unit.emoji}
                title={lesson?.title ?? `레슨 ${lIdx + 1}`}
                done={done}
                isCurrent={isCurrent}
                locked={locked}
                stars={lessonStars}
                sectionBg={section.bg}
                onClick={() => !locked && onLessonClick(lessonId)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface NodeProps {
  emoji: string
  title: string
  done: boolean
  isCurrent: boolean
  locked: boolean
  stars: number
  sectionBg: string
  onClick: () => void
}

function LessonNode({ emoji, title, done, isCurrent, locked, stars, sectionBg, onClick }: NodeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={locked}
        className={[
          'w-[72px] h-[72px] rounded-full border-4 flex items-center justify-center text-2xl shadow-md transition-all',
          isCurrent  && `${sectionBg} border-white scale-110 shadow-lg animate-pulse`,
          done && !isCurrent && 'bg-green-100 border-green-400',
          !done && !isCurrent && !locked && 'bg-canvas border-gray-300 hover:border-primary hover:scale-105',
          locked     && 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50',
        ].filter(Boolean).join(' ')}
      >
        {locked ? '🔒' : isCurrent ? '▶' : emoji}
      </button>

      {/* 별점 */}
      <div className="flex gap-0.5">
        {[1, 2, 3].map(n => (
          <span key={n} className={`text-xs ${n <= stars ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>

      <span className="text-[13px] font-semibold text-steel text-center leading-tight max-w-[84px]">
        {title}
      </span>
    </div>
  )
}
