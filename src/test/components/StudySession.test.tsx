import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { StudySession } from '../../pages/StudySession'

function renderSession(path: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/alphabet/:id" element={<StudySession mode="alphabet" />} />
          <Route path="/words/:id" element={<StudySession mode="words" />} />
          <Route path="/complete" element={<div>complete</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('StudySession', () => {
  it('알파벳 A: Step 1 FlashCard 렌더링', () => {
    renderSession('/alphabet/A')
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('사과')).toBeInTheDocument()
  })

  it('"다음 ▶" 클릭 시 Step 2로 이동', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByText('다음 ▶'))
    expect(screen.getByText(/퀴즈|맞춰|고르|듣|문장/)).toBeInTheDocument()
  })

  it('X 버튼 클릭 시 나가기 확인 다이얼로그 표시', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByLabelText('학습 나가기'))
    expect(screen.getByText('학습을 나가시겠어요?')).toBeInTheDocument()
    expect(screen.getByText('계속 학습')).toBeInTheDocument()
    expect(screen.getByText('나가기')).toBeInTheDocument()
  })

  it('다이얼로그 "계속 학습" 클릭 시 다이얼로그 닫힘', () => {
    renderSession('/alphabet/A')
    fireEvent.click(screen.getByLabelText('학습 나가기'))
    fireEvent.click(screen.getByText('계속 학습'))
    expect(screen.queryByText('학습을 나가시겠어요?')).not.toBeInTheDocument()
  })

  it('존재하지 않는 id: "항목을 찾을 수 없습니다" 표시', () => {
    renderSession('/alphabet/NOTEXIST')
    expect(screen.getByText('항목을 찾을 수 없습니다')).toBeInTheDocument()
  })
})
