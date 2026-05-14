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
  it('제목과 섹션 카드 렌더링', () => {
    renderHome()
    expect(screen.getByText('Easy English')).toBeInTheDocument()
    expect(screen.getByText('알파벳')).toBeInTheDocument()
    expect(screen.getByText('단어')).toBeInTheDocument()
  })

  it('알파벳 섹션 시작하기 버튼 존재', () => {
    renderHome()
    const buttons = screen.getAllByText('시작하기 ▶')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('학습 맵 보기 버튼 존재', () => {
    renderHome()
    expect(screen.getByText('학습 맵 보기')).toBeInTheDocument()
  })
})
