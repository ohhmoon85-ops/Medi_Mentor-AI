/**
 * D2-1 체크리스트 방식 — 타입 정의
 *
 * UX 의도 (사용자 결정 2026-05-24):
 * - 끈질긴 문진 회피, 체크박스 + 즉시 답변
 * - 4단계 1분 흐름: 대분류 → 증상 체크 → 시간·강도 → 결과
 * - 보호자 토글 (본인/가족/어린이/노인)
 * - 자살 충동 #30 별도 1393 분기
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

/** 8개 대분류 */
export type RegionId =
  | 'HEAD_FACE'   // 머리·얼굴
  | 'NECK_CHEST'  // 목·가슴
  | 'ABDOMEN'     // 배·소화
  | 'LIMBS'       // 팔·다리·관절
  | 'SKIN'        // 피부
  | 'ENT_EYE'     // 눈·코·귀
  | 'URO_OBGYN'   // 비뇨·여성
  | 'SYSTEMIC'    // 전신·기분

/** 증상 한 건 — 체크박스 후보 */
export interface Symptom {
  id: string
  label: string
  region: RegionId
  /** 응급 신호 (KTAS L1~L2 트리거) */
  urgent: boolean
  /** 자살 충동 등 특수 분기 */
  specialBranch?: 'suicide_1393'
}

/** 응급 신호 트리거 — 체크된 증상 조합으로 KTAS 분류 */
export interface UrgentTrigger {
  /** 모두 체크되어야 발동 (AND 조건) */
  signals: string[]              // symptom.id 배열
  /** 추정 가능 진단 라벨 (UI 노출) */
  possible: string[]
  ktas: 1 | 2
  /** 권장 행동 */
  action: 'CALL_119' | 'GO_ER'
  /** 자살 충동 특수 분기 (1393 자동 표시) */
  specialBranch?: 'suicide_1393'
}

/** 증상 조합 매칭 룰 (KTAS L3~L5 일반 분류) */
export interface CombinationRule {
  /** 진단 후보 라벨 (UI 노출) */
  name: string
  region: RegionId
  /** 모두 체크되어야 함 (AND) */
  required: string[]
  /** 가산 점수용 (체크 시 +1) */
  supporting: string[]
  /** 체크되어 있으면 매칭 무효 (배제 조건) */
  contradictions?: string[]
  /** 매칭 임계값: required 전부 + supporting score >= threshold */
  scoreThreshold: number
  ktas: 3 | 4 | 5
  specialty: SpecialtyCode
  /** lib/supplements/data.ts 의 symptomKey 매핑 (있을 때만) */
  supplementKey?: string
}

/** 잠정 진단 카탈로그 항목 (88건, 부위별 7~10개) */
export interface ConditionEntry {
  /** 진단 라벨 (UI 노출) */
  name: string
  region: RegionId
  /** 응급도 표시 (UI 배지) */
  urgent: boolean
  /** 권장 진료과 */
  specialty: SpecialtyCode
  /** 한 줄 설명 */
  brief: string
}

/** 4단계 컨텍스트 입력 */
export interface ChecklistContext {
  /** 언제부터 */
  duration: 'just_now' | 'within_1h' | 'today' | 'days' | 'week_plus'
  /** 강도 */
  intensity: 'mild' | 'discomfort' | 'severe' | 'extreme'
  /** 보호자 토글 (본인/가족/어린이/노인) */
  companion: 'self' | 'family' | 'child' | 'elder'
  /** 자유 입력 (선택) */
  freeText?: string
}

/** Decision Engine 결과 */
export interface ChecklistMatchResult {
  /** 1단 응급 트리거 매치 (있으면 우선 표시) */
  urgentMatch?: UrgentTrigger & { matchedSignals: string[] }
  /** 2단 조합 매칭 결과 (최대 3건, 점수 내림차순) */
  combinationMatches: Array<CombinationRule & { score: number }>
  /** 최종 KTAS */
  ktas: 1 | 2 | 3 | 4 | 5
  /** 추천 진료과 */
  primarySpecialty: SpecialtyCode | null
  /** 자살 충동 1393 분기 활성화 */
  suicide1393?: boolean
  /** lib/supplements 매핑용 symptomKey (있을 때만) */
  supplementKey?: string
  /** 사용자 자유 입력 + 컨텍스트 echo */
  rationale: string
}
