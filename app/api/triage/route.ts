import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { runMTSEngine } from '@/lib/triage/mts-engine'
import { routeToSpecialty } from '@/lib/triage/department-router'
import {
  classifyRedFlags,
  detectRedFlags,
  getPatientMessage,
} from '@/lib/safety/red-flag-classifier'
import { applyMedicalLawFilter } from '@/lib/safety/medical-law-filter'
import { normalizeToMedical } from '@/lib/nlp/ko-medical-terms'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import { PREGNANCY_PATTERN, MINOR_PATTERN } from '@/lib/safety/red-flag-data'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// A-4 방식 1: 시스템 프롬프트에 인구학 정보 우선 수집 명시
const SYSTEM_PROMPT = `당신은 한국의 1차 의료 안내자다. 환자의 증상을 듣고
응급도와 진료과를 판단하기 위해 필요한 정보를 한 번에 1~2개씩만 묻는다.
절대 진단을 내리지 않는다.

[인구학 정보 우선 수집 — 첫 1~2번 질문 안에 반드시 파악]
다음 3가지가 captured_so_far에 없으면 가장 먼저 물어라:
1. 연령대 (숫자로 기록: age)
2. 성별 (남/여로 기록: sex)
3. 여성인 경우 임신 가능성 (있음/없음/모름으로 기록: pregnancy)
파악된 즉시 captured_so_far에 기록하라.

[수집 우선순위]
- 증상 부위/성질/시작 시점/지속 기간/악화·완화 요인/동반 증상
- 외상 유무, 발열, 의식 상태
- 환자의 연령대/성별/임신 가능성/주요 기저질환/복용약

[추천 가능 진료과 (1차 진료 직접 방문 가능 15개)]
내과(IM), 가정의학과(FM), 소아청소년과(PED), 신경과(NEU), 정신건강의학과(PSY),
피부과(DERM), 정형외과(OS), 산부인과(OBGYN), 비뇨의학과(URO), 안과(OPH),
이비인후과(ENT), 치과(DENT), 응급의학과(EM), 재활의학과(REH), 통증의학과(PAIN)

[흔한 환자 혼선 유의]
- 턱관절 통증 → DENT(구강악안면) 1차, OS·ENT 대안
- 무릎통증 → OS 1차, REH·PAIN 대안
- 어지럼증 → ENT(말초성)·NEU(중추성) 동시 고려
- 흉통 → IM(순환기)·EM 동시 고려 (연령·성별 가중치)
- 두통 → NEU 1차, IM·PSY 대안
- 복통 → IM·GS·OBGYN(여성) 분기

[라우팅 결정은 server-side에서 routeToSpecialty()가 수행하므로,
LLM의 역할은 정보 수집 + 다음 질문 생성 + ready_for_triage 판정에 한정한다.]

응답은 반드시 다음 JSON 형식으로만 한다:
{
  "next_question": "...",
  "captured_so_far": {...},
  "ready_for_triage": false
}`

// red_flag_warning 응답 타입
export interface RedFlagWarning {
  severity: 'critical' | 'urgent' | 'high'
  category: string
  patient_message: string
  dont_miss_diagnoses: string[]
  recommended_action: 'CALL_119' | 'GO_ER' | 'NIGHT_CLINIC' | 'CONSULT'
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // ─── [1단계] classifyRedFlags: 즉시 응급 키워드 필터 ─────────────
    const rfResult = classifyRedFlags(message)

    if (rfResult.acuityOverride === 1) {
      // acuity 1 → LLM·라우팅 모두 건너뜀, 즉시 응급 응답 반환
      return NextResponse.json({
        reply: `🔴 ${rfResult.emergencyMessage}\n\n${rfResult.flags.join(', ')} 증상이 감지되었습니다. 지금 즉시 119에 신고해 주세요.`,
        triage: {
          acuity_level: 1,
          recommended_department: '응급의학과',
          alternative_departments: [],
          red_flags: rfResult.flags,
          rationale: rfResult.emergencyMessage,
        },
        red_flag_warning: {
          severity: 'critical',
          category: '즉시 응급',
          patient_message: rfResult.emergencyMessage ?? '지금 즉시 119에 신고하거나 응급실로 이동하세요.',
          dont_miss_diagnoses: [],
          recommended_action: 'CALL_119',
        } satisfies RedFlagWarning,
        demographics: {
          pregnancy: PREGNANCY_PATTERN.test(message),
          isMinor: MINOR_PATTERN.test(message),
          age: null,
        },
      })
    }

    // ─── LLM 호출: 후속 질문 생성 + 인구학 정보 수집 ────────────────
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

    const captured = parsed.captured_so_far ?? {}

    // ─── [A-4] 인구학 정보 병합: 방식 1(LLM) 우선 → 방식 2(텍스트 패턴) 보완
    const ageFromCapture = Number(captured.age) > 0 ? Number(captured.age) : undefined
    const sexFromCapture = typeof captured.sex === 'string' ? captured.sex : undefined

    // 방식 1: LLM이 capture한 pregnancy
    const pregnancyFromLLM =
      captured.pregnancy === true ||
      captured.pregnancy === '있음' ||
      captured.pregnancy === 'yes'

    // 방식 1: LLM이 capture한 isMinor
    const isMinorFromLLM = ageFromCapture !== undefined && ageFromCapture < 18

    // 방식 2: 텍스트 패턴 보완 (현재 메시지에서 감지)
    const pregnancyFromText = PREGNANCY_PATTERN.test(message)
    const isMinorFromText = MINOR_PATTERN.test(message)

    // 최종 병합 (LLM 우선)
    const effectivePregnancy = pregnancyFromLLM || pregnancyFromText
    const effectiveIsMinor = isMinorFromLLM || isMinorFromText

    // ─── [2단계] detectRedFlags: Don't Miss 매트릭스 분류 ─────────────
    const dfResult = detectRedFlags({
      rawSymptoms: message,
      pregnancy: effectivePregnancy,
      isMinor: effectiveIsMinor,
    })

    // red_flag_warning 구성
    let redFlagWarning: RedFlagWarning | null = null

    if (dfResult.is_red_flag && dfResult.matched_category) {
      const severity = dfResult.urgency === 'immediate' ? 'critical' : 'urgent'
      redFlagWarning = {
        severity,
        category: dfResult.matched_category,
        patient_message: getPatientMessage(dfResult),
        dont_miss_diagnoses: dfResult.dont_miss_diagnoses.map((e) => e.dont_miss_lay_term),
        recommended_action: severity === 'critical' ? 'CALL_119' : 'GO_ER',
      }
    } else if (rfResult.acuityOverride === 2) {
      // classifyRedFlags level 2 단독 발동 — detectRedFlags 미적중 케이스
      redFlagWarning = {
        severity: 'urgent',
        category: '응급 증상',
        patient_message: rfResult.emergencyMessage ?? '가장 가까운 응급실 또는 응급의료기관으로 이동하세요.',
        dont_miss_diagnoses: [],
        recommended_action: 'GO_ER',
      }
    }

    // ─── triage: ready_for_triage 판정 후 라우팅 ─────────────────────
    let triage = null

    if (parsed.ready_for_triage && captured) {
      const symptomText = [
        captured.symptom, captured.location, captured.duration,
      ].filter(Boolean).join(' ')

      const mtsResult = runMTSEngine({ symptomText, duration: String(captured.duration ?? '') })

      const routing = await routeToSpecialty({
        rawSymptoms: symptomText,
        capturedFindings: captured,
        age: ageFromCapture,
        sex: sexFromCapture,
        pregnancy: effectivePregnancy,
        isMinor: effectiveIsMinor,
      })

      triage = {
        acuity_level: mtsResult.acuity_level,
        recommended_department: KOREAN_SPECIALTIES[routing.primary.code].ko,
        alternative_departments: routing.alternatives.map((a) => KOREAN_SPECIALTIES[a.code].ko),
        red_flags: mtsResult.red_flags,
        rationale: mtsResult.rationale,
      }
    }

    const reply = parsed.next_question
      ? applyMedicalLawFilter(parsed.next_question)
      : applyMedicalLawFilter(rawText)

    return NextResponse.json({
      reply,
      triage,
      red_flag_warning: redFlagWarning,
      demographics: {
        pregnancy: effectivePregnancy,
        isMinor: effectiveIsMinor,
        age: ageFromCapture ?? null,
      },
    })
  } catch (err) {
    console.error('[triage] error:', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
