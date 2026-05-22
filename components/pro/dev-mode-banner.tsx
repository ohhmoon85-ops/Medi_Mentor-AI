'use client'

/**
 * Pro 개발 모드 배너 (의사 인증 게이트 임시 우회 안내)
 *
 * - NEXT_PUBLIC_PRO_DEV_MODE === 'true' 일 때만 마운트
 * - app/(pro)/layout.tsx 상단 sticky 표시 (모든 Pro 페이지 영구 노출)
 * - 출시 시점 환경변수 한 줄(false 또는 unset)로 즉시 차단 가능
 */
export function DevModeBanner() {
  if (process.env.NEXT_PUBLIC_PRO_DEV_MODE !== 'true') return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="sticky top-0 z-[60] bg-amber-400 text-black border-b-2 border-amber-700 px-4 py-2.5 shadow-md"
    >
      <div className="max-w-5xl mx-auto text-center">
        <p className="flex items-center justify-center gap-2 font-bold text-sm sm:text-base">
          <span aria-hidden="true">⚠️</span>
          <span>개발 모드 — 의사 인증 우회 중</span>
        </p>
        <p className="text-xs sm:text-sm font-medium text-black/80 leading-snug mt-0.5">
          본 콘텐츠는 의료인 전용입니다. 일반 사용자는 의학적 판단·복용 결정에 사용하지 마십시오.
          출시 시점에 의사 인증이 적용됩니다.
        </p>
      </div>
    </div>
  )
}
