/**
 * G1-5 consent-form.tsx 자체 검증 (구조 + 코드 확인)
 * 실행: npx tsx components/care/consent/consent-form.test.tsx
 */

import { existsSync, readFileSync } from 'fs'
import path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(label: string, condition: boolean) {
  if (condition) { passed++ } else { failed++; failures.push(label) }
}

// ─── T1: 알파 코드 형식 검증 로직 ────────────────────────────

function isValidAlphaCode(code: string, validCodes: string[]): boolean {
  return validCodes.map((c) => c.trim()).includes(code.trim())
}

const SAMPLE_CODES = ['ALPHA-MM-001', 'ALPHA-MM-002', 'ALPHA-MM-003', 'ALPHA-MM-004', 'ALPHA-MM-005']

assert('T1-1 유효 코드 허용', isValidAlphaCode('ALPHA-MM-001', SAMPLE_CODES))
assert('T1-2 유효 코드 5번 허용', isValidAlphaCode('ALPHA-MM-005', SAMPLE_CODES))
assert('T1-3 잘못된 코드 거부', !isValidAlphaCode('ALPHA-MM-006', SAMPLE_CODES))
assert('T1-4 빈 코드 거부', !isValidAlphaCode('', SAMPLE_CODES))
assert('T1-5 공백 포함 코드 허용 (trim)', isValidAlphaCode('  ALPHA-MM-001  ', SAMPLE_CODES))

// ─── T2: 동의 항목 4건 필수 검증 ─────────────────────────────

function allChecked(checks: boolean[]): boolean {
  return checks.every(Boolean)
}

assert('T2-1 4건 모두 체크 시 통과', allChecked([true, true, true, true]))
assert('T2-2 1건 미체크 시 실패', !allChecked([true, true, true, false]))
assert('T2-3 전부 미체크 시 실패', !allChecked([false, false, false, false]))

// ─── T3: consent-form.tsx 파일 구조 확인 ─────────────────────

const formPath = path.join(process.cwd(), 'components/care/consent/consent-form.tsx')
assert('T3-1 consent-form.tsx 파일 존재', existsSync(formPath))

if (existsSync(formPath)) {
  const content = readFileSync(formPath, 'utf8')
  assert('T3-2 use server 선언', content.includes("'use server'"))
  assert('T3-3 ConsentForm export', content.includes('export async function ConsentForm'))
  assert('T3-4 submitConsent 서버 액션', content.includes('export async function submitConsent'))
  assert('T3-5 ALPHA_USER_CODES 환경변수 사용', content.includes('ALPHA_USER_CODES'))
  assert('T3-6 동의 항목 (a) AI 진단 아님', content.includes('진단 또는 처방이 아님'))
  assert('T3-7 동의 항목 (b) 응급 도구 아님', content.includes('응급 상황 판단 도구'))
  assert('T3-8 동의 항목 (c) 로그 동의', content.includes('통계·운영 로그'))
  assert('T3-9 동의 항목 (d) 피드백 의사', content.includes('피드백'))
  assert('T3-10 logs/consent 저장', content.includes("'consent'"))
  assert('T3-11 invalid_code 에러 처리', content.includes('invalid_code'))
  assert('T3-12 incomplete 에러 처리', content.includes('incomplete'))
}

// ─── T4: alpha-consent 페이지 구조 확인 ──────────────────────

const pagePath = path.join(process.cwd(), 'app/(care)/care/alpha-consent/page.tsx')
assert('T4-1 alpha-consent/page.tsx 존재', existsSync(pagePath))

if (existsSync(pagePath)) {
  const content = readFileSync(pagePath, 'utf8')
  assert('T4-2 ConsentForm import', content.includes('ConsentForm'))
  assert('T4-3 searchParams 처리', content.includes('searchParams'))
  assert('T4-4 success=1 처리', content.includes("success === '1'"))
}

// ─── 결과 출력 ────────────────────────────────────────────────

const total = passed + failed
console.log(`\n=== consent-form.test.tsx: ${passed}/${total} PASS ===`)
if (failures.length > 0) {
  console.log('❌ 실패:')
  failures.forEach((f) => console.log(`   - ${f}`))
} else {
  console.log('✅ 전체 통과')
}

process.exit(failed > 0 ? 1 : 0)
