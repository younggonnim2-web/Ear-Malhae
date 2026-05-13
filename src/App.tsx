import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Home } from './pages/Home'
import { AlphabetList } from './pages/AlphabetList'
import { WordList } from './pages/WordList'
import { StudySession } from './pages/StudySession'
import { Complete } from './pages/Complete'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
