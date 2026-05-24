/**
 * D1-2 진단 단언 차단 룰셋
 *
 * LLM 응답에 진단 단언 어휘가 섞이면 차단·중화 처리.
 * 의료법 위반 위험 최소화 + G4-1 §응답 원칙(진단명·약물 추정 금지) 정합.
 */

const FORBIDDEN_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /진단(됩니다|입니다|함|합니다)/, label: '단언 진단어' },
  { pattern: /확진/,                          label: '확진' },
  { pattern: /확실(히|함|합니다)/,            label: '확실 단언' },
  { pattern: /분명(히|함|합니다)/,            label: '분명 단언' },
  { pattern: /틀림없(이|음|습니다)/,          label: '단언 부정형' },
  { pattern: /의심됩니다/,                    label: '의심 단언 (추정 톤 사용 권장)' },
  { pattern: /처방(합니다|함|드립니다)/,      label: '처방 어휘' },
  { pattern: /투여(하세요|하시면)/,           label: '투여 지시' },
]

export interface OutputValidation {
  valid: boolean
  violations: string[]
}

/** 위반 어휘 발견 시 violations 배열에 라벨 누적. valid=false. */
export function validateOutput(text: string): OutputValidation {
  if (!text) return { valid: true, violations: [] }
  const violations: string[] = []
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) violations.push(label)
  }
  return { valid: violations.length === 0, violations }
}

/** 단언 어휘를 추정 톤으로 치환 (응급 fallback). 원본 의미 보존을 보장하지 않음 — 보조 안전망. */
export function softenOutput(text: string): string {
  return text
    .replace(/진단(됩니다|입니다)/g, '추정됩니다')
    .replace(/확진/g, '추정')
    .replace(/확실히/g, '가능성이 있어')
    .replace(/분명히/g, '관찰상')
    .replace(/틀림없이/g, '관찰상')
    .replace(/처방(합니다|드립니다)/g, '병원 상담을 권장합니다')
    .replace(/투여(하세요|하시면)/g, '의사 상담을 권장')
}

export const VISION_DISCLAIMER = [
  '본 안내는 추정이며 의학적 진단이 아닙니다.',
  '자세한 진단은 의료기관 방문이 필요합니다.',
  '응급 상황 시 즉시 119에 신고하세요.',
  '사진 분석 결과는 보조 정보이며 단독으로 판단·치료에 사용해서는 안 됩니다.',
  '업로드한 사진은 서버에 저장되지 않으며 분석 직후 메모리에서 제거됩니다.',
  '사진으로 판단이 어려운 경우 솔직히 안내하며 병원 방문을 권고합니다.',
] as const
