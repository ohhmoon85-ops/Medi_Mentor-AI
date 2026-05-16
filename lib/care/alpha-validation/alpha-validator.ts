/**
 * G1-1 알파 시나리오 자동 검증 엔진
 *
 * 입력: docs/alpha/alpha_scenarios.json (읽기 전용)
 * 통과 기준 (§5.1.1 N1 메트릭 3번):
 *   - type_ii_count === 0  (L1 누락 0건)
 *   - appropriate_routing_rate >= 0.95  (적정 라우팅 ≥ 95%)
 *
 * 라우팅 엔진 통합: 자문 회신(G1-2) 후 RealRoutingAdapter로 교체 예정.
 * 현재 StubRoutingAdapter → placeholder 결과 반환.
 */

// ─── 타입 정의 ─────────────────────────────────────────────────

export interface AlphaScenarioInput {
  primary_symptom: string
  secondary_symptoms?: string[]
  age: number
  age_group: 'pediatric' | 'adult' | 'elderly'
  sex: string
  time: string
  time_bracket: 'daytime' | 'evening' | 'midnight'
  duration: string
  context?: string
}

export interface AlphaScenarioExpected {
  triage_level: string
  routing: string
  card_displayed: string
  specialty_recommendation?: string[] | null
  message_keywords: string[]
}

export interface AlphaScenario {
  id: string
  category: string
  type_label?: string
  input: AlphaScenarioInput
  expected_output: AlphaScenarioExpected
  validation_focus: string
  clinical_review_required: boolean
  clinical_review_note?: string
}

export interface AlphaScenariosFile {
  version: string
  created: string
  purpose: string
  pass_criteria: {
    type_ii_count_max: number
    appropriate_routing_min: number
    rationale: string
  }
  scenarios: AlphaScenario[]
}

export interface ActualOutput {
  triage_level: string
  routing: string
  card_displayed: string
  specialty_recommendation?: string[] | null
  message_keywords: string[]
  /** 실 통합 여부 플래그 */
  integrated: boolean
}

export interface ScenarioResult {
  id: string
  category: string
  passed: boolean
  /** L1 예상인데 실제 L1 아닌 경우 true */
  type_ii: boolean
  expected: AlphaScenarioExpected
  actual: ActualOutput
  diff: string[]
}

export interface ValidationReport {
  run_timestamp: string
  adapter: 'stub' | 'real'
  total: number
  passed: number
  type_ii_count: number
  appropriate_routing_rate: number
  pass_criteria_met: {
    type_ii_zero: boolean
    appropriate_95: boolean
  }
  all_passed: boolean
  failures: ScenarioResult[]
  results: ScenarioResult[]
}

// ─── 라우팅 어댑터 인터페이스 ─────────────────────────────────

export interface RoutingAdapter {
  name: 'stub' | 'real'
  route(scenario: AlphaScenario): Promise<ActualOutput>
}

// ─── Stub 어댑터 (G1-2 자문 회신 전 placeholder) ──────────────

export class StubRoutingAdapter implements RoutingAdapter {
  name = 'stub' as const

  async route(scenario: AlphaScenario): Promise<ActualOutput> {
    // TODO: 자문 회신 + G1-2 정책 테이블 활성화 후 RealRoutingAdapter로 교체
    return {
      triage_level:              'NOT_INTEGRATED',
      routing:                   'NOT_INTEGRATED',
      card_displayed:            'NOT_INTEGRATED',
      specialty_recommendation:  null,
      message_keywords:          [],
      integrated:                false,
    }
  }
}

// ─── 비교 로직 ────────────────────────────────────────────────

function diffOutputs(
  expected: AlphaScenarioExpected,
  actual: ActualOutput,
): string[] {
  const diffs: string[] = []

  if (!actual.integrated) {
    diffs.push('라우팅 엔진 미통합 (stub 결과)')
    return diffs
  }

  if (expected.triage_level !== actual.triage_level) {
    diffs.push(`triage_level: expected=${expected.triage_level} actual=${actual.triage_level}`)
  }
  if (expected.routing !== actual.routing) {
    diffs.push(`routing: expected=${expected.routing} actual=${actual.routing}`)
  }
  if (expected.card_displayed !== actual.card_displayed) {
    diffs.push(`card_displayed: expected=${expected.card_displayed} actual=${actual.card_displayed}`)
  }

  // message_keywords: 부분 일치 허용 (모든 expected 키워드가 actual에 포함되어야 함)
  const missingKeywords = expected.message_keywords.filter(
    (kw) => !actual.message_keywords.some((ak) => ak.includes(kw) || kw.includes(ak))
  )
  if (missingKeywords.length > 0) {
    diffs.push(`message_keywords 누락: ${missingKeywords.join(', ')}`)
  }

  return diffs
}

function isAppropriateRouting(result: ScenarioResult): boolean {
  if (!result.actual.integrated) return false
  return result.passed
}

// ─── 검증 엔진 ────────────────────────────────────────────────

export async function runValidation(
  scenarios: AlphaScenario[],
  adapter: RoutingAdapter,
): Promise<ValidationReport> {
  const runTimestamp = new Date().toISOString()
  const results: ScenarioResult[] = []

  for (const scenario of scenarios) {
    const actual = await adapter.route(scenario)
    const diff = diffOutputs(scenario.expected_output, actual)

    // stub 결과는 passed=false로 카운트 (실 통합 후 재측정 필요)
    const passed = actual.integrated && diff.length === 0
    const type_ii =
      scenario.expected_output.triage_level === 'L1' &&
      actual.integrated &&
      actual.triage_level !== 'L1'

    results.push({
      id:       scenario.id,
      category: scenario.category,
      passed,
      type_ii,
      expected: scenario.expected_output,
      actual,
      diff,
    })
  }

  const passed         = results.filter((r) => r.passed).length
  const type_ii_count  = results.filter((r) => r.type_ii).length
  const appropriateCount = results.filter((r) => isAppropriateRouting(r)).length
  const appropriate_routing_rate =
    results.length > 0 ? appropriateCount / results.length : 0

  const pass_criteria_met = {
    type_ii_zero:   type_ii_count === 0,
    appropriate_95: appropriate_routing_rate >= 0.95,
  }

  return {
    run_timestamp:        runTimestamp,
    adapter:              adapter.name,
    total:                results.length,
    passed,
    type_ii_count,
    appropriate_routing_rate,
    pass_criteria_met,
    all_passed:           pass_criteria_met.type_ii_zero && pass_criteria_met.appropriate_95,
    failures:             results.filter((r) => !r.passed),
    results,
  }
}
