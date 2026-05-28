import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SECTIONS, INTERMEDIATE_SECTIONS, ADVANCED_SECTIONS } from '../data/sections'
import { LESSONS_MAP } from '../data/lessons'
import { UNITS_MAP } from '../data/units'
import { WORDS } from '../data/words'
import { SENTENCES } from '../data/sentences'
import type { Section } from '../data/sections'

type Tab = 'summary' | 'wrong' | 'log'

function getVisibleLessonIds(section: Section): string[] {
  return section.unitIds.flatMap(uid => UNITS_MAP[uid]?.lessonIds ?? [])
}

function getSectionsAll() {
  return [
    { label: '입문', sections: SECTIONS },
    { label: '중급', sections: INTERMEDIATE_SECTIONS },
    { label: '고급', sections: ADVANCED_SECTIONS },
  ]
}

function starEmoji(stars: 1 | 2 | 3) {
  return '⭐'.repeat(stars)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

function getLessonTitle(lessonId: string) {
  const lesson = LESSONS_MAP[lessonId]
  if (!lesson) return lessonId
  const unit = UNITS_MAP[lesson.unitId]
  return unit ? `${unit.title} · ${lesson.title}` : lesson.title
}

function getItemDisplayName(id: string): string {
  const word = WORDS.find(w => w.id === id)
  if (word) return `${word.emoji} ${word.word} (${word.meaning})`
  const sentence = SENTENCES.find(s => s.id === id)
  if (sentence) return `"${sentence.english}"`
  return id
}

export function History() {
  const navigate = useNavigate()
  const { progress } = useApp()
  const [tab, setTab] = useState<Tab>('summary')

  const diffGroups = getSectionsAll()
  const wrongEntries = Object.entries(progress.wrongAnswers ?? {})
    .sort((a, b) => b[1].count - a[1].count)
  const wrongCount = wrongEntries.length

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-canvas border-b border-hairline">
        <div className="px-4 pt-4 pb-0 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-steel text-xl leading-none pr-1"
            aria-label="뒤로가기"
          >
            ←
          </button>
          <h1 className="text-xl font-black text-ink">학습 히스토리</h1>
        </div>
        <div className="flex mt-3">
          {(['summary', 'wrong', 'log'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-3 text-sm font-bold border-b-2 transition-colors',
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-steel',
              ].join(' ')}
            >
              {t === 'summary' && '요약'}
              {t === 'wrong' && `오답 노트 ${wrongCount > 0 ? `(${wrongCount})` : ''}`}
              {t === 'log' && '학습 기록'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 pb-8">
        {tab === 'summary' && <SummaryTab groups={diffGroups} progress={progress} />}
        {tab === 'wrong' && (
          <WrongTab
            entries={wrongEntries}
            onStartReview={() => navigate('/review')}
          />
        )}
        {tab === 'log' && <LogTab sessionLog={progress.sessionLog ?? []} />}
      </div>
    </div>
  )
}

// ── Summary tab ─────────────────────────────────────────────────────────────

interface SummaryTabProps {
  groups: { label: string; sections: Section[] }[]
  progress: ReturnType<typeof useApp>['progress']
}

function SummaryTab({ groups, progress }: SummaryTabProps) {
  return (
    <>
      {groups.map(({ label, sections }) => {
        const allLessonIds = sections.flatMap(s => getVisibleLessonIds(s))
        const totalLessons = allLessonIds.length
        if (totalLessons === 0) return null
        const doneLessons = allLessonIds.filter(id => progress.lessonProgress.includes(id)).length
        const pct = Math.round((doneLessons / totalLessons) * 100)

        return (
          <div key={label} className="bg-canvas rounded-2xl border border-hairline p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-ink">{label} 트랙</h2>
              <span className="text-sm font-bold text-steel">{doneLessons}/{totalLessons} 완료</span>
            </div>

            {/* 전체 진행도 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 bg-surface rounded-full border border-hairline overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-primary w-9 text-right">{pct}%</span>
            </div>

            {/* 섹션별 별 평균 */}
            <div className="flex flex-col gap-1.5 mt-1">
              {sections.map(section => {
                const ids = getVisibleLessonIds(section)
                const completed = ids.filter(id => progress.lessonProgress.includes(id))
                if (completed.length === 0) return null
                const starSum = completed.reduce(
                  (acc, id) => acc + (progress.lessonStars[id] ?? 0), 0
                )
                const avg = starSum / completed.length
                const fullStars = Math.round(avg)

                return (
                  <div key={section.id} className="flex items-center justify-between text-sm">
                    <span className="text-steel truncate max-w-[60%]">{section.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-400 text-xs">
                        {'★'.repeat(fullStars)}{'☆'.repeat(3 - fullStars)}
                      </span>
                      <span className="text-xs text-muted">{completed.length}/{ids.length}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

// ── Wrong tab ────────────────────────────────────────────────────────────────

interface WrongTabProps {
  entries: [string, { count: number; kind: string; lessonId: string; lastWrongAt: string }][]
  onStartReview: () => void
}

function WrongTab({ entries, onStartReview }: WrongTabProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <span className="text-6xl">🎉</span>
        <p className="text-lg font-black text-ink text-center">오답이 없어요!</p>
        <p className="text-sm text-steel text-center">계속 학습하면 틀린 문제가 여기에 쌓여요</p>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={onStartReview}
        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-base"
      >
        🔄 {entries.length}개 복습하기
      </button>

      <div className="flex flex-col gap-2">
        {entries.map(([id, entry]) => (
          <div key={id} className="bg-canvas rounded-xl border border-hairline p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink truncate">{getItemDisplayName(id)}</p>
              <p className="text-xs text-steel mt-0.5">{getLessonTitle(entry.lessonId)}</p>
              <p className="text-xs text-muted mt-0.5">마지막 오답: {formatDate(entry.lastWrongAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-full">
                {entry.count}번 틀림
              </span>
              <span className="text-[10px] text-muted">{entry.kind}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Log tab ──────────────────────────────────────────────────────────────────

function LogTab({ sessionLog }: { sessionLog: { lessonId: string; date: string; stars: 1 | 2 | 3 }[] }) {
  if (sessionLog.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <span className="text-6xl">📖</span>
        <p className="text-lg font-black text-ink text-center">학습 기록이 없어요</p>
        <p className="text-sm text-steel text-center">레슨을 완료하면 여기에 기록돼요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sessionLog.map((entry, i) => (
        <div key={i} className="bg-canvas rounded-xl border border-hairline p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-ink">{getLessonTitle(entry.lessonId)}</p>
            <p className="text-xs text-muted mt-0.5">{formatDate(entry.date)}</p>
          </div>
          <span className="text-lg">{starEmoji(entry.stars)}</span>
        </div>
      ))}
    </div>
  )
}
