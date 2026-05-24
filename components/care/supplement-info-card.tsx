/**
 * G5-4 결과 화면 건강기능식품 안내 카드
 *
 * - 결론 메시지 (응급도 분류 완료) + 매칭 supplement 있을 때만 마운트
 * - lookup 매칭 우선순위: symptomKey (LLM 메타) → 결론 본문 한글 라벨/동의어
 * - "효능 보증 금지" 톤 — G4-1 §응답 원칙 정합
 * - 디자인: AnswerSourceFooter 인접 위치, 옅은 회색 박스 + 주황 강조
 *   2단계 G3-3~6 ui-tokens v2 정착 후 재정비 예정
 */

import {
  findSupplementsBySymptom,
  findSupplementsByKey,
  type SymptomSupplementMapping,
} from '@/lib/supplements'

export interface SupplementInfoCardProps {
  /** LLM 메타필드. 있으면 이걸 우선 사용 */
  symptomKey?: string
  /** 결론 메시지 본문. symptomKey 없을 때 폴백 매칭 소스 */
  conclusionText?: string
  /** 표시 성분 최대 개수 (기본 4) */
  maxDisplay?: number
}

export function SupplementInfoCard({
  symptomKey,
  conclusionText,
  maxDisplay = 4,
}: SupplementInfoCardProps) {
  let mapping: SymptomSupplementMapping | null = null
  if (symptomKey) mapping = findSupplementsByKey(symptomKey)
  if (!mapping && conclusionText) mapping = findSupplementsBySymptom(conclusionText)
  if (!mapping || mapping.supplements.length === 0) return null

  const shown = mapping.supplements.slice(0, maxDisplay)

  return (
    <div className="mt-2 border-t border-amber-200 pt-3 text-xs sm:text-[13px] leading-relaxed text-gray-700 bg-amber-50 rounded-b-2xl px-3 sm:px-4 py-3 space-y-2">
      <p className="font-semibold text-amber-900 flex items-center gap-1">
        💊 관련 건강기능식품 정보 <span className="text-amber-700 font-normal">(참고용)</span>
      </p>
      <ul className="space-y-1 list-disc list-inside marker:text-amber-400">
        {shown.map((s) => (
          <li key={s.id}>
            <span className="font-medium text-gray-900">{s.name}</span>{' '}
            <span className="text-gray-600">— {s.knownFor.join(', ')}</span>
            {s.warningTags && s.warningTags.length > 0 && (
              <span className="text-amber-800"> · ⚠️ {s.warningTags.join(', ')}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-amber-900 pt-1 border-t border-amber-200 mt-2">
        ⚠️ 이러한 건강기능식품들이 관련 증상·기능과 함께 일반적으로 알려져 있습니다.
        효능을 의학적으로 보증하지 않으며, 복용 전 의사·약사의 상담을 권장합니다.
        임산부·만성질환자·약물 복용자는 특히 주의가 필요합니다.
      </p>
    </div>
  )
}
