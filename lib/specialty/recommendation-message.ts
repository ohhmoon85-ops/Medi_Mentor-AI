/**
 * M3-3 안내자형 메시지 조립 (G-1 정책)
 *
 * 메시지 구조:
 * 1. triage_level별 긴급도 안내 문구
 * 2. primary → secondary(대안) 단계적 진료과 안내
 * 3. recommendation_reason (증상별 임상 근거 1문장)
 * 4. 카카오맵/네이버지도 외부 링크
 *
 * 준수 사항:
 * - 진단명 단정 표현 금지 (의료법 §27)
 * - 3인칭(isThirdPerson=true) 시 "환자분은" 접두어
 * - 마크다운 **bold** 로 주요 진료과 강조
 */

import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { SymptomMappingEntry } from './symptom-mapping-schema'
import type { RecommendationResult } from './recommendation-engine'
import { generateKakaoMapUrl, generateNaverMapUrl } from './external-map-link'

// ─── 입력 타입 ────────────────────────────────────────────────────

export interface EffectiveDemographics {
  isMinor: boolean
  pregnancy: boolean
  /** detectFamilyDemographics().isThirdPerson 결과 */
  isThirdPerson: boolean
}

// ─── 내부 헬퍼 ───────────────────────────────────────────────────

function ko(code: SpecialtyCode): string {
  return KOREAN_SPECIALTIES[code]?.ko ?? code
}

function altText(codes: SpecialtyCode[]): string {
  return codes.slice(0, 2).map(ko).join('·')
}

// ─── 공개 API ─────────────────────────────────────────────────────

/**
 * 추천 결과·증상 항목·인구학을 받아 환자용 안내 메시지를 반환한다.
 *
 * @param rec resolveRecommendation() 결과
 * @param symptom 매칭된 SymptomMappingEntry (미매칭 시 null)
 * @param demo 유효 인구학 정보
 */
export function assembleMessage(
  rec: RecommendationResult,
  symptom: SymptomMappingEntry | null,
  demo: EffectiveDemographics,
): string {
  const { effectiveSpecialty, effectiveTriageLevel, alternativeSpecialties, isEmergency } = rec
  const primaryKo = ko(effectiveSpecialty)
  const alts = alternativeSpecialties.length > 0 ? altText(alternativeSpecialties) : ''
  const reason = symptom?.recommendation_reason ?? ''
  const kakao = generateKakaoMapUrl(effectiveSpecialty, isEmergency)
  const naver = generateNaverMapUrl(effectiveSpecialty, isEmergency)
  const searchTarget = isEmergency ? '응급실' : primaryKo
  const mapLine = `\n가까운 ${searchTarget} 찾기: [카카오맵](${kakao}) | [네이버지도](${naver})`

  // ── Critical: 즉시 응급 ────────────────────────────────────────
  if (effectiveTriageLevel === 'critical') {
    return `지금 즉시 119에 신고하거나 **응급실**로 이동하세요.${mapLine}`
  }

  // ── Urgent: 당일 방문 권장 ────────────────────────────────────
  if (effectiveTriageLevel === 'urgent') {
    const altPart = alts ? ` 또는 ${alts}` : ''
    return [
      `오늘 안에 **${primaryKo}**${altPart}에 방문하시는 것을 권장합니다.`,
      reason,
      mapLine,
    ].filter(Boolean).join('\n')
  }

  // ── Night/Weekend: 야간·주말 응급실 안내 ─────────────────────
  if (effectiveTriageLevel === 'night_weekend') {
    const altPart = alts ? ` 또는 ${alts}` : ''
    return [
      `평일에는 **${primaryKo}**${altPart}에 방문하시고, 야간·주말에는 응급실을 이용하세요.`,
      reason,
      mapLine,
    ].filter(Boolean).join('\n')
  }

  // ── Outpatient / Self-care: 안내자형 (G-1 정책) ───────────────
  const subjectPrefix = demo.isThirdPerson ? '환자분은 ' : ''
  const specialtyLine = alts
    ? `${subjectPrefix}**${primaryKo}**에 가시거나, ${alts}을 방문하셔도 됩니다.`
    : `${subjectPrefix}**${primaryKo}**에 방문하세요.`

  return [specialtyLine, reason, mapLine].filter(Boolean).join('\n')
}
