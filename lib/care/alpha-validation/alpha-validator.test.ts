/**
 * G1-1 alpha-validator.ts 자체 검증
 * 실행: npx tsx lib/care/alpha-validation/alpha-validator.test.ts
 */

import {
  runValidation,
  StubRoutingAdapter,
  type AlphaScenario,
} from './alpha-validator'

// ─── assert 프레임워크 ─────────────────────────────────────────

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
  }
}

// ─── 픽스처 ───────────────────────────────────────────────────

const l1Scenario: AlphaScenario = {
  id:       'TEST-001',
  category: 'L1_critical_type_I',
  input: {
    primary_symptom: '흉통',
    age:          60,
    age_group:    'adult',
    sex:          'male',
    time:         '14:30',
    time_bracket: 'daytime',
    duration:     '30분',
  },
  expected_output: {
    triage_level:         'L1',
    routing:              '119_immediate',
    card_displayed:       'CriticalEmergencyCard',
    specialty_recommendation: null,
    message_keywords:     ['119', '즉시'],
  },
  validation_focus:           'L1 라우팅',
  clinical_review_required:   false,
}

const l4Scenario: AlphaScenario = {
  id:       'TEST-002',
  category: 'L4_type_I',
  input: {
    primary_symptom: '만성 두통',
    age:          40,
    age_group:    'adult',
    sex:          'female',
    time:         '10:00',
    time_bracket: 'daytime',
    duration:     '2주',
  },
  expected_output: {
    triage_level:         'L4',
    routing:              'regular_visit',
    card_displayed:       'SpecialtyRecommendationCard',
    specialty_recommendation: ['신경과'],
    message_keywords:     ['신경과', '정규 진료'],
  },
  validation_focus:           'L4 라우팅',
  clinical_review_required:   false,
}

// ─── 테스트 실행 ──────────────────────────────────────────────

async function runTests() {
  console.log('\n=== alpha-validator.test.ts ===\n')

  const adapter = new StubRoutingAdapter()

  // T1: StubRoutingAdapter는 integrated=false 반환
  const stubResult = await adapter.route(l1Scenario)
  assert('T1 stub: integrated=false', stubResult.integrated === false)
  assert('T1 stub: triage_level=NOT_INTEGRATED', stubResult.triage_level === 'NOT_INTEGRATED')

  // T2: runValidation 결과 형식 검증
  const report = await runValidation([l1Scenario, l4Scenario], adapter)
  assert('T2 report.total=2',   report.total === 2)
  assert('T2 report.adapter=stub', report.adapter === 'stub')
  assert('T2 report.passed=0 (stub)', report.passed === 0)
  assert('T2 type_ii_count=0 (stub: not integrated → not counted)', report.type_ii_count === 0)
  assert('T2 results.length=2', report.results.length === 2)
  assert('T2 failures.length=2 (stub)', report.failures.length === 2)

  // T3: pass_criteria_met 구조
  assert('T3 pass_criteria_met.type_ii_zero 필드 존재', typeof report.pass_criteria_met.type_ii_zero === 'boolean')
  assert('T3 pass_criteria_met.appropriate_95 필드 존재', typeof report.pass_criteria_met.appropriate_95 === 'boolean')

  // T4: ScenarioResult 구조
  const firstResult = report.results[0]
  assert('T4 result.id 존재',       typeof firstResult.id === 'string')
  assert('T4 result.expected 존재', typeof firstResult.expected === 'object')
  assert('T4 result.actual 존재',   typeof firstResult.actual === 'object')
  assert('T4 result.diff 배열',     Array.isArray(firstResult.diff))

  // T5: type_ii 감지 로직 (integrated=false 시 type_ii=false 보장)
  const l1Result = report.results.find((r) => r.id === 'TEST-001')!
  assert('T5 stub L1: type_ii=false (미통합)',   l1Result.type_ii === false)

  // T6: run_timestamp 형식
  assert('T6 run_timestamp ISO 형식', /^\d{4}-\d{2}-\d{2}T/.test(report.run_timestamp))

  console.log(`\n${passed}/${passed + failed} PASS`)
  if (failures.length > 0) {
    console.log('❌ 실패:')
    failures.forEach((f) => console.log(`   - ${f}`))
  } else {
    console.log('✅ 전체 통과')
  }

  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch((e) => { console.error(e); process.exit(1) })
