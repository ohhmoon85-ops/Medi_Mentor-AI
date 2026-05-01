import { classifyRedFlags } from '@/lib/safety/red-flag-classifier'
import type { TriageResult } from '@/lib/db/schema'

export type AcuityLevel = 1 | 2 | 3 | 4 | 5

export const ACUITY_CONFIG: Record<AcuityLevel, {
  color: string
  emoji: string
  label: string
  action: string
}> = {
  1: { color: 'red', emoji: '🔴', label: '즉시 응급', action: '지금 즉시 119에 신고하세요' },
  2: { color: 'orange', emoji: '🟠', label: '응급', action: '가장 가까운 응급실로 이동하세요' },
  3: { color: 'yellow', emoji: '🟡', label: '일반/주말 진료', action: '당일이나 주말 진료 안내' },
  4: { color: 'green', emoji: '🟢', label: '일반 외래', action: '1차 진료 예약을 추천합니다' },
  5: { color: 'purple', emoji: '🟣', label: '자가관리', action: '자가요법으로 관리 가능합니다' },
}

export interface TriageInput {
  symptomText: string
  age?: number
  sex?: string
  comorbidities?: string[]
  medications?: string[]
  duration?: string
  vitalSigns?: {
    temperature?: number
    heartRate?: number
    bloodPressure?: string
    oxygenSaturation?: number
  }
}

export interface TriageOutput {
  acuity_level: AcuityLevel
  recommended_department: string
  alternative_departments: string[]
  red_flags: string[]
  rationale: string
  ui_config: typeof ACUITY_CONFIG[AcuityLevel]
}

export function runMTSEngine(input: TriageInput): TriageOutput {
  const redFlagResult = classifyRedFlags(input.symptomText)

  if (redFlagResult.acuityOverride) {
    return {
      acuity_level: redFlagResult.acuityOverride,
      recommended_department: redFlagResult.acuityOverride === 1 ? '응급의학과' : '응급실',
      alternative_departments: [],
      red_flags: redFlagResult.flags,
      rationale: redFlagResult.emergencyMessage ?? '즉시 응급 처치가 필요합니다.',
      ui_config: ACUITY_CONFIG[redFlagResult.acuityOverride],
    }
  }

  // 바이탈 사인 기반 레벨 조정
  const vitals = input.vitalSigns
  if (vitals) {
    if (
      (vitals.temperature && vitals.temperature >= 38.5) ||
      (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) ||
      (vitals.heartRate && (vitals.heartRate > 120 || vitals.heartRate < 50))
    ) {
      return {
        acuity_level: 2,
        recommended_department: '응급실',
        alternative_departments: ['내과', '가정의학과'],
        red_flags: ['비정상 활력징후'],
        rationale: '활력징후 이상으로 응급실 내원이 권고됩니다.',
        ui_config: ACUITY_CONFIG[2],
      }
    }
  }

  // 기간 기반 레벨 판정
  const durationPattern = /(\d+)\s*(일|주|개월)/
  const durationMatch = input.duration?.match(durationPattern)
  const durationDays = durationMatch
    ? parseInt(durationMatch[1]) * (durationMatch[2] === '주' ? 7 : durationMatch[2] === '개월' ? 30 : 1)
    : 0

  // 기본 레벨 4 (일반 외래) 반환 - 실제 LLM 연동은 API 레이어에서 처리
  return {
    acuity_level: durationDays > 14 ? 4 : 3,
    recommended_department: '가정의학과',
    alternative_departments: ['내과'],
    red_flags: [],
    rationale: '증상과 기간을 고려할 때 일반 외래 진료를 권장합니다.',
    ui_config: ACUITY_CONFIG[durationDays > 14 ? 4 : 3],
  }
}
