'use client'

import { useState, useMemo } from 'react'
import { getRandomClinicalCase } from '@/lib/constants/clinical-case-examples'
import { CitationModal } from '@/components/ui/citation-modal'
import { getProSpecialtyCode } from '@/lib/utils/pro-context'
import type { Citation } from '@/lib/db/schema'

interface DDxItem {
  rank: number
  diagnosis_name: string
  icd10?: string
  probability: number
  evidence_strength: 'strong' | 'moderate' | 'weak'
  supporting_findings: string[]
  rule_out_findings: string[]
  next_steps: string[]
  is_dont_miss: boolean
  citations: Citation[]
}

interface DDxResult {
  case_summary: string
  differentials: DDxItem[]
  dont_miss: { name: string; why: string; rule_out_test: string }[]
}

const EVIDENCE_COLORS = {
  strong: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  weak: 'bg-gray-100 text-gray-600',
}

export default function DDxPage() {
  const [form, setForm] = useState({
    chief_complaint: '',
    age: '',
    sex: '',
    hpi: '',
    exam: '',
    labs: '',
  })
  const [result, setResult] = useState<DDxResult | null>(null)
  const [loading, setLoading] = useState(false)
  const caseExample = useMemo(() => getRandomClinicalCase(), [])

  async function runDDx() {
    if (!form.chief_complaint.trim()) return
    setLoading(true)
    try {
      const specialty = getProSpecialtyCode()
      const res = await fetch('/api/ddx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, specialty }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">감별진단 (DDx)</h2>
        <p className="text-gray-500 text-sm mt-1">환자 정보를 입력하면 RAG 기반 감별진단 리스트를 생성합니다</p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">주 증상 *</label>
            <input
              value={form.chief_complaint}
              onChange={(e) => setForm((f) => ({ ...f, chief_complaint: e.target.value }))}
              placeholder={`예: ${caseExample.chief_complaint}`}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">나이</label>
            <input
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="45"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">성별</label>
            <select
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">HPI (현병력)</label>
          <textarea
            value={form.hpi}
            onChange={(e) => setForm((f) => ({ ...f, hpi: e.target.value }))}
            placeholder={caseExample.hpi}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">신체 검진 소견</label>
            <textarea
              value={form.exam}
              onChange={(e) => setForm((f) => ({ ...f, exam: e.target.value }))}
              placeholder={caseExample.physical_exam}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">검사 결과</label>
            <textarea
              value={form.labs}
              onChange={(e) => setForm((f) => ({ ...f, labs: e.target.value }))}
              placeholder={caseExample.lab_results}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <button
          onClick={runDDx}
          disabled={loading || !form.chief_complaint.trim()}
          className="w-full bg-[#003876] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-800 transition-colors"
        >
          {loading ? '분석 중... (RAG 검색 중)' : '🔍 감별진단 생성'}
        </button>
      </div>

      {/* 결과 */}
      {result && (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-600">
            <strong>증례 요약:</strong> {result.case_summary}
          </div>

          {/* Don't Miss 카드 */}
          {result.dont_miss.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="font-bold text-red-700 mb-3">🚩 절대 놓치면 안 되는 진단</h3>
              <div className="space-y-2">
                {result.dont_miss.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-red-100">
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">이유: {item.why}</div>
                    <div className="text-sm text-red-600 mt-1">
                      배제 검사: <strong>{item.rule_out_test}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 감별진단 리스트 */}
          <div className="space-y-3">
            {result.differentials.map((ddx) => (
              <div key={ddx.rank} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#003876] text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                      {ddx.rank}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-800">{ddx.diagnosis_name}</h3>
                      {ddx.icd10 && <span className="text-xs text-gray-400">ICD-10: {ddx.icd10}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EVIDENCE_COLORS[ddx.evidence_strength]}`}>
                      {ddx.evidence_strength === 'strong' ? '강한 근거' : ddx.evidence_strength === 'moderate' ? '중간 근거' : '약한 근거'}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {Math.round(ddx.probability * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">지지 소견</p>
                    <ul className="space-y-0.5 text-gray-700">
                      {ddx.supporting_findings.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">배제 소견</p>
                    <ul className="space-y-0.5 text-gray-500">
                      {ddx.rule_out_findings.map((f, i) => <li key={i}>• {f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">다음 단계</p>
                    <ul className="space-y-0.5 text-blue-700">
                      {ddx.next_steps.map((s, i) => <li key={i}>→ {s}</li>)}
                    </ul>
                  </div>
                </div>

                {ddx.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <CitationModal citations={ddx.citations}>
                      📚 근거: {ddx.citations.map((c) => c.name).join(', ')} →
                    </CitationModal>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
