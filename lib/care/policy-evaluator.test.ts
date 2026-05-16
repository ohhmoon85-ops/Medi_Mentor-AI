/**
 * G2-2 정책 평가기 자가 검증
 * 실행: npx tsx lib/care/policy-evaluator.test.ts
 */

import {
  evaluateActivePolicies,
  emptyPolicyInput,
  type PolicyEvaluationInput,
} from './policy-evaluator'
import { ROUTING_POLICY_TABLE, type RoutingPolicy } from './routing-policy/routing-policy-table'
import { getActivePolicies, getPolicyById } from './routing-policy/routing-policy-loader'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

const ACTIVE = getActivePolicies()

function withInput(overrides: Partial<PolicyEvaluationInput>): PolicyEvaluationInput {
  return { ...emptyPolicyInput(), ...overrides }
}

// ─── T1: AGENDA-12 (TIA) ─────────────────────────────────────

const tia = evaluateActivePolicies(withInput({
  symptom_keywords: ['일시적 어지럼증', '발음 어눌(현재 회복)', '왼팔 무력감 30분 전'],
  symptom_current_state: ['30분 전 발생, 현재 호전'],
  patient_age_years: 75,
}), ACTIVE)
assert('T1-1 ALPHA-008 TIA → AGENDA-12 트리거',     tia?.agenda_id === 'AGENDA-12')
assert('T1-2 ALPHA-008 TIA → target_triage_level L1', tia?.target_triage_level === 'L1')
assert('T1-3 ALPHA-008 TIA → forced_routing',         tia?.forced_routing === '119_immediate')
assert('T1-4 ALPHA-008 TIA → forced_card',            tia?.forced_card === 'CriticalEmergencyCard')
assert('T1-5 ALPHA-008 TIA → l1_override',            tia?.policy_kind === 'l1_override')

// ─── T2: AGENDA-13 (충수염) ───────────────────────────────────

const appendix = evaluateActivePolicies(withInput({
  symptom_keywords: ['복통', '발열 38.2도', '구역'],
  pain_location: ['우하복부 압통'],
  patient_age_years: 28,
}), ACTIVE)
assert('T2-1 ALPHA-009 충수염 → AGENDA-13',      appendix?.agenda_id === 'AGENDA-13')
assert('T2-2 ALPHA-009 충수염 → L1',             appendix?.target_triage_level === 'L1')
assert('T2-3 ALPHA-009 충수염 → 119_or_ER',      appendix?.forced_routing === '119_or_ER_immediate')

// ─── T3: AGENDA-14 (영아 무기력 + 수유 거부) ──────────────────

const infant = evaluateActivePolicies(withInput({
  symptom_keywords: ['영아 무기력', '수유 거부', '호흡 빠름(분당 60회)', '체온 정상'],
  patient_age_years: 1,
  patient_age_months: 12,
}), ACTIVE)
assert('T3-1 ALPHA-010 영아 → AGENDA-14',  infant?.agenda_id === 'AGENDA-14')
assert('T3-2 ALPHA-010 영아 → L1',         infant?.target_triage_level === 'L1')

const child2y = evaluateActivePolicies(withInput({
  symptom_keywords: ['무기력', '수유 거부'],
  patient_age_months: 30, // 30개월 > 24개월 → AGENDA-14 미트리거
}), ACTIVE)
assert('T3-3 30개월(>24) → AGENDA-14 비트리거', child2y?.agenda_id !== 'AGENDA-14')

// ─── T4: AGENDA-15 (뇌막염) ──────────────────────────────────

const meningitis = evaluateActivePolicies(withInput({
  symptom_keywords: ['두통', '목 뻣뻣함', '미열 37.8도', '광 과민'],
  patient_age_years: 35,
}), ACTIVE)
assert('T4-1 ALPHA-011 뇌막염 → AGENDA-15', meningitis?.agenda_id === 'AGENDA-15')
assert('T4-2 ALPHA-011 뇌막염 → L1',        meningitis?.target_triage_level === 'L1')

// ─── T5: AGENDA-16 (비전형 ACS, 고령 여성) ───────────────────

const acs = evaluateActivePolicies(withInput({
  symptom_keywords: ['소화불량', '흉부 답답함', '식은땀', '어지럼증'],
  patient_age_years: 68,
  patient_gender: 'female',
}), ACTIVE)
assert('T5-1 ALPHA-012 비전형 ACS → AGENDA-16', acs?.agenda_id === 'AGENDA-16')
assert('T5-2 ALPHA-012 비전형 ACS → L1',        acs?.target_triage_level === 'L1')

const acsYoung = evaluateActivePolicies(withInput({
  symptom_keywords: ['소화불량', '식은땀'],
  patient_age_years: 45, // 45 < 65 → 미트리거
  patient_gender: 'female',
}), ACTIVE)
assert('T5-3 45세 여성 → AGENDA-16 비트리거', acsYoung?.agenda_id !== 'AGENDA-16')

const acsMale = evaluateActivePolicies(withInput({
  symptom_keywords: ['소화불량', '식은땀'],
  patient_age_years: 70,
  patient_gender: 'male', // 남성 → 미트리거
}), ACTIVE)
assert('T5-4 70세 남성 → AGENDA-16 비트리거', acsMale?.agenda_id !== 'AGENDA-16')

// ─── T6: AGENDA-17 (자살 위기) ───────────────────────────────

const suicide = evaluateActivePolicies(withInput({
  symptom_keywords: ['자살 시도 직후', '의식 있음', '자해 흔적'],
  patient_age_years: 25,
}), ACTIVE)
assert('T6-1 ALPHA-006 자살 → AGENDA-17', suicide?.agenda_id === 'AGENDA-17')
assert('T6-2 ALPHA-006 자살 → L1',        suicide?.target_triage_level === 'L1')

// ─── T7: AGENDA-18 (과잉 라우팅 방지 — 진단력 컨텍스트) ──────

const panic = evaluateActivePolicies(withInput({
  symptom_keywords: ['흉통', '과호흡', '손저림', '공황 양상'],
  existing_diagnosis: ['공황장애'],
  symptom_matches_existing_diagnosis: true,
  patient_age_years: 30,
}), ACTIVE)
assert('T7-1 ALPHA-025 공황 → AGENDA-18',           panic?.agenda_id === 'AGENDA-18')
assert('T7-2 ALPHA-025 공황 → L4',                  panic?.target_triage_level === 'L4')
assert('T7-3 ALPHA-025 공황 → context_deduction',   panic?.policy_kind === 'context_deduction')

const migraine = evaluateActivePolicies(withInput({
  symptom_keywords: ['두통', '편측', '광 과민', '오심'],
  existing_diagnosis: ['편두통'],
  symptom_matches_existing_diagnosis: true,
}), ACTIVE)
assert('T7-4 ALPHA-026 편두통 → AGENDA-18', migraine?.agenda_id === 'AGENDA-18')

const gastritis = evaluateActivePolicies(withInput({
  symptom_keywords: ['복통', '식후 발생', '체기 양상'],
  existing_diagnosis: ['만성 위염'],
  symptom_matches_existing_diagnosis: true,
}), ACTIVE)
assert('T7-5 ALPHA-027 위염 → AGENDA-18', gastritis?.agenda_id === 'AGENDA-18')

const noDx = evaluateActivePolicies(withInput({
  symptom_keywords: ['두통'],
  existing_diagnosis: [],
  symptom_matches_existing_diagnosis: false,
}), ACTIVE)
assert('T7-6 진단력 없음 → AGENDA-18 비트리거', noDx === null || noDx.agenda_id !== 'AGENDA-18')

// ─── T8: AGENDA-19 (운동성 흉통, L4) ─────────────────────────

const stableAngina = evaluateActivePolicies(withInput({
  symptom_keywords: ['간헐적 흉부 답답함', '가슴 아픔'],
  pain_character: ['운동 시 발생'],
  existing_diagnosis: ['근골격계 질환'],
  patient_age_years: 55,
}), ACTIVE)
assert('T8-1 운동성 흉통 → AGENDA-19',           stableAngina?.agenda_id === 'AGENDA-19')
assert('T8-2 운동성 흉통 → L4',                  stableAngina?.target_triage_level === 'L4')
assert('T8-3 운동성 흉통 → escalated_to_l1=false', stableAngina?.escalated_to_l1 === false)

// ─── T9: AGENDA-19 예외 (방사통/30분↑ → L1 격상) ─────────────

const radiating = evaluateActivePolicies(withInput({
  symptom_keywords: ['흉통'],
  pain_character: ['운동성'],
  existing_diagnosis: ['근골격계 질환'],
  has_radiating_pain: true,
}), ACTIVE)
assert('T9-1 흉통+방사통 → L1 격상',           radiating?.target_triage_level === 'L1')
assert('T9-2 흉통+방사통 → escalated_to_l1',   radiating?.escalated_to_l1 === true)
assert('T9-3 흉통+방사통 → 119_immediate',     radiating?.forced_routing === '119_immediate')

const overThirtyMin = evaluateActivePolicies(withInput({
  symptom_keywords: ['흉통'],
  pain_character: ['이동성'],
  existing_diagnosis: ['역류성 식도염'],
  chest_pain_over_30min: true,
}), ACTIVE)
assert('T9-4 흉통+30분↑ → L1 격상', overThirtyMin?.target_triage_level === 'L1')

// ─── T10: 우선순위 (AGENDA-12 > AGENDA-19 등) ────────────────

const tiaAndChest = evaluateActivePolicies(withInput({
  symptom_keywords: ['갑자기 어눌', '흉통'],
  symptom_current_state: ['호전'],
  pain_character: ['운동성'],
  existing_diagnosis: ['근골격계 질환'],
}), ACTIVE)
assert('T10-1 TIA + 흉통 모두 매칭 → AGENDA-12 우선', tiaAndChest?.agenda_id === 'AGENDA-12')

const panicAndStable = evaluateActivePolicies(withInput({
  symptom_keywords: ['흉통'],
  pain_character: ['운동성'],
  existing_diagnosis: ['근골격계 질환', '공황장애'],
  symptom_matches_existing_diagnosis: true,
}), ACTIVE)
assert('T10-2 AGENDA-19 + AGENDA-18 모두 매칭 → AGENDA-19 우선',
       panicAndStable?.agenda_id === 'AGENDA-19')

// ─── T11: 매칭 없는 경우 → null ──────────────────────────────

const noMatch = evaluateActivePolicies(withInput({
  symptom_keywords: ['콧물', '가벼운 인후통'],
  patient_age_years: 30,
}), ACTIVE)
assert('T11-1 매칭 없음 → null', noMatch === null)

const noMatchEmpty = evaluateActivePolicies(emptyPolicyInput(), ACTIVE)
assert('T11-2 빈 입력 → null', noMatchEmpty === null)

// ─── T12: clinical_review_status≠approved 정책 무시 ──────────

const fakePending: RoutingPolicy = {
  ...(getPolicyById('AGENDA-17') as RoutingPolicy),
  clinical_review_status: 'pending',
}
const pendingResult = evaluateActivePolicies(withInput({
  symptom_keywords: ['자살'],
}), [fakePending])
assert('T12-1 pending 정책 → 무시(null)', pendingResult === null)

// ─── T13: 빈 trigger_conditions → 미적용 ─────────────────────

const emptyPolicy: RoutingPolicy = {
  policy_id: 'AGENDA-99',
  description: 'empty',
  trigger_conditions: [],
  target_triage_level: 'L1',
  clinical_review_status: 'approved',
  approved_by: 'test',
  approved_date: '2026-05-16',
  notes: 'test',
}
const emptyResult = evaluateActivePolicies(withInput({ symptom_keywords: ['자살'] }), [emptyPolicy])
assert('T13-1 빈 trigger_conditions → null', emptyResult === null)

// ─── T14: 양방향 부분 일치 (lenient) 검증 ────────────────────

const looseTia1 = evaluateActivePolicies(withInput({
  symptom_keywords: ['어눌'], // 정책: '갑자기 어눌' (단어 '어눌'로 매치)
  symptom_current_state: ['호전'],
}), ACTIVE)
assert('T14-1 단어 부분 매치 → 어눌 ⊂ 갑자기 어눌', looseTia1?.agenda_id === 'AGENDA-12')

const looseFever = evaluateActivePolicies(withInput({
  symptom_keywords: ['복통', '미열', '우하복부'], // 정책: '발열'·'열'
  pain_location: ['우하복부'],
}), ACTIVE)
assert('T14-2 "미열" → "열" 단어 매치 → AGENDA-13', looseFever?.agenda_id === 'AGENDA-13')

// ─── T15: 정책 테이블 일관성 ─────────────────────────────────

assert('T15-1 ACTIVE 8개', ACTIVE.length === 8)
assert('T15-2 ROUTING_POLICY_TABLE 8개', ROUTING_POLICY_TABLE.length === 8)

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== policy-evaluator.test.ts: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
