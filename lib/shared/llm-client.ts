/**
 * M6-B 표준 LLM 클라이언트 — 인터페이스 정의 (M6 패치)
 *
 * 정책 (M3-4-β): 모델 고정 claude-sonnet-4-6
 * 에러 처리: 4가지 타입 (auth / rate_limit / timeout / invalid_response)
 * JSON 모드: responseFormat='json' 시 자동 파싱 + 유효성 검사
 *
 * 향후 사용 패턴:
 *   - M5 일기 AI 분석 (Phase 2 이관, K-4)
 *   - Pro 모듈 P2·P5·P6 LLM 호출
 *   기존 lib/specialty/llm-fallback.ts는 변경하지 않음 (M3-4-final 보호 파일)
 *
 * 의존 관계:
 *   - @anthropic-ai/sdk (Anthropic)
 */

import Anthropic from '@anthropic-ai/sdk'

// ─── 상수 ─────────────────────────────────────────────────────────

/** M3-4-β 정책: 모든 LLM 호출은 이 모델을 사용한다 */
export const LLM_MODEL = 'claude-sonnet-4-6'
export const DEFAULT_MAX_TOKENS = 1024
export const DEFAULT_TEMPERATURE = 0.3

// ─── 요청·응답 인터페이스 ─────────────────────────────────────────

export interface LLMRequest {
  systemPrompt: string
  userPrompt: string
  /** 기본값 1024 */
  maxTokens?: number
  /** 기본값 0.3 */
  temperature?: number
  /** 기본값 'text'. 'json' 시 자동 파싱 */
  responseFormat?: 'json' | 'text'
}

export interface LLMResponse<T = string> {
  success: boolean
  data?: T
  error?: LLMError
  /** 실제 사용된 모델 ID */
  modelUsed: string
}

export type LLMError =
  | { type: 'auth' }
  | { type: 'rate_limit' }
  | { type: 'timeout' }
  | { type: 'invalid_response' }
  | { type: 'unknown'; message: string }

// ─── 내부 유틸 ───────────────────────────────────────────────────

function mapError(err: unknown): LLMError {
  const e = err as { status?: number; code?: string; message?: string }
  if (e.status === 401)                        return { type: 'auth' }
  if (e.status === 429)                        return { type: 'rate_limit' }
  if (e.code === 'ETIMEDOUT' || e.code === 'ECONNABORTED' ||
      e.message?.toLowerCase().includes('timeout'))
                                               return { type: 'timeout' }
  return { type: 'unknown', message: e.message ?? 'unknown error' }
}

function parseJsonResponse<T>(raw: string): T | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0]) as T
  } catch {
    return null
  }
}

// ─── 표준 클라이언트 ──────────────────────────────────────────────

const _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * 표준 LLM 호출 함수 (M6-B 인터페이스 정의).
 *
 * - 성공 시: { success: true, data: T, modelUsed }
 * - 실패 시: { success: false, error: LLMError, modelUsed }
 * - responseFormat='json': JSON 파싱 실패 → { success: false, error: { type: 'invalid_response' } }
 *
 * 향후 패치에서 신규 LLM 호출 시 본 함수만 사용 (llm-fallback.ts 제외).
 */
export async function callLLM<T = string>(
  request: LLMRequest
): Promise<LLMResponse<T>> {
  const {
    systemPrompt,
    userPrompt,
    maxTokens    = DEFAULT_MAX_TOKENS,
    temperature  = DEFAULT_TEMPERATURE,
    responseFormat = 'text',
  } = request

  try {
    const response = await _anthropic.messages.create({
      model:       LLM_MODEL,
      max_tokens:  maxTokens,
      system:      systemPrompt,
      messages:    [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''

    if (responseFormat === 'json') {
      const parsed = parseJsonResponse<T>(raw)
      if (parsed === null) {
        return { success: false, error: { type: 'invalid_response' }, modelUsed: LLM_MODEL }
      }
      return { success: true, data: parsed, modelUsed: LLM_MODEL }
    }

    return { success: true, data: raw as T, modelUsed: LLM_MODEL }
  } catch (err) {
    return { success: false, error: mapError(err), modelUsed: LLM_MODEL }
  }
}

// ─── 편의 함수 ────────────────────────────────────────────────────

/** JSON 모드 단축 함수 */
export async function callLLMJson<T>(
  request: Omit<LLMRequest, 'responseFormat'>
): Promise<LLMResponse<T>> {
  return callLLM<T>({ ...request, responseFormat: 'json' })
}
