'use client'

/**
 * G3-2 일반 공개용 안전 안내 푸터 (LAUNCH-0 직진 단계)
 *
 * - 모든 Care 페이지 최하단에 영구 표시
 * - "[동의 철회·재확인]" 클릭 시 localStorage 키 제거 + 페이지 새로고침
 *   → DisclaimerModal 이 다시 표시됨
 * - 디자인: sticky bottom 기본 톤 (ui-tokens v2는 2단계 G3-3에서 정착)
 */

import { DISCLAIMER_STORAGE_KEY } from './disclaimer-modal'
import { USER_INFO_STORAGE_KEY } from './user-info-form'

export function SafetyFooter() {
  function resetDisclaimer() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(DISCLAIMER_STORAGE_KEY)
    window.location.reload()
  }

  function resetUserInfo() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(USER_INFO_STORAGE_KEY)
    window.location.href = '/care/info'
  }

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-xs sm:text-sm text-gray-600 px-4 py-3 text-center leading-relaxed space-x-2">
      <span>본 서비스는 의학적 진단이 아닌 건강 정보 안내 서비스입니다. </span>
      <span>응급 상황 시 즉시 119에 신고하세요. </span>
      <button
        type="button"
        onClick={resetDisclaimer}
        className="text-teal-700 hover:text-teal-800 underline underline-offset-2 font-medium"
        aria-label="안전 안내 동의 철회 또는 재확인"
      >
        [동의 철회·재확인]
      </button>
      <button
        type="button"
        onClick={resetUserInfo}
        className="text-teal-700 hover:text-teal-800 underline underline-offset-2 font-medium"
        aria-label="내 정보 수정 또는 삭제"
      >
        [내 정보 수정·삭제]
      </button>
    </footer>
  )
}
