import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { runMTSEngine } from '@/lib/triage/mts-engine'
import { matchDepartment } from '@/lib/triage/department-router'
import { classifyRedFlags } from '@/lib/safety/red-flag-classifier'
import { applyMedicalLawFilter } from '@/lib/safety/medical-law-filter'
import { normalizeToMedical } from '@/lib/nlp/ko-medical-terms'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `당신은 한국의 1차 의료 안내원입니다. 환자의 증상을 듣고 응급도와 진료과를 판단하기 위해
필요한 정보를 한 번에 1~2개씩만 묻습니다. 절대 진단을 내리지 않습니다.
질문은 일상어로 합니다. 다음 항목 중 미파악 항목을 우선 묻습니다:
- 증상 부위/성질/시작 원인/지속 기간/악화·완화 요인/동반 증상
- 인지 여부, 발열, 식사 상태
- 환자의 연령대/성별/임신 가능성/주요 기저질환/복용약
정보가 충분하면 ready_for_triage: true를 JSON으로 반환합니다.
응답은 반드시 다음 JSON 형식으로만 합니다:
{
  "next_question": "...",
  "captured_so_far": {...},
  "ready_for_triage": false
}`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Red Flag 즉시 체크
    const redFlagResult = classifyRedFlags(message)
    if (redFlagResult.acuityOverride === 1) {
      return NextResponse.json({
        reply: `🔴 ${redFlagResult.emergencyMessage}\n\n${redFlagResult.flags.join(', ')} 증상이 감지되었습니다. 지금 즉시 119에 신고해 주세요.`,
        triage: {
          acuity_level: 1,
          recommended_department: '응급의학과',
          alternative_departments: [],
          red_flags: redFlagResult.flags,
          rationale: redFlagResult.emergencyMessage,
        },
      })
    }

    const apiMessages: Anthropic.Messages.MessageParam[] = [
      ...(history ?? []).slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'

    let parsed: { next_question?: string; captured_so_far?: Record<string, unknown>; ready_for_triage?: boolean }
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } catch {
      parsed = { next_question: rawText, ready_for_triage: false }
    }

    let triage = null

    if (parsed.ready_for_triage && parsed.captured_so_far) {
      const captured = parsed.captured_so_far
      const symptomText = [
        captured.symptom, captured.location, captured.duration,
      ].filter(Boolean).join(' ')

      const department = matchDepartment(symptomText)
      const mtsResult = runMTSEngine({ symptomText, duration: String(captured.duration ?? '') })

      triage = {
        acuity_level: mtsResult.acuity_level,
        recommended_department: department.primary,
        alternative_departments: department.alternatives,
        red_flags: mtsResult.red_flags,
        rationale: mtsResult.rationale,
      }
    }

    const reply = parsed.next_question
      ? applyMedicalLawFilter(parsed.next_question)
      : applyMedicalLawFilter(rawText)

    return NextResponse.json({ reply, triage })
  } catch (err) {
    console.error('[triage] error:', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
