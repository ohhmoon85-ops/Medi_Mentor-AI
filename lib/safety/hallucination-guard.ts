import Anthropic from '@anthropic-ai/sdk'
import type { KnowledgeChunk } from '@/lib/db/schema'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GuardResult {
  sanitizedAnswer: string
  confidence: number
  flagged: boolean
  flaggedSentences: string[]
}

// [n] 인용 번호가 실제 chunks 배열에 매핑되는지 검증
function verifyCitationMapping(answer: string, chunks: KnowledgeChunk[]): number[] {
  const cited = Array.from(answer.matchAll(/\[(\d+)\]/g)).map((m) => parseInt(m[1]))
  return cited.filter((n) => n < 1 || n > chunks.length)
}

// 약품명·용량·검사명이 chunks 텍스트에 등장하는지 확인
function checkMedicalTermsPresence(answer: string, chunks: KnowledgeChunk[]): string[] {
  const combinedContext = chunks.map((c) => c.content).join(' ').toLowerCase()
  const medicalPattern = /([가-힣a-zA-Z]+(?:mg|mcg|ml|정|캡슐|주사|검사|수술))/g
  const terms = Array.from(answer.matchAll(medicalPattern)).map((m) => m[1].toLowerCase())
  return terms.filter((term) => term.length > 2 && !combinedContext.includes(term))
}

export async function hallucinationGuard(
  answer: string,
  chunks: KnowledgeChunk[]
): Promise<GuardResult> {
  const invalidCitations = verifyCitationMapping(answer, chunks)
  const unsupportedTerms = checkMedicalTermsPresence(answer, chunks)

  let sanitizedAnswer = answer
  const flaggedSentences: string[] = []

  // 잘못된 인용 번호 처리
  if (invalidCitations.length > 0) {
    invalidCitations.forEach((n) => {
      sanitizedAnswer = sanitizedAnswer.replace(
        new RegExp(`\\[${n}\\]`, 'g'),
        '[근거 부족으로 삭제됨]'
      )
    })
    flaggedSentences.push(`잘못된 인용 번호: [${invalidCitations.join(', ')}]`)
  }

  // 근거 없는 의학 용어가 많으면 2nd-pass 검증
  if (unsupportedTerms.length > 2) {
    const verificationPrompt = `다음 답변에서 주어진 근거 자료에 없는 의학적 사실 주장 문장을 찾아라.
근거 자료: ${chunks.map((c) => c.content).join('\n').slice(0, 3000)}
답변: ${answer}
근거 없는 문장만 줄바꿈으로 구분하여 출력하라. 없으면 "없음"이라고만 하라.`

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: verificationPrompt }],
    })

    const verificationResult =
      msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''

    if (verificationResult !== '없음') {
      const unsupportedSentences = verificationResult.split('\n').filter(Boolean)
      flaggedSentences.push(...unsupportedSentences)
      unsupportedSentences.forEach((sentence: string) => {
        if (sanitizedAnswer.includes(sentence)) {
          sanitizedAnswer = sanitizedAnswer.replace(
            sentence,
            '[근거 부족으로 삭제됨]'
          )
        }
      })
    }
  }

  const confidence =
    flaggedSentences.length === 0 ? 0.9 : Math.max(0.3, 0.9 - flaggedSentences.length * 0.2)

  return {
    sanitizedAnswer,
    confidence,
    flagged: flaggedSentences.length > 0,
    flaggedSentences,
  }
}
