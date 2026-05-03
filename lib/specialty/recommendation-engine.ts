/**
 * M3-3 추천 우선순위 로직
 *
 * 5-분기 결정 트리 (v4 §5 우선순위 1):
 * 1. red_flag classifier acuity=1 → EM 강제 라우팅 (A-3 정책)
 * 2. capturedDemographics.isMinor=true → pediatric_specialty 우선
 * 3. capturedDemographics.pregnancy=true → obstetric_specialty 우선
 * 4. red_flag_category 매칭 → triage_level ≥ urgent 상향
 * 5. primary → secondary → tertiary 안내자형 (G-1 정책)
 *
 * 의존 관계:
 * - lib/specialty/symptom-mapping-schema.ts (SymptomMappingEntry, TriageLevel)
 * - lib/safety/red-flag-classifier.ts (RedFlagResult, DetectRedFlagsResult)
 * - lib/constants/specialties.ts (SpecialtyCode)
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { SymptomMappingEntry, TriageLevel } from './symptom-mapping-schema'
import type { RedFlagResult, DetectRedFlagsResult } from '@/lib/safety/red-flag-classifier'
import { callLLMFallback } from './llm-fallback'

// ─── 입출력 타입 ──────────────────────────────────────────────────

export interface CapturedDemographicsInput {
  pregnancy: boolean
  isMinor: boolean
  age: number | null
}

export interface RecommendationInput {
  /** 증상 사전 매칭 결과 (미매칭 시 null) */
  matchedEntry: SymptomMappingEntry | null
  capturedDemographics: CapturedDemographicsInput
  /** classifyRedFlags() 결과 */
  redFlagClassify: RedFlagResult
  /** detectRedFlags() 결과 (호출하지 않은 경우 null) */
  redFlagDetect: DetectRedFlagsResult | null
  /** M3-4: LLM fallback에 전달할 원본 사용자 입력 (옵션) */
  userInput?: string
}

export interface RecommendationResult {
  /** 최종 유효 추천 진료과 */
  effectiveSpecialty: SpecialtyCode
  /** 최종 트리아지 레벨 (분기 4 상향 반영) */
  effectiveTriageLevel: TriageLevel
  /** 대안 진료과 목록 (secondary + tertiary, 최대 3개) */
  alternativeSpecialties: SpecialtyCode[]
  /** 응급 플래그 — critical/urgent 또는 acuity=2 시 true */
  isEmergency: boolean
  /** 분기 추론 근거 (디버깅용) */
  reasoning: string[]
  /** M3-4: LLM fallback 결과임을 UI에 표시 */
  isLLMFallback?: boolean
  /** M3-4: LLM이 생성한 추천 이유 또는 symptom의 recommendation_reason */
  recommendation_reason?: string
  /** M3-4: LLM 응답 신뢰도 */
  confidence?: 'high' | 'medium' | 'low'
}

// ─── 트리아지 순위 ────────────────────────────────────────────────

const TRIAGE_RANK: Record<TriageLevel, number> = {
  critical: 5,
  urgent: 4,
  night_weekend: 3,
  outpatient: 2,
  self_care: 1,
}

function upgradeTriage(current: TriageLevel, floor: TriageLevel): TriageLevel {
  return TRIAGE_RANK[current] >= TRIAGE_RANK[floor] ? current : floor
}

// ─── 핵심 함수 ────────────────────────────────────────────────────

/**
 * 5-분기 추천 우선순위 로직으로 최종 진료과와 트리아지 레벨을 결정한다.
 * M3-4: 분기 0 추가 — matchedEntry=null 시 LLM fallback 자동 호출.
 */
export async function resolveRecommendation(input: RecommendationInput): Promise<RecommendationResult> {
  const { matchedEntry, capturedDemographics, redFlagClassify, redFlagDetect } = input
  const reasoning: string[] = []

  // ── 분기 0: 정적 사전 매칭 0건 시 LLM fallback (M3-4) ─────────
  if (matchedEntry === null) {
    reasoning.push('[분기 0] 정적 사전 매칭 없음 → LLM fallback 호출')
    const fallback = await callLLMFallback({
      user_input: input.userInput ?? '',
      detected_demographics: {
        isMinor: capturedDemographics.isMinor,
        pregnancy: capturedDemographics.pregnancy,
        isThirdPerson: false,
      },
      red_flag_result: redFlagClassify,
    })
    return {
      effectiveSpecialty: fallback.primary_specialty,
      effectiveTriageLevel: fallback.triage_level,
      alternativeSpecialties: fallback.secondary_specialties,
      isEmergency: fallback.triage_level === 'critical' || fallback.triage_level === 'urgent',
      reasoning: [...reasoning, `[LLM] primary=${fallback.primary_specialty}`],
      isLLMFallback: true,
      recommendation_reason: fallback.recommendation_reason,
      confidence: fallback.confidence,
    }
  }

  // ── 분기 1: acuity 1 → EM 강제 라우팅 (A-3 정책) ─────────────
  if (redFlagClassify.acuityOverride === 1) {
    reasoning.push('[분기 1] acuity 1 판정 → EM 강제 라우팅 (A-3)')
    return {
      effectiveSpecialty: 'EM',
      effectiveTriageLevel: 'critical',
      alternativeSpecialties: (matchedEntry?.secondary_specialties ?? []).slice(0, 2),
      isEmergency: true,
      reasoning,
    }
  }

  // ── 분기 2: 소아 → pediatric_specialty 우선 ──────────────────
  if (capturedDemographics.isMinor && matchedEntry?.pediatric_specialty) {
    const ped = matchedEntry.pediatric_specialty
    reasoning.push(`[분기 2] isMinor=true + pediatric_specialty=${ped} → 소아청소년과 우선`)
    const alts = [
      matchedEntry.primary_specialty,
      ...(matchedEntry.secondary_specialties ?? []),
    ].filter((c): c is SpecialtyCode => !!c && c !== ped).slice(0, 2)
    return {
      effectiveSpecialty: ped,
      effectiveTriageLevel: matchedEntry.triage_level,
      alternativeSpecialties: alts,
      isEmergency: false,
      reasoning,
    }
  }

  // ── 분기 3: 임산부 → obstetric_specialty 우선 ────────────────
  if (capturedDemographics.pregnancy && matchedEntry?.obstetric_specialty) {
    const obs = matchedEntry.obstetric_specialty
    reasoning.push(`[분기 3] pregnancy=true + obstetric_specialty=${obs} → 산부인과 우선`)
    const alts = [
      matchedEntry.primary_specialty,
      ...(matchedEntry.secondary_specialties ?? []),
    ].filter((c): c is SpecialtyCode => !!c && c !== obs).slice(0, 2)
    return {
      effectiveSpecialty: obs,
      effectiveTriageLevel: matchedEntry.triage_level,
      alternativeSpecialties: alts,
      isEmergency: false,
      reasoning,
    }
  }

  // ── 분기 4: red_flag_category 매칭 → triage ≥ urgent ─────────
  let triageLevel: TriageLevel = matchedEntry?.triage_level ?? 'outpatient'
  if (matchedEntry?.red_flag_category && redFlagDetect?.is_red_flag) {
    const upgraded = upgradeTriage(triageLevel, 'urgent')
    if (upgraded !== triageLevel) {
      reasoning.push(
        `[분기 4] red_flag_category(${matchedEntry.red_flag_category}) 매칭 → triage ${triageLevel}→${upgraded} 상향`,
      )
      triageLevel = upgraded
    } else {
      reasoning.push(
        `[분기 4] red_flag_category(${matchedEntry.red_flag_category}) 매칭, triage 이미 ${triageLevel}`,
      )
    }
  }

  // ── 분기 5: primary → secondary → tertiary 안내자형 (G-1) ─────
  if (!matchedEntry?.primary_specialty) {
    reasoning.push('[분기 5] 매칭 항목 없음 → FM 기본 라우팅')
    return {
      effectiveSpecialty: 'FM',
      effectiveTriageLevel: 'outpatient',
      alternativeSpecialties: ['IM'],
      isEmergency: false,
      reasoning,
    }
  }

  const primary = matchedEntry.primary_specialty
  const alts = [
    ...(matchedEntry.secondary_specialties ?? []),
    ...(matchedEntry.tertiary_specialties ?? []),
  ].slice(0, 3)

  reasoning.push(`[분기 5] primary=${primary} → alts=[${alts.join(', ')}]`)

  const isEmergency =
    redFlagClassify.acuityOverride === 2 ||
    triageLevel === 'critical' ||
    triageLevel === 'urgent'

  return {
    effectiveSpecialty: primary,
    effectiveTriageLevel: triageLevel,
    alternativeSpecialties: alts,
    isEmergency,
    reasoning,
  }
}
