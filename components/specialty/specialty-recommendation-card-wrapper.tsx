'use client'

/**
 * C1 SpecialtyRecommendationCard Wrapper
 *
 * 설계 원칙 (D-1 wrapper 방식: 인계 v6 8.3 + L-4):
 * - specialty-recommendation-card.tsx 는 import만 — 변경 절대 금지 (8.3)
 * - "방문 전 준비하기" 버튼을 카드 외부 하단에 배치 (카드 내부 변경 금지)
 * - isCritical=true 또는 recommendation.effectiveTriageLevel==='critical' → 버튼 미노출 (A-3)
 * - night_weekend 포함 비critical 시나리오 → 버튼 노출
 * - M6 ui-tokens seniorMode 분기 의무 (getCareTouchTarget, getCareTitleClasses)
 * - 1.6 정책: new Date() / Date.now() / 위치·영업시간 코드 금지
 */

import Link from 'next/link'
import {
  SpecialtyRecommendationCard,
  type SpecialtyRecommendationCardProps,
} from './specialty-recommendation-card'
import {
  getCareTouchTarget,
  CareCardTokens,
} from '@/lib/care/ui-tokens'

// ─── Props ────────────────────────────────────────────────────────

export interface SpecialtyRecommendationCardWrapperProps
  extends SpecialtyRecommendationCardProps {
  /**
   * 명시적 응급 플래그 (A-3 정책).
   * 미전달 시 recommendation.effectiveTriageLevel === 'critical' 로 자동 판단.
   */
  isCritical?: boolean
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────

export function SpecialtyRecommendationCardWrapper({
  recommendation,
  onMapClick,
  seniorMode = false,
  isCritical,
}: SpecialtyRecommendationCardWrapperProps) {
  // A-3: critical 시 방문 준비 버튼 미노출
  const derivedCritical =
    isCritical ?? recommendation.effectiveTriageLevel === 'critical'

  const showPrepButton = !derivedCritical

  const visitPrepUrl =
    `/care/visit-prep` +
    `?specialty=${recommendation.effectiveSpecialty}` +
    `&triage=${recommendation.effectiveTriageLevel}` +
    `&seniorMode=${seniorMode}`

  return (
    <div className="space-y-2">
      {/* M3-4 보호 카드 — import만, 변경 없음 */}
      <SpecialtyRecommendationCard
        recommendation={recommendation}
        onMapClick={onMapClick}
        seniorMode={seniorMode}
      />

      {/* 방문 전 준비 버튼 — 카드 외부 하단 (A-3: critical 시 미노출) */}
      {showPrepButton && (
        <Link
          href={visitPrepUrl}
          className={`
            flex items-center justify-center gap-2 w-full
            border-2 border-teal-300 text-teal-700 font-semibold rounded-xl
            bg-teal-50 hover:bg-teal-100 hover:border-teal-400 transition-colors
            ${getCareTouchTarget(seniorMode)}
            ${CareCardTokens.typography.body}
            ${seniorMode ? 'py-4 text-xl' : 'py-3'}
          `}
        >
          📋 방문 전 준비하기
        </Link>
      )}
    </div>
  )
}
