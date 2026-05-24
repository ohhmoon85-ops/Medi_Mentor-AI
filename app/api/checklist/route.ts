/**
 * D2-4 체크리스트 API 라우트
 *
 * 입력: { region, checkedSymptomIds[], context, images?[] }
 * 출력: { matchResult, llmReply?, visionResult?, disclaimer[] }
 *
 * - Decision Engine은 LLM 의존 X (결정 고정)
 * - LLM은 자연어 응답만 생성 (선택, ANTHROPIC_API_KEY 있을 때만)
 * - 사진은 lib/vision으로 위임 (D1 정합)
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  runDecisionEngine,
  CHECKLIST_SYSTEM_PROMPT,
  type ChecklistContext,
  type RegionId,
  type ChecklistMatchResult,
} from '@/lib/checklist'
import { validateOutput, softenOutput } from '@/lib/vision'

interface ChecklistRequest {
  region: RegionId
  checkedSymptomIds: string[]
  context: ChecklistContext
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChecklistRequest

    if (!body.region || !Array.isArray(body.checkedSymptomIds)) {
      return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 })
    }
    if (body.checkedSymptomIds.length === 0) {
      return NextResponse.json({ error: '증상을 1개 이상 체크해 주세요.' }, { status: 400 })
    }

    const matchResult: ChecklistMatchResult = runDecisionEngine({
      region: body.region,
      checkedSymptomIds: body.checkedSymptomIds,
      context: body.context,
    })

    // LLM 자연어 응답 (선택)
    let llmReply: string | undefined
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const summary = JSON.stringify({
          region: body.region,
          checkedCount: body.checkedSymptomIds.length,
          ktas: matchResult.ktas,
          primarySpecialty: matchResult.primarySpecialty,
          suicide1393: matchResult.suicide1393,
          urgentMatch: matchResult.urgentMatch
            ? { possible: matchResult.urgentMatch.possible, action: matchResult.urgentMatch.action }
            : null,
          combinationMatches: matchResult.combinationMatches.slice(0, 3).map((c) => ({ name: c.name })),
          context: body.context,
        })
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: CHECKLIST_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Decision Engine 결과 (고정 입력):\n${summary}\n\n자연어 안내를 생성하세요.` }],
        })
        const txt = response.content[0]?.type === 'text' ? response.content[0].text : ''
        if (txt) {
          // D2 closure: 단언 어휘 사후 검증 (lib/vision/safety-rules 재사용) — 위반 시 soften
          const v = validateOutput(txt)
          llmReply = v.valid ? txt : softenOutput(txt)
        }
      } catch {
        // LLM 실패는 무시 (matchResult만으로도 UI 표시 가능)
      }
    }

    return NextResponse.json({
      matchResult,
      llmReply,
      disclaimer: [
        '본 안내는 추정이며 의학적 진단이 아닙니다.',
        '체크리스트 결과는 의료 상담을 대체할 수 없습니다.',
        '자세한 진단은 의료기관 방문이 필요합니다.',
        '응급 상황 시 즉시 119에 신고하세요.',
      ],
    })
  } catch (err) {
    console.error('[checklist] error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: '체크리스트 처리에 실패했습니다.' }, { status: 500 })
  }
}
