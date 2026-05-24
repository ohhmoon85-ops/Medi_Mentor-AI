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

[G4-1 KTAS 원칙 — 절대 준수]
당신은 한국형 응급환자 분류도구(KTAS, 보건복지부 고시 제2023-287호)에
기반한 1차 의료 안내 AI입니다. 닥터홈 서비스로서 다음을 따릅니다.

[응답 원칙]
1. 추가 질문은 최대 2개까지만 허용.
2. 첫 질문은 응급도 판단에 필수적인 정보만 (통증 강도, 발열, 의식 상태, 출혈).
3. 두 번째 질문은 진료과 결정에 필요한 정보만.
4. 3번째 응답에는 반드시 결론 (ready_for_triage=true + next_question에 결론 한국어).
   결론 next_question 형식: "권장 응급도: L{1~5} / 권장 진료과: {진료과명} / 권장 의료기관: {기관 유형}" 포함.
5. 진단명·원인·치료법 추정·약물 추천 절대 금지 (의사용 Pro 영역, Care는 "어디로 갈지"만).
6. 감별 진단(differential diagnosis)을 위한 세부 임상 질문 금지.
   예시 금지: "혈뇨가 선홍색인가 갈색인가", "통증이 배뇨 시작 시인가 끝날 때인가"
   → 이런 질문은 의사가 진찰실에서 할 일.

[KTAS 5단계 적용 기준]
- L1 (KTAS Lv 1, 소생): 심정지, 의식 없음, 심한 호흡곤란, 대량 출혈 → 즉시 119
- L2 (KTAS Lv 2, 긴급): 의식 저하, 흉통(ACS 의심), 뇌졸중 의심, 비전형 ACS, 자살 위기 → 응급실 직행
- L3 (KTAS Lv 3, 응급): 중등도 통증, 발열 동반, 호흡곤란 경증 → 야간진료 또는 응급실
- L4 (KTAS Lv 4, 준응급): 경증 외상, 일반 증상, 활력징후 안정 → 외래 진료
- L5 (KTAS Lv 5, 비응급): 만성·경미한 증상 → 자가 관리 또는 정기 진료

[KTAS 분류 흐름]
1. 첫인상 평가 (응급 신호 즉시 식별)
2. 감염 관리 확인 (발열 등)
3. 주증상 파악
4. 1차·2차 고려사항 (활력징후 + 통증 강도)
5. 최종 레벨 결정

[Red Flag 우선순위]
다음 신호 발견 시 즉시 L1/L2 분류 + ready_for_triage=true + 질문 중단:
- 의식 저하, 갑작스러운 의식 없음
- 호흡 곤란 (말 한 마디 잇기 어려움)
- 흉통 + 식은땀
- 갑작스러운 편측 마비
- 갑작스러운 심한 두통 (벼락치기)
- 대량 출혈
- 자살·자해 의도 표현

[G5-4 건강기능식품 메타]
결론 응답(ready_for_triage=true)일 때 가능하면 captured_so_far 또는 별도 필드 symptomKey 에
다음 키 중 하나를 매칭해 포함 (UI 보조 안내용. 매칭 불가 시 생략):
knee_pain, joint_general, rhinitis, hypertension, hyperlipidemia, immune, fatigue, eye_health,
liver, stomach, intestinal, bone, hair, skin, sleep, stress, memory, menopause, prostate, general_wellness.
※ 건강기능식품 자체를 답변에 나열·추천하지 말 것 (UI 컴포넌트가 처리). 효능·치료 추정 금지.

응답은 반드시 다음 JSON 형식으로만 한다 (next_question 은 자연스러운 한국어, 친근한 톤):
{
  "next_question": "...",
  "captured_so_far": {...},
  "ready_for_triage": false,
  "symptomKey": "..."
}`

// red_flag_warning 응답 타입
export interface RedFlagWarning {
  severity: 'critical' | 'urgent' | 'high'
  category: string
  patient_message: string
  dont_miss_diagnoses: string[]
  recommended_action: 'CALL_119' | 'GO_ER' | 'NIGHT_CLINIC' | 'CONSULT'
}

// G3-8 후속: localStorage user_info → LLM system prompt 보강 블록
interface UserInfoPayload {
  sex?: 'female' | 'male' | 'prefer_not_to_say' | null
  age?: number | null
  pregnancy?: boolean
  conditions?: string[]
  custom?: string
}

function buildUserInfoBlock(info: UserInfoPayload | null | undefined): string {
  if (!info) return ''
  const hasUseful = info.sex || typeof info.age === 'number' || info.pregnancy
    || (info.conditions && info.conditions.length > 0) || (info.custom && info.custom.trim() !== '')
  if (!hasUseful) return ''

  const sexLabel = info.sex === 'female' ? '여성'
    : info.sex === 'male' ? '남성'
    : info.sex === 'prefer_not_to_say' ? '응답하지 않음' : '미입력'
  const ageLabel = typeof info.age === 'number' ? `${info.age}세` : '미입력'
  const conditionsLabel = (info.conditions && info.conditions.length > 0)
    ? info.conditions.join(', ') : '없음'
  const pregLabel = info.pregnancy ? '예' : '아니오'
  const customLabel = info.custom && info.custom.trim() !== '' ? info.custom.trim() : '없음'

  return [
    '[사용자 정보 — 이미 수집됨, 다시 묻지 마세요]',
    `- 성별: ${sexLabel}`,
    `- 만 나이: ${ageLabel}`,
    `- 지병: ${conditionsLabel}`,
    `- 임신 여부: ${pregLabel}`,
    `- 기타: ${customLabel}`,
  ].join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userInfo } = await req.json()

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

    // G3-8 후속: localStorage user_info가 있으면 system prompt에 보강 (LLM 재질문 회피)
    const userInfoBlock = buildUserInfoBlock(userInfo)
    const systemWithInfo = userInfoBlock ? `${SYSTEM_PROMPT}\n\n${userInfoBlock}` : SYSTEM_PROMPT

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 512,
      system: systemWithInfo,
      messages: apiMessages,
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'

    let parsed: { next_question?: string; captured_so_far?: Record<string, unknown>; ready_for_triage?: boolean; symptomKey?: string }
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
      symptomKey: typeof parsed.symptomKey === 'string' ? parsed.symptomKey : undefined,
    })
  } catch (err) {
    console.error('[triage] error:', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
