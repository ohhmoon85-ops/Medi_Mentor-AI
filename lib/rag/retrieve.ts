import { getServiceClient } from '@/lib/db/supabase'
import type { KnowledgeChunk } from '@/lib/db/schema'

export interface RetrieveResult {
  chunks: KnowledgeChunk[]
  confidence: number
  has_korean_evidence: boolean
}

const SOURCE_WEIGHTS: Record<string, number> = {
  guideline: 1.5,
  cochrane: 1.3,
  nice: 1.3,
  pubmed: 1.0,
  hira: 1.2,
  mfds: 1.2,
}

const FIVE_YEAR_CUTOFF = new Date().getFullYear() - 5

export async function retrieveEvidence(
  embedding: number[],
  topK = 10
): Promise<RetrieveResult> {
  const supabase = getServiceClient()

  const { data, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: embedding,
    match_count: topK * 2,
  })

  if (error) throw new Error(`RAG retrieval failed: ${error.message}`)

  const chunks = (data as KnowledgeChunk[]).map((chunk) => {
    const baseWeight = SOURCE_WEIGHTS[chunk.source_type] ?? 1.0
    const ageWeight =
      chunk.publication_year && chunk.publication_year < FIVE_YEAR_CUTOFF
        ? 0.7
        : 1.0
    return { ...chunk, authority_score: chunk.authority_score * baseWeight * ageWeight }
  })

  chunks.sort((a, b) => b.authority_score - a.authority_score)
  const top = chunks.slice(0, topK)

  const authoritative = top.filter((c) => c.authority_score >= 0.6)
  const confidence = authoritative.length >= 3 ? Math.min(authoritative.length / topK, 1) : 0

  return {
    chunks: top,
    confidence,
    has_korean_evidence: top.some((c) => c.language === 'ko'),
  }
}
