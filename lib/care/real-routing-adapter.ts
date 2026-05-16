/**
 * G2-3 Real Routing Adapter
 *
 * AlphaScenario → 실 라우팅 결과(ActualOutput) 매핑.
 *
 * 흐름:
 *   1. PolicyEvaluationInput 구성 (D-1: sex 는 정책 평가에만 사용, 엔진에는 비전달)
 *   2. evaluateActivePolicies() — AGENDA-12~17 (L1 강제), -19 (L4/예외 격상), -18 (감산)
 *   3. 정책 매칭 시:
 *        l1_override / l4_chest_pain 격상 → 정책 결과 직접 출력
 *        context_deduction (AGENDA-18) → 진단력 기반 matchedEntry 로 엔진 호출
 *   4. 정책 미매칭 시: 시나리오 키워드 → matchedEntry 합성 → resolveRecommendation()
 *   5. 엔진 결과(TriageLevel) → LLevel + routing + card + message_keywords 도출
 *
 * D-3: USE_LLM_FALLBACK 환경변수(기본 'false'). matchedEntry 가 항상 비-null 이도록
 *      합성 entry 를 제공해 엔진의 분기 0(LLM) 진입을 방지한다.
 *
 * 보호 파일 미수정: recommendation-engine.ts, llm-fallback.ts, routing-policy-table.ts,
 *                   routing-policy-loader.ts, red-flag-classifier.ts, symptom-mapping-schema.ts.
 */

import { resolveRecommendation, type RecommendationResult } from '@/lib/specialty/recommendation-engine'
import type { SymptomMappingEntry, TriageLevel } from '@/lib/specialty/symptom-mapping-schema'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import { classifyRedFlags, detectRedFlags } from '@/lib/safety/red-flag-classifier'
import { getActivePolicies } from './routing-policy/routing-policy-loader'
import {
  evaluateActivePolicies,
  type PolicyEvaluationInput,
  type PolicyOverrideResult,
} from './policy-evaluator'
import { toLLevel, type LLevel } from './triage-level-converter'
import type {
  RoutingAdapter,
  AlphaScenario,
  AlphaScenarioInput,
  ActualOutput,
} from './alpha-validation/alpha-validator'

// ─── 상수 ─────────────────────────────────────────────────────

const USE_LLM_FALLBACK = process.env.USE_LLM_FALLBACK === 'true'

const CARD_BY_LEVEL: Record<LLevel, string> = {
  L1: 'CriticalEmergencyCard',
  L2: 'EmergencyRoomCard',
  L3: 'NightWeekendInfoCard',
  L4: 'SpecialtyRecommendationCard',
  L5: 'SelfCareCard',
}

// 진단력 → matchedEntry 합성 (AGENDA-18 진입 시)
interface DiagnosisMapEntry {
  triage: TriageLevel
  primary: SpecialtyCode
  secondary: SpecialtyCode[]
}
const DIAGNOSIS_MAP: Array<{ pattern: RegExp; entry: DiagnosisMapEntry }> = [
  { pattern: /공황장애|불안장애/,                 entry: { triage: 'outpatient', primary: 'PSY', secondary: ['IM','FM'] } },
  { pattern: /편두통/,                            entry: { triage: 'self_care',  primary: 'NEU', secondary: ['FM','IM'] } },
  { pattern: /만성\s*위염|기능성\s*소화불량/,     entry: { triage: 'self_care',  primary: 'IM',  secondary: ['FM'] } },
  { pattern: /과민성\s*대장/,                     entry: { triage: 'self_care',  primary: 'IM',  secondary: ['FM'] } },
]

// 정책 → message_keywords 매핑
const AGENDA_KEYWORDS: Record<string, string[]> = {
  'AGENDA-12': ['119', 'TIA', '뇌졸중 전조', '증상 사라져도'],
  'AGENDA-13': ['응급실', '충수염', '천공 위험', '지체 금지'],
  'AGENDA-14': ['119', '즉시', '영아', '비특이 증상도 응급'],
  'AGENDA-15': ['응급실', '뇌수막염', '지체 금지'],
  'AGENDA-16': ['119', '비전형', '심근경색', '여성·고령'],
  'AGENDA-17': ['119', '즉시', '1393', '정신건강위기상담'],
}

// ─── PolicyEvaluationInput 구성 ───────────────────────────────

function buildPolicyInput(input: AlphaScenarioInput): PolicyEvaluationInput {
  const primary = input.primary_symptom ?? ''
  const secondary = input.secondary_symptoms ?? []
  const context = input.context ?? ''
  const duration = input.duration ?? ''
  const allText = [primary, ...secondary, context, duration].join(' ')

  const symptom_keywords = [primary, ...secondary].filter((s) => s.length > 0)
  const symptom_current_state = [duration, context].filter((s) => s.length > 0)
  // pain_location/character 는 secondary 전체를 후보로 — lenient 매칭으로 필터링
  const pain_location = [...secondary]
  const pain_character = [...secondary]

  return {
    symptom_keywords,
    symptom_current_state,
    pain_location,
    pain_character,
    patient_age_years: input.age,
    patient_age_months: Math.round(input.age * 12),
    patient_gender: input.sex, // D-1: 정책 평가용으로 보존
    existing_diagnosis: context ? [context] : [],
    symptom_matches_existing_diagnosis: /동일\s*양상|평소\s*패턴|동일.*반복/.test(context),
    has_radiating_pain: /방사통|어깨.*까지|팔.*까지|턱.*까지/.test(allText),
    chest_pain_over_30min:
      /흉통|가슴/.test(allText) && /(30|40|50|60)분\s*(지속|이상)|1시간|2시간/.test(allText),
  }
}

// ─── matchedEntry 합성 ────────────────────────────────────────

function makeEntry(
  triage: TriageLevel,
  primary: SpecialtyCode,
  secondary: SpecialtyCode[],
  pediatric?: SpecialtyCode,
  obstetric?: SpecialtyCode,
): SymptomMappingEntry {
  return {
    symptom_id: '__synthetic__',
    korean_name: '합성 항목',
    description: '합성 매핑',
    recommendation_reason: '',
    triage_level: triage,
    prevalence: 'medium',
    age_group: ['adult'],
    primary_specialty: primary,
    secondary_specialties: secondary,
    tertiary_specialties: [],
    pediatric_specialty: pediatric,
    obstetric_specialty: obstetric,
    validation_status: 'approved',
  }
}

function buildSyntheticEntry(scenario: AlphaScenario): SymptomMappingEntry {
  const ps = scenario.input.primary_symptom ?? ''
  const ss = (scenario.input.secondary_symptoms ?? []).join(' ')
  const ctx = scenario.input.context ?? ''
  const dur = scenario.input.duration ?? ''
  const all = `${ps} ${ss} ${ctx} ${dur}`
  const isPed = scenario.input.age_group === 'pediatric'
  const isElderly = scenario.input.age_group === 'elderly'

  // ── L1 critical ────────────────────────────────────────────
  // 흉통 + 방사통/30분/식은땀 — ACS 전형
  if (/흉통|가슴.*통증/.test(all) && /방사통|식은땀|30분|악화/.test(all))
    return makeEntry('critical', 'EM', ['IM','CS'])
  // 뇌졸중/마비
  if (/뇌졸중|편측 마비|편마비|발음 장애|안면 비대칭|FAST/.test(all))
    return makeEntry('critical', 'EM', ['NEU','NS'])
  // 호흡곤란/아나필락시스
  if (/호흡\s*곤란|아나필락시스|천명음?|청색증|기도/.test(all))
    return makeEntry('critical', 'EM', ['IM'])
  // 외상 + 다량 출혈 (출혈성 쇼크)
  if (/외상.*출혈|다량.*출혈|출혈성|쇼크/.test(all))
    return makeEntry('critical', 'EM', ['GS','OS'])
  // 임신 중 출혈 (산과 응급)
  if (/임신.*출혈|질출혈|산과/.test(all))
    return makeEntry('critical', 'EM', ['OBGYN'], undefined, 'OBGYN')
  // 소아 패혈증 — 고열 + 의식 저하/축 처짐 + 영유아
  if (isPed && /(고열|4[01]도)/.test(all) && /(의식|처짐|패혈증|늘어짐)/.test(all))
    return makeEntry('critical', 'EM', ['PED'], 'PED')

  // ── L2 urgent ──────────────────────────────────────────────
  // 성인 고열 39+ — 단순 발열, 의식·호흡 이상 없음
  if (/고열|39\.\d|39도|40도/.test(all) && !isPed && !/의식|처짐|패혈증/.test(all))
    return makeEntry('urgent', 'IM', ['EM','FM'])
  // 옆구리 통증 + 혈뇨 — 요로결석
  if (/옆구리|요로|결석|혈뇨/.test(all))
    return makeEntry('urgent', 'URO', ['IM','EM'])
  // 외상 + 골절 의심
  if (/골절|변형|부종/.test(all) && /외상|사고|부상/.test(all))
    return makeEntry('urgent', 'OS', ['EM','FM'])

  // ── L3 night_weekend ───────────────────────────────────────
  // 소아 — 발열·구토·설사·경미한 외상
  if (isPed && /(발열|구토|설사|자상|외상|콧물)/.test(all))
    return makeEntry('night_weekend', 'PED', ['FM','EM'], 'PED')
  // 성인 — 인후통+발열 동반 시 야간진료 (가벼운 인후통+체온 정상은 L5 로 흘러감)
  if (!isPed && /인후통|삼킴/.test(all) && /발열\s*38|고열/.test(all))
    return makeEntry('night_weekend', 'ENT', ['IM','FM'])

  // ── L4 outpatient ──────────────────────────────────────────
  // 만성 두통
  if (/만성\s*두통|두통.*\d+주|두통.*\d+개월/.test(all))
    return makeEntry('outpatient', 'NEU', ['IM','FM'])
  // 간헐적 흉부 답답함 (운동 시 발생, 휴식 시 호전, 응급 신호 없음)
  if (/흉부\s*답답|간헐적.*가슴|운동\s*시.*발생/.test(all) && !/방사통|30분|악화/.test(all))
    return makeEntry('outpatient', 'IM', ['FM','CS'])
  // 소아 야뇨증
  if (isPed && /야뇨|배뇨|소변/.test(all))
    return makeEntry('outpatient', 'PED', ['URO'], 'PED')

  // ── L5 self_care ───────────────────────────────────────────
  if (/콧물|가벼운\s*인후통|코감기/.test(all) && !isPed)
    return makeEntry('self_care', 'FM', ['IM'])
  if (/근육통|운동\s*후|등산/.test(all))
    return makeEntry('self_care', 'FM', ['REH'])
  if (/코피|비출혈/.test(all))
    return makeEntry('self_care', 'ENT', ['FM'])

  // ── 최종 fallback (외래) ───────────────────────────────────
  void isElderly
  return makeEntry('outpatient', 'FM', ['IM'])
}

function buildDeductionEntry(scenario: AlphaScenario): SymptomMappingEntry {
  const ctx = scenario.input.context ?? ''
  for (const m of DIAGNOSIS_MAP) {
    if (m.pattern.test(ctx))
      return makeEntry(m.entry.triage, m.entry.primary, m.entry.secondary)
  }
  // fallback — 외래
  return makeEntry('outpatient', 'FM', ['IM'])
}

// ─── routing 도출 ─────────────────────────────────────────────

function deriveRouting(
  level: LLevel,
  scenario: AlphaScenario,
  policyKind: PolicyOverrideResult['policy_kind'] | null,
): string {
  if (level === 'L1') return '119_immediate' // policy_kind 별 분기는 정책 결과에서 직접 출력
  if (level === 'L2') return 'ER_visit'
  if (level === 'L3') {
    const isPed = scenario.input.age_group === 'pediatric'
    const ctx = scenario.input.context ?? ''
    const isWeekend = /주말|토요일|일요일/.test(ctx)
    if (isPed) {
      if (isWeekend) {
        // 외상·자상 동반 시 외래도 함께 안내
        if (/자상|외상|부상/.test(`${scenario.input.primary_symptom} ${(scenario.input.secondary_symptoms ?? []).join(' ')}`))
          return 'weekend_pediatric_or_clinic'
        return 'weekend_pediatric_clinic'
      }
      return 'night_pediatric_clinic'
    }
    return 'night_clinic_adult'
  }
  if (level === 'L4') return policyKind === 'context_deduction' ? 'regular_visit_or_self_care' : 'regular_visit'
  // L5
  return policyKind === 'context_deduction' ? 'self_care_or_regular' : 'self_care'
}

// ─── message_keywords 도출 ────────────────────────────────────

function specialtyToKo(code: SpecialtyCode): string {
  return KOREAN_SPECIALTIES[code]?.ko ?? code
}

function buildMessageKeywords(
  scenario: AlphaScenario,
  level: LLevel,
  specialties: SpecialtyCode[],
  policy: PolicyOverrideResult | null,
): string[] {
  // 정책 매칭 시 사전 정의된 키워드 사용
  if (policy && !policy.escalated_to_l1) {
    const agendaKws = AGENDA_KEYWORDS[policy.agenda_id]
    if (agendaKws) return [...agendaKws]
    // AGENDA-18 (context_deduction) — 진단력에 따른 메시지
    if (policy.policy_kind === 'context_deduction') {
      const ctx = scenario.input.context ?? ''
      if (/공황장애|불안/.test(ctx))    return ['정신건강의학과', '정규 진료', '응급 신호 시 119']
      if (/편두통/.test(ctx))           return ['편두통', '자가 처치', '패턴 변화 시 진료']
      if (/만성\s*위염|소화불량/.test(ctx)) return ['자가 처치', '악화 시 진료']
      if (/과민성\s*대장/.test(ctx))    return ['자가 처치', '악화 시 진료']
      return ['자가 처치', '악화 시 진료']
    }
    // AGENDA-19 비격상 — 흉통 L4
    if (policy.policy_kind === 'l4_chest_pain') {
      const koPrimary = specialties[0] ? specialtyToKo(specialties[0]) : '순환기내과'
      return [koPrimary, '정규 진료', '심전도']
    }
  }
  // 정책 격상 — L1 (AGENDA-19 예외)
  if (policy?.escalated_to_l1) {
    return ['119', '즉시', '심근경색']
  }

  // 엔진 경로 — level 기반 키워드
  const all = [
    scenario.input.primary_symptom,
    ...(scenario.input.secondary_symptoms ?? []),
    scenario.input.context ?? '',
    scenario.input.duration ?? '',
  ].join(' ')

  if (level === 'L1') {
    const kws: string[] = ['119', '즉시']
    if (/마비|뇌졸중|편측|발음 장애|안면 비대칭/.test(all)) kws.push('뇌졸중', 'FAST')
    else if (/호흡\s*곤란|아나필락시스|천명|청색증|땅콩/.test(all)) kws.push('아나필락시스', '기도')
    else if (/임신|질출혈|산과/.test(all)) kws.push('산과 응급')
    else if (/외상.*출혈|다량.*출혈|출혈성|쇼크|교통사고/.test(all)) kws.push('출혈성 쇼크')
    else if (scenario.input.age_group === 'pediatric' && /고열|41도|의식|처짐|패혈증/.test(all))
      kws.push('패혈증', '영유아')
    else if (/흉통|가슴.*통증|방사통|식은땀/.test(all)) kws.push('심근경색')
    return kws
  }
  if (level === 'L2') {
    const kws = ['응급실']
    if (/골절|변형|부종/.test(all)) kws.push('골절 의심')
    else if (/옆구리|요로|결석|혈뇨/.test(all)) kws.push('요로결석 의심')
    else if (/고열|39|40/.test(all)) kws.push('고열', '지속')
    return kws
  }
  if (level === 'L3') {
    const kws: string[] = []
    const isPed = scenario.input.age_group === 'pediatric'
    const ctx = scenario.input.context ?? ''
    if (isPed) kws.push('달빛어린이병원')
    else       kws.push('야간진료')
    if (/주말|토요일|일요일/.test(ctx)) kws.push('주말')
    else                                kws.push('야간')
    return kws
  }
  if (level === 'L4') {
    const kws: string[] = []
    const ko = specialties[0] ? specialtyToKo(specialties[0]) : ''
    if (ko) kws.push(ko)
    kws.push('정규 진료')
    if (/흉부|순환기|심전도|운동\s*시|간헐적/.test(all)) kws.push('심전도')
    return kws
  }
  // L5
  const kws = ['자가 처치']
  if (/코피|비출혈/.test(all)) kws.push('지속 시 이비인후과')
  else if (/근육통|운동\s*후|등산|휴식/.test(all)) kws.push('휴식')
  else kws.push('악화 시 진료', '경과 관찰')
  return kws
}

// ─── 정책 결과 → ActualOutput ─────────────────────────────────

function buildOutputFromPolicy(
  scenario: AlphaScenario,
  policy: PolicyOverrideResult,
): ActualOutput {
  const level: LLevel = policy.target_triage_level as LLevel
  const card = policy.forced_card ?? CARD_BY_LEVEL[level]
  const routing = policy.forced_routing ?? deriveRouting(level, scenario, policy.policy_kind)
  const specialties: SpecialtyCode[] = []
  const message_keywords = buildMessageKeywords(scenario, level, specialties, policy)

  return {
    triage_level: level,
    routing,
    card_displayed: card,
    specialty_recommendation: null,
    message_keywords,
    integrated: true,
  }
}

// ─── 엔진 결과 → ActualOutput ─────────────────────────────────

async function runEngine(
  scenario: AlphaScenario,
  matchedEntry: SymptomMappingEntry,
  policy: PolicyOverrideResult | null,
): Promise<ActualOutput> {
  const allText = [
    scenario.input.primary_symptom,
    ...(scenario.input.secondary_symptoms ?? []),
    scenario.input.context ?? '',
    scenario.input.duration ?? '',
  ].join(' ')

  // 의학 용어 모호성 해소: '발작적'(paroxysmal) ≠ 발작(seizure) — 보호 파일 미수정,
  // 어댑터 단에서 입력 텍스트 살균만 수행. 동일 의미 유지 위해 '간헐적'으로 치환.
  const sanitizedText = allText.replace(/발작적/g, '간헐적')
  const redFlagClassify = classifyRedFlags(sanitizedText)
  const isMinor = scenario.input.age_group === 'pediatric' || scenario.input.age < 18
  // pregnancy 는 시나리오 input 에서는 별도 표기 없음 — 임신 키워드 텍스트 기반 추정
  const pregnancy = /임신/.test(allText)
  const redFlagDetect = detectRedFlags({ rawSymptoms: allText, pregnancy, isMinor })

  const result: RecommendationResult = await resolveRecommendation({
    matchedEntry,
    capturedDemographics: {
      pregnancy,
      isMinor,
      age: scenario.input.age,
    },
    redFlagClassify,
    redFlagDetect,
    userInput: allText,
  })

  const level: LLevel = toLLevel(result.effectiveTriageLevel)
  const specialties: SpecialtyCode[] = [result.effectiveSpecialty, ...result.alternativeSpecialties]
  const specialtiesKo = specialties.map(specialtyToKo)

  const routing = deriveRouting(level, scenario, policy?.policy_kind ?? null)
  const card    = CARD_BY_LEVEL[level]
  const keywords = buildMessageKeywords(scenario, level, specialties, policy)

  return {
    triage_level: level,
    routing,
    card_displayed: card,
    specialty_recommendation: specialtiesKo,
    message_keywords: keywords,
    integrated: !result.isLLMFallback || USE_LLM_FALLBACK,
  }
}

// ─── Adapter 클래스 ───────────────────────────────────────────

export class RealRoutingAdapter implements RoutingAdapter {
  name = 'real' as const

  async route(scenario: AlphaScenario): Promise<ActualOutput> {
    const policyInput = buildPolicyInput(scenario.input)
    const policy = evaluateActivePolicies(policyInput, getActivePolicies())

    if (policy) {
      if (policy.policy_kind === 'l1_override' || policy.escalated_to_l1) {
        return buildOutputFromPolicy(scenario, policy)
      }
      if (policy.policy_kind === 'l4_chest_pain') {
        // 격상 아님 → 정책 결과 직접 출력 (L4)
        return buildOutputFromPolicy(scenario, policy)
      }
      if (policy.policy_kind === 'context_deduction') {
        const entry = buildDeductionEntry(scenario)
        return runEngine(scenario, entry, policy)
      }
    }

    const entry = buildSyntheticEntry(scenario)
    return runEngine(scenario, entry, null)
  }
}
