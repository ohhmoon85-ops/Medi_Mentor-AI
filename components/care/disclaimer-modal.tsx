'use client'

/**
 * G3-2 일반 공개용 안전 안내 모달 (LAUNCH-0 직진 단계)
 *
 * - 최초 방문 시 1회 표시
 * - localStorage 키: medimentor_care_disclaimer_acked_v1 (버전 키)
 * - 안내 4건 (체크박스 X, 단일 확인 버튼)
 * - 의학적 진단 부정 / 응급 119 / 의료기관 방문 권유 / 책임 분기
 * - "확인하고 시작하기" 클릭 시 localStorage 저장 + 모달 닫힘
 * - 모달 표시 중 body 스크롤 차단 + ESC 키로 닫기 가능
 * - 디자인: 흰 배경 + teal 강조 + 기본 그림자 (ui-tokens v2는 2단계 G3-3에서 정착)
 */

import { useEffect, useState } from 'react'

export const DISCLAIMER_STORAGE_KEY = 'medimentor_care_disclaimer_acked_v1'

export function DisclaimerModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const acked = window.localStorage.getItem(DISCLAIMER_STORAGE_KEY)
    if (!acked) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') acknowledge()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function acknowledge() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, '1')
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
        <h2
          id="disclaimer-title"
          className="text-xl sm:text-2xl font-bold text-teal-700 text-center"
        >
          🏥 서비스 이용 전 안내
        </h2>

        <ul className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-teal-700 font-bold flex-shrink-0">·</span>
            <span>본 서비스는 의학적 진단이 아닙니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-700 font-bold flex-shrink-0">·</span>
            <span>응급 상황 시 즉시 119에 신고하세요.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-700 font-bold flex-shrink-0">·</span>
            <span>정확한 진단은 의료기관 방문이 필요합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-700 font-bold flex-shrink-0">·</span>
            <span>본 서비스 이용으로 발생하는 결과에 대한 최종 판단·책임은 사용자에게 있습니다.</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={acknowledge}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-2xl py-3 transition-colors"
        >
          확인하고 시작하기
        </button>
      </div>
    </div>
  )
}
