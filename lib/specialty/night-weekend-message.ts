/**
 * M4-B 야간·주말 진료 안내 메시지 빌더
 *
 * 정책:
 * - G-1: 안내자형 표현 — 특정 병원·장소 직접 지정 금지
 * - 소아(만 18세 미만): 달빛어린이병원 우선 안내
 * - 성인: 야간 진료 클리닉 안내
 * - urgent + er_eligible: 응급실 병기
 * - 시간 추적 절대 금지 (1.6 정책): new Date() 사용 금지
 */

import type { NightWeekendEligibilityEntry } from './night-weekend-mapping'

// ─── 진료과 한국어 레이블 ─────────────────────────────────────────

const SPECIALTY_KO: Record<string, string> = {
  ENT:  '이비인후과',
  OPH:  '안과',
  IM:   '내과',
  OS:   '정형외과',
  URO:  '비뇨의학과',
  PED:  '소아청소년과',
  FM:   '가정의학과',
  NEU:  '신경과',
  DERM: '피부과',
  GS:   '외과',
  EM:   '응급의학과',
  GI:   '소화기내과',
}

function resolveSpecialtyKo(code: string, override?: string): string {
  return override ?? SPECIALTY_KO[code] ?? code
}

// ─── 인터페이스 ───────────────────────────────────────────────────

export interface NightWeekendMessageOptions {
  entry: NightWeekendEligibilityEntry
  /** 환자 나이 (만 나이). 18 미만 시 소아 경로 */
  ageYears?: number
  /** 진료과 한국어 이름 오버라이드 */
  specialtyKo?: string
}

// ─── 메시지 빌더 ─────────────────────────────────────────────────

/**
 * 야간·주말 진료 안내 메시지를 반환한다.
 *
 * 분기:
 * - urgent + er_eligible → 야간 클리닉 안내 + ER 병기
 * - outpatient + 소아    → 달빛어린이병원 안내
 * - outpatient + 성인    → 야간 진료 클리닉 안내
 *
 * G-1 안내자형 — "이용하실 수 있습니다" 표현 사용.
 * 특정 의료기관 이름·위치 지정 없음.
 */
export function buildNightWeekendMessage(
  options: NightWeekendMessageOptions
): string {
  const { entry, ageYears, specialtyKo } = options
  const isMinor = typeof ageYears === 'number' && ageYears < 18
  const label = resolveSpecialtyKo(entry.primary_specialty, specialtyKo)

  if (entry.triage_level === 'urgent') {
    const erNote = entry.er_eligible
      ? ' 증상이 빠르게 나빠지거나 참기 어려우시면 응급실을 이용하세요.'
      : ''
    if (isMinor) {
      return (
        `야간·주말에는 **달빛어린이병원**에서 ${label} 계열 진료를 받으실 수 있습니다.` +
        erNote
      )
    }
    return (
      `야간·주말에는 **야간 진료 클리닉**에서 ${label} 계열 진료를 받으실 수 있습니다.` +
      erNote
    )
  }

  // outpatient
  if (isMinor) {
    return (
      `야간·주말에는 **달빛어린이병원**에서 ${label} 계열 진료를 받으실 수 있습니다. ` +
      `평일 외래 방문이 어려울 때 이용해 보세요.`
    )
  }
  return (
    `야간·주말에는 **야간 진료 클리닉**에서 ${label} 계열 진료를 받으실 수 있습니다. ` +
    `평일 외래 방문이 어려울 때 이용해 보세요.`
  )
}
