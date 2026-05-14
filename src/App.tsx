import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Home } from './pages/Home'
import { AlphabetList } from './pages/AlphabetList'
import { WordList } from './pages/WordList'
import { StudySession } from './pages/StudySession'
import { LessonSession } from './pages/LessonSession'
import { UnitMap } from './pages/UnitMap'
import { Complete } from './pages/Complete'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/units" element={<UnitMap />} />
          <Route path="/lesson/:lessonId" element={<LessonSession />} />
          {/* 기존 routes 유지 (하위 호환) */}
          <Route path="/alphabet" element={<AlphabetList />} />
          <Route path="/alphabet/:id" element={<StudySession mode="alphabet" />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/:id" element={<StudySession mode="words" />} />
          <Route path="/complete" element={<Complete />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
