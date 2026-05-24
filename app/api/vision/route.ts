/**
 * D1-1 Vision API 라우트
 *
 * 정책:
 * - 사진 서버 미저장 (Blob/KV/DB 사용 금지)
 * - 요청 처리 직후 base64 변수 dereference (GC 트리거)
 * - 로그에 사진 데이터 출력 금지
 * - 최대 3장, 단언 어휘 차단 후 softenOutput 폴백
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  VISION_SYSTEM_PROMPT,
  validateOutput,
  softenOutput,
  VISION_DISCLAIMER,
  BODY_REGIONS,
  type VisionAnalysisResult,
} from '@/lib/vision'
import { isValidSpecialtyCode } from '@/lib/constants/specialties'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_IMAGES = 3

interface VisionRequest {
  images: string[]
  symptomText: string
}

/** data:image/<type>;base64,<data> dataURL → { mediaType, data } 분리 */
function parseDataURL(dataURL: string): { mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; data: string } | null {
  const m = dataURL.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/)
  if (!m) return null
  return { mediaType: m[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: m[2] }
}

export async function POST(req: NextRequest) {
  let images: string[] | undefined
  let symptomText: string | undefined

  try {
    const body = (await req.json()) as VisionRequest
    images = body.images
    symptomText = body.symptomText

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: '사진을 첨부해 주세요.' }, { status: 400 })
    }
    if (images.length > MAX_IMAGES) {
      return NextResponse.json({ error: `사진은 최대 ${MAX_IMAGES}장까지 첨부 가능합니다.` }, { status: 400 })
    }
    if (typeof symptomText !== 'string' || symptomText.trim().length === 0) {
      return NextResponse.json({ error: '증상을 함께 입력해 주세요.' }, { status: 400 })
    }

    const parsed = images.map(parseDataURL)
    if (parsed.some((p) => p === null)) {
      return NextResponse.json({ error: '사진 형식이 올바르지 않습니다 (jpeg/png/webp/gif).' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            ...parsed.map((p) => ({
              type: 'image' as const,
              source: { type: 'base64' as const, media_type: p!.mediaType, data: p!.data },
            })),
            { type: 'text' as const, text: symptomText },
          ],
        },
      ],
    })

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : '{}'

    let parsedLLM: Partial<VisionAnalysisResult> & { ktasAdjustment?: VisionAnalysisResult['ktasAdjustment'] | null }
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      parsedLLM = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      parsedLLM = {}
    }

    // 단언 어휘 검증 — 위반 시 soften (rationale + observations 한정)
    const violations: string[] = []
    if (parsedLLM.combinedEstimate?.rationale) {
      const v = validateOutput(parsedLLM.combinedEstimate.rationale)
      if (!v.valid) {
        violations.push(...v.violations)
        parsedLLM.combinedEstimate.rationale = softenOutput(parsedLLM.combinedEstimate.rationale)
      }
    }
    for (const a of parsedLLM.analyses ?? []) {
      a.observations = (a.observations ?? []).map((o) => {
        const v = validateOutput(o)
        if (!v.valid) {
          violations.push(...v.violations)
          return softenOutput(o)
        }
        return o
      })
    }

    const combined = parsedLLM.combinedEstimate ?? {
      bodyRegion: 'out_of_scope' as const,
      estimatedConditions: [],
      confidence: 'low' as const,
      unanalyzable: true,
      rationale: '사진으로는 판단이 어렵습니다. 병원 방문을 권고합니다.',
    }

    const recommendedSpecialty =
      typeof parsedLLM.specialtyRecommendation === 'string' && isValidSpecialtyCode(parsedLLM.specialtyRecommendation)
        ? parsedLLM.specialtyRecommendation
        : (BODY_REGIONS[combined.bodyRegion]?.specialty ?? null)

    const ktasAdjustment =
      parsedLLM.ktasAdjustment &&
      typeof parsedLLM.ktasAdjustment.level === 'number' &&
      [1, 2, 3, 4, 5].includes(parsedLLM.ktasAdjustment.level)
        ? parsedLLM.ktasAdjustment
        : undefined

    const result: VisionAnalysisResult = {
      analyses: parsedLLM.analyses ?? [
        {
          bodyRegion: combined.bodyRegion,
          observations: [combined.rationale],
          unanalyzable: combined.unanalyzable,
        },
      ],
      combinedEstimate: combined,
      specialtyRecommendation: recommendedSpecialty,
      ktasAdjustment,
      disclaimer: [...VISION_DISCLAIMER],
    }

    // 메모리 정리 — 응답 직후 base64 dereference
    images = undefined
    parsed.length = 0

    return NextResponse.json({ ...result, _violations: violations.length > 0 ? violations : undefined })
  } catch (err) {
    console.error('[vision] error:', err instanceof Error ? err.message : 'unknown')
    images = undefined
    return NextResponse.json(
      { error: '사진 분석에 실패했습니다. 텍스트 안내로 진행해 주세요.', fallback: 'triage' },
      { status: 500 },
    )
  }
}
