import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { Home } from '../../pages/Home'

function renderHome() {
  return render(
    <AppProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Home', () => {
  it('제목과 2개 진도 카드 렌더링', () => {
    renderHome()
    expect(screen.getByText('Easy English')).toBeInTheDocument()
    expect(screen.getByText('전체 레슨')).toBeInTheDocument()
    expect(screen.getByText('회화')).toBeInTheDocument()
  })

  it('"오늘 학습 시작" 버튼 존재', () => {
    renderHome()
    expect(screen.getByText('오늘 학습 시작 ▶')).toBeInTheDocument()
  })

  it('회화 카드는 잠금 상태 (단어 50개 미완료)', () => {
    renderHome()
    const lockIcon = screen.getByText('🔒')
    expect(lockIcon).toBeInTheDocument()
  })
})
