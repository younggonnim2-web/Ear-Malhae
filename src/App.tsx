import { BrowserRouter, Routes, Route, useParams, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { LearningPath } from './pages/LearningPath'
import { SectionPath } from './pages/SectionPath'
import { AlphabetList } from './pages/AlphabetList'
import { WordList } from './pages/WordList'
import { StudySession } from './pages/StudySession'
import { LessonSession } from './pages/LessonSession'
import { UnitMap } from './pages/UnitMap'
import { Complete } from './pages/Complete'
import { JumpTest } from './pages/JumpTest'
import { Onboarding } from './pages/Onboarding'
import { History } from './pages/History'
import { ReviewSession } from './pages/ReviewSession'

// lessonId 또는 completion 파라미터가 바뀌면 LessonSession을 재마운트
function LessonRoute() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [searchParams] = useSearchParams()
  const completion = searchParams.get('completion')
  return <LessonSession key={`${lessonId}-${completion ?? 'live'}`} />
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LearningPath />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/units" element={<UnitMap />} />
          <Route path="/section/:sectionId" element={<SectionPath />} />
          <Route path="/lesson/:lessonId" element={<LessonRoute />} />
          {/* 기존 routes 유지 (하위 호환) */}
          <Route path="/alphabet" element={<AlphabetList />} />
          <Route path="/alphabet/:id" element={<StudySession mode="alphabet" />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/:id" element={<StudySession mode="words" />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/jump/:sectionId" element={<JumpTest />} />
          <Route path="/history" element={<History />} />
          <Route path="/review" element={<ReviewSession />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
