'use client'

/**
 * G1-3 N3 인앱 피드백 진입점 컴포넌트
 *
 * - 클릭 시 Tally 폼 URL을 새 탭으로 오픈
 * - 폼 A/B/C 분기: 첫 진입 이후 경과 일수 기준
 *   A: 즉시 (30일 미만)  → NEXT_PUBLIC_TALLY_FEEDBACK_URL_A
 *   B: 7일 이상          → NEXT_PUBLIC_TALLY_FEEDBACK_URL_B
 *   C: 30일 이상         → NEXT_PUBLIC_TALLY_FEEDBACK_URL_C
 * - 환경변수 미설정 시 버튼 비활성 (오류 throw 금지)
 * - 1.6/L-3: 아래 Date.now() 사용은 G1-3 UI 분기 판정용으로 인가됨
 */

import { useMemo } from 'react'
import {
  getCareTouchTarget,
  CareCardTokens,
} from '@/lib/care/ui-tokens'

// ─── 폼 분기 로직 ──────────────────────────────────────────────

type FeedbackForm = 'A' | 'B' | 'C'

const FORM_URL_ENV: Record<FeedbackForm, string> = {
  A: process.env.NEXT_PUBLIC_TALLY_FEEDBACK_URL_A ?? '',
  B: process.env.NEXT_PUBLIC_TALLY_FEEDBACK_URL_B ?? '',
  C: process.env.NEXT_PUBLIC_TALLY_FEEDBACK_URL_C ?? '',
}

const FIRST_ENTRY_KEY = 'care_first_entry_ts'

/**
 * G1-3 인가: Date.now() 사용 — 피드백 폼 A/B/C 분기 판정 전용
 * 1.6 실시간 시각 추적 금지 정책 예외 (UI 분기용 최소 사용).
 */
function selectForm(): { form: FeedbackForm; url: string } | null {
  if (typeof window === 'undefined') return null

  // 첫 진입일 기록 (로컬스토리지, G1-3 인가 시각 기록)
  const stored = localStorage.getItem(FIRST_ENTRY_KEY)
  const firstEntryTs = stored ? parseInt(stored, 10) : Date.now()
  if (!stored) localStorage.setItem(FIRST_ENTRY_KEY, String(firstEntryTs))

  const daysSinceFirst = (Date.now() - firstEntryTs) / (1000 * 60 * 60 * 24)

  let form: FeedbackForm
  if (daysSinceFirst >= 30) {
    form = 'C'
  } else if (daysSinceFirst >= 7) {
    form = 'B'
  } else {
    form = 'A'
  }

  const url = FORM_URL_ENV[form]
  return url ? { form, url } : null
}

// ─── Props ─────────────────────────────────────────────────────

interface FeedbackEntryButtonProps {
  seniorMode?: boolean
  /** 버튼 레이블 오버라이드 (기본: "피드백 남기기") */
  label?: string
  /** 추가 className */
  className?: string
}

// ─── 컴포넌트 ─────────────────────────────────────────────────

export function FeedbackEntryButton({
  seniorMode = false,
  label = '피드백 남기기',
  className = '',
}: FeedbackEntryButtonProps) {
  const formSelection = useMemo(() => selectForm(), [])

  if (!formSelection) return null

  const { url } = formSelection

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center justify-center gap-2 w-full
        border-2 border-purple-300 text-purple-700 font-semibold rounded-xl
        bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-colors
        ${getCareTouchTarget(seniorMode)}
        ${CareCardTokens.typography.body}
        ${seniorMode ? 'py-4 text-xl' : 'py-3'}
        ${className}
      `}
      aria-label="서비스 피드백 폼 열기"
    >
      💬 {label}
    </a>
  )
}
