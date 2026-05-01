import Anthropic from '@anthropic-ai/sdk'
import type { KnowledgeChunk } from '@/lib/db/schema'
import { hallucinationGuard } from '@/lib/safety/hallucination-guard'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GenerateOptions {
  query: string
  chunks: KnowledgeChunk[]
  persona: 'patient' | 'doctor'
  systemContext?: string
}

export interface GenerateResult {
  answer: string
  citations: { index: number; chunk: KnowledgeChunk }[]
  confidence: number
  hallucination_flagged: boolean
}

export async function generateAnswer(opts: GenerateOptions): Promise<GenerateResult> {
  const { query, chunks, persona, systemContext } = opts

  if (chunks.length === 0) {
    return {
      answer: '근거 부족: 이 질문에 답하기 위한 충분한 의학적 근거를 찾지 못했습니다.',
      citations: [],
      confidence: 0,
      hallucination_flagged: false,
    }
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.source_type.toUpperCase()}, ${c.publication_year ?? 'N/A'})\n제목: ${c.title ?? '제목 없음'}\n내용: ${c.content}`)
    .join('\n\n')

  const languageInstruction =
    persona === 'patient'
      ? '일상어로 쉽게 설명하라. 의학 용어가 필요하면 괄호 안에 쉬운 말로 병기하라.'
      : '의료 전문 용어와 ICD-10 코드를 사용하라. 한국 의료 환경(보험 급여, 식약처 허가)도 반드시 언급하라.'

  const systemPrompt = systemContext ?? `당신은 한국의 의료 정보 시스템입니다. 다음 규칙을 반드시 따르라:
1. 주어진 [근거] 자료에 있는 사실만 답하라. 근거에 없는 사실은 "근거 부족"이라 명시하라.
2. 모든 사실 주장에 [1], [2] 형태로 인용 번호를 붙여라.
3. ${languageInstruction}
4. 진단·처방·치료 결정을 단정짓지 마라.`

  const userPrompt = `[근거 자료]\n${context}\n\n[질문]\n${query}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const rawAnswer = message.content[0].type === 'text' ? message.content[0].text : ''

  const guardResult = await hallucinationGuard(rawAnswer, chunks)

  return {
    answer: guardResult.sanitizedAnswer,
    citations: chunks
      .map((chunk, index) => ({ index: index + 1, chunk }))
      .filter((_, i) => rawAnswer.includes(`[${i + 1}]`)),
    confidence: guardResult.confidence,
    hallucination_flagged: guardResult.flagged,
  }
}
