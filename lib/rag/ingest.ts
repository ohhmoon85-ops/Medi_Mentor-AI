import { getServiceClient } from '@/lib/db/supabase'
import { embedBatch } from './embed'
import type { KnowledgeChunk } from '@/lib/db/schema'

const CHUNK_SIZE = 800
const CHUNK_OVERLAP = 100

export function splitIntoChunks(text: string): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    chunks.push(text.slice(start, end))
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks
}

export interface IngestPayload {
  source_type: KnowledgeChunk['source_type']
  source_id?: string
  source_url?: string
  title?: string
  content: string
  language?: string
  publication_year?: number
  authority_score?: number
}

export async function ingestDocument(payload: IngestPayload): Promise<void> {
  const supabase = getServiceClient()
  const chunks = splitIntoChunks(payload.content)
  const embeddings = await embedBatch(chunks)

  const rows = chunks.map((chunk, i) => ({
    source_type: payload.source_type,
    source_id: payload.source_id,
    source_url: payload.source_url,
    title: payload.title,
    content: chunk,
    embedding: embeddings[i],
    language: payload.language ?? 'en',
    publication_year: payload.publication_year,
    authority_score: payload.authority_score ?? 0.5,
  }))

  const { error } = await supabase.from('knowledge_chunks').insert(rows)
  if (error) throw new Error(`Ingest failed: ${error.message}`)
}
