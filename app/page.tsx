import Link from 'next/link'
import { Stethoscope, MessageCircle, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const isProDevMode = process.env.NEXT_PUBLIC_PRO_DEV_MODE === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-teal-900 flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-3xl w-full text-center space-y-10 sm:space-y-12">
        {/* 로고 + 타이틀 */}
        <div className="space-y-4">
          <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <Stethoscope className="h-9 w-9 sm:h-11 sm:w-11 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            MediMentor AI
          </h1>
          <p className="text-blue-200/90 text-base sm:text-lg font-light tracking-wide">
            한국형 AI 의료 진료 지원 플랫폼
          </p>
        </div>

        {/* 두 가지 입구 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Care 카드 */}
          <Link
            href="/care/info"
            className="group relative bg-white rounded-3xl p-6 sm:p-7 text-left ring-1 ring-white/10 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100 mb-5">
              <MessageCircle className="h-6 w-6 text-emerald-700" strokeWidth={2} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 tracking-tight">
              MediMentor Care
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              일반 시민을 위한 1차 의료 안내
              <br />
              증상 입력 → 응급도 판단 → 병원 추천
            </p>
            <div className="mt-5 inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm group-hover:gap-2 transition-all">
              시작하기
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </Link>

          {/* Pro 카드 */}
          <Link
            href={isProDevMode ? '/dashboard' : '/verify'}
            className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-7 text-left ring-1 ring-gray-700/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:ring-amber-500/30 transition-all duration-300"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 mb-5">
              <Stethoscope className="h-6 w-6 text-amber-400" strokeWidth={2} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
              MediMentor Pro
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              면허 인증 의사를 위한 임상 지원
              <br />
              DDx · Red Flag · 처방 자문 · 멘토
            </p>
            <div className="mt-5 inline-flex items-center gap-1 text-amber-400 font-semibold text-sm group-hover:gap-2 transition-all">
              {isProDevMode ? '[개발 모드] 입장' : '의사 인증 후 입장'}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </div>
          </Link>
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
