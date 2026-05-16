/**
 * G2-2 정책 평가기 (Policy Evaluator)
 *
 * routing-policy-table.ts 의 8개 정책(AGENDA-12 ~ AGENDA-19) 중
 * 입력 컨텍스트에 적용 가능한 첫 매칭 정책을 반환한다.
 *
 * 본 모듈은 routing-policy-loader.ts 의 미구현 evaluatePolicies() TODO 를
 * 우회(D-2)하기 위한 신규 평가기이며, 기존 파일은 수정하지 않는다.
 *
 * 평가 순서 (우선순위):
 *   AGENDA-12 → 13 → 14 → 15 → 16 → 17 (L1 강제)
 *   → AGENDA-19 (L4 + 예외 경보)
 *   → AGENDA-18 (L4/L5 감산)
 *
 * 키워드 매칭은 양방향 부분 일치(lenient) 정책:
 *   policy_value 와 input_value 중 한쪽이 다른 쪽을 포함하면 매치,
 *   또는 policy_value 의 2자 이상 단어 중 하나가 input 에 포함되면 매치.
 */

import type {
  RoutingPolicy,
  TriggerCondition,
} from './routing-policy/routing-policy-table'

// ─── 입출력 타입 ──────────────────────────────────────────────

export interface PolicyEvaluationInput {
  /** 증상 키워드 (primary + secondary 통합) */
  symptom_keywords: string[]
  /** 현재 증상 상태 (duration/context 추출, 회복·지속·악화 등) */
  symptom_current_state: string[]
  /** 통증 부위 (secondary_symptoms 추출) */
  pain_location: string[]
  /** 통증 성격 (운동성·이동성·체위 변화 등) */
  pain_character: string[]
  /** 환자 연령 (만 나이, 년 단위) */
  patient_age_years: number
  /** 환자 연령 (개월 단위, 영유아 정책용) */
  patient_age_months: number
  /** 환자 성별 ('male' | 'female' | string) */
  patient_gender: string
  /** 기존 진단력 (context 추출) */
  existing_diagnosis: string[]
  /** 현재 증상이 기존 진단 패턴과 일치 (AGENDA-18 적용) */
  symptom_matches_existing_diagnosis: boolean
  /** 방사통 동반 여부 (AGENDA-19 예외 처리용) */
  has_radiating_pain: boolean
  /** 흉통 30분 이상 지속 여부 (AGENDA-19 예외 처리용) */
  chest_pain_over_30min: boolean
}

export type PolicyKind =
  | 'l1_override'        // AGENDA-12~17
  | 'l4_chest_pain'      // AGENDA-19
  | 'context_deduction'  // AGENDA-18

export interface PolicyOverrideResult {
  agenda_id: string
  policy_kind: PolicyKind
  target_triage_level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
  forced_routing: string | null
  forced_card: string | null
  /** AGENDA-19 예외: 방사통/30분↑ 시 L1 경보로 강제 격상 */
  escalated_to_l1: boolean
  matched_conditions: string[]
  notes: string
}

// ─── 우선순위 순서 ────────────────────────────────────────────

const PRIORITY_ORDER = [
  'AGENDA-12','AGENDA-13','AGENDA-14','AGENDA-15','AGENDA-16','AGENDA-17',
  'AGENDA-19','AGENDA-18',
] as const

// ─── LEAF 평가 ────────────────────────────────────────────────

function isLooseMatch(policyValue: string, inputValue: string): boolean {
  if (!policyValue || !inputValue) return false
  if (inputValue.includes(policyValue)) return true
  if (policyValue.includes(inputValue) && inputValue.length >= 2) return true

  // 양쪽 모두 어절 단위(2자↑)로 분해 후 교차 부분 일치 검사
  // 예: 정책 "운동성" ↔ 입력 "운동 시 발생" → "운동성"⊃"운동" 매치
  const pWords = policyValue.split(/[\s.,()]+/).filter((w) => w.length >= 2)
  const iWords = inputValue.split(/[\s.,()]+/).filter((w) => w.length >= 2)
  for (const pw of pWords) {
    for (const iw of iWords) {
      if (iw.includes(pw) || pw.includes(iw)) return true
    }
  }
  return false
}

function anyOfMatch(policyValues: unknown, inputField: unknown): boolean {
  if (!Array.isArray(policyValues)) return false
  const pvs = policyValues.filter((v): v is string => typeof v === 'string')

  if (Array.isArray(inputField)) {
    const ivs = inputField.filter((v): v is string => typeof v === 'string')
    return pvs.some((pv) => ivs.some((iv) => isLooseMatch(pv, iv)))
  }
  if (typeof inputField === 'string') {
    return pvs.some((pv) => isLooseMatch(pv, inputField))
  }
  return false
}

function evalLeaf(
  cond: TriggerCondition,
  input: PolicyEvaluationInput,
): boolean {
  const field = cond.field ?? ''
  const op = cond.operator ?? 'eq'
  const value = cond.value
  const inputField = (input as unknown as Record<string, unknown>)[field]

  switch (op) {
    case 'eq':
      return inputField === value
    case 'in':
      return Array.isArray(value) && value.includes(inputField as never)
    case 'gte':
      return typeof inputField === 'number' && typeof value === 'number' && inputField >= value
    case 'lte':
      return typeof inputField === 'number' && typeof value === 'number' && inputField <= value
    case 'contains':
      if (Array.isArray(inputField)) {
        return inputField.some((iv) => typeof iv === 'string' && typeof value === 'string' && iv.includes(value))
      }
      return typeof inputField === 'string' && typeof value === 'string' && inputField.includes(value)
    case 'any_of':
      return anyOfMatch(value, inputField)
    default:
      return false
  }
}

function evalCondition(
  cond: TriggerCondition,
  input: PolicyEvaluationInput,
): boolean {
  if (cond.type === 'LEAF') return evalLeaf(cond, input)
  const children = cond.conditions ?? []
  if (cond.type === 'AND') return children.every((c) => evalCondition(c, input))
  if (cond.type === 'OR')  return children.some((c)  => evalCondition(c, input))
  return false
}

function evalPolicy(
  policy: RoutingPolicy,
  input: PolicyEvaluationInput,
): { matched: boolean; matchedDescriptions: string[] } {
  // 정책의 trigger_conditions 가 비어 있으면 미적용
  if (policy.trigger_conditions.length === 0) {
    return { matched: false, matchedDescriptions: [] }
  }
  const matched = policy.trigger_conditions.every((c) => evalCondition(c, input))
  const descriptions = matched
    ? policy.trigger_conditions.map((c) => c.description ?? '(조건)')
    : []
  return { matched, matchedDescriptions: descriptions }
}

// ─── 정책 분류 ────────────────────────────────────────────────

function policyKind(policyId: string): PolicyKind {
  if (policyId === 'AGENDA-18') return 'context_deduction'
  if (policyId === 'AGENDA-19') return 'l4_chest_pain'
  return 'l1_override'
}

// ─── 메인 평가 함수 ───────────────────────────────────────────

export function evaluateActivePolicies(
  input: PolicyEvaluationInput,
  activePolicies: readonly RoutingPolicy[],
): PolicyOverrideResult | null {
  // 우선순위 순서대로 정렬
  const byId = new Map(activePolicies.map((p) => [p.policy_id, p]))
  const ordered = PRIORITY_ORDER
    .map((id) => byId.get(id))
    .filter((p): p is RoutingPolicy => p !== undefined)

  for (const policy of ordered) {
    if (policy.clinical_review_status !== 'approved') continue
    const { matched, matchedDescriptions } = evalPolicy(policy, input)
    if (!matched) continue

    const kind = policyKind(policy.policy_id)

    // AGENDA-19 예외: 방사통 또는 흉통 30분↑ → L1 경보로 격상
    if (kind === 'l4_chest_pain' && (input.has_radiating_pain || input.chest_pain_over_30min)) {
      return {
        agenda_id:           policy.policy_id,
        policy_kind:         kind,
        target_triage_level: 'L1',
        forced_routing:      '119_immediate',
        forced_card:         'CriticalEmergencyCard',
        escalated_to_l1:     true,
        matched_conditions:  matchedDescriptions,
        notes:               policy.notes,
      }
    }

    return {
      agenda_id:           policy.policy_id,
      policy_kind:         kind,
      target_triage_level: policy.target_triage_level,
      forced_routing:      policy.forced_routing ?? null,
      forced_card:         policy.forced_card ?? null,
      escalated_to_l1:     false,
      matched_conditions:  matchedDescriptions,
      notes:               policy.notes,
    }
  }

  return null
}

// ─── 빈 입력 헬퍼 ─────────────────────────────────────────────

export function emptyPolicyInput(): PolicyEvaluationInput {
  return {
    symptom_keywords: [],
    symptom_current_state: [],
    pain_location: [],
    pain_character: [],
    patient_age_years: 0,
    patient_age_months: 0,
    patient_gender: '',
    existing_diagnosis: [],
    symptom_matches_existing_diagnosis: false,
    has_radiating_pain: false,
    chest_pain_over_30min: false,
  }
}
