// 의료법 27조 준수 필터 (환자용 출력 후처리)
// 진단·처방·치료를 단정하는 표현을 권고·안내 표현으로 변환

const FORBIDDEN_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /(.+)입니다\s*\(진단\)/g, replacement: '$1일 가능성이 있습니다' },
  { pattern: /(.+)병입니다/g, replacement: '$1일 가능성이 있습니다' },
  { pattern: /(.+)약을?\s*드세요/g, replacement: '$1약 복용을 의사와 상담하세요' },
  { pattern: /(.+)수술이?\s*필요합니다/g, replacement: '$1수술이 필요할 수 있으니 전문의 상담을 받으세요' },
  { pattern: /(.+)치료(?:를|을)\s*받으세요/g, replacement: '$1치료가 도움이 될 수 있으니 의료기관을 방문하세요' },
  { pattern: /확진/g, replacement: '진단 가능성' },
]

const DISCLAIMER =
  '\n\n⚠️ 이 정보는 의학적 진단이 아닙니다. 증상이 심하면 즉시 의료기관을 방문하세요.'

export function applyMedicalLawFilter(text: string): string {
  let filtered = text
  FORBIDDEN_PATTERNS.forEach(({ pattern, replacement }) => {
    filtered = filtered.replace(pattern, replacement)
  })
  return filtered + DISCLAIMER
}

export function hasForbiddenExpression(text: string): boolean {
  return FORBIDDEN_PATTERNS.some(({ pattern }) => pattern.test(text))
}
