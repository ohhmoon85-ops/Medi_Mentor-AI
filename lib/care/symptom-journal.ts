/**
 * M5-A 증상 일기 — 데이터 레이어
 * LLM 호출 없음. 순수 함수형 CRUD + 의사 요약 생성.
 */

import type { KinshipRelation } from '@/lib/specialty/family-demographics'

export type IntensityLevel = 1 | 2 | 3 | 4 | 5
export type PatientRelation = 'self' | KinshipRelation

export interface JournalEntry {
  id: string
  created_at: string           // ISO 8601
  core_symptom: string         // 핵심 증상 자유 텍스트
  intensity: IntensityLevel    // 1~5
  onset_at: string             // ISO 8601 (날짜+시각)
  aggravating_factors: string[]
  relieving_factors: string[]
  notes?: string
  patient_relation?: PatientRelation
}

export interface JournalFilter {
  days?: 7 | 30
  patient_relation?: PatientRelation
}

let _seq = 0

// ─── Entry 생성 ───────────────────────────────────────────────

export function createJournalEntry(
  input: Omit<JournalEntry, 'id' | 'created_at'>
): JournalEntry {
  return {
    id: `je-${Date.now()}-${++_seq}`,
    created_at: new Date().toISOString(),
    ...input,
  }
}

// ─── Entry 조회·필터 ──────────────────────────────────────────

export function listJournalEntries(
  entries: JournalEntry[],
  filter?: JournalFilter
): JournalEntry[] {
  let result = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (filter?.days !== undefined) {
    const cutoff = Date.now() - filter.days * 24 * 60 * 60 * 1000
    result = result.filter((e) => new Date(e.created_at).getTime() >= cutoff)
  }

  if (filter?.patient_relation !== undefined) {
    result = result.filter((e) => e.patient_relation === filter.patient_relation)
  }

  return result
}

export function getJournalEntry(
  entries: JournalEntry[],
  id: string
): JournalEntry | undefined {
  return entries.find((e) => e.id === id)
}

// ─── 의사 요약 카드 ───────────────────────────────────────────

const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  1: '매우 약함',
  2: '약함',
  3: '보통',
  4: '심함',
  5: '매우 심함',
}

/**
 * 진료 전 의사에게 보여줄 증상 일기 요약문을 생성한다.
 * LLM 호출 없음 — 순수 텍스트 조립.
 */
export function getJournalSummaryForDoctor(entries: JournalEntry[]): string {
  if (entries.length === 0) return '기록된 증상 일기가 없습니다.'

  const lines: string[] = [
    `=== 증상 일기 요약 (${entries.length}건) ===`,
    `생성 일시: ${new Date().toLocaleString('ko-KR')}`,
    '',
  ]

  entries.forEach((e, i) => {
    const onset = new Date(e.onset_at).toLocaleString('ko-KR')
    const created = new Date(e.created_at).toLocaleString('ko-KR')
    const relation =
      e.patient_relation && e.patient_relation !== 'self'
        ? ` (환자: ${e.patient_relation})`
        : ''

    lines.push(`[${i + 1}] ${e.core_symptom}${relation}`)
    lines.push(`  • 강도: ${e.intensity}/5 (${INTENSITY_LABELS[e.intensity]})`)
    lines.push(`  • 증상 시작: ${onset}`)
    lines.push(`  • 기록 시각: ${created}`)

    if (e.aggravating_factors.length > 0)
      lines.push(`  • 악화 요인: ${e.aggravating_factors.join(', ')}`)
    if (e.relieving_factors.length > 0)
      lines.push(`  • 완화 요인: ${e.relieving_factors.join(', ')}`)
    if (e.notes)
      lines.push(`  • 메모: ${e.notes}`)

    lines.push('')
  })

  lines.push('[본 요약은 AI 안내 보조 도구로 생성되었으며 의학적 진단이 아닙니다.]')
  return lines.join('\n')
}
