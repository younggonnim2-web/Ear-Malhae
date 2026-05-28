import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import type { AppStorage, AppContextValue, DifficultyLevel, SessionLogEntry } from '../types'
import type { ChallengeKind } from '../types/lesson'
import { calculateStreak, getTodayString } from '../utils/streak'
import { calcXp, calcLevel, calcXpToNext } from '../utils/xp'

const STORAGE_KEY = 'easy-english-progress'

const DEFAULT_STORAGE: AppStorage = {
  streak: 0,
  lastStudiedDate: '',
  alphabetProgress: [],
  wordProgress: [],
  lessonProgress: [],
  lessonStars: {},
  lessonCompletionCount: {},
  onboardingDone: false,
  difficultyLevel: 'beginner',
  wrongAnswers: {},
  sessionLog: [],
}

function loadStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STORAGE
    const parsed = JSON.parse(raw)
    const merged = { ...DEFAULT_STORAGE, ...parsed }
    // Existing users who already have progress skip onboarding
    if (!parsed.onboardingDone && merged.lessonProgress.length > 0) {
      merged.onboardingDone = true
    }
    return merged
  } catch {
    return DEFAULT_STORAGE
  }
}

function saveStorage(data: AppStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // in-memory state continues working
  }
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AppStorage>(loadStorage)

  useEffect(() => {
    saveStorage(progress)
  }, [progress])

  function markAlphabetDone(id: string) {
    setProgress(prev => {
      if (prev.alphabetProgress.includes(id)) return prev
      return { ...prev, alphabetProgress: [...prev.alphabetProgress, id] }
    })
  }

  function markWordDone(id: string) {
    setProgress(prev => {
      if (prev.wordProgress.includes(id)) return prev
      return { ...prev, wordProgress: [...prev.wordProgress, id] }
    })
  }

  function markLessonDone(id: string, stars: 1 | 2 | 3) {
    setProgress(prev => {
      const prevStars = (prev.lessonStars[id] ?? 0) as 0 | 1 | 2 | 3
      const newStars = Math.max(prevStars, stars) as 1 | 2 | 3
      const prevCount = prev.lessonCompletionCount[id] ?? 0
      return {
        ...prev,
        lessonProgress: prev.lessonProgress.includes(id)
          ? prev.lessonProgress
          : [...prev.lessonProgress, id],
        lessonStars: { ...prev.lessonStars, [id]: newStars },
        lessonCompletionCount: { ...prev.lessonCompletionCount, [id]: prevCount + 1 },
      }
    })
  }

  function updateStreak() {
    setProgress(prev => ({
      ...prev,
      streak: calculateStreak(prev.lastStudiedDate, prev.streak),
      lastStudiedDate: getTodayString(),
    }))
  }

  function skipToSection(lessonIds: string[]) {
    setProgress(prev => {
      const newProgress = [...prev.lessonProgress]
      const newStars = { ...prev.lessonStars }
      const newCount = { ...prev.lessonCompletionCount }
      lessonIds.forEach(id => {
        if (!newProgress.includes(id)) newProgress.push(id)
        if (!newStars[id]) newStars[id] = 1
        newCount[id] = (newCount[id] ?? 0) + 1
      })
      return { ...prev, lessonProgress: newProgress, lessonStars: newStars, lessonCompletionCount: newCount }
    })
  }

  function setDifficulty(level: DifficultyLevel) {
    setProgress(prev => ({ ...prev, difficultyLevel: level, onboardingDone: true }))
  }

  function addWrongAnswer(id: string, kind: ChallengeKind, lessonId: string) {
    setProgress(prev => {
      const entry = prev.wrongAnswers[id]
      return {
        ...prev,
        wrongAnswers: {
          ...prev.wrongAnswers,
          [id]: {
            count: (entry?.count ?? 0) + 1,
            kind,
            lessonId,
            lastWrongAt: new Date().toISOString(),
          },
        },
      }
    })
  }

  function clearWrongAnswer(id: string) {
    setProgress(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed, ...rest } = prev.wrongAnswers
      return { ...prev, wrongAnswers: rest }
    })
  }

  function addSessionLog(lessonId: string, stars: 1 | 2 | 3) {
    setProgress(prev => {
      const entry: SessionLogEntry = { lessonId, date: new Date().toISOString(), stars }
      return { ...prev, sessionLog: [entry, ...prev.sessionLog].slice(0, 50) }
    })
  }

  function isPhraseUnlocked() {
    const wordLessonIds = [
      'fruit-1','fruit-2','animal-1','animal-2','animal-3',
      'color-1','color-2','body-1','body-2','food-1',
    ]
    return wordLessonIds.every(id => progress.lessonProgress.includes(id))
  }

  const totalXp = useMemo(() => calcXp(progress.lessonStars), [progress.lessonStars])
  const currentLevel = useMemo(() => calcLevel(totalXp), [totalXp])
  const xpToNextLevel = useMemo(() => calcXpToNext(totalXp), [totalXp])

  return (
    <AppContext.Provider value={{
      progress,
      markAlphabetDone,
      markWordDone,
      markLessonDone,
      updateStreak,
      isPhraseUnlocked,
      skipToSection,
      setDifficulty,
      addWrongAnswer,
      clearWrongAnswer,
      addSessionLog,
      totalXp,
      currentLevel,
      xpToNextLevel,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
