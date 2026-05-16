/**
 * G1-2 라우팅 정책 런타임 로더
 *
 * ROUTING_POLICY_TABLE에서 조건에 맞는 정책 조회.
 * 활성화 정책 (status='approved') 만 라우팅에 사용.
 * 자문 회신 전: 모두 'pending' → 라우팅 엔진 override 없음.
 */

import { ROUTING_POLICY_TABLE, type RoutingPolicy, type ReviewStatus } from './routing-policy-table'

// ─── 조회 함수 ────────────────────────────────────────────────

/** policy_id로 단일 정책 조회 */
export function getPolicyById(policyId: string): RoutingPolicy | undefined {
  return ROUTING_POLICY_TABLE.find((p) => p.policy_id === policyId)
}

/** 특정 status 필터링 */
export function getPoliciesByStatus(status: ReviewStatus): readonly RoutingPolicy[] {
  return ROUTING_POLICY_TABLE.filter((p) => p.clinical_review_status === status)
}

/** 활성화된(approved) 정책 목록 */
export function getActivePolicies(): readonly RoutingPolicy[] {
  return getPoliciesByStatus('approved')
}

/** pending 정책 목록 (자문 회신 대기) */
export function getPendingPolicies(): readonly RoutingPolicy[] {
  return getPoliciesByStatus('pending')
}

/** 자문 회신 완료 여부 요약 */
export function getPolicyApprovalSummary(): {
  total:    number
  pending:  number
  approved: number
  modified: number
  rejected: number
  all_approved: boolean
} {
  const total    = ROUTING_POLICY_TABLE.length
  const pending  = getPoliciesByStatus('pending').length
  const approved = getPoliciesByStatus('approved').length
  const modified = getPoliciesByStatus('modified').length
  const rejected = getPoliciesByStatus('rejected').length

  return {
    total,
    pending,
    approved,
    modified,
    rejected,
    all_approved: pending === 0 && approved + modified === total - rejected,
  }
}

/**
 * TODO: G1-2 자문 회신 후 구현 예정
 * trigger_conditions를 평가하여 적용 가능한 정책 반환.
 * 현재는 모두 pending이므로 빈 배열 반환.
 */
export function evaluatePolicies(
  _context: Record<string, unknown>,
): readonly RoutingPolicy[] {
  const active = getActivePolicies()
  if (active.length === 0) return []

  // TODO: trigger_conditions 평가 로직 구현
  // 자문 회신 수령 후 각 정책의 trigger_conditions를 context와 비교
  return []
}
