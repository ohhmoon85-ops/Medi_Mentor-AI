'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { AcuityBadge } from '@/components/ui/acuity-badge'
import type { AcuityLevel } from '@/lib/triage/mts-engine'
import { ACUITY_CONFIG } from '@/lib/triage/mts-engine'
import { FeedbackEntryButton } from '@/components/care/feedback/feedback-entry-button'
import { collectMetric, getAnonymousSessionHash } from '@/lib/care/metrics/metrics-collector'

function TriageResultContent() {
  const params = useSearchParams()
  const level = (parseInt(params.get('level') ?? '4') || 4) as AcuityLevel
  const department = params.get('dept') ?? '가정의학과'
  const config = ACUITY_CONFIG[level]

  // M3 placeholder: 라우팅 결과 발행 사실 1회 기록 (해석 B, v13 §3.2 D-3 정합).
  // visited_er/routing_appropriate 는 시스템 자가 평가 — 사후 follow-up 갱신은 별도 wire-in.
  useEffect(() => {
    collectMetric({
      metric_type:         'M3_emergency_routing',
      session_hash:        getAnonymousSessionHash(),
      triage_level:        `L${level}`,
      visited_er:          false,
      routing_appropriate: true,
    })
  }, [level])

  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <div className="text-6xl mb-3">{config.emoji}</div>
        <AcuityBadge level={level} className="text-base px-4 py-2" />
        <p className="text-gray-600 mt-3 text-base">{config.action}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800">추천 진료과</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-lg font-semibold text-[#003876]">{department}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/hospitals"
          className="bg-[#10B981] text-white rounded-2xl p-4 text-center font-semibold hover:bg-emerald-600 transition-colors"
        >
          🗺️ 근처 병원 찾기
        </Link>
        <Link
          href="/self-care"
          className="bg-white border-2 border-[#003876] text-[#003876] rounded-2xl p-4 text-center font-semibold hover:bg-blue-50 transition-colors"
        >
          🌿 자가관리 방법
        </Link>
      </div>

      <FeedbackEntryButton />

      <Link
        href="/"
        className="block text-center text-gray-400 text-sm hover:text-gray-600 pt-2"
      >
        ← 처음으로 돌아가기
      </Link>
    </div>
  )
}

export default function TriageResultPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">로딩 중...</div>}>
      <TriageResultContent />
    </Suspense>
  )
}
