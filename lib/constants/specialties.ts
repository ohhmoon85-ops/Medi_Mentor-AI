/**
 * 한국 26개 진료과 마스터 상수
 * 보강 프롬프트 §2 기준 — 이 파일이 전체 코드베이스에서
 * 진료과 코드의 단일 진실 공급원(Single Source of Truth)이다.
 */

export const KOREAN_SPECIALTIES = {
  // ── 내과계 ──────────────────────────────────────────────────
  IM: {
    code: 'IM',
    ko: '내과',
    en: 'Internal Medicine',
    subs: ['소화기', '순환기', '호흡기', '내분비', '신장', '혈액종양', '감염', '알레르기', '류마티스'],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  FM: {
    code: 'FM',
    ko: '가정의학과',
    en: 'Family Medicine',
    subs: ['1차의료'],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  PED: {
    code: 'PED',
    ko: '소아청소년과',
    en: 'Pediatrics',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  NEU: {
    code: 'NEU',
    ko: '신경과',
    en: 'Neurology',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  PSY: {
    code: 'PSY',
    ko: '정신건강의학과',
    en: 'Psychiatry',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  DERM: {
    code: 'DERM',
    ko: '피부과',
    en: 'Dermatology',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },

  // ── 외과계 ──────────────────────────────────────────────────
  GS: {
    code: 'GS',
    ko: '외과',
    en: 'General Surgery',
    subs: ['일반', '대장항문', '간담췌', '유방', '갑상선'],
    isPrimaryCare: false,
    isReferralOnly: false,
  },
  OS: {
    code: 'OS',
    ko: '정형외과',
    en: 'Orthopedic Surgery',
    subs: ['척추', '관절', '상지', '족부', '외상'],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  NS: {
    code: 'NS',
    ko: '신경외과',
    en: 'Neurosurgery',
    subs: ['뇌', '척추'],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  CS: {
    code: 'CS',
    ko: '흉부외과',
    en: 'Thoracic Surgery',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  PS: {
    code: 'PS',
    ko: '성형외과',
    en: 'Plastic Surgery',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: false,
  },

  // ── 여성·비뇨 ───────────────────────────────────────────────
  OBGYN: {
    code: 'OBGYN',
    ko: '산부인과',
    en: 'Obstetrics & Gynecology',
    subs: ['산과', '부인과'],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  URO: {
    code: 'URO',
    ko: '비뇨의학과',
    en: 'Urology',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },

  // ── 감각계 ──────────────────────────────────────────────────
  OPH: {
    code: 'OPH',
    ko: '안과',
    en: 'Ophthalmology',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  ENT: {
    code: 'ENT',
    ko: '이비인후과',
    en: 'Otolaryngology',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },

  // ── 치과 ────────────────────────────────────────────────────
  DENT: {
    code: 'DENT',
    ko: '치과',
    en: 'Dentistry',
    subs: ['보존', '구강악안면', '교정', '치주', '보철', '소아치과'],
    isPrimaryCare: true,
    isReferralOnly: false,
  },

  // ── 응급·재활·기타 ──────────────────────────────────────────
  EM: {
    code: 'EM',
    ko: '응급의학과',
    en: 'Emergency Medicine',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  REH: {
    code: 'REH',
    ko: '재활의학과',
    en: 'Rehabilitation Medicine',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  PAIN: {
    code: 'PAIN',
    ko: '통증의학과',
    en: 'Pain Medicine',
    subs: [],
    isPrimaryCare: true,
    isReferralOnly: false,
  },
  ANES: {
    code: 'ANES',
    ko: '마취통증의학과',
    en: 'Anesthesiology',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },

  // ── 진단·영상 ───────────────────────────────────────────────
  RAD: {
    code: 'RAD',
    ko: '영상의학과',
    en: 'Radiology',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  PATH: {
    code: 'PATH',
    ko: '병리과',
    en: 'Pathology',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  LAB: {
    code: 'LAB',
    ko: '진단검사의학과',
    en: 'Lab Medicine',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  NM: {
    code: 'NM',
    ko: '핵의학과',
    en: 'Nuclear Medicine',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
  RO: {
    code: 'RO',
    ko: '방사선종양학과',
    en: 'Radiation Oncology',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },

  // ── 예방·기타 ───────────────────────────────────────────────
  PM: {
    code: 'PM',
    ko: '예방의학과',
    en: 'Preventive Medicine',
    subs: [],
    isPrimaryCare: false,
    isReferralOnly: true,
  },
} as const

export type SpecialtyCode = keyof typeof KOREAN_SPECIALTIES

export type SpecialtyMeta = (typeof KOREAN_SPECIALTIES)[SpecialtyCode]

/**
 * 환자용 1차 직접 방문 가능 진료과
 * 의뢰 없이 외래로 바로 접근할 수 있는 과
 */
export const PRIMARY_CARE_SPECIALTIES: SpecialtyCode[] = (
  Object.values(KOREAN_SPECIALTIES) as SpecialtyMeta[]
)
  .filter((s) => s.isPrimaryCare)
  .map((s) => s.code as SpecialtyCode)

/**
 * 의뢰 전용 진료과 (환자용에서 직접 추천하지 않음)
 * 의사용 멘토 모드에서는 모든 과 커버
 */
export const REFERRAL_ONLY_SPECIALTIES: SpecialtyCode[] = (
  Object.values(KOREAN_SPECIALTIES) as SpecialtyMeta[]
)
  .filter((s) => s.isReferralOnly)
  .map((s) => s.code as SpecialtyCode)

/** UI 표시용 한글 → 코드 역방향 조회 */
export function getSpecialtyByKo(ko: string): SpecialtyCode | undefined {
  const found = Object.values(KOREAN_SPECIALTIES).find((s) => s.ko === ko)
  return found?.code as SpecialtyCode | undefined
}

/** 코드 → 한글명 */
export function getSpecialtyLabel(code: SpecialtyCode): string {
  return KOREAN_SPECIALTIES[code].ko
}
