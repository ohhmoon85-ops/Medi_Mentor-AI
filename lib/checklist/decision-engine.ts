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
      supplementKey: top.supplementKey,
      rationale,
    }
  }

  // 3단: 매치 없음 — 일반 안내
  return {
    combinationMatches: [],
    ktas: 4,
    primarySpecialty: REGIONS[region].primarySpecialty,
    rationale: `${rationale} — 조합 매칭 없음, 일반 외래 진료 권장`,
  }
}
