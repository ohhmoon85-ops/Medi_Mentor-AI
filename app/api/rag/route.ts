import { NextRequest, NextResponse } from 'next/server'
import { embedText } from '@/lib/rag/embed'
import { retrieveEvidence } from '@/lib/rag/retrieve'
import { generateAnswer } from '@/lib/rag/generate'
import { applyMedicalLawFilter } from '@/lib/safety/medical-law-filter'
import { KOREAN_SPECIALTIES, isValidSpecialtyCode } from '@/lib/constants/specialties'

export async function POST(req: NextRequest) {
  try {
    const { query, persona, type, specialty } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: '쿼리를 입력해 주세요.' }, { status: 400 })
    }

    const validSpecialty = isValidSpecialtyCode(specialty) ? specialty : null

    const embedding = await embedText(query)
    const { chunks, confidence, has_korean_evidence } = await retrieveEvidence(embedding)

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: '근거 부족: 이 질문에 대한 충분한 의학 근거를 찾지 못했습니다.',
        citations: [],
        confidence: 0,
        has_korean_evidence: false,
        hallucination_flagged: false,
      })
    }

    // specialty가 있으면 의사용 기본 프롬프트에 진료과 컨텍스트 추가
    const specialtyContext = (persona === 'doctor' && validSpecialty)
      ? `\n[질의자 진료과 컨텍스트] ${KOREAN_SPECIALTIES[validSpecialty].ko}(${validSpecialty}) 전문의가 자신의 진료 영역에서 묻는 질문이다. 해당 진료과의 표준 진료 관행과 한국 임상 가이드라인을 우선 참조하라.\n`
      : ''

    const systemContext = specialtyContext || undefined

    const result = await generateAnswer({
      query,
      chunks,
      persona: persona ?? 'patient',
      systemContext,
    })

    // 환자용 출력은 의료법 필터 적용
    const answer = persona === 'patient'
      ? applyMedicalLawFilter(result.answer)
      : result.answer

    // 자가관리 가이드 구조화 (care/self-care용)
    if (type === 'self_care' && persona === 'patient') {
      const guide = {
        symptom: query,
        doNow: extractSection(answer, '지금 해도 좋은 것', '해야 할 것'),
        avoid: extractSection(answer, '하지 말아야', '피해야'),
        whenToVisit: extractSection(answer, '병원에 가야', '의사에게'),
        prepItems: extractSection(answer, '준비물', '챙겨야'),
      }
      return NextResponse.json({ guide, citations: result.citations.map((c) => c.chunk), confidence })
    }

    return NextResponse.json({
      answer,
      citations: result.citations.map((c) => c.chunk),
      confidence,
      has_korean_evidence,
      hallucination_flagged: result.hallucination_flagged,
    })
  } catch (err) {
    console.error('[rag] error:', err)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

function extractSection(text: string, ...keywords: string[]): string[] {
  const lines = text.split('\n')
  const results: string[] = []
  let inSection = false

  for (const line of lines) {
    if (keywords.some((kw) => line.includes(kw))) {
      inSection = true
      continue
    }
    if (inSection && line.trim().startsWith('-') || (inSection && line.trim().startsWith('•'))) {
      results.push(line.replace(/^[-•]\s*/, '').trim())
    } else if (inSection && line.trim() === '' && results.length > 0) {
      break
    }
  }

  return results.length > 0 ? results : ['관련 정보를 불러오는 중입니다.']
}
