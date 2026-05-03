'use client'

/**
 * C1 방문 전 준비하기 라우트 — /care/visit-prep
 *
 * 설계 원칙:
 * - M5 카드 3종 import만 (무변경: M5 보호 파일)
 * - M6 ui-tokens 활용 (CareCardTokens, getCareCardClasses, getCareTitleClasses)
 * - 1.6 정책: 위치 정보·영업시간·시각 판정 코드 일체 금지
 * - query string: specialty (26개 유효성 검증), seniorMode, triage
 * - specialty 미전달/유효하지 않음 → 체크리스트 대신 선택 안내 표시
 */

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { TriageLevel } from '@/lib/specialty/symptom-mapping-schema'
import { SymptomJournalCard }   from '@/components/care/symptom-journal-card'
import { MedicationListCard }   from '@/components/care/medication-list-card'
import { VisitChecklistCard }   from '@/components/care/visit-checklist-card'
import {
  getCareCardClasses,
  getCareTitleClasses,
  CareCardTokens,
} from '@/lib/care/ui-tokens'

// ─── 유효성 헬퍼 ─────────────────────────────────────────────────

const VALID_SPECIALTY_CODES = Object.keys(KOREAN_SPECIALTIES) as SpecialtyCode[]

const VALID_TRIAGE_LEVELS: TriageLevel[] = [
  'critical', 'urgent', 'night_weekend', 'outpatient', 'self_care',
]

function resolveSpecialty(raw: string | null): SpecialtyCode | null {
  if (!raw) return null
  return (VALID_SPECIALTY_CODES as string[]).includes(raw)
    ? (raw as SpecialtyCode)
    : null
}

function resolveTriage(raw: string | null): TriageLevel {
  if (!raw) return 'outpatient'
  return (VALID_TRIAGE_LEVELS as string[]).includes(raw)
    ? (raw as TriageLevel)
    : 'outpatient'
}

// ─── 메인 콘텐츠 (useSearchParams 분리 → Suspense 필요) ──────────

function VisitPrepContent() {
  const params = useSearchParams()

  const specialty  = resolveSpecialty(params.get('specialty'))
  const seniorMode = params.get('seniorMode') === 'true'
  const triage     = resolveTriage(params.get('triage'))

  const specialtyKo = specialty ? (KOREAN_SPECIALTIES[specialty]?.ko ?? specialty) : null

  return (
    <div className={CareCardTokens.spacing.sectionGap}>
      {/* ── 페이지 헤더 ─────────────────────────────────── */}
      <div className={`${getCareCardClasses(seniorMode)} border-teal-400`}>
        <div className={CareCardTokens.layout.cardHeader}>
          <h1 className={`${getCareTitleClasses(seniorMode)} text-teal-700`}>
            📋 방문 전 준비하기
          </h1>
          {specialtyKo && (
            <span className="text-xs font-semibold px-3 py-1 bg-teal-100 text-teal-700 border border-teal-300 rounded-full">
              {specialtyKo}
            </span>
          )}
        </div>
        <p className={`${CareCardTokens.typography.body} text-gray-600`}>
          진료를 앞두고 미리 준비해 두면 의사 선생님과 상담이 더 원활해집니다.
        </p>
      </div>

      {/* ── M5 카드 1: 증상 일기 (순서: Journal → Medication → Checklist) */}
      <SymptomJournalCard seniorMode={seniorMode} />

      {/* ── M5 카드 2: 복용약 목록 ────────────────────────── */}
      <MedicationListCard seniorMode={seniorMode} />

      {/* ── M5 카드 3: 방문 체크리스트 ──────────────────────
       * specialty 유효 시 → VisitChecklistCard (진료과별 자동 체크리스트)
       * specialty 미전달/유효하지 않음 → 진료과 선택 안내
       */}
      {specialty ? (
        <VisitChecklistCard
          specialty={specialty}
          triageLevel={triage}
          seniorMode={seniorMode}
        />
      ) : (
        <div className={`${getCareCardClasses(seniorMode)} border-indigo-400`}>
          <h2 className={`${getCareTitleClasses(seniorMode)} text-indigo-700`}>
            🗂️ 방문 준비 체크리스트
          </h2>
          <p className={`${CareCardTokens.typography.body} text-gray-600`}>
            진료과를 선택하면 맞춤 체크리스트가 표시됩니다.
          </p>
          <p className={CareCardTokens.typography.caption}>
            증상 분석 결과 페이지에서 진입하면 진료과가 자동으로 설정됩니다.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 페이지 진입점 (Suspense 경계) ───────────────────────────────

export default function VisitPrepPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-gray-500 text-center">
          불러오는 중...
        </div>
      }
    >
      <VisitPrepContent />
    </Suspense>
  )
}
