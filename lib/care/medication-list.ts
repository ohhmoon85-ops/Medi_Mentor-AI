/**
 * M5-B 복용약 등록 — 데이터 레이어
 *
 * 사진 첨부 정책:
 * - MVP: mock URL / base64 임시 저장 (의사 참고용)
 * - OCR 운영은 Phase 2로 이관
 *   사유: (1) 의약품안전나라 API 연동 인프라 구축 비용,
 *         (2) OCR 정확도 검증 시간,
 *         (3) MVP 폐쇄 베타 일정 우선
 * - 사진 첨부 자체는 MVP에서 운영 (의사 참고용)
 *
 * LLM 호출 없음.
 */

import type { KinshipRelation } from '@/lib/specialty/family-demographics'

export type PatientRelation = 'self' | KinshipRelation

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024  // 5 MB
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/heic'] as const
export type AllowedPhotoType = (typeof ALLOWED_PHOTO_TYPES)[number]

export interface MedicationEntry {
  id: string
  added_at: string              // ISO 8601

  // 텍스트 입력 — 사용자 직접
  name: string                  // "타이레놀 500mg"
  dose: string                  // "1정"
  frequency: string             // "하루 3회"
  duration?: string             // "3일째"
  notes?: string

  // 사진 첨부 — 의사 참고용 (LLM OCR은 Phase 2)
  photo_url?: string            // mock URL 또는 base64

  // E-1 정체성 정책
  patient_relation?: PatientRelation
}

export interface MedicationFilter {
  patient_relation?: PatientRelation
}

// ─── Entry 생성 ───────────────────────────────────────────────

let _seq = 0

export function createMedicationEntry(
  input: Partial<MedicationEntry> & Pick<MedicationEntry, 'name' | 'dose' | 'frequency'>
): MedicationEntry {
  return {
    id: `med-${Date.now()}-${++_seq}`,
    added_at: new Date().toISOString(),
    name: input.name,
    dose: input.dose,
    frequency: input.frequency,
    ...(input.duration   !== undefined && { duration:         input.duration }),
    ...(input.notes      !== undefined && { notes:            input.notes }),
    ...(input.photo_url  !== undefined && { photo_url:        input.photo_url }),
    ...(input.patient_relation !== undefined && { patient_relation: input.patient_relation }),
  }
}

// ─── Entry 조회·필터 ──────────────────────────────────────────

export function listMedications(
  medications: MedicationEntry[],
  filters?: MedicationFilter
): MedicationEntry[] {
  let result = [...medications].sort(
    (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
  )

  if (filters?.patient_relation !== undefined) {
    result = result.filter((m) => m.patient_relation === filters.patient_relation)
  }

  return result
}

// ─── 사진 유효성 ──────────────────────────────────────────────

export function isValidPhotoType(type: string): type is AllowedPhotoType {
  return (ALLOWED_PHOTO_TYPES as readonly string[]).includes(type)
}

export function isValidPhotoSize(bytes: number): boolean {
  return bytes <= MAX_PHOTO_SIZE_BYTES
}

// ─── 의사 요약 카드 ───────────────────────────────────────────

/**
 * 진료 전 의사에게 보여줄 복용약 목록 요약문을 생성한다.
 * LLM 호출 없음.
 * 사진 첨부: "사진 N장 첨부됨" 표시만 (OCR Phase 2).
 */
export function getMedicationSummaryForDoctor(meds: MedicationEntry[]): string {
  if (meds.length === 0) return '등록된 복용약이 없습니다.'

  const lines: string[] = [
    `=== 복용약 목록 요약 (${meds.length}종) ===`,
    `생성 일시: ${new Date().toLocaleString('ko-KR')}`,
    '',
  ]

  meds.forEach((m, i) => {
    const relation =
      m.patient_relation && m.patient_relation !== 'self'
        ? ` (${m.patient_relation} 복용)`
        : ''
    const photoNote = m.photo_url ? ' [사진 첨부됨]' : ''

    lines.push(`${i + 1}. ${m.name}${relation}${photoNote}`)
    lines.push(`   용량: ${m.dose} / ${m.frequency}`)
    if (m.duration) lines.push(`   복용 기간: ${m.duration}`)
    if (m.notes)    lines.push(`   메모: ${m.notes}`)
  })

  const photoCount = meds.filter((m) => m.photo_url).length
  if (photoCount > 0) {
    lines.push('')
    lines.push(`※ 사진 ${photoCount}장 첨부됨 (약 봉투·처방전)`)
  }

  lines.push('')
  lines.push('[본 요약은 AI 안내 보조 도구로 생성되었으며 의학적 진단이 아닙니다.]')
  return lines.join('\n')
}
