import Link from 'next/link'

export default function CarePage() {
  return (
    <div className="space-y-6">
      {/* 인사말 */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800">
          안녕하세요 👋
        </h2>
        <p className="text-gray-500 mt-2 text-base">
          어디가 불편하신가요?<br />
          증상을 말씀해 주시면 도움이 될 정보를 안내해 드릴게요.
        </p>
      </div>

      {/* 주요 기능 버튼 */}
      <div className="grid grid-cols-1 gap-4">
        <Link
          href="/care/chat"
          className="bg-[#003876] text-white rounded-2xl p-5 flex items-center gap-4 shadow-md hover:bg-blue-800 transition-colors"
        >
          <span className="text-4xl">💬</span>
          <div>
            <div className="font-bold text-lg">증상 입력하기</div>
            <div className="text-sm text-blue-200">AI와 대화로 증상을 분석합니다</div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/care/hospitals"
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow border border-gray-100 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">🗺️</span>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">근처 병원 찾기</div>
              <div className="text-xs text-gray-400">위치 기반 추천</div>
            </div>
          </Link>

          <Link
            href="/care/self-care"
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow border border-gray-100 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">🌿</span>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">자가관리 가이드</div>
              <div className="text-xs text-gray-400">가벼운 증상 관리법</div>
            </div>
          </Link>

          <Link
            href="/care/prep-checklist"
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow border border-gray-100 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">📋</span>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">병원 방문 준비</div>
              <div className="text-xs text-gray-400">가져갈 서류 체크</div>
            </div>
          </Link>

          <Link
            href="/care/diary"
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow border border-gray-100 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">📔</span>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">증상 일기</div>
              <div className="text-xs text-gray-400">증상 변화 기록</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 응급 안내 */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl">🔴</span>
        <div>
          <div className="font-bold text-red-700">응급 상황이신가요?</div>
          <p className="text-sm text-red-600 mt-1">
            의식 소실, 호흡 곤란, 심한 흉통이 있으면
          </p>
          <a
            href="tel:119"
            className="inline-block mt-2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-red-700"
          >
            📞 119 바로 전화
          </a>
        </div>
      </div>
    </div>
  )
}
