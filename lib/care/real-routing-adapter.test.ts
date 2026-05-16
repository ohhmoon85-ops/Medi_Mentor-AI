/**
 * G2-3 Real Routing Adapter 자가 검증
 * 실행: npx tsx lib/care/real-routing-adapter.test.ts
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { RealRoutingAdapter } from './real-routing-adapter'
import type { AlphaScenariosFile, AlphaScenario } from './alpha-validation/alpha-validator'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

const SCENARIOS_PATH = resolve(process.cwd(), 'docs/alpha/alpha_scenarios.json')
const file = JSON.parse(readFileSync(SCENARIOS_PATH, 'utf-8')) as AlphaScenariosFile
const scenarios = file.scenarios
const byId = new Map(scenarios.map((s) => [s.id, s]))

const adapter = new RealRoutingAdapter()

async function check(id: string, expected: { triage: string; routing: string; card: string }) {
  const sc = byId.get(id)
  if (!sc) { failed++; failures.push(`${id} 시나리오 미존재`); return }
  const out = await adapter.route(sc)
  assert(`${id} triage_level=${expected.triage}`,    out.triage_level    === expected.triage)
  assert(`${id} routing=${expected.routing}`,        out.routing         === expected.routing)
  assert(`${id} card_displayed=${expected.card}`,    out.card_displayed  === expected.card)
  assert(`${id} integrated=true`,                    out.integrated      === true)
}

async function run() {
  // ── L1 Type I (전형) ──────────────────────────────────────
  await check('ALPHA-001', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-002', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-003', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-004', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-005', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-006', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })
  await check('ALPHA-007', { triage: 'L1', routing: '119_immediate', card: 'CriticalEmergencyCard' })

  // ── L1 Type II (경계 — 정책 핵심) ─────────────────────────
  await check('ALPHA-008', { triage: 'L1', routing: '119_immediate',        card: 'CriticalEmergencyCard' })
  await check('ALPHA-009', { triage: 'L1', routing: '119_or_ER_immediate',  card: 'CriticalEmergencyCard' })
  await check('ALPHA-010', { triage: 'L1', routing: '119_immediate',        card: 'CriticalEmergencyCard' })
  await check('ALPHA-011', { triage: 'L1', routing: '119_or_ER_immediate',  card: 'CriticalEmergencyCard' })
  await check('ALPHA-012', { triage: 'L1', routing: '119_immediate',        card: 'CriticalEmergencyCard' })

  // ── L2 ────────────────────────────────────────────────────
  await check('ALPHA-013', { triage: 'L2', routing: 'ER_visit', card: 'EmergencyRoomCard' })
  await check('ALPHA-014', { triage: 'L2', routing: 'ER_visit', card: 'EmergencyRoomCard' })
  await check('ALPHA-015', { triage: 'L2', routing: 'ER_visit', card: 'EmergencyRoomCard' })

  // ── L3 (소아·성인 야간/주말) ──────────────────────────────
  await check('ALPHA-016', { triage: 'L3', routing: 'night_pediatric_clinic',     card: 'NightWeekendInfoCard' })
  await check('ALPHA-017', { triage: 'L3', routing: 'weekend_pediatric_clinic',   card: 'NightWeekendInfoCard' })
  await check('ALPHA-018', { triage: 'L3', routing: 'night_clinic_adult',         card: 'NightWeekendInfoCard' })
  await check('ALPHA-019', { triage: 'L3', routing: 'weekend_pediatric_or_clinic',card: 'NightWeekendInfoCard' })

  // ── L4 ────────────────────────────────────────────────────
  await check('ALPHA-020', { triage: 'L4', routing: 'regular_visit', card: 'SpecialtyRecommendationCard' })
  await check('ALPHA-021', { triage: 'L4', routing: 'regular_visit', card: 'SpecialtyRecommendationCard' })
  await check('ALPHA-022', { triage: 'L4', routing: 'regular_visit', card: 'SpecialtyRecommendationCard' })

  // ── L5 ────────────────────────────────────────────────────
  await check('ALPHA-023', { triage: 'L5', routing: 'self_care', card: 'SelfCareCard' })
  await check('ALPHA-024', { triage: 'L5', routing: 'self_care', card: 'SelfCareCard' })

  // ── over_routing (AGENDA-18 감산) ─────────────────────────
  await check('ALPHA-025', { triage: 'L4', routing: 'regular_visit_or_self_care', card: 'SpecialtyRecommendationCard' })
  await check('ALPHA-026', { triage: 'L5', routing: 'self_care_or_regular',       card: 'SelfCareCard' })
  await check('ALPHA-027', { triage: 'L5', routing: 'self_care_or_regular',       card: 'SelfCareCard' })
  await check('ALPHA-028', { triage: 'L5', routing: 'self_care',                  card: 'SelfCareCard' })

  // ── Type II 명시 검증 (정책 매칭 카운트) ──────────────────
  const typeIIIds = ['ALPHA-008','ALPHA-009','ALPHA-010','ALPHA-011','ALPHA-012']
  for (const id of typeIIIds) {
    const sc = byId.get(id)!
    const out = await adapter.route(sc)
    assert(`${id} Type II → triage_level=L1`, out.triage_level === 'L1')
    assert(`${id} Type II → integrated=true`, out.integrated === true)
  }

  // ── message_keywords 부분 일치 검증 ───────────────────────
  for (const sc of scenarios) {
    const out = await adapter.route(sc)
    const expectedKws = sc.expected_output.message_keywords
    const missing = expectedKws.filter(
      (kw) => !out.message_keywords.some((ak) => ak.includes(kw) || kw.includes(ak)),
    )
    assert(`${sc.id} message_keywords 모두 매칭`, missing.length === 0)
  }

  // ── 결과 출력 ───────────────────────────────────────────────
  const total = passed + failed
  console.log(`\n=== real-routing-adapter.test.ts: ${passed}/${total} PASS ===`)
  if (failures.length > 0) {
    console.log('❌ 실패:')
    failures.forEach((f) => console.log(`   - ${f}`))
  } else {
    console.log('✅ 전체 통과')
  }
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((err) => {
  console.error('테스트 실행 실패:', err)
  process.exit(1)
})
