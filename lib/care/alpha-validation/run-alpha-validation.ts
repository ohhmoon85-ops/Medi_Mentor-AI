/**
 * G1-1 CLI 실행 진입점 — 알파 시나리오 검증 도구
 *
 * 실행 방법:
 *   npx tsx lib/care/alpha-validation/run-alpha-validation.ts
 *
 * 입력: docs/alpha/alpha_scenarios.json (읽기 전용)
 * 출력: docs/alpha/validation_reports/<ISO_TIMESTAMP>.json
 *
 * 어댑터: G2-3 RealRoutingAdapter 통합 완료 (2026-05-16).
 *   - AGENDA-12~17 L1 강제 정책 + AGENDA-18/19 감산 정책 평가
 *   - 정책 미매칭 시 resolveRecommendation() 엔진 경로
 */

import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import {
  runValidation,
  type AlphaScenariosFile,
} from './alpha-validator'
import { RealRoutingAdapter } from '../real-routing-adapter'

async function main() {
  const root = process.cwd()
  const scenariosPath = path.join(root, 'docs', 'alpha', 'alpha_scenarios.json')

  // 1. 입력 JSON 읽기 (진실 원천 — 절대 수정 금지)
  let scenariosFile: AlphaScenariosFile
  try {
    scenariosFile = JSON.parse(readFileSync(scenariosPath, 'utf8')) as AlphaScenariosFile
  } catch (e) {
    console.error('❌ alpha_scenarios.json 읽기 실패:', e)
    process.exit(1)
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  알파 시나리오 검증 도구 v1`)
  console.log(`  입력: ${scenariosFile.scenarios.length}개 시나리오`)
  console.log(`  어댑터: RealRoutingAdapter (G2-3 통합)`)
  console.log(`${'═'.repeat(60)}`)

  // 2. 검증 실행
  const adapter = new RealRoutingAdapter()
  const report  = await runValidation(scenariosFile.scenarios, adapter)

  // 3. 콘솔 출력
  console.log(`\n  Total    : ${report.total}`)
  console.log(`  Passed   : ${report.passed}`)
  console.log(`  Type II  : ${report.type_ii_count}`)
  console.log(`  Routing% : ${(report.appropriate_routing_rate * 100).toFixed(1)}%`)
  console.log(`\n  기준 충족 여부:`)
  console.log(`    Type II = 0   : ${report.pass_criteria_met.type_ii_zero ? '✅' : '❌'} (현재: ${report.type_ii_count})`)
  console.log(`    적정 ≥ 95%    : ${report.pass_criteria_met.appropriate_95 ? '✅' : '❌'} (현재: ${(report.appropriate_routing_rate * 100).toFixed(1)}%)`)

  if (report.adapter === 'stub') {
    console.log('\n  ⚠️  라우팅 엔진 미통합 (stub 결과)')
    console.log('     → G1-2 자문 회신 후 RealRoutingAdapter 교체 필요')
  }

  // 실패 시나리오 요약
  if (report.failures.length > 0) {
    console.log(`\n  실패 시나리오 (${report.failures.length}개):`)
    report.failures.forEach((f) => {
      console.log(`    - ${f.id} (${f.category})`)
      f.diff.forEach((d) => console.log(`        · ${d}`))
    })
  }

  // 4. 보고서 저장
  const reportsDir = path.join(root, 'docs', 'alpha', 'validation_reports')
  mkdirSync(reportsDir, { recursive: true })

  const timestamp    = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath   = path.join(reportsDir, `${timestamp}.json`)
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')
  console.log(`\n  보고서 저장: ${reportPath}`)
  console.log(`${'═'.repeat(60)}\n`)

  process.exit(report.pass_criteria_met.type_ii_zero ? 0 : 1)
}

main().catch((e) => {
  console.error('예기치 않은 오류:', e)
  process.exit(1)
})
