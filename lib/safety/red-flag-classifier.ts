/**
 * Red Flag 분류기
 *
 * 두 가지 독립 메커니즘이 순차 동작한다:
 *
 * [1단계] classifyRedFlags() — 즉시 응급(🔴) 키워드 사전 필터 (기존 유지)
 *   - department-router.ts의 9-B-1 응급 키워드 필터와 병렬로 동작
 *   - acuityOverride 1/2 판정 → triage route에서 EM 즉시 라우팅
 *   - 의식 저하·편마비·경련·자살 등 = 주증상-Don't Miss 매트릭스 형식 비적합
 *
 * [2단계] detectRedFlags() — 8개 주증상별 Don't Miss 매트릭스 (신규)
 *   - classifyRedFlags() 미적중 후 호출
 *   - 매칭된 주증상의 Don't Miss 진단 목록 반환
 *   - 인구학적 보정: pregnancy → 임산부 복통, isMinor + 발열 → 소아 발열
 *
 * LLM은 이 분류기의 판정을 번복하지 않는다. 룰 기반 결정이 우선한다.
 *
 * 한계 메모 (9-F 자가 검증):
 * signs_detected 매칭은 String.includes() 단순 일치이며, 한국어 조사 변형
 * (~이/가/을/를 등)으로 patient_signs 일부가 미검출될 수 있음.
 * 카테고리 라우팅에는 영향 없으나, getDoctorBriefing()의 "감지된 신호"
 * 섹션이 누락된 채 출력될 수 있음. 9-G 단계에서 형태소 기반 매칭 보강 검토.
 */

import {
  DONT_MISS_MATRIX,
  CATEGORY_PATTERNS,
  FEVER_PATTERN,
  ABDOMINAL_PATTERN,
  PREGNANCY_PATTERN,
  MINOR_PATTERN,
} from './red-flag-data'
import type { RedFlagEntry } from './red-flag-data'

// ─────────────────────────────────────────────────────────────
// [1단계] 기존 즉시 응급 판정 (backward compatible — triage route.ts에서 사용 중)
// ─────────────────────────────────────────────────────────────

export interface RedFlagResult {
  hasRedFlag: boolean
  flags: string[]
  acuityOverride?: 1 | 2
  emergencyMessage?: string
}

// 즉시 응급처치가 필요한 증상 패턴 (acuity 1)
const LEVEL_1_PATTERNS = [
  /호흡\s*곤란|숨\s*못\s*쉬|숨이\s*막/,
  /의식\s*없|쓰러|기절|정신\s*잃/,
  /심한\s*흉통|가슴\s*통증.*땀|심장.*조임/,
  /다량.*출혈|피를?\s*많이/,
  /경련|발작|뇌졸중|마비/,
  /자살|자해|극단적/,
]

// 응급실 내원이 필요한 증상 패턴 (acuity 2)
const LEVEL_2_PATTERNS = [
  /38\.5도?\s*이상|고열.*지속/,
  /지속적.*흉통|흉통.*30분/,
  /갑자기.*시력|눈.*안\s*보/,
  /심한.*복통|복통.*열/,
  /두통.*구토|갑자기.*심한\s*두통/,
]

export function classifyRedFlags(symptomText: string): RedFlagResult {
  const flags: string[] = []
  let acuityOverride: 1 | 2 | undefined

  for (const pattern of LEVEL_1_PATTERNS) {
    if (pattern.test(symptomText)) {
      flags.push(symptomText.match(pattern)?.[0] ?? '위험 증상')
      acuityOverride = 1
    }
  }

  if (!acuityOverride) {
    for (const pattern of LEVEL_2_PATTERNS) {
      if (pattern.test(symptomText)) {
        flags.push(symptomText.match(pattern)?.[0] ?? '주의 증상')
        acuityOverride = 2
      }
    }
  }

  const emergencyMessages: Record<1 | 2, string> = {
    1: '지금 즉시 119에 신고하거나 응급실로 이동하세요.',
    2: '가장 가까운 응급실 또는 응급의료기관으로 이동하세요.',
  }

  return {
    hasRedFlag: flags.length > 0,
    flags,
    acuityOverride,
    emergencyMessage: acuityOverride ? emergencyMessages[acuityOverride] : undefined,
  }
}

// ─────────────────────────────────────────────────────────────
// [2단계] Don't Miss 매트릭스 기반 분류기 (신규)
// ─────────────────────────────────────────────────────────────

export interface DetectRedFlagsResult {
  is_red_flag: boolean
  matched_category: string | null
  dont_miss_diagnoses: RedFlagEntry[]
  urgency: 'immediate' | 'urgent' | 'routine'
  signs_detected: string[]
}

/**
 * 8개 주증상별 Don't Miss 진단 목록을 반환한다.
 *
 * 1단계(classifyRedFlags) 미적중 후 호출하는 것을 원칙으로 한다.
 * 인구학적 플래그(pregnancy, isMinor)가 카테고리 매핑을 우선 결정한다.
 */
export function detectRedFlags(input: {
  rawSymptoms: string
  pregnancy?: boolean
  isMinor?: boolean
}): DetectRedFlagsResult {
  const text = input.rawSymptoms

  // 인구학적 특수 케이스 판정 (플래그 또는 텍스트 패턴)
  const isPregnant = input.pregnancy === true || PREGNANCY_PATTERN.test(text)
  const isMinor = input.isMinor === true || MINOR_PATTERN.test(text)

  let matchedCategory: string | null = null
  let urgency: 'immediate' | 'urgent' | 'routine' = 'routine'

  // 인구학적 우선 매핑
  if (isPregnant && ABDOMINAL_PATTERN.test(text)) {
    matchedCategory = '임산부 복통'
    urgency = 'immediate'
  } else if (isMinor && FEVER_PATTERN.test(text)) {
    matchedCategory = '소아 발열'
    urgency = 'urgent'
  } else {
    // 일반 카테고리 순차 탐색 (흉통→두통→복통→요통→어지럼증→시력 변화)
    for (const { category, pattern, urgency: u } of CATEGORY_PATTERNS) {
      if (pattern.test(text)) {
        matchedCategory = category
        urgency = u
        break
      }
    }
  }

  if (!matchedCategory) {
    return {
      is_red_flag: false,
      matched_category: null,
      dont_miss_diagnoses: [],
      urgency: 'routine',
      signs_detected: [],
    }
  }

  const entries = DONT_MISS_MATRIX[matchedCategory] ?? []

  // 환자 입력에서 발견된 red flag 신호 수집
  const signsDetected: string[] = []
  for (const entry of entries) {
    for (const sign of entry.patient_signs) {
      if (text.includes(sign) && !signsDetected.includes(sign)) {
        signsDetected.push(sign)
      }
    }
  }

  return {
    is_red_flag: true,
    matched_category: matchedCategory,
    dont_miss_diagnoses: entries,
    urgency,
    signs_detected: signsDetected,
  }
}

// ─────────────────────────────────────────────────────────────
// 출력 헬퍼
// ─────────────────────────────────────────────────────────────

/**
 * 환자용 메시지 생성.
 * 진단명 단정 금지 — "가능성이 있습니다" 수준의 행동 유도 표현만 사용.
 */
export function getPatientMessage(result: DetectRedFlagsResult): string {
  if (!result.is_red_flag) return ''

  const symptomRef = result.matched_category
    ? `입력하신 ${result.matched_category} 증상에`
    : '입력하신 증상에'

  if (result.urgency === 'immediate') {
    return `${symptomRef} 즉각적인 응급 처치가 필요한 상태의 가능성이 있습니다. 지금 바로 119에 신고하거나 응급실로 이동하세요. 혼자 이동이 어려우시면 움직이지 말고 주변에 도움을 요청하세요.`
  }

  return `${symptomRef} 빠른 진료가 필요한 상태의 가능성이 있습니다. 오늘 안에 응급실 또는 가까운 병원을 방문하세요.`
}

/**
 * 의사용 임상 브리핑 생성.
 * hedge 표현 금지 — 배제 검사와 임상적 근거를 명확히 제시한다.
 */
export function getDoctorBriefing(result: DetectRedFlagsResult): string {
  if (!result.is_red_flag || !result.matched_category) return ''

  const header = `[${result.matched_category}] 배제 필수 진단 ${result.dont_miss_diagnoses.length}개`
  const lines = result.dont_miss_diagnoses.map((entry) => {
    const code = entry.icd10 ? ` (${entry.icd10})` : ''
    const evidence = entry.source_guideline ? ` [${entry.source_guideline}]` : ''
    return `• ${entry.diagnosis}${code} — 배제 검사: ${entry.rule_out_test} / ${entry.why_critical}${evidence}`
  })

  const signNote = result.signs_detected.length > 0
    ? `\n감지된 신호: ${result.signs_detected.join(', ')}`
    : ''

  return [header, ...lines, signNote].filter(Boolean).join('\n')
}
