'use client'

/**
 * D2-6 체크리스트 페이지 — /care/check
 * 4단계 흐름: 대분류 → 증상 체크 → 시간·강도 → 결과
 *
 * UX 피드백 #2 (2026-05-24):
 * - 보호자(companion)는 user-info-form에서 수집 → 본 페이지에서 자동 채움
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegionGrid } from '@/components/care/checklist/region-grid'
import { SymptomCheckboxes } from '@/components/care/checklist/symptom-checkboxes'
import { ContextInput } from '@/components/care/checklist/context-input'
import { ResultCard } from '@/components/care/checklist/result-card'
import { USER_INFO_STORAGE_KEY, type UserInfo } from '@/components/care/user-info-form'
import type { RegionId, ChecklistContext, ChecklistMatchResult } from '@/lib/checklist'

type Step = 'region' | 'symptoms' | 'context' | 'result'

const DEFAULT_CONTEXT: ChecklistContext = {
  duration: 'today',
  intensity: 'discomfort',
  companion: 'self',
}

export default function CheckPage() {
  // UX 피드백 #2: user_info 미입력 시 /care/info 로 우선 진입 + companion 자동 설정
  const router = useRouter()
  const [step, setStep] = useState<Step>('region')
  const [region, setRegion] = useState<RegionId | undefined>()
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [context, setContext] = useState<ChecklistContext>(DEFAULT_CONTEXT)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChecklistMatchResult | null>(null)
  const [llmReply, setLlmReply] = useState<string | undefined>()
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(USER_INFO_STORAGE_KEY)
    if (!raw) {
      router.replace('/care/info')
      return
    }
    try {
      const info = JSON.parse(raw) as UserInfo
      if (info.companion) {
        setContext((prev) => ({ ...prev, companion: info.companion! }))
      }
    } catch {
      // JSON 파싱 실패 시 DEFAULT_CONTEXT.companion='self' 유지
    }
  }, [router])

  function reset() {
    setStep('region')
    setRegion(undefined)
    setCheckedIds([])
    setContext(DEFAULT_CONTEXT)
    setResult(null)
    setLlmReply(undefined)
    setError('')
  }

  async function submit() {
    if (!region || checkedIds.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, checkedSymptomIds: checkedIds, context }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        setError(e?.error ?? '처리에 실패했습니다.')
        return
      }
      const data = await res.json()
      setResult(data.matchResult)
      setLlmReply(data.llmReply)
      setStep('result')
    } catch {
      setError('네트워크 오류. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 진행 표시 */}
      {step !== 'result' && (
        <ol className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          {[
            { id: 'region', label: '1. 부위' },
            { id: 'symptoms', label: '2. 증상' },
            { id: 'context', label: '3. 상황' },
          ].map((s, i, arr) => (
            <li key={s.id} className="flex items-center flex-1">
              <span className={`font-medium ${step === s.id ? 'text-emerald-700' : 'text-gray-400'}`}>{s.label}</span>
              {i < arr.length - 1 && <span className="flex-1 mx-2 border-t border-gray-200" />}
            </li>
          ))}
        </ol>
      )}

      {step === 'region' && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">어느 부위가 불편하신가요?</h2>
          <RegionGrid selected={region} onSelect={(r) => { setRegion(r); setStep('symptoms') }} />
        </section>
      )}

      {step === 'symptoms' && region && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">해당되는 증상을 모두 체크해 주세요</h2>
          <SymptomCheckboxes region={region} checkedIds={checkedIds} onChange={setCheckedIds} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('region')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={() => setStep('context')}
              disabled={checkedIds.length === 0}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700"
            >
              다음 ({checkedIds.length}개 체크) →
            </button>
          </div>
        </section>
      )}

      {step === 'context' && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">상황을 알려 주세요</h2>
          <ContextInput value={context} onChange={setContext} />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('symptoms')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700"
            >
              {loading ? '분석 중...' : '결과 보기'}
            </button>
          </div>
        </section>
      )}

      {step === 'result' && result && (
        <section className="space-y-4">
          <ResultCard result={result} llmReply={llmReply} />
          <button
            type="button"
            onClick={reset}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50"
          >
            🔄 새로 체크하기
          </button>
        </section>
      )}
    </div>
  )
}
