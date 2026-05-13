import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function Complete() {
  const navigate = useNavigate()
  const { progress } = useApp()

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center">
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">오늘 학습 완료!</h2>
      <p className="text-gray-500 mb-6">정말 잘했어요 👏</p>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full mb-8">
        <div className="text-5xl font-bold text-orange-500">🔥 {progress.streak}일</div>
        <div className="text-gray-500 mt-1">연속 학습 중</div>
      </div>
      <button
        onClick={() => navigate('/')}
        className="w-full py-5 bg-primary text-white text-2xl font-bold rounded-2xl"
      >
        홈으로
      </button>
    </div>
  )
}
