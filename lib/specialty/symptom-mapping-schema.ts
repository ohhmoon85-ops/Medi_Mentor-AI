/**
 * M3 증상-진료과 매핑 사전 스키마
 *
 * 설계 원칙:
 * (1) red_flag_category 필드로 단계 A·B 검출 결과와 연결 (M3-3에서 통합)
 * (2) pediatric_specialty / obstetric_specialty 로 capturedDemographics 분기 (M3-3에서 활용)
 * (3) validation_status 로 의료자문 검증 진행 상황 추적
 * (4) primary / secondary / tertiary 분리로 환자에게 단계적 안내 가능 (M3-2에서 채움)
 *
 * 브로드 추천 정책 (M3-2 이행 기준):
 * - secondary_specialties 는 반드시 1개 이상 채워야 함 (빈 배열 금지)
 * - 1차 추천이 전문과인 경우 FM·IM 등 1차 진료과를 secondary 에 포함
 * - 환자 메시지는 "A과에 가시거나, B과·C과를 방문하셔도 됩니다" 안내자형으로 작성
 *
 * 의존 관계:
 * - lib/constants/specialties.ts (SpecialtyCode 타입)
 * - lib/safety/red-flag-data.ts 의 6개 카테고리 레이블과 동일 문자열 사용 (M3-3 연동)
 * - app/(care)/chat/page.tsx 의 capturedDemographics state (M3-3 연동)
 * - app/api/ddx/route.ts 응답 페이로드 (M3-4에서 추가)
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

// ─── 공통 열거형 ──────────────────────────────────────────────

/**
 * 단계 A·B 6개 red_flag 카테고리 — lib/safety/red-flag-data.ts의 CATEGORY_PATTERNS와 1:1 대응
 * M3-3에서 통합: 해당 카테고리 매칭 시 triage_level 를 ≥ urgent 로 상향
 */
export type RedFlagCategory =
  | '두통'
  | '흉통'
  | '복통'
  | '요통'
  | '어지럼증'
  | '시력 변화'

/**
 * 진료 긴급도 5단계 — MTS/ESI 기반 환자 안내용
 * critical: 즉시 119·응급실 (MTS 1)
 * urgent: 응급실 방문 (MTS 2·3)
 * night_weekend: 야간·주말 응급실 / 평일 외래 (MTS 3·4 경계)
 * outpatient: 외래 진료 권장 (MTS 4)
 * self_care: 자가관리 또는 일반 외래 (MTS 5)
 */
export type TriageLevel = 'critical' | 'urgent' | 'night_weekend' | 'outpatient' | 'self_care'

/** 1차 진료 외래 발생 빈도 */
export type PrevalenceLevel = 'high' | 'medium' | 'low'

/**
 * 주요 대상 연령 그룹 (복수 허용)
 * infant: 0–24개월 / child: 2–17세 / adult: 18–64세 / elderly: 65세 이상
 */
export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly'

/**
 * 의료자문 검증 상태
 * draft → reviewed → approved (승인 후 운영 반영)
 * rejected: 자문 결과 부적합 판정, 수정 필요 (M3-1-fix: 사용자 결정으로 스키마에 포함 유지)
 */
export type ValidationStatus = 'draft' | 'reviewed' | 'approved' | 'rejected'

// ─── 핵심 인터페이스 ──────────────────────────────────────────

/**
 * 브로드 추천 정책:
 * M3-2에서 secondary_specialties 를 반드시 1개 이상 채워야 함.
 * 1인칭 패턴: "A과에 가세요" → "A과 또는 B과를 방문하세요"
 * 3인칭 패턴: "A과 진료가 필요합니다" → "A과 진료가 필요하며, B과·C과에서도 진료받으실 수 있습니다"
 */
export interface SymptomMappingEntry {
  /** 고유 식별자 (영문 snake_case) */
  symptom_id: string

  /** 환자 표시용 한국어 일상 표현 — 의학 전문용어 사용 금지 */
  korean_name: string

  /** 환자 화면 표시용 설명 (1~2문장, 30자 이내 권장) */
  description: string

  /** 이 진료과를 추천하는 임상적 이유 (M3-2 이후 채움) */
  recommendation_reason: string

  /** 진료 긴급도 5단계 */
  triage_level: TriageLevel

  /** 1차 진료 발생 빈도 */
  prevalence: PrevalenceLevel

  /** 주요 대상 연령 그룹 (복수) — infant/child/adult/elderly 조합 */
  age_group: AgeGroup[]

  // ── M3-2에서 채울 진료과 매핑 필드 ─────────────────────────
  /** 1차 추천 진료과 코드 — M3-2에서 추가 */
  primary_specialty?: SpecialtyCode
  /**
   * 대안 진료과 코드 목록 — M3-2에서 추가
   * 브로드 추천 정책: 반드시 1개 이상 채울 것 (빈 배열 금지)
   */
  secondary_specialties?: SpecialtyCode[]
  /** 3차 옵션 — M3-2에서 추가 */
  tertiary_specialties?: SpecialtyCode[]

  // ── M3-3에서 capturedDemographics 연동 ──────────────────────
  /**
   * isMinor=true 시 우선 추천 진료과
   * app/(care)/chat/page.tsx capturedDemographics.isMinor 와 연동 (M3-3에서 활용)
   */
  pediatric_specialty?: SpecialtyCode
  /**
   * pregnancy=true 시 우선 추천 진료과
   * app/(care)/chat/page.tsx capturedDemographics.pregnancy 와 연동 (M3-3에서 활용)
   */
  obstetric_specialty?: SpecialtyCode

  // ── M3-2에서 채울 패턴 필드 ─────────────────────────────────
  /**
   * 증상 검출 패턴 (1인칭 + 3인칭 그룹)
   * E-1 정체성 정책: 1인칭(입력자=환자)과 3인칭(입력자≠환자, 가족 단위) 명확히 분리
   * M3-3에서 3인칭 매칭 시 family_demographics 라우팅 처리
   */
  patterns?: RegExp[]
  /**
   * Type I 과경고 차단 패턴
   * 표면적으로 위험 패턴과 매칭되지만 실제 critical이 아닌 경우 제외
   */
  exclusion_patterns?: RegExp[]

  // ── 단계 A·B 연동 ────────────────────────────────────────────
  /**
   * 단계 A·B red_flag 6개 카테고리와의 연결 키
   * lib/safety/red-flag-data.ts CATEGORY_PATTERNS[].category 와 동일 문자열
   * M3-3 통합: red_flag 매칭 시 이 필드로 증상을 찾아 triage_level 를 urgent 이상으로 상향
   */
  red_flag_category?: RedFlagCategory

  /** 의료자문 검증 상태 — 출시 전 반드시 'approved' 여야 함 */
  validation_status: ValidationStatus
}

// ─── 사전 컨테이너 ────────────────────────────────────────────

export interface SymptomMappingDictionary {
  /** 사전 버전 (semver) */
  version: string
  /** 최종 업데이트 날짜 (ISO 8601) */
  last_updated: string
  /** 의료자문 담당자 */
  validation_contact: string
  /** 증상 목록 */
  symptoms: SymptomMappingEntry[]
}
