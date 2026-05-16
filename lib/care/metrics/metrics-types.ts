/**
 * G1-4 N1 메트릭 수집 — 4종 메트릭 타입 정의 (인계 v11 §5.1.1)
 *
 * PII 미저장: user_id는 세션 기반 익명 hash만.
 * 알파 단계 저장: logs/metrics/<YYYY-MM-DD>.jsonl (콘솔 + 파일)
 * TODO: 공개 출시 시 DB(Supabase/PostgreSQL)로 교체 예정
 */

// ─── 공통 ─────────────────────────────────────────────────────

/** 세션 기반 익명 hash — PII 미포함 */
export type AnonymousSessionHash = string

export type MetricTiming = 'immediate' | '7day' | '30day' | '60day' | '90day'

export type MetricType = 'M1_satisfaction' | 'M2_specialty_match' | 'M3_emergency_routing' | 'M4_retention'

// ─── M1: 사용자 만족도 ─────────────────────────────────────────

export interface M1SatisfactionPayload {
  metric_type: 'M1_satisfaction'
  session_hash: AnonymousSessionHash
  timing: 'immediate' | '7day' | '30day'
  /** 5점 리커트 (1 = 매우 불만족, 5 = 매우 만족) */
  score: 1 | 2 | 3 | 4 | 5
  /** 선택적 자유 의견 (200자 이내, 내용 미검토) */
  comment?: string
}

// ─── M2: 진료과 매칭 정확도 (자기 보고) ─────────────────────────

export interface M2SpecialtyMatchPayload {
  metric_type: 'M2_specialty_match'
  session_hash: AnonymousSessionHash
  /** 시스템 추천 진료과 코드 */
  recommended_specialty: string
  /** 실제 방문 진료과 코드 (자기 보고) */
  actual_specialty?: string
  /** 추천과 실제 일치 여부 (자기 보고) */
  matched: boolean
  /** 미일치 시 사유 (선택) */
  mismatch_reason?: string
}

// ─── M3: 응급 라우팅 적정성 (critical 후속 보고) ─────────────────

export interface M3EmergencyRoutingPayload {
  metric_type: 'M3_emergency_routing'
  session_hash: AnonymousSessionHash
  /** L1 라우팅을 받은 시나리오의 triage_level */
  triage_level: string
  /** 실제로 응급실 방문 여부 (자기 보고) */
  visited_er: boolean
  /** 응급실 도착 시 진단 결과 (선택, 자기 보고) */
  er_diagnosis?: string
  /** 라우팅 적정 여부 (사용자 판단) */
  routing_appropriate: boolean
}

// ─── M4: 잔존율 (공개 출시 후 자연 유입) ─────────────────────────

export interface M4RetentionPayload {
  metric_type: 'M4_retention'
  session_hash: AnonymousSessionHash
  timing: '30day' | '60day' | '90day'
  /** 재방문 여부 */
  returned: boolean
  /** 재방문 시 사용 기능 목록 (선택) */
  features_used?: string[]
}

// ─── 유니온 타입 ──────────────────────────────────────────────

export type MetricPayload =
  | M1SatisfactionPayload
  | M2SpecialtyMatchPayload
  | M3EmergencyRoutingPayload
  | M4RetentionPayload

// ─── 저장 레코드 ──────────────────────────────────────────────

export interface MetricRecord {
  recorded_at: string
  payload: MetricPayload
}

// ─── 검증 결과 ────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
}
