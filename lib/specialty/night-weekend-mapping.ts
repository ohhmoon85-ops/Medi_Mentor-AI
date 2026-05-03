/**
 * M4-A 야간·주말 진료 적합성 매핑 테이블
 *
 * 정책 (1.6):
 * - 시간 추적 절대 금지: new Date() / Date.now() 사용 금지
 * - 영업시간 정보 미포함: 실시간 개원 여부 확인 없음
 * - 실시간 데이터 패치 없음: 정적 매핑 테이블만 사용
 *
 * 매핑 선정 기준:
 * - outpatient 15개 중 6개 선정 (야간·주말 1차 진료 적합성 높음)
 * - urgent 10개 중 2개 선정 (야간 진료 가능, ER 대안 안내 병기)
 * - lib/specialty/symptom-list-draft.ts 변경 금지 (J-3 정책)
 *
 * 달빛어린이병원 안내 정책:
 * - 소아(만 18세 미만) 환자에게 우선 안내
 * - 특정 병원·위치 지정 없음 (G-1 안내자형)
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

// ─── 인터페이스 ───────────────────────────────────────────────────

export interface NightWeekendEligibilityEntry {
  symptom_id: string
  triage_level: 'outpatient' | 'urgent'
  /**
   * 'minor'  → 소아 위주 증상 (달빛어린이병원 적합도 높음)
   * 'adult'  → 성인 위주 증상
   * 'all'    → 연령 무관 (소아 시 달빛어린이병원, 성인 시 야간 클리닉)
   */
  age_group_priority: 'minor' | 'adult' | 'all'
  primary_specialty: SpecialtyCode
  /**
   * urgent 케이스에서 ER도 적절한 선택지인지 여부.
   * outpatient는 항상 false.
   */
  er_eligible: boolean
}

// ─── 매핑 테이블 ─────────────────────────────────────────────────

export const NIGHT_WEEKEND_MAPPING: readonly NightWeekendEligibilityEntry[] = [
  // ── outpatient 6개 ──────────────────────────────────────────────
  // 목통증·삼킴곤란: 소아 편도염 빈번 → 달빛어린이병원 적합
  {
    symptom_id:         'severe_sore_throat',
    triage_level:       'outpatient',
    age_group_priority: 'all',
    primary_specialty:  'ENT',
    er_eligible:        false,
  },
  // 눈 충혈·통증: 영아~노인 전 연령, 야간 안과 클리닉 가능
  {
    symptom_id:         'eye_pain_redness',
    triage_level:       'outpatient',
    age_group_priority: 'all',
    primary_specialty:  'OPH',
    er_eligible:        false,
  },
  // 설사 지속: 탈수 위험으로 야간 처치 필요할 수 있음
  {
    symptom_id:         'prolonged_diarrhea',
    triage_level:       'outpatient',
    age_group_priority: 'all',
    primary_specialty:  'IM',
    er_eligible:        false,
  },
  // 명치 속쓰림·역류: 야간 악화 흔함, 1차 내과 야간 클리닉 가능
  {
    symptom_id:         'epigastric_burn',
    triage_level:       'outpatient',
    age_group_priority: 'all',
    primary_specialty:  'IM',
    er_eligible:        false,
  },
  // 3주 이상 기침: 야간·주말 내과 진료로 초기 평가 가능
  {
    symptom_id:         'chronic_cough',
    triage_level:       'outpatient',
    age_group_priority: 'all',
    primary_specialty:  'IM',
    er_eligible:        false,
  },
  // 무릎 부종·통증: 성인·노인 위주 — 정형외과 야간 클리닉 가능
  {
    symptom_id:         'knee_pain_swollen',
    triage_level:       'outpatient',
    age_group_priority: 'adult',
    primary_specialty:  'OS',
    er_eligible:        false,
  },
  // ── urgent 2개 ──────────────────────────────────────────────────
  // 돌발성 난청: 72시간 이내 치료 필요 → 야간 이비인후과·ER 가능
  {
    symptom_id:         'sudden_hearing_loss',
    triage_level:       'urgent',
    age_group_priority: 'all',
    primary_specialty:  'ENT',
    er_eligible:        true,
  },
  // 혈뇨·배뇨통: 요로결석·신우신염 가능 → 야간 내과·ER 가능
  {
    symptom_id:         'hematuria_dysuria',
    triage_level:       'urgent',
    age_group_priority: 'all',
    primary_specialty:  'URO',
    er_eligible:        true,
  },
]

// ─── 공개 함수 ───────────────────────────────────────────────────

/**
 * 해당 symptom_id가 야간·주말 진료 안내 대상인지 확인.
 * triage_level이 night_weekend가 아닌 M3-2 항목 중 선정된 것만 true.
 */
export function isNightWeekendEligible(symptomId: string): boolean {
  return NIGHT_WEEKEND_MAPPING.some((e) => e.symptom_id === symptomId)
}

/**
 * 해당 symptom_id의 연령 우선순위 반환.
 * 매핑에 없으면 null.
 */
export function getAgeGroupPriority(
  symptomId: string
): 'minor' | 'adult' | 'all' | null {
  return (
    NIGHT_WEEKEND_MAPPING.find((e) => e.symptom_id === symptomId)
      ?.age_group_priority ?? null
  )
}

/**
 * symptom_id로 매핑 항목 조회.
 * 없으면 undefined.
 */
export function getNightWeekendEntry(
  symptomId: string
): NightWeekendEligibilityEntry | undefined {
  return NIGHT_WEEKEND_MAPPING.find((e) => e.symptom_id === symptomId)
}
