// Red Flag 분류기 - LLM 단독 판단 금지, 룰 기반 + 보조 LLM 사용

export interface RedFlagResult {
  hasRedFlag: boolean
  flags: string[]
  acuityOverride?: 1 | 2
  emergencyMessage?: string
}

// 즉시 응급처치가 필요한 증상 패턴
const LEVEL_1_PATTERNS = [
  /호흡\s*곤란|숨\s*못\s*쉬|숨이\s*막/,
  /의식\s*없|쓰러|기절|정신\s*잃/,
  /심한\s*흉통|가슴\s*통증.*땀|심장.*조임/,
  /다량.*출혈|피를?\s*많이/,
  /경련|발작|뇌졸중|마비/,
  /자살|자해|극단적/,
]

// 응급실 내원이 필요한 증상 패턴
const LEVEL_2_PATTERNS = [
  /38\.5도?\s*이상|고열.*지속/,
  /지속적.*흉통|흉통.*30분/,
  /갑자기.*시력|눈.*안\s*보/,
  /심한.*복통|복통.*열/,
  /두통.*구토|갑자기.*심한\s*두통/,
]

export function classifyRedFlags(symptomText: string): RedFlagResult {
  const flags: string[] = []
  let acuityOverride: 1 | 2 | undefined

  for (const pattern of LEVEL_1_PATTERNS) {
    if (pattern.test(symptomText)) {
      flags.push(symptomText.match(pattern)?.[0] ?? '위험 증상')
      acuityOverride = 1
    }
  }

  if (!acuityOverride) {
    for (const pattern of LEVEL_2_PATTERNS) {
      if (pattern.test(symptomText)) {
        flags.push(symptomText.match(pattern)?.[0] ?? '주의 증상')
        acuityOverride = 2
      }
    }
  }

  const emergencyMessages: Record<1 | 2, string> = {
    1: '지금 즉시 119에 신고하거나 응급실로 이동하세요.',
    2: '가장 가까운 응급실 또는 응급의료기관으로 이동하세요.',
  }

  return {
    hasRedFlag: flags.length > 0,
    flags,
    acuityOverride,
    emergencyMessage: acuityOverride ? emergencyMessages[acuityOverride] : undefined,
  }
}
