import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MediMentor Pro - 의사용',
  description: '면허 인증 의사를 위한 AI 임상 의사결정 지원 도구',
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚕️</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">MediMentor Pro</h1>
              <p className="text-xs text-gray-400">의사 전용 임상 지원 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ← 환자용 Care
            </a>
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
              의사 전용
            </span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Pro 면책 고지 */}
      <footer className="border-t border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-400">
        본 도구는 의사결정 보조 도구입니다. 최종 진단·처방 책임은 의료인 본인에게 있습니다.
        환자에게 본 화면을 직접 보여주지 마세요.
      </footer>
    </div>
  )
}
