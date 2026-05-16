/**
 * G1-4 N1 메트릭 수집 인터페이스
 *
 * 클라이언트 → POST /api/care/metrics 경유.
 * PII 미저장: session_hash는 익명 hash.
 * 알파 단계: 콘솔 로그 + logs/metrics/<YYYY-MM-DD>.jsonl
 * TODO: 공개 출시 시 DB로 교체 예정
 */

import type { MetricPayload, MetricRecord, ValidationResult } from './metrics-types'

// ─── 페이로드 검증 ─────────────────────────────────────────────

const VALID_METRIC_TYPES = [
  'M1_satisfaction',
  'M2_specialty_match',
  'M3_emergency_routing',
  'M4_retention',
] as const

export function validateMetricPayload(payload: unknown): ValidationResult {
  const errors: string[] = []

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload가 객체가 아님'] }
  }

  const p = payload as Record<string, unknown>

  if (!p.metric_type || !VALID_METRIC_TYPES.includes(p.metric_type as never)) {
    errors.push(`metric_type 유효하지 않음: ${p.metric_type}`)
  }
  if (!p.session_hash || typeof p.session_hash !== 'string' || p.session_hash.length < 8) {
    errors.push('session_hash 누락 또는 너무 짧음')
  }

  switch (p.metric_type) {
    case 'M1_satisfaction': {
      const score = p.score as number
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        errors.push('M1: score는 1~5 정수여야 함')
      }
      if (!['immediate', '7day', '30day'].includes(p.timing as string)) {
        errors.push('M1: timing은 immediate|7day|30day 중 하나여야 함')
      }
      break
    }
    case 'M2_specialty_match': {
      if (!p.recommended_specialty || typeof p.recommended_specialty !== 'string') {
        errors.push('M2: recommended_specialty 누락')
      }
      if (typeof p.matched !== 'boolean') {
        errors.push('M2: matched는 boolean이어야 함')
      }
      break
    }
    case 'M3_emergency_routing': {
      if (typeof p.visited_er !== 'boolean') {
        errors.push('M3: visited_er는 boolean이어야 함')
      }
      if (typeof p.routing_appropriate !== 'boolean') {
        errors.push('M3: routing_appropriate는 boolean이어야 함')
      }
      break
    }
    case 'M4_retention': {
      if (!['30day', '60day', '90day'].includes(p.timing as string)) {
        errors.push('M4: timing은 30day|60day|90day 중 하나여야 함')
      }
      if (typeof p.returned !== 'boolean') {
        errors.push('M4: returned는 boolean이어야 함')
      }
      break
    }
  }

  return { valid: errors.length === 0, errors }
}

// ─── 클라이언트 수집 함수 ─────────────────────────────────────

/** 브라우저에서 메트릭 POST 요청 전송 */
export async function collectMetric(payload: MetricPayload): Promise<void> {
  try {
    await fetch('/api/care/metrics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
  } catch {
    // 메트릭 수집 실패는 사용자 경험에 영향 주지 않음 — 무시
  }
}

// ─── 익명 세션 hash 생성 ─────────────────────────────────────

/**
 * 브라우저 세션 기반 익명 hash (PII 없음).
 * sessionStorage에 저장 → 탭 닫으면 초기화.
 */
export function getAnonymousSessionHash(): string {
  if (typeof window === 'undefined') return 'server-side'

  const key = 'care_session_hash'
  const existing = sessionStorage.getItem(key)
  if (existing) return existing

  const hash = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  sessionStorage.setItem(key, hash)
  return hash
}

// ─── 서버 사이드 저장 (API route에서 사용) ───────────────────

export function buildMetricRecord(payload: MetricPayload): MetricRecord {
  return {
    recorded_at: new Date().toISOString(),
    payload,
  }
}
