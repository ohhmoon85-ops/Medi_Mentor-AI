import type { Metadata } from 'next'
import { Disclaimer } from '@/components/ui/disclaimer'

export const metadata: Metadata = {
  title: 'MediMentor Care - 1차 의료 안내',
  description: '증상을 입력하면 응급도와 적합한 진료과를 안내해 드립니다.',
}

export default function CareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-[#003876] text-white px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">MediMentor Care</h1>
              <p className="text-xs text-blue-200">의학 정보 안내 서비스</p>
            </div>
          </div>
          <a
            href="/pro/verify"
            className="text-xs bg-blue-700 hover:bg-blue-600 rounded-full px-3 py-1.5 transition-colors"
          >
            의사용 Pro →
          </a>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* 하단 면책 고지 (고정) */}
      <Disclaimer />
    </div>
  )
}
