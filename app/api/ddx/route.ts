import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { embedText } from '@/lib/rag/embed'
import { retrieveEvidence } from '@/lib/rag/retrieve'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import { isValidSpecialtyCode } from '@/lib/utils/pro-context'
import { CATEGORY_PATTERNS, PREGNANCY_PATTERN } from '@/lib/safety/red-flag-data'
import type { DDxRedFlagEntry } from '@/lib/types/medical'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DDX_SYSTEM_PROMPT = `당신은 한국의 선임 멘토 의사다. 후배 의사의 질문에 다음 원칙으로 답하라:
1. 답변은 항상 RAG로 검색된 근거 자료에만 기반한다. 근거가 없으면 "근거 부족"이라 명시한다.
2. 답변 대상 추천(라벨·면허·기도) 추천의 출처(라벨·명칭·연도)를 반드시 인용한다.
3. 한국어 임상 표준 용어 + ICD-10 코드를 병기한다.
4. 한국 의료 환경(보험 급여, 식약처 허가)과 글로벌 스탠다드가 다르면 둘 다 명시한다.
5. 마지막에 "이 환자에서 추가로 확인할 점 3가지"를 제안한다.

응답은 반드시 다음 JSON 형식으로만 출력하라:
{
  "case_summary": "...",
  "differentials": [
    {
      "rank": 1,
      "diagnosis_name": "...",
      "icd10": "...",
      "probability": 0.8,
      "evidence_strength": "strong|moderate|weak",
      "supporting_findings": ["..."],
      "rule_out_findings": ["..."],
      "next_steps": ["..."],
      "is_dont_miss": false,
      "citations": [{"type": "guideline", "name": "...", "url": "..."}]
    }
  ],
  "dont_miss": [
    {"name": "...", "why": "...", "rule_out_test": "..."}
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const { chief_complaint, age, sex, hpi, exam, labs, specialty } = await req.json()

    if (!chief_complaint?.trim()) {
      return NextResponse.json({ error: '주 증상을 입력해 주세요.' }, { status: 400 })
    }

    const validSpecialty = isValidSpecialtyCode(specialty) ? specialty : null

    const specialtyContext = validSpecialty
      ? `\n[질의자 진료과 컨텍스트] ${KOREAN_SPECIALTIES[validSpecialty].ko}(${validSpecialty}) 전문의가 자신의 진료 영역에서 묻는 질문이다. 해당 진료과의 표준 진료 관행과 한국 임상 가이드라인을 우선 참조하라.\n`
      : ''

    const systemPrompt = DDX_SYSTEM_PROMPT + specialtyContext

    const caseText = [
      `주 증상: ${chief_complaint}`,
      age ? `나이: ${age}세` : '',
      sex ? `성별: ${sex === 'M' ? '남성' : '여성'}` : '',
      hpi ? `현병력: ${hpi}` : '',
      exam ? `신체검진: ${exam}` : '',
      labs ? `검사결과: ${labs}` : '',
    ].filter(Boolean).join('\n')

    // RAG 검색
    const embedding = await embedText(chief_complaint)
    const { chunks } = await retrieveEvidence(embedding, 8)

    const context = chunks
      .map((c, i) => `[${i + 1}] ${c.title ?? ''}\n${c.content}`)
      .join('\n\n')

    const userPrompt = `[근거 자료]\n${context}\n\n[환자 정보]\n${caseText}\n\n위 환자의 감별진단 JSON을 생성하라.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 응답 파싱 오류' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    // ─── Red Flag 감지: CATEGORY_PATTERNS 전체 순회 (복수 매칭 허용) ───
    const symptomText = [chief_complaint, hpi].filter(Boolean).join(' ')
    const isPregnant = PREGNANCY_PATTERN.test(symptomText)

    const SEVERITY_ORDER: Record<DDxRedFlagEntry['severity'], number> = {
      critical: 3, urgent: 2, high: 1,
    }

    const rawRedFlags: DDxRedFlagEntry[] = []
    for (const { category, pattern, urgency } of CATEGORY_PATTERNS) {
      const match = symptomText.match(pattern)
      if (!match) continue

      // 임산부 복통: urgency를 immediate(critical)로 상향
      const effectiveUrgency = (isPregnant && category === '복통') ? 'immediate' : urgency

      rawRedFlags.push({
        category: category as DDxRedFlagEntry['category'],
        severity: effectiveUrgency === 'immediate' ? 'critical' : 'urgent',
        action: effectiveUrgency === 'immediate' ? 'CALL_119' : 'ER_VISIT',
        matched_pattern: pattern.source,
        matched_text: match[0],
        confidence: 1.0,
      })
    }

    // 중복 제거: 같은 카테고리가 복수 발생 시 highest severity 유지
    const seenCategories = new Set<string>()
    const dedupedFlags: DDxRedFlagEntry[] = []
    for (const entry of rawRedFlags.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity])) {
      if (!seenCategories.has(entry.category)) {
        seenCategories.add(entry.category)
        dedupedFlags.push(entry)
      }
    }

    // 최종 정렬: severity 내림차순, 동률 시 category 알파벳 순
    const redFlags = dedupedFlags.sort((a, b) => {
      const diff = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
      return diff !== 0 ? diff : a.category.localeCompare(b.category)
    })

    return NextResponse.json({ ...result, red_flags: redFlags })
  } catch (err) {
    console.error('[ddx] error:', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
