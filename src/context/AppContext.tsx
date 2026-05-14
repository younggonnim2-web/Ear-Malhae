import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import type { AppStorage, AppContextValue } from '../types'
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
}

function loadStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_STORAGE, ...JSON.parse(raw) } : DEFAULT_STORAGE
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
      return {
        ...prev,
        lessonProgress: prev.lessonProgress.includes(id)
          ? prev.lessonProgress
          : [...prev.lessonProgress, id],
        lessonStars: { ...prev.lessonStars, [id]: newStars },
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
