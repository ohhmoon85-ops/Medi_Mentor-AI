/**
 * M3-4 LLM fallback — 정적 사전 매칭 실패 시 Claude Sonnet에 진료과 추천 위임
 *
 * 발동 조건 (M3-4-A 정책): matchedEntry === null (정적 사전 매칭 0건)
 * 모델 (M3-4-β 정책): claude-sonnet-4-6
 *
 * 에러 핸들링:
 * - API 호출 실패 → FM 안전 fallback
 * - JSON 파싱 실패 → FM 안전 fallback
 * - 26개 진료과 외 SpecialtyCode → FM 안전 fallback
 * - triage_level enum 외 값 → FM 안전 fallback
 *
 * 의존 관계 (순환 없음):
 * - lib/constants/specialties.ts (KOREAN_SPECIALTIES, SpecialtyCode)
 * - lib/specialty/symptom-mapping-schema.ts (TriageLevel)
 * - lib/specialty/recommendation-message.ts (EffectiveDemographics)
 * - lib/safety/red-flag-classifier.ts (RedFlagResult)
 * - @anthropic-ai/sdk (Anthropic)
 */

import Anthropic from '@anthropic-ai/sdk'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { TriageLevel } from './symptom-mapping-schema'
import type { EffectiveDemographics } from './recommendation-message'
import type { RedFlagResult } from '@/lib/safety/red-flag-classifier'

// ─── 타입 정의 ───────────────────────────────────────────────────

export interface LLMFallbackInput {
  /** 환자/보호자 원본 입력 텍스트 */
  user_input: string
  /** 인구학 정보 (1인칭/3인칭, 소아, 임산부) */
  detected_demographics: EffectiveDemographics
  /** 단계 A red_flag 분류 결과 (없으면 null) */
  red_flag_result: RedFlagResult | null
}

export interface LLMFallbackOutput {
  primary_specialty: SpecialtyCode
  secondary_specialties: SpecialtyCode[]
  triage_level: TriageLevel
  /** G-1 안내자형 추천 이유 (진단 단정 금지) */
  recommendation_reason: string
  /** LLM fallback 결과임을 UI에 표시하기 위한 고정 태그 */
  isLLMFallback: true
  /** LLM 자체 평가 신뢰도 */
  confidence?: 'high' | 'medium' | 'low'
}

// ─── Anthropic 클라이언트 ─────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── 유효성 검사 ─────────────────────────────────────────────────

const VALID_SPECIALTY_CODES = new Set<string>(Object.keys(KOREAN_SPECIALTIES))
const VALID_TRIAGE_LEVELS: ReadonlySet<string> = new Set([
  'critical', 'urgent', 'night_weekend', 'outpatient', 'self_care',
])

function isValidSpecialty(code: string): code is SpecialtyCode {
  return VALID_SPECIALTY_CODES.has(code)
}

function isValidTriage(level: string): level is TriageLevel {
  return VALID_TRIAGE_LEVELS.has(level)
}

// ─── 안전 fallback ───────────────────────────────────────────────

const SAFE_FALLBACK: LLMFallbackOutput = {
  primary_specialty: 'FM',
  secondary_specialties: ['IM'],
  triage_level: 'outpatient',
  recommendation_reason: '정확한 진료과 추천이 어렵습니다. 가정의학과 진료를 우선 권합니다.',
  isLLMFallback: true,
  confidence: 'low',
}

// ─── 시스템 프롬프트 ──────────────────────────────────────────────

const SPECIALTY_LIST = (Object.entries(KOREAN_SPECIALTIES) as [SpecialtyCode, { ko: string }][])
  .map(([code, meta]) => `${code}(${meta.ko})`)
  .join(', ')

const SYSTEM_PROMPT = `당신은 한국 가정 누구에게나 필요한 가정 주치의 안내자(medimentor)다.
환자 또는 보호자의 증상 설명을 듣고 가장 적절한 진료과를 추천한다.

[정체성 (E-1)]
- 노년층뿐 아니라 전 연령 지원: 영유아·소아·청장년·임산부·노년
- 가족 단위 3인칭 입력 지원: "내 아이가", "어머니가", "남편이" 등
- 한국 가정 주치의 안내자 정체성

[추천 가능 진료과 26개 — 반드시 이 코드만 사용]
${SPECIALTY_LIST}

[5단계 트리아지]
critical: 즉시 119·응급실 (MTS 1등급)
urgent: 당일 응급실 방문 (MTS 2·3등급)
night_weekend: 야간·주말 응급실 또는 평일 외래 (MTS 3·4 경계)
outpatient: 외래 진료 권장 (MTS 4등급)
self_care: 자가관리 또는 일반 외래 (MTS 5등급)

[브로드 추천 정책 (G-1)]
- secondary_specialties는 반드시 2개 이상 포함
- "OO과를 우선 권합니다. OO과·OO과도 고려하실 수 있습니다" 안내자형 표현

[의도적 제외 기능 — 절대 금지]
1. 위치 기반 병원 추천 알고리즘 (GPS·거리 계산) 금지
2. 진단 단정 표현 금지 — "OO일 가능성이 있습니다"만 사용
3. 처방 정보 환자 직접 제공 금지
4. 원격 진료 행위 금지
5. 병원 후기·평점 알고리즘 금지

[응답 형식 — 반드시 이 JSON만, 마크다운·서문 없음]
{
  "primary_specialty": "CODE",
  "secondary_specialties": ["CODE1", "CODE2"],
  "triage_level": "outpatient",
  "recommendation_reason": "1~2문장, 안내자형, 진단 단정 금지",
  "confidence": "high|medium|low"
}`

// ─── 사용자 프롬프트 조립 ─────────────────────────────────────────

function buildUserPrompt(input: LLMFallbackInput): string {
  const parts: string[] = [
    `[환자/보호자 입력]\n${input.user_input || '(증상 입력 없음)'}`,
  ]

  const { isThirdPerson, isMinor, pregnancy } = input.detected_demographics
  const demoLines: string[] = []
  if (isThirdPerson) demoLines.push('입력 유형: 3인칭 (가족 대리 입력)')
  if (isMinor)       demoLines.push('연령 특이사항: 소아 (18세 미만)')
  if (pregnancy)     demoLines.push('임신 가능성: 있음')
  if (demoLines.length > 0) parts.push(`[인구학 정보]\n${demoLines.join('\n')}`)

  const rf = input.red_flag_result
  if (rf?.hasRedFlag && rf.flags.length > 0) {
    const level = rf.acuityOverride === 1 ? 'critical' : 'urgent'
    parts.push(`[Red Flag 감지]\n심각도: ${level}\n감지 신호: ${rf.flags.join(', ')}`)
  }

  parts.push('위 입력에 가장 적합한 진료과 추천 JSON을 생성하라.')
  return parts.join('\n\n')
}

// ─── 공개 API ─────────────────────────────────────────────────────

/**
 * 정적 사전 매칭 실패 시 Claude Sonnet에 진료과 추천을 위임한다.
 *
 * API 오류·파싱 실패·유효하지 않은 코드 → SAFE_FALLBACK(FM) 반환.
 * isLLMFallback: true 플래그를 통해 UI에서 LLM 추천임을 표시해야 한다.
 */
export async function callLLMFallback(input: LLMFallbackInput): Promise<LLMFallbackOutput> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return SAFE_FALLBACK

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>
    } catch {
      return SAFE_FALLBACK
    }

    // SpecialtyCode 유효성 검사
    const primaryCode = parsed.primary_specialty
    if (typeof primaryCode !== 'string' || !isValidSpecialty(primaryCode)) return SAFE_FALLBACK

    // triage_level 유효성 검사
    const triageLevel = parsed.triage_level
    if (typeof triageLevel !== 'string' || !isValidTriage(triageLevel)) return SAFE_FALLBACK

    // secondary_specialties: 유효한 코드만 통과
    const rawSecondary = Array.isArray(parsed.secondary_specialties)
      ? (parsed.secondary_specialties as unknown[])
      : []
    const validSecondary: SpecialtyCode[] = rawSecondary
      .filter((c): c is string => typeof c === 'string' && isValidSpecialty(c))
      .slice(0, 3) as SpecialtyCode[]

    const rawConfidence = parsed.confidence
    const confidence =
      rawConfidence === 'high' || rawConfidence === 'medium' || rawConfidence === 'low'
        ? (rawConfidence as 'high' | 'medium' | 'low')
        : 'medium'

    return {
      primary_specialty: primaryCode as SpecialtyCode,
      secondary_specialties: validSecondary,
      triage_level: triageLevel as TriageLevel,
      recommendation_reason: typeof parsed.recommendation_reason === 'string'
        ? parsed.recommendation_reason
        : '',
      isLLMFallback: true,
      confidence,
    }
  } catch {
    return SAFE_FALLBACK
  }
}
