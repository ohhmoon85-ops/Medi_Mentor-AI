/**
 * M3-1 진료과 마스터 (환자용 라우팅 전용)
 *
 * lib/constants/specialties.ts 와의 차이:
 * - 필드명 변경: isPrimaryCare → primary_care, isReferralOnly 삭제
 * - 신규 플래그: emergency / pediatric / obstetric (M3-3 capturedDemographics 연동용)
 * - primary_care 기준 강화: 의뢰 없이 환자가 직접 방문하는 13개만 true
 *   (기존 constants/specialties.ts는 LLM 라우팅용 15개, 여기서는 환자 UI 기준 13개)
 * - EM(응급의학과): primary_care=false — 응급 라우팅군으로 별도 분류 (M3-1-fix 확정)
 *
 * M3-2에서 SymptomMappingEntry.primary_specialty 필드 타입의 소스가 됨.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

export interface SpecialtyEntry {
  id: SpecialtyCode
  ko: string
  en: string
  /** 의뢰 없이 환자가 직접 방문 가능한 1차 진료과 */
  primary_care: boolean
  /** 응급 환자 수용 가능 (triage_level critical·urgent 라우팅 시 우선 고려) */
  emergency: boolean
  /** 소아 전문 — capturedDemographics.isMinor=true 시 우선 추천 (M3-3) */
  pediatric: boolean
  /** 임산부/부인과 전문 — capturedDemographics.pregnancy=true 시 우선 추천 (M3-3) */
  obstetric: boolean
  subs: string[]
}

export const SPECIALTIES: SpecialtyEntry[] = [

  // ════════════════════════════════════════════════════════════
  // 1차 진료 우선군 (13개, primary_care=true)
  // 의뢰 없이 환자가 직접 방문 가능한 외래 진료과
  // ════════════════════════════════════════════════════════════

  // ── 내과계 ──────────────────────────────────────────────────
  {
    id: 'IM', ko: '내과', en: 'Internal Medicine',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: ['소화기', '순환기', '호흡기', '내분비', '신장', '혈액종양', '감염', '알레르기'],
  },
  {
    id: 'FM', ko: '가정의학과', en: 'Family Medicine',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: ['1차의료'],
  },
  {
    id: 'PED', ko: '소아청소년과', en: 'Pediatrics',
    primary_care: true, emergency: false, pediatric: true, obstetric: false,
    subs: [],
  },
  {
    id: 'NEU', ko: '신경과', en: 'Neurology',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'PSY', ko: '정신건강의학과', en: 'Psychiatry',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'DERM', ko: '피부과', en: 'Dermatology',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 외과계 (1차 방문 가능) ──────────────────────────────────
  {
    id: 'OS', ko: '정형외과', en: 'Orthopedic Surgery',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: ['척추', '관절', '상지', '족부', '외상'],
  },

  // ── 여성·비뇨 ───────────────────────────────────────────────
  {
    id: 'OBGYN', ko: '산부인과', en: 'Obstetrics & Gynecology',
    primary_care: true, emergency: false, pediatric: false, obstetric: true,
    subs: ['산과', '부인과'],
  },
  {
    id: 'URO', ko: '비뇨의학과', en: 'Urology',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 감각계 ──────────────────────────────────────────────────
  {
    id: 'OPH', ko: '안과', en: 'Ophthalmology',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'ENT', ko: '이비인후과', en: 'Otolaryngology',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 치과 ────────────────────────────────────────────────────
  {
    id: 'DENT', ko: '치과', en: 'Dentistry',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: ['보존', '구강악안면', '교정', '치주', '보철', '소아치과'],
  },

  // ── 재활 ────────────────────────────────────────────────────
  {
    id: 'REH', ko: '재활의학과', en: 'Rehabilitation Medicine',
    primary_care: true, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ════════════════════════════════════════════════════════════
  // 응급 라우팅군 (1개, emergency=true)
  // triage_level critical·urgent 시 우선 안내; primary_care=false (환자 직접 방문 목적 외래 아님)
  // ════════════════════════════════════════════════════════════

  {
    id: 'EM', ko: '응급의학과', en: 'Emergency Medicine',
    primary_care: false, emergency: true, pediatric: false, obstetric: false,
    subs: [],
  },

  // ════════════════════════════════════════════════════════════
  // 2차 의뢰군 (12개) — primary_care: false, emergency: false
  // 일반적으로 1차 진료과 의뢰 후 방문
  // ════════════════════════════════════════════════════════════

  // ── 외과계 (의뢰 후 방문) ───────────────────────────────────
  {
    id: 'GS', ko: '외과', en: 'General Surgery',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: ['대장항문', '간담췌', '유방', '갑상선'],
  },
  {
    id: 'NS', ko: '신경외과', en: 'Neurosurgery',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: ['뇌', '척추'],
  },
  {
    id: 'CS', ko: '흉부외과', en: 'Thoracic Surgery',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'PS', ko: '성형외과', en: 'Plastic Surgery',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 통증·마취 ────────────────────────────────────────────────
  {
    // primary_care: false — 통증클리닉은 일반적으로 1차 의뢰 후 방문 (M3-1-fix 사용자 확정)
    id: 'PAIN', ko: '통증의학과', en: 'Pain Medicine',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'ANES', ko: '마취통증의학과', en: 'Anesthesiology',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 진단·영상 ───────────────────────────────────────────────
  {
    id: 'RAD', ko: '영상의학과', en: 'Radiology',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'PATH', ko: '병리과', en: 'Pathology',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'LAB', ko: '진단검사의학과', en: 'Lab Medicine',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'NM', ko: '핵의학과', en: 'Nuclear Medicine',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
  {
    id: 'RO', ko: '방사선종양학과', en: 'Radiation Oncology',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },

  // ── 예방의학 ─────────────────────────────────────────────────
  {
    id: 'PM', ko: '예방의학과', en: 'Preventive Medicine',
    primary_care: false, emergency: false, pediatric: false, obstetric: false,
    subs: [],
  },
] as const

/** 환자가 직접 방문 가능한 1차 진료과 (13개) */
export const PRIMARY_CARE_SPECIALTIES = SPECIALTIES.filter((s) => s.primary_care)

/** 응급 수용 가능 진료과 */
export const EMERGENCY_SPECIALTIES = SPECIALTIES.filter((s) => s.emergency)

/** 소아 전문 진료과 — capturedDemographics.isMinor 연동 (M3-3) */
export const PEDIATRIC_SPECIALTIES = SPECIALTIES.filter((s) => s.pediatric)

/** 임산부·부인과 전문 — capturedDemographics.pregnancy 연동 (M3-3) */
export const OBSTETRIC_SPECIALTIES = SPECIALTIES.filter((s) => s.obstetric)

/** id로 SpecialtyEntry 조회 */
export function getSpecialty(id: SpecialtyCode): SpecialtyEntry | undefined {
  return SPECIALTIES.find((s) => s.id === id)
}
