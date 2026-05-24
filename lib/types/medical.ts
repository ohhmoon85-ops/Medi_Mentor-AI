/**
 * 닥터홈 공통 의료 도메인 타입
 * 전체 코드베이스에서 import하는 단일 타입 소스
 */

// SpecialtyCode는 specialties.ts에서 파생 — 여기서 재export
export type { SpecialtyCode, SpecialtyMeta } from '@/lib/constants/specialties'

// ──────────────────────────────────────────────
// 트리아지 관련 타입
// ──────────────────────────────────────────────

/** MTS/ESI 5단계 응급도 */
export type AcuityLevel = 1 | 2 | 3 | 4 | 5

export interface AcuityConfig {
  level: AcuityLevel
  color: 'red' | 'orange' | 'yellow' | 'green' | 'purple'
  emoji: string
  label: string
  action: string
}

export const ACUITY_CONFIGS: Record<AcuityLevel, AcuityConfig> = {
  1: { level: 1, color: 'red',    emoji: '🔴', label: '즉시 응급',      action: '지금 즉시 119에 신고하세요' },
  2: { level: 2, color: 'orange', emoji: '🟠', label: '응급',           action: '가장 가까운 응급실로 이동하세요' },
  3: { level: 3, color: 'yellow', emoji: '🟡', label: '일반/주말 진료', action: '당일이나 주말 진료를 안내받으세요' },
  4: { level: 4, color: 'green',  emoji: '🟢', label: '일반 외래',      action: '1차 진료 예약을 추천합니다' },
  5: { level: 5, color: 'purple', emoji: '🟣', label: '자가관리',       action: '자가요법으로 관리 가능합니다' },
}

// ──────────────────────────────────────────────
// 진료과 라우팅 결과 타입
// ──────────────────────────────────────────────

import type { SpecialtyCode } from '@/lib/constants/specialties'

export interface SpecialtyMatch {
  code: SpecialtyCode
  confidence: number       // 0.0 ~ 1.0
  reason: string           // LLM 추론 근거
}

export interface RoutingResult {
  primary: SpecialtyMatch
  alternatives: SpecialtyMatch[]
  needs_emergency: boolean
  reasoning_trace: string[]
}

// ──────────────────────────────────────────────
// RAG / 지식베이스 타입
// ──────────────────────────────────────────────

export interface Citation {
  type: 'pubmed' | 'guideline' | 'mfds' | 'hira' | 'nice' | 'who' | 'cochrane'
  name: string
  url?: string
  pmid?: string
  year?: number
}

export interface KnowledgeChunkMeta {
  source_type: Citation['type']
  source_id?: string
  source_url?: string
  title?: string
  language: string
  publication_year?: number
  authority_score: number
  specialty?: SpecialtyCode   // RAG 청크가 어느 진료과에 해당하는지
}

// ──────────────────────────────────────────────
// Red Flag 타입
// ──────────────────────────────────────────────

export interface RedFlagResult {
  hasRedFlag: boolean
  flags: string[]
  acuityOverride?: 1 | 2
  emergencyMessage?: string
  dontMissDiagnoses?: string[]   // Don't Miss 감별진단 힌트
}

// DDx API 응답용 red_flags 항목 (9-F-4)
// red-flag-classifier.ts의 RedFlagResult와 구별: DDx는 per-category, multi-match 구조
export interface DDxRedFlagEntry {
  category: '두통' | '흉통' | '복통' | '요통' | '어지럼증' | '시력 변화'
  severity: 'critical' | 'urgent' | 'high'
  action: 'CALL_119' | 'ER_VISIT' | 'CLINIC_VISIT' | null
  matched_pattern: string   // 매칭된 RegExp.source (디버깅·로깅용)
  matched_text: string      // 입력 중 실제 매칭 substring (향후 UI 하이라이트용)
  confidence: number        // 현재 1.0 고정, 향후 ML 기반 확장 여지
}

// ──────────────────────────────────────────────
// 약물 안전성 타입
// ──────────────────────────────────────────────

export interface DDIAlert {
  drug_a_name: string
  drug_b_name: string
  severity: 'major' | 'moderate' | 'minor'
  mechanism?: string
  recommendation?: string
}

export interface DDIResult {
  interactions: DDIAlert[]
  hasMajor: boolean
}

// ──────────────────────────────────────────────
// 환자 세션 타입
// ──────────────────────────────────────────────

export interface PatientContext {
  age?: number
  ageBand?: string            // "30-39"
  sex?: 'M' | 'F'
  pregnancyStatus?: boolean
  comorbidities?: string[]
  medications?: string[]
  locationLat?: number
  locationLng?: number
}

// ──────────────────────────────────────────────
// 의사 전용 타입
// ──────────────────────────────────────────────

export interface DoctorContext {
  specialty: SpecialtyCode
  subSpecialty?: string
  licenseNumber: string
}

export interface DDxItem {
  rank: number
  diagnosis_name: string
  icd10?: string
  probability: number          // 0.0 ~ 1.0
  evidence_strength: 'strong' | 'moderate' | 'weak'
  supporting_findings: string[]
  rule_out_findings: string[]
  next_steps: string[]
  is_dont_miss: boolean
  citations: Citation[]
}

export interface DDxResult {
  case_summary: string
  differentials: DDxItem[]
  dont_miss: {
    name: string
    why: string
    rule_out_test: string
    is_critical: boolean
  }[]
  red_flags: DDxRedFlagEntry[]  // 룰 기반 감지 결과 (9-F-4) — 미적중 시 빈 배열
}
