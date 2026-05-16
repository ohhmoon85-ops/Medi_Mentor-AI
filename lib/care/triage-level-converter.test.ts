/**
 * G2-1 TriageLevel 변환 레이어 자가 검증
 * 실행: npx tsx lib/care/triage-level-converter.test.ts
 */

import {
  toLLevel,
  fromLLevel,
  isLLevel,
  isTriageLevel,
  type LLevel,
} from './triage-level-converter'
import type { TriageLevel } from '@/lib/specialty/symptom-mapping-schema'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

// ─── T1: toLLevel 5단계 ────────────────────────────────────────

assert('T1-1 critical → L1',      toLLevel('critical')      === 'L1')
assert('T1-2 urgent → L2',        toLLevel('urgent')        === 'L2')
assert('T1-3 night_weekend → L3', toLLevel('night_weekend') === 'L3')
assert('T1-4 outpatient → L4',    toLLevel('outpatient')    === 'L4')
assert('T1-5 self_care → L5',     toLLevel('self_care')     === 'L5')

// ─── T2: fromLLevel 5단계 ──────────────────────────────────────

assert('T2-1 L1 → critical',      fromLLevel('L1') === 'critical')
assert('T2-2 L2 → urgent',        fromLLevel('L2') === 'urgent')
assert('T2-3 L3 → night_weekend', fromLLevel('L3') === 'night_weekend')
assert('T2-4 L4 → outpatient',    fromLLevel('L4') === 'outpatient')
assert('T2-5 L5 → self_care',     fromLLevel('L5') === 'self_care')

// ─── T3: 왕복 변환 항등성 (round-trip) ─────────────────────────

const triageAll: TriageLevel[] = ['critical','urgent','night_weekend','outpatient','self_care']
triageAll.forEach((t) => {
  assert(`T3 ${t} round-trip 항등`, fromLLevel(toLLevel(t)) === t)
})

const lAll: LLevel[] = ['L1','L2','L3','L4','L5']
lAll.forEach((l) => {
  assert(`T3 ${l} round-trip 항등`, toLLevel(fromLLevel(l)) === l)
})

// ─── T4: isLLevel ──────────────────────────────────────────────

assert('T4-1 isLLevel(L1)', isLLevel('L1'))
assert('T4-2 isLLevel(L5)', isLLevel('L5'))
assert('T4-3 isLLevel(L6) false',         !isLLevel('L6'))
assert('T4-4 isLLevel("critical") false', !isLLevel('critical'))
assert('T4-5 isLLevel(null) false',       !isLLevel(null))
assert('T4-6 isLLevel(undefined) false',  !isLLevel(undefined))
assert('T4-7 isLLevel(1) false',          !isLLevel(1))
assert('T4-8 isLLevel("") false',         !isLLevel(''))

// ─── T5: isTriageLevel ─────────────────────────────────────────

assert('T5-1 isTriageLevel(critical)',      isTriageLevel('critical'))
assert('T5-2 isTriageLevel(self_care)',     isTriageLevel('self_care'))
assert('T5-3 isTriageLevel(night_weekend)', isTriageLevel('night_weekend'))
assert('T5-4 isTriageLevel(L1) false',      !isTriageLevel('L1'))
assert('T5-5 isTriageLevel(null) false',    !isTriageLevel(null))
assert('T5-6 isTriageLevel("emergency") false', !isTriageLevel('emergency'))

// ─── T6: 순서 보존 (L1 ≺ L5 우선순위) ──────────────────────────

const triageOrder: TriageLevel[] = ['critical','urgent','night_weekend','outpatient','self_care']
const lOrder = triageOrder.map(toLLevel)
assert('T6-1 우선순위 순서 보존', lOrder.join(',') === 'L1,L2,L3,L4,L5')

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== triage-level-converter.test.ts: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
