import Link from 'next/link'
import { Stethoscope, ChevronRight, CheckSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-3xl w-full text-center space-y-10 sm:space-y-12">
        {/* 로고 + 타이틀 */}
        <div className="space-y-4">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <Stethoscope className="h-9 w-9 sm:h-11 sm:w-11 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            닥터홈
          </h1>
          <p className="text-blue-200/90 text-base sm:text-lg font-light tracking-wide">
            우리집 1차 의료 안내 + 건강기능식품 가이드
          </p>
        </div>

        {/* 단일 진입점 — 체크리스트가 기본, 결과 화면에서 자세한 상담 옵션 제공 */}
        <div className="max-w-md mx-auto">
          <Link
            href="/care/info"
            className="group relative block bg-white rounded-3xl p-6 sm:p-7 text-left ring-2 ring-emerald-400/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 mb-5">
              <CheckSquare className="h-6 w-6 text-emerald-700" strokeWidth={2} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">
              증상 안내 시작
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              내 정보 입력 → 부위·증상 체크 →
              <br />
              응급도·진료과·건강기능식품 안내
            </p>
            <div className="mt-5 inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm group-hover:gap-2 transition-all">
              시작하기 (약 1분)
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </Link>
          <p className="mt-3 text-xs text-blue-200/70 text-center">
            결과 화면에서 자세한 대화 상담 옵션을 제공합니다.
          </p>
        </div>

        {/* 하단 면책 */}
        <p className="text-blue-200/70 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
          본 서비스는 의학적 진단이 아닌 건강 정보 제공 및 진료 안내 서비스입니다.
          <br />
          응급 상황 시 즉시 119에 신고하세요.
        </p>
      </div>
    </div>
  )
}
