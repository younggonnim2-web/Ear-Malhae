import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppStorage, AppContextValue } from '../types'
import { calculateStreak, getTodayString } from '../utils/streak'

const STORAGE_KEY = 'easy-english-progress'

const DEFAULT_STORAGE: AppStorage = {
  streak: 0,
  lastStudiedDate: '',
  alphabetProgress: [],
  wordProgress: [],
  lessonProgress: [],
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

  function markLessonDone(id: string) {
    setProgress(prev => {
      if (prev.lessonProgress.includes(id)) return prev
      return { ...prev, lessonProgress: [...prev.lessonProgress, id] }
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
    return progress.wordProgress.length >= 50
  }

  return (
    <AppContext.Provider value={{ progress, markAlphabetDone, markWordDone, markLessonDone, updateStreak, isPhraseUnlocked }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
