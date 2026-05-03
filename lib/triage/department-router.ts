// LLM + RAG + 룰 하이브리드 진료과 라우터
// 구 matchDepartment() 정규식 14개 룰은 폐기됨.

import Anthropic from '@anthropic-ai/sdk'
import { embedText } from '@/lib/rag/embed'
import { retrieveEvidence } from '@/lib/rag/retrieve'
import { KOREAN_SPECIALTIES, PRIMARY_CARE_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { RoutingResult, SpecialtyMatch } from '@/lib/types/medical'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────────────────────
// 공개 입력 타입
// ─────────────────────────────────────────────────────────────

export interface RouterInput {
  rawSymptoms: string
  capturedFindings: Record<string, unknown>
  age?: number
  sex?: string
  pregnancy?: boolean
  isMinor?: boolean
}

// ─────────────────────────────────────────────────────────────
// 1단계: 응급 키워드 사전 필터 (룰 기반)
// classifyRedFlags()가 acuity 1/2를 잡고, 여기서는 EM 라우팅 결정만 담당.
// ─────────────────────────────────────────────────────────────

const EMERGENCY_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /의식\s*(저하|없음|잃|불명|혼미|혼탁)/,                         reason: '의식 변화 감지' },
  { pattern: /가슴.{0,20}통증.{0,40}(식은땀|방사|왼팔|턱)/,                  reason: '심근경색 의심 증상군' },
  { pattern: /(식은땀|방사통|왼팔\s*저림).{0,40}가슴\s*통증/,                 reason: '심근경색 의심 증상군 (역순)' },
  { pattern: /갑자기.{0,10}극심한.{0,10}(두통|머리)/,                         reason: '뇌출혈·SAH 의심' },
  { pattern: /한쪽.{0,5}(팔|다리|얼굴|안면).{0,10}(마비|힘이\s*빠|저림)|편마비/, reason: '뇌졸중 의심' },
  { pattern: /경련|발작/,                                                       reason: '경련 발작 감지' },
  { pattern: /대량\s*출혈|피가\s*많이\s*나/,                                   reason: '대량 출혈' },
  { pattern: /아나필락|알레르기.{0,10}(쇼크|기도\s*막|기도\s*부)/,             reason: '아나필락시스 의심' },
]

function checkEmergencyKeywords(input: RouterInput): RoutingResult | null {
  const text = `${input.rawSymptoms} ${JSON.stringify(input.capturedFindings)}`

  for (const { pattern, reason } of EMERGENCY_PATTERNS) {
    if (pattern.test(text)) {
      return {
        primary: { code: 'EM', confidence: 0.95, reason },
        alternatives: [{ code: 'IM', confidence: 0.3, reason: '내과 협진 가능' }],
        needs_emergency: true,
        reasoning_trace: [`[룰] 응급 키워드 매칭: ${reason}`, '→ 응급의학과 즉시 라우팅'],
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// 2단계: RAG 증거 검색 (선택적 — 0건이어도 진행)
// ─────────────────────────────────────────────────────────────

async function retrieveSpecialtyEvidence(symptoms: string): Promise<string> {
  try {
    const embedding = await embedText(symptoms)
    const { chunks } = await retrieveEvidence(embedding, 4)
    if (chunks.length === 0) return ''
    return chunks
      .map((c, i) => `[근거 ${i + 1}] ${c.title ?? ''}: ${String(c.content).slice(0, 200)}`)
      .join('\n')
  } catch {
    return '' // RAG 실패 시 LLM 단독 진행
  }
}

// ─────────────────────────────────────────────────────────────
// 3단계: LLM 진료과 분류
// ─────────────────────────────────────────────────────────────

const SPECIALTY_CANDIDATES = PRIMARY_CARE_SPECIALTIES
  .map(code => `${code}(${KOREAN_SPECIALTIES[code].ko})`)
  .join(', ')

const CLASSIFIER_SYSTEM_PROMPT = `당신은 한국 1차 의료 라우팅 전문가다.
환자 증상과 수집된 정보를 바탕으로 가장 적절한 진료과를 Top 3으로 추천한다.

[추천 가능 코드 15개 — 반드시 이 목록에서만 선택]
${SPECIALTY_CANDIDATES}

[어려운 감별 포인트]
- 어지럼증: 말초성(ENT) vs 중추성(NEU) → 동반 증상(이명·구역/신경학적 징후)으로 감별
- 흉통: IM(순환기) vs EM → 연령·위험인자·동반증상 고려
- 두통: NEU(편두통·긴장성) vs PSY(우울·불안 동반) vs EM(갑작스러운 극심한 두통)
- 복통: IM(소화기) vs OBGYN(여성) vs EM(급성 복증)
- 턱·구강 통증: DENT(치과) vs OS(TMJ) vs ENT

[응답 형식 — 반드시 이 JSON만 출력]
{
  "primary": { "code": "CODE", "confidence": 0.0~1.0, "reason": "추론 근거 1문장" },
  "alternatives": [
    { "code": "CODE", "confidence": 0.0~1.0, "reason": "추론 근거" },
    { "code": "CODE", "confidence": 0.0~1.0, "reason": "추론 근거" }
  ],
  "needs_emergency": false,
  "reasoning_trace": ["단계1", "단계2", "단계3"]
}`

function isValidPrimaryCode(code: string): code is SpecialtyCode {
  return (
    Object.keys(KOREAN_SPECIALTIES).includes(code) &&
    PRIMARY_CARE_SPECIALTIES.includes(code as SpecialtyCode)
  )
}

function fallbackRouting(input: RouterInput): RoutingResult {
  const code: SpecialtyCode = input.isMinor ? 'PED' : 'FM'
  return {
    primary: { code, confidence: 0.4, reason: 'LLM 파싱 실패 — 기본 진료과 안내' },
    alternatives: [{ code: 'IM', confidence: 0.3, reason: '내과 방문 가능' }],
    needs_emergency: false,
    reasoning_trace: ['[폴백] LLM 응답 파싱 실패 → 기본 라우팅'],
  }
}

async function llmClassifySpecialty(
  input: RouterInput,
  evidence: string,
): Promise<RoutingResult> {
  const userContent = [
    `[환자 증상]\n${input.rawSymptoms}`,
    Object.keys(input.capturedFindings).length > 0
      ? `[수집 정보]\n${JSON.stringify(input.capturedFindings, null, 2)}`
      : null,
    input.age ? `나이: ${input.age}세` : null,
    input.sex ? `성별: ${input.sex === 'M' ? '남성' : '여성'}` : null,
    input.pregnancy ? '임신 가능성: 있음' : null,
    evidence ? `[RAG 근거]\n${evidence}` : '[RAG 근거 없음 — LLM 단독 추론]',
  ]
    .filter(Boolean)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 512,
    system: CLASSIFIER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return fallbackRouting(input)

  try {
    const parsed = JSON.parse(jsonMatch[0])

    if (!isValidPrimaryCode(parsed.primary?.code)) return fallbackRouting(input)

    const alternatives: SpecialtyMatch[] = (parsed.alternatives ?? [])
      .filter((a: { code: string }) => isValidPrimaryCode(a.code))
      .slice(0, 2)
      .map((a: { code: SpecialtyCode; confidence: number; reason: string }) => ({
        code: a.code,
        confidence: Number(a.confidence ?? 0.3),
        reason: String(a.reason ?? ''),
      }))

    return {
      primary: {
        code: parsed.primary.code as SpecialtyCode,
        confidence: Number(parsed.primary.confidence ?? 0.5),
        reason: String(parsed.primary.reason ?? ''),
      },
      alternatives,
      needs_emergency: parsed.needs_emergency === true,
      reasoning_trace: Array.isArray(parsed.reasoning_trace)
        ? parsed.reasoning_trace.map(String).slice(0, 5)
        : ['[LLM] 분류 완료'],
    }
  } catch {
    return fallbackRouting(input)
  }
}

// ─────────────────────────────────────────────────────────────
// 4단계: 인구학적 보정
// ─────────────────────────────────────────────────────────────

function applyDemographicAdjustment(
  result: RoutingResult,
  input: RouterInput,
): RoutingResult {
  const trace = [...result.reasoning_trace]
  let alternatives = [...result.alternatives]

  // 임신 가능성 → OBGYN 대안 추가
  if (input.pregnancy && result.primary.code !== 'OBGYN') {
    const hasObgyn = alternatives.some(a => a.code === 'OBGYN')
    if (!hasObgyn) {
      alternatives = [
        { code: 'OBGYN' as SpecialtyCode, confidence: 0.6, reason: '임신 가능성 — 산부인과 동반 추천' },
        ...alternatives,
      ].slice(0, 2)
      trace.push('[인구학적 보정] 임신 가능성 → OBGYN 대안 추가')
    }
  }

  // 소아(18세 미만) → PED 대안 추가 (전문 수술과 제외)
  const referralOnlyCodes: SpecialtyCode[] = ['NS', 'CS', 'RAD', 'PATH', 'LAB', 'NM', 'RO', 'PM', 'ANES']
  if (input.isMinor && result.primary.code !== 'PED' && result.primary.code !== 'EM') {
    const canBePed = !referralOnlyCodes.includes(result.primary.code)
    if (canBePed) {
      const hasPed = alternatives.some(a => a.code === 'PED')
      if (!hasPed) {
        alternatives = [
          { code: 'PED' as SpecialtyCode, confidence: 0.65, reason: '소아 환자 — 소아청소년과 우선 고려' },
          ...alternatives,
        ].slice(0, 2)
        trace.push('[인구학적 보정] 소아 환자 → PED 대안 추가')
      }
    }
  }

  // 65세 이상 → 만성질환 가능성으로 IM 대안 추가
  if (input.age !== undefined && input.age >= 65) {
    if (!['IM', 'FM', 'EM'].includes(result.primary.code)) {
      const hasChronicSpecialty = alternatives.some(a => a.code === 'IM' || a.code === 'FM')
      if (!hasChronicSpecialty) {
        alternatives = [
          ...alternatives.slice(0, 1),
          { code: 'IM', confidence: 0.45, reason: '65세 이상 — 내과 동반 만성질환 고려' },
        ]
        trace.push('[인구학적 보정] 65세 이상 → IM 대안 추가')
      }
    }
  }

  return { ...result, alternatives, reasoning_trace: trace }
}

// ─────────────────────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────────────────────

export async function routeToSpecialty(input: RouterInput): Promise<RoutingResult> {
  const trace: string[] = []

  // 1단계: 응급 사전 필터
  const emergencyHit = checkEmergencyKeywords(input)
  if (emergencyHit) return emergencyHit
  trace.push('[1단계] 응급 키워드 없음')

  // 2단계: RAG 증거 검색 (0건이어도 진행)
  const evidence = await retrieveSpecialtyEvidence(input.rawSymptoms)
  trace.push(
    evidence
      ? '[2단계] RAG 근거 확보'
      : '[2단계] RAG 근거 없음 (시드 미적재 또는 미매칭)',
  )

  // 3단계: LLM 분류
  let llmResult: RoutingResult
  try {
    llmResult = await llmClassifySpecialty(input, evidence)
    trace.push(
      `[3단계] LLM 분류: ${llmResult.primary.code} (신뢰도 ${Math.round(llmResult.primary.confidence * 100)}%)`,
    )
  } catch {
    llmResult = fallbackRouting(input)
    trace.push('[3단계] LLM 호출 실패 → 폴백 라우팅')
  }

  // 4단계: 인구학적 보정
  return applyDemographicAdjustment(
    { ...llmResult, reasoning_trace: [...trace, ...llmResult.reasoning_trace] },
    input,
  )
}
