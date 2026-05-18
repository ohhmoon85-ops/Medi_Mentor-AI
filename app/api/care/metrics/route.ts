/**
 * G1-4 N1 메트릭 수집 API 라우트
 * POST /api/care/metrics
 *
 * PII 미저장 — session_hash는 익명 hash만 허용.
 * 알파 단계: 콘솔 로그 + Vercel Blob `metrics/<metric_type>.jsonl` (G3-4 A안 마이그레이션)
 *   - 동시성 전략 (α): 메트릭 타입별 분리 — TPS << 1, 충돌 위험 < 1%
 *   - 형식: NDJSON (JSON Lines, 기존 형식 보존)
 *   - 환경 변수: BLOB_READ_WRITE_TOKEN (G3-3 공유)
 *   - access: 'public' (v2 private deprecated, addRandomSuffix=false 로 URL 추측 차단)
 * TODO: LAUNCH-0 P-2(d) Sentry/PostHog 등 외부 메트릭 서비스 검토
 */

import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
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

  // Vercel Blob NDJSON append (read-modify-write)
  // 동시성 위험: 동일 type 동시 POST 시 손실 가능 — 알파 5명 TPS << 1 허용 위험
  try {
    const pathname = `metrics/${record.payload.metric_type}.jsonl`
    const newLine = JSON.stringify(record) + '\n'

    // 기존 NDJSON 읽기 (없으면 빈 문자열)
    let existing = ''
    try {
      const result = await list({ prefix: pathname })
      const target = result.blobs.find((b) => b.pathname === pathname)
      if (target) {
        const res = await fetch(target.url)
        if (res.ok) existing = await res.text()
      }
    } catch {
      // 첫 적재 — 새 Blob 생성
    }

    await put(pathname, existing + newLine, {
      access:          'public',
      addRandomSuffix: false,
      contentType:     'application/x-ndjson',
    })
  } catch (e) {
    // Blob 저장 실패는 API 응답에 영향 없음 (BLOB_READ_WRITE_TOKEN 누락 등)
    console.error('[metrics] Blob 저장 실패:', e)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
