/**
 * G1-4 metrics-collector.ts 자체 검증
 * 실행: npx tsx lib/care/metrics/metrics-collector.test.ts
 */

import { validateMetricPayload, buildMetricRecord } from './metrics-collector'
import type { MetricPayload } from './metrics-types'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

// ─── T1: M1 만족도 검증 ───────────────────────────────────────

const m1Valid: MetricPayload = {
  metric_type: 'M1_satisfaction',
  session_hash: 'abc123def456',
  timing: 'immediate',
  score: 5,
}
const r1 = validateMetricPayload(m1Valid)
assert('T1-1 M1 유효 페이로드 PASS', r1.valid)
assert('T1-2 M1 유효 오류 없음', r1.errors.length === 0)

const m1Invalid = { ...m1Valid, score: 6 }
const r1i = validateMetricPayload(m1Invalid)
assert('T1-3 M1 score=6 FAIL', !r1i.valid)

const m1WrongTiming = { ...m1Valid, timing: 'weekly' }
const r1t = validateMetricPayload(m1WrongTiming)
assert('T1-4 M1 timing=weekly FAIL', !r1t.valid)

// ─── T2: M2 진료과 매칭 검증 ─────────────────────────────────

const m2Valid: MetricPayload = {
  metric_type: 'M2_specialty_match',
  session_hash: 'abc123def456',
  recommended_specialty: 'IM',
  matched: true,
}
const r2 = validateMetricPayload(m2Valid)
assert('T2-1 M2 유효 페이로드 PASS', r2.valid)

const m2NoSpec = { metric_type: 'M2_specialty_match', session_hash: 'abc123', matched: false }
const r2n = validateMetricPayload(m2NoSpec)
assert('T2-2 M2 recommended_specialty 누락 FAIL', !r2n.valid)

// ─── T3: M3 응급 라우팅 검증 ─────────────────────────────────

const m3Valid: MetricPayload = {
  metric_type: 'M3_emergency_routing',
  session_hash: 'abc123def456',
  triage_level: 'L1',
  visited_er: true,
  routing_appropriate: true,
}
const r3 = validateMetricPayload(m3Valid)
assert('T3-1 M3 유효 페이로드 PASS', r3.valid)

const m3NoVisit = { ...m3Valid, visited_er: 'yes' }
const r3n = validateMetricPayload(m3NoVisit)
assert('T3-2 M3 visited_er=string FAIL', !r3n.valid)

// ─── T4: M4 잔존율 검증 ──────────────────────────────────────

const m4Valid: MetricPayload = {
  metric_type: 'M4_retention',
  session_hash: 'abc123def456',
  timing: '30day',
  returned: true,
}
const r4 = validateMetricPayload(m4Valid)
assert('T4-1 M4 유효 페이로드 PASS', r4.valid)

const m4WrongTiming = { ...m4Valid, timing: '7day' }
const r4t = validateMetricPayload(m4WrongTiming)
assert('T4-2 M4 timing=7day FAIL', !r4t.valid)

// ─── T5: session_hash 검증 ───────────────────────────────────

const shortHash = { ...m1Valid, session_hash: 'abc' }
const r5 = validateMetricPayload(shortHash)
assert('T5-1 session_hash 짧음 FAIL', !r5.valid)

const noHash = { ...m1Valid, session_hash: undefined }
const r5n = validateMetricPayload(noHash)
assert('T5-2 session_hash 누락 FAIL', !r5n.valid)

// ─── T6: buildMetricRecord ────────────────────────────────────

const record = buildMetricRecord(m1Valid)
assert('T6-1 record.recorded_at ISO 형식', /^\d{4}-\d{2}-\d{2}T/.test(record.recorded_at))
assert('T6-2 record.payload 일치', record.payload === m1Valid)

// ─── T7: 유효하지 않은 metric_type ───────────────────────────

const r7 = validateMetricPayload({ metric_type: 'M99_unknown', session_hash: 'abc123def456' })
assert('T7 알 수 없는 metric_type FAIL', !r7.valid)

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== metrics-collector.test.ts: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
