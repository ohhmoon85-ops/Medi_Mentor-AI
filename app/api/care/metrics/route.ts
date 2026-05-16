/**
 * G1-4 N1 메트릭 수집 API 라우트
 * POST /api/care/metrics
 *
 * PII 미저장 — session_hash는 익명 hash만 허용.
 * 알파 단계: 콘솔 로그 + logs/metrics/<YYYY-MM-DD>.jsonl
 * TODO: 공개 출시 시 Supabase/DB로 교체
 */

import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync, mkdirSync } from 'fs'
import path from 'path'
import { validateMetricPayload, buildMetricRecord } from '@/lib/care/metrics/metrics-collector'
import type { MetricPayload } from '@/lib/care/metrics/metrics-types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON 파싱 실패' }, { status: 400 })
  }

  const validation = validateMetricPayload(payload)
  if (!validation.valid) {
    return NextResponse.json(
      { error: '페이로드 검증 실패', details: validation.errors },
      { status: 422 },
    )
  }

  const record = buildMetricRecord(payload as MetricPayload)

  // 콘솔 로그 (알파 단계 디버깅)
  console.log('[metrics]', JSON.stringify(record))

  // JSONL 파일 저장
  try {
    const dateStr = new Date().toISOString().slice(0, 10)
    const logsDir = path.join(process.cwd(), 'logs', 'metrics')
    mkdirSync(logsDir, { recursive: true })
    const logPath = path.join(logsDir, `${dateStr}.jsonl`)
    appendFileSync(logPath, JSON.stringify(record) + '\n', 'utf8')
  } catch (e) {
    // 파일 저장 실패는 API 응답에 영향 없음
    console.error('[metrics] 파일 저장 실패:', e)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
