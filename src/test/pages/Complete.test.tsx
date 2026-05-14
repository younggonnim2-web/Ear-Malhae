import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../../context/AppContext'
import { Complete } from '../../pages/Complete'

beforeEach(() => {
  localStorage.clear()
})

function renderComplete(state?: { stars: 1 | 2 | 3; xpGained: number }) {
  const initialEntries = state
    ? [{ pathname: '/complete', state }]
    : ['/complete']
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/complete" element={<Complete />} />
          <Route path="/" element={<div>홈</div>} />
        </Routes>
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Complete — state 없이 직접 접근', () => {
  it('별 카드가 렌더링되지 않음', () => {
    renderComplete()
    expect(screen.queryByTestId('star-card')).not.toBeInTheDocument()
  })

  it('홈으로 버튼 존재', () => {
    renderComplete()
    expect(screen.getByText('홈으로')).toBeInTheDocument()
  })

  it('레벨 바는 항상 렌더링', () => {
    renderComplete()
    expect(screen.getByTestId('level-bar')).toBeInTheDocument()
  })
})

describe('Complete — 3성 state로 접근', () => {
  it('별 3개 모두 채워진 별(★) 렌더링', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    const starCard = screen.getByTestId('star-card')
    expect(starCard.textContent).toContain('★★★')
  })

  it('+30 XP 텍스트 표시', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    expect(screen.getByText('+30 XP')).toBeInTheDocument()
  })

  it('레벨 바 렌더링', () => {
    renderComplete({ stars: 3, xpGained: 30 })
    expect(screen.getByTestId('level-bar')).toBeInTheDocument()
  })
})

describe('Complete — 1성 state로 접근', () => {
  it('별 1개 채워진 별, 2개 빈 별(☆) 렌더링', () => {
    renderComplete({ stars: 1, xpGained: 10 })
    const starCard = screen.getByTestId('star-card')
    expect(starCard.textContent).toContain('★☆☆')
  })

  it('+10 XP 텍스트 표시', () => {
    renderComplete({ stars: 1, xpGained: 10 })
    expect(screen.getByText('+10 XP')).toBeInTheDocument()
  })
})
