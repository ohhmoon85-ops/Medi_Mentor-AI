import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 로고 */}
        <div>
          <div className="text-7xl mb-4">🏥</div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            MediMentor AI
          </h1>
          <p className="text-blue-200 text-lg mt-2">
            한국형 AI 의료 진료 지원 플랫폼
          </p>
        </div>

        {/* 두 가지 입구 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            href="/chat"
            className="bg-white rounded-3xl p-7 text-left hover:shadow-2xl transition-all hover:-translate-y-1 group"
          >
            <div className="text-4xl mb-3">💬</div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#003876]">
              MediMentor Care
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              일반 시민을 위한 1차 의료 안내<br />
              증상 입력 → 응급도 판단 → 병원 추천
            </p>
            <div className="mt-4 text-[#10B981] font-semibold text-sm">
              시작하기 →
            </div>
          </Link>

          <Link
            href="/verify"
            className="bg-gray-900 border border-gray-700 rounded-3xl p-7 text-left hover:shadow-2xl transition-all hover:-translate-y-1 group"
          >
            <div className="text-4xl mb-3">⚕️</div>
            <h2 className="text-xl font-bold text-white group-hover:text-amber-400">
              MediMentor Pro
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              면허 인증 의사를 위한 임상 지원<br />
              DDx · Red Flag · 처방 자문 · 멘토
            </p>
            <div className="mt-4 text-amber-400 font-semibold text-sm">
              의사 인증 후 입장 →
            </div>
          </Link>
        </div>

        {/* 하단 면책 */}
        <p className="text-blue-300 text-xs">
          본 서비스는 의학적 진단이 아닌 건강 정보 제공 및 진료 안내 서비스입니다.<br />
          응급 상황 시 즉시 119에 신고하세요.
        </p>
      </div>
    </div>
  )
}
