/**
 * G1-2 라우팅 정책 테이블 스키마 검증
 * 실행: npx tsx lib/care/routing-policy/routing-policy-table.test.ts
 */

import { ROUTING_POLICY_TABLE } from './routing-policy-table'
import {
  getPolicyById,
  getPendingPolicies,
  getActivePolicies,
  getPolicyApprovalSummary,
} from './routing-policy-loader'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

// ─── T1: 테이블 기본 구조 ─────────────────────────────────────

assert('T1-1 정책 테이블 8개 항목', ROUTING_POLICY_TABLE.length === 8)

const ids = ROUTING_POLICY_TABLE.map((p) => p.policy_id)
const expectedIds = ['AGENDA-12','AGENDA-13','AGENDA-14','AGENDA-15','AGENDA-16','AGENDA-17','AGENDA-18','AGENDA-19']
assert('T1-2 AGENDA-12~19 전부 존재', expectedIds.every((id) => ids.includes(id)))
assert('T1-3 ID 중복 없음', new Set(ids).size === ids.length)

// ─── T2: 각 정책 필수 필드 검증 ──────────────────────────────

ROUTING_POLICY_TABLE.forEach((p) => {
  assert(`T2 ${p.policy_id} policy_id 존재`,    typeof p.policy_id === 'string' && p.policy_id.length > 0)
  assert(`T2 ${p.policy_id} description 존재`,  typeof p.description === 'string' && p.description.length > 0)
  assert(`T2 ${p.policy_id} trigger_conditions 배열`, Array.isArray(p.trigger_conditions))
  assert(`T2 ${p.policy_id} target_triage_level 유효`, ['L1','L2','L3','L4','L5'].includes(p.target_triage_level))
  assert(`T2 ${p.policy_id} clinical_review_status 유효`, ['pending','approved','modified','rejected'].includes(p.clinical_review_status))
  assert(`T2 ${p.policy_id} notes 존재`, typeof p.notes === 'string' && p.notes.length > 0)
})

// ─── T3: 자문 승인 후 상태 (모두 approved) ───────────────────

assert('T3-1 모든 정책 approved 상태', ROUTING_POLICY_TABLE.every((p) => p.clinical_review_status === 'approved'))
assert('T3-2 approved_by 설정됨', ROUTING_POLICY_TABLE.every((p) => p.approved_by !== null))
assert('T3-3 approved_date 설정됨', ROUTING_POLICY_TABLE.every((p) => p.approved_date !== null))
assert('T3-4 trigger_conditions 비어있지 않음', ROUTING_POLICY_TABLE.every((p) => p.trigger_conditions.length > 0))

// ─── T4: 로더 함수 ────────────────────────────────────────────

assert('T4-1 getPolicyById AGENDA-12 반환', !!getPolicyById('AGENDA-12'))
assert('T4-2 getPolicyById 없는 ID → undefined', getPolicyById('NONEXISTENT') === undefined)
assert('T4-3 getPendingPolicies 0개 반환 (모두 승인)', getPendingPolicies().length === 0)
assert('T4-4 getActivePolicies 8개 반환 (모두 approved)', getActivePolicies().length === 8)

const summary = getPolicyApprovalSummary()
assert('T4-5 summary.total=8', summary.total === 8)
assert('T4-6 summary.pending=0', summary.pending === 0)
assert('T4-7 summary.all_approved=true', summary.all_approved === true)

// ─── T5: L1 고위험 의제 확인 ─────────────────────────────────

const l1Agendas = ROUTING_POLICY_TABLE.filter((p) => p.target_triage_level === 'L1')
assert('T5-1 L1 정책 6개 이상', l1Agendas.length >= 6)

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== routing-policy-table.test.ts: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
