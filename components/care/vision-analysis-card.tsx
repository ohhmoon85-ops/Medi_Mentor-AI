/**
 * D1-4 Vision 분석 결과 카드
 *
 * 마운트 규칙:
 * - 결론 turn (ktasLevel 있는 turn) + visionAnalysis 있는 메시지에만
 * - unanalyzable=true → 단독 카드 ("판단 어려움, 병원 방문 권고")
 * - specialtyRecommendation null + 매칭 없음 → 카드 미렌더
 * - 디자인: SupplementInfoCard 다음 위치, 푸른 강조 (참고 정보 톤)
 */

import { KOREAN_SPECIALTIES, type SpecialtyCode } from '@/lib/constants/specialties'
import { BODY_REGIONS, type VisionAnalysisResult } from '@/lib/vision'

export interface VisionAnalysisCardProps {
  result?: VisionAnalysisResult
}

const CONFIDENCE_BADGE: Record<'low' | 'medium' | 'high', { label: string; cls: string }> = {
  high:   { label: '신뢰도: 높음',  cls: 'bg-blue-100 text-blue-800' },
  medium: { label: '신뢰도: 중간',  cls: 'bg-amber-100 text-amber-800' },
  low:    { label: '신뢰도: 낮음',  cls: 'bg-gray-100 text-gray-700' },
}

export function VisionAnalysisCard({ result }: VisionAnalysisCardProps) {
  if (!result) return null

  const { combinedEstimate, specialtyRecommendation, ktasAdjustment } = result
  const region = BODY_REGIONS[combinedEstimate.bodyRegion]

  if (combinedEstimate.unanalyzable) {
    return (
      <div className="mt-2 border-t border-blue-200 pt-3 text-xs sm:text-[13px] leading-relaxed text-blue-900 bg-blue-50 rounded-b-2xl px-3 sm:px-4 py-3 space-y-2">
        <p className="font-semibold flex items-center gap-1">
          📷 사진 분석 (참고용)
        </p>
        <p>
          사진으로는 판단이 어렵습니다. 정확한 안내를 위해 의료기관 방문을 권고합니다.
        </p>
        <p className="text-blue-800 text-xs pt-1 border-t border-blue-200 mt-2">
          ⚠️ 본 안내는 추정이며 의학적 진단이 아닙니다.
        </p>
      </div>
    )
  }

  const conditions = combinedEstimate.estimatedConditions.slice(0, 3)
  const specialtyLabel =
    specialtyRecommendation && (specialtyRecommendation as SpecialtyCode) in KOREAN_SPECIALTIES
      ? KOREAN_SPECIALTIES[specialtyRecommendation as SpecialtyCode].ko
      : null
  const conf = CONFIDENCE_BADGE[combinedEstimate.confidence]

  return (
    <div className="mt-2 border-t border-blue-200 pt-3 text-xs sm:text-[13px] leading-relaxed text-gray-700 bg-blue-50 rounded-b-2xl px-3 sm:px-4 py-3 space-y-2">
      <p className="font-semibold text-blue-900 flex items-center gap-2">
        📷 사진 분석 — {region.label}
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${conf.cls}`}>{conf.label}</span>
      </p>

      {conditions.length > 0 && (
        <ul className="space-y-1 list-disc list-inside marker:text-blue-400">
          {conditions.map((c, i) => (
            <li key={i}>
              <span className="text-gray-800">{c}</span>
            </li>
          ))}
        </ul>
      )}

      {combinedEstimate.rationale && (
        <p className="text-gray-600 italic">— {combinedEstimate.rationale}</p>
      )}

      {specialtyLabel && (
        <p>
          <span className="font-medium text-gray-800">권장 진료과:</span>{' '}
          <span className="text-blue-800">{specialtyLabel}</span>
        </p>
      )}

      {ktasAdjustment && (
        <p className="text-amber-900 bg-amber-50 px-2 py-1 rounded">
          ⚠️ 사진 단서 응급도 보정: L{ktasAdjustment.level} ({ktasAdjustment.reason})
        </p>
      )}

      <p className="text-blue-900 text-xs pt-1 border-t border-blue-200 mt-2">
        ⚠️ 본 분석은 추정이며 의학적 진단이 아닙니다. 자세한 진단은 의료기관 방문이 필요합니다.
      </p>
    </div>
  )
}
