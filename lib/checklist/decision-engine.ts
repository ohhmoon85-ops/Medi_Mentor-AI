/**
 * D2-3 Decision Engine — 3단 계층 분기
 *
 * 1단: matchUrgent (KTAS L1~L2) — 매치 시 즉시 채택, 다른 분석 생략
 * 2단: matchCombinations (KTAS L3~L5) — 점수 내림차순 최대 3건
 * 3단: 매치 없음 → 일반 안내 (KTAS L4, FM)
 *
 * 자살 충동 #30 — urgentMatch.specialBranch='suicide_1393' 자동 표시.
 */

import type { ChecklistContext, ChecklistMatchResult, RegionId } from './types'
import { matchUrgent } from './urgent-triggers'
import { matchCombinations } from './combinations'
import { REGIONS } from './regions'

/**
 * UX 피드백 (2026-05-24): 부위별 기본 supplementKey 폴백.
 * combinations 룰에 supplementKey 누락 시(51개 중 29개) + 일반 안내 폴백 시
 * 본 매핑으로 SupplementInfoCard가 항상 마운트되도록 보장.
 * 응급(urgent) 분기에는 적용 X (영양제 권유 부적절).
 */
const REGION_DEFAULT_SUPPLEMENT: Record<RegionId, string> = {
  HEAD_FACE:  'stress',            // 두통·어지러움 — 마그네슘·L-테아닌
  NECK_CHEST: 'immune',            // 호흡기·인후 — 비타민D·아연
  ABDOMEN:    'stomach',           // 소화기 — 프로바이오틱스
  LIMBS:      'joint_general',     // 관절·근육 — 글루코사민·콜라겐
  SKIN:       'skin',              // 피부 — 콜라겐·비타민C
  ENT_EYE:    'eye_health',        // 눈 — 루테인 (코·귀는 immune 대안)
  URO_OBGYN:  'general_wellness',  // 비뇨·여성 — 종합비타민 (안전 폴백)
  SYSTEMIC:   'general_wellness',  // 전신 — 종합비타민·오메가-3
}

function buildRationale(region: RegionId, checkedCount: number, context: ChecklistContext): string {
  const r = REGIONS[region].label
  const dur = {
    just_now: '방금',
    within_1h: '1시간 이내',
    today: '오늘',
    days: '며칠 전',
    week_plus: '일주일 이상',
  }[context.duration]
  const intense = {
    mild: '참을만',
    discomfort: '불편',
    severe: '심함',
    extreme: '극심',
  }[context.intensity]
  const comp = {
    self: '본인',
    family: '가족',
    child: '어린이',
    elder: '노인',
  }[context.companion]
  return `${comp} 기준 ${r} 영역 ${checkedCount}개 증상 체크 (${dur} 시작, ${intense})`
}

export function runDecisionEngine(params: {
  region: RegionId
  checkedSymptomIds: string[]
  context: ChecklistContext
}): ChecklistMatchResult {
  const { region, checkedSymptomIds, context } = params
  const checked = new Set(checkedSymptomIds)
  const rationale = buildRationale(region, checkedSymptomIds.length, context)

  // 1단: 응급 트리거 우선
  const urgent = matchUrgent(checked)
  if (urgent) {
    return {
      urgentMatch: { ...urgent, matchedSignals: urgent.signals.filter((id) => checked.has(id)) },
      combinationMatches: [],
      ktas: urgent.ktas,
      primarySpecialty: REGIONS[region].primarySpecialty,
      suicide1393: urgent.specialBranch === 'suicide_1393',
      rationale,
    }
  }

  // 2단: 조합 매칭
  const combinations = matchCombinations(checked, 3)
  if (combinations.length > 0) {
    const top = combinations[0]
    return {
      combinationMatches: combinations,
      ktas: top.ktas,
      primarySpecialty: top.specialty,
      // UX 피드백: 룰에 supplementKey 없으면 부위 폴백
      supplementKey: top.supplementKey ?? REGION_DEFAULT_SUPPLEMENT[region],
      rationale,
    }
  }

  // 3단: 매치 없음 — 일반 안내 (부위 기반 supplementKey 폴백)
  return {
    combinationMatches: [],
    ktas: 4,
    primarySpecialty: REGIONS[region].primarySpecialty,
    supplementKey: REGION_DEFAULT_SUPPLEMENT[region],
    rationale: `${rationale} — 조합 매칭 없음, 일반 외래 진료 권장`,
  }
}
