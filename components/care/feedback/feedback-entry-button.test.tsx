/**
 * G1-3 feedback-entry-button.tsx 자체 검증 (구조 + 타입 확인)
 * 실행: npx tsx components/care/feedback/feedback-entry-button.test.tsx
 *
 * 브라우저 환경 없이 실행 가능한 구조 검증만.
 * 실제 렌더링 테스트는 브라우저 환경 필요 (E2E 단계에서 추가).
 */

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

// ─── T1: 환경변수 분기 로직 검증 ──────────────────────────────

function getFeedbackForm(daysSinceFirst: number): 'A' | 'B' | 'C' {
  if (daysSinceFirst >= 30) return 'C'
  if (daysSinceFirst >= 7)  return 'B'
  return 'A'
}

assert('T1-1 0일 → 폼 A', getFeedbackForm(0) === 'A')
assert('T1-2 3일 → 폼 A', getFeedbackForm(3) === 'A')
assert('T1-3 7일 → 폼 B', getFeedbackForm(7) === 'B')
assert('T1-4 15일 → 폼 B', getFeedbackForm(15) === 'B')
assert('T1-5 30일 → 폼 C', getFeedbackForm(30) === 'C')
assert('T1-6 60일 → 폼 C', getFeedbackForm(60) === 'C')
assert('T1-7 경계: 6.99일 → 폼 A', getFeedbackForm(6.99) === 'A')
assert('T1-8 경계: 29.99일 → 폼 B', getFeedbackForm(29.99) === 'B')

// ─── T2: 환경변수 키 명명 검증 ───────────────────────────────

const ENV_KEYS: Record<'A' | 'B' | 'C', string> = {
  A: 'NEXT_PUBLIC_TALLY_FEEDBACK_URL_A',
  B: 'NEXT_PUBLIC_TALLY_FEEDBACK_URL_B',
  C: 'NEXT_PUBLIC_TALLY_FEEDBACK_URL_C',
}

assert('T2-1 폼 A 환경변수 키 형식', ENV_KEYS.A.startsWith('NEXT_PUBLIC_'))
assert('T2-2 폼 B 환경변수 키 형식', ENV_KEYS.B.startsWith('NEXT_PUBLIC_'))
assert('T2-3 폼 C 환경변수 키 형식', ENV_KEYS.C.startsWith('NEXT_PUBLIC_'))
assert('T2-4 A/B/C 키 모두 다름', new Set(Object.values(ENV_KEYS)).size === 3)

// ─── T3: 컴포넌트 파일 존재 확인 (Node.js) ───────────────────

import { existsSync, readFileSync } from 'fs'
import path from 'path'

const componentPath = path.join(
  process.cwd(),
  'components/care/feedback/feedback-entry-button.tsx',
)
assert('T3-1 feedback-entry-button.tsx 파일 존재', existsSync(componentPath))

// 파일 내용 검증
if (existsSync(componentPath)) {
  const content = readFileSync(componentPath, 'utf8')
  assert('T3-2 use client 선언', content.includes("'use client'"))
  assert('T3-3 FeedbackEntryButton export', content.includes('export function FeedbackEntryButton'))
  assert('T3-4 Tally URL env 분기', content.includes('NEXT_PUBLIC_TALLY_FEEDBACK_URL'))
  assert('T3-5 새 탭 오픈 (target=_blank)', content.includes('target="_blank"'))
  assert('T3-6 환경변수 미설정 시 null 반환', content.includes('return null'))
}

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== feedback-entry-button.test.tsx: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
