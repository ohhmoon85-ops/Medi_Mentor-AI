import type { Metadata } from 'next'
import { DisclaimerModal } from '@/components/care/disclaimer-modal'
import { SafetyFooter } from '@/components/care/safety-footer'

export const metadata: Metadata = {
  title: '닥터홈 — 1차 의료 안내',
  description: '증상을 입력하면 응급도와 적합한 진료과를 안내해 드립니다.',
}

export default function CareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 최초 진입 안내 모달 (G3-2 LAUNCH-0 직진 안전망) */}
      <DisclaimerModal />

      {/* 헤더 */}
      <header className="bg-[#003876] text-white px-4 py-3 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">닥터홈</h1>
            <p className="text-xs text-blue-200">의학 정보 안내 서비스</p>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      {/* 영구 안전 안내 푸터 (G3-2 SafetyFooter — 동의 철회·재확인 포함) */}
      <SafetyFooter />
    </div>
  )
}
