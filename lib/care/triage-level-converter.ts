/**
 * G2-1 TriageLevel 변환 레이어
 *
 * recommendation-engine.ts(TriageLevel: 'critical'|'urgent'|'night_weekend'|'outpatient'|'self_care')
 * ↔ alpha 시나리오(LLevel: 'L1'|'L2'|'L3'|'L4'|'L5') 1:1 매핑.
 *
 * routing-policy-table.ts 의 TriageLevel(=LLevel) 과는 별도 타입이며,
 * 본 파일은 lib/specialty/symptom-mapping-schema.ts 의 TriageLevel(엔진용)을 참조한다.
 */

import type { TriageLevel } from '@/lib/specialty/symptom-mapping-schema'

export type LLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

const TO_L: Record<TriageLevel, LLevel> = {
  critical:      'L1',
  urgent:        'L2',
  night_weekend: 'L3',
  outpatient:    'L4',
  self_care:     'L5',
}

const FROM_L: Record<LLevel, TriageLevel> = {
  L1: 'critical',
  L2: 'urgent',
  L3: 'night_weekend',
  L4: 'outpatient',
  L5: 'self_care',
}

const L_LEVELS: ReadonlySet<string> = new Set(['L1','L2','L3','L4','L5'])
const TRIAGE_LEVELS: ReadonlySet<string> = new Set([
  'critical','urgent','night_weekend','outpatient','self_care',
])

export function toLLevel(level: TriageLevel): LLevel {
  return TO_L[level]
}

export function fromLLevel(level: LLevel): TriageLevel {
  return FROM_L[level]
}

export function isLLevel(value: unknown): value is LLevel {
  return typeof value === 'string' && L_LEVELS.has(value)
}

export function isTriageLevel(value: unknown): value is TriageLevel {
  return typeof value === 'string' && TRIAGE_LEVELS.has(value)
}
