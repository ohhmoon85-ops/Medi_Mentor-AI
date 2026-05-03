'use client'

/**
 * M5-A 증상 일기 카드
 * M3-5-γ 디자인 언어 적용 (노년층 친화, min-h-[44px], text-base+)
 */

import { useState } from 'react'
import {
  createJournalEntry,
  listJournalEntries,
  getJournalSummaryForDoctor,
  type JournalEntry,
  type IntensityLevel,
  type PatientRelation,
} from '@/lib/care/symptom-journal'

const INTENSITY_LABELS = ['', '매우 약함', '약함', '보통', '심함', '매우 심함'] as const
const INTENSITY_COLORS = [
  '', 'text-blue-500', 'text-green-500', 'text-yellow-600', 'text-orange-500', 'text-red-500',
] as const

interface SymptomJournalCardProps {
  seniorMode?: boolean
  patientRelation?: PatientRelation
}

export function SymptomJournalCard({
  seniorMode = false,
  patientRelation = 'self',
}: SymptomJournalCardProps) {
  // 폼 상태
  const [coreSymptom, setCoreSymptom]     = useState('')
  const [intensity, setIntensity]         = useState<IntensityLevel>(3)
  const [onsetAt, setOnsetAt]             = useState('')
  const [aggInput, setAggInput]           = useState('')
  const [aggFactors, setAggFactors]       = useState<string[]>([])
  const [relInput, setRelInput]           = useState('')
  const [relFactors, setRelFactors]       = useState<string[]>([])
  const [notes, setNotes]                 = useState('')
  const [showForm, setShowForm]           = useState(false)

  // 목록 상태
  const [entries, setEntries]             = useState<JournalEntry[]>([])
  const [filterDays, setFilterDays]       = useState<7 | 30>(7)
  const [selectedId, setSelectedId]       = useState<string | null>(null)

  // 요약 카드 상태
  const [showSummary, setShowSummary]     = useState(false)
  const [summaryText, setSummaryText]     = useState('')
  const [copied, setCopied]               = useState(false)

  const textBase = seniorMode ? 'text-xl' : 'text-base'
  const textLg   = seniorMode ? 'text-2xl' : 'text-lg'
  const pad      = seniorMode ? 'p-6'      : 'p-4'

  // ── 태그 헬퍼 ──────────────────────────────────────────────

  function addTag(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    const t = value.trim()
    if (t && !list.includes(t)) setList([...list, t])
    setInput('')
  }

  function removeTag(tag: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((t) => t !== tag))
  }

  // ── 저장 ───────────────────────────────────────────────────

  function handleSave() {
    if (!coreSymptom.trim() || !onsetAt) return
    const entry = createJournalEntry({
      core_symptom:        coreSymptom.trim(),
      intensity,
      onset_at:            onsetAt,
      aggravating_factors: aggFactors,
      relieving_factors:   relFactors,
      notes:               notes.trim() || undefined,
      patient_relation:    patientRelation,
    })
    setEntries((prev) => [entry, ...prev])
    setCoreSymptom(''); setIntensity(3); setOnsetAt('')
    setAggFactors([]); setRelFactors([]); setNotes('')
    setAggInput(''); setRelInput('')
    setShowForm(false)
  }

  // ── 요약 카드 ──────────────────────────────────────────────

  function handleSummary() {
    const filtered = listJournalEntries(entries, { days: filterDays })
    setSummaryText(getJournalSummaryForDoctor(filtered))
    setShowSummary(true)
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* unavailable */ }
  }

  const filtered = listJournalEntries(entries, { days: filterDays })

  return (
    <div className={`bg-white border-2 border-teal-400 rounded-2xl ${pad} space-y-4`} role="region" aria-label="증상 일기">

      {/* ── 헤더 ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className={`${textLg} font-bold text-teal-700`}>📒 증상 일기</h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className={`bg-teal-600 text-white font-semibold rounded-xl min-h-[44px] px-4 py-2 hover:bg-teal-700 transition-colors ${textBase}`}
        >
          {showForm ? '접기 ▲' : '+ 새 기록'}
        </button>
      </div>

      {/* ── 작성 폼 ──────────────────────────── */}
      {showForm && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-4">

          {/* 핵심 증상 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              핵심 증상 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={coreSymptom}
              onChange={(e) => setCoreSymptom(e.target.value)}
              placeholder="예: 오른쪽 아랫배 통증"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-teal-400 outline-none ${textBase}`}
            />
          </div>

          {/* 강도 1~5 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-2 ${textBase}`}>
              증상 강도 <span className="text-gray-500 font-normal">({INTENSITY_LABELS[intensity]})</span>
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as IntensityLevel[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setIntensity(lv)}
                  className={`
                    flex-1 min-h-[44px] rounded-xl border-2 font-bold transition-colors ${textBase}
                    ${intensity === lv ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300 text-gray-600 hover:border-teal-300'}
                  `}
                >{lv}</button>
              ))}
            </div>
            <div className="flex justify-between text-gray-400 text-sm mt-1">
              <span>약함</span><span>심함</span>
            </div>
          </div>

          {/* 시작 시각 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              증상 시작 시각 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={onsetAt}
              onChange={(e) => setOnsetAt(e.target.value)}
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-teal-400 outline-none ${textBase}`}
            />
          </div>

          {/* 악화 요인 태그 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              악화 요인 <span className="text-gray-400 font-normal text-sm">(Enter로 추가)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aggInput}
                onChange={(e) => setAggInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(aggInput, aggFactors, setAggFactors, setAggInput) } }}
                placeholder="예: 움직일 때"
                className={`flex-1 border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-teal-400 outline-none ${textBase}`}
              />
              <button type="button" onClick={() => addTag(aggInput, aggFactors, setAggFactors, setAggInput)}
                className="min-h-[44px] px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-600">추가</button>
            </div>
            {aggFactors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {aggFactors.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag, aggFactors, setAggFactors)} className="font-bold hover:text-orange-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 완화 요인 태그 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              완화 요인 <span className="text-gray-400 font-normal text-sm">(Enter로 추가)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={relInput}
                onChange={(e) => setRelInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(relInput, relFactors, setRelFactors, setRelInput) } }}
                placeholder="예: 누우면 나아짐"
                className={`flex-1 border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-teal-400 outline-none ${textBase}`}
              />
              <button type="button" onClick={() => addTag(relInput, relFactors, setRelFactors, setRelInput)}
                className="min-h-[44px] px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-600">추가</button>
            </div>
            {relFactors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {relFactors.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag, relFactors, setRelFactors)} className="font-bold hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 자유 메모 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>자유 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="추가로 기록하고 싶은 내용을 자유롭게 적어주세요"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-teal-400 outline-none resize-none ${textBase}`}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!coreSymptom.trim() || !onsetAt}
            className={`
              w-full bg-teal-600 text-white font-bold rounded-xl
              min-h-[44px] ${seniorMode ? 'py-4' : 'py-3'}
              hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${textBase}
            `}
          >💾 저장</button>
        </div>
      )}

      {/* ── 기간 필터 ────────────────────────── */}
      <div className="flex gap-2">
        {([7, 30] as const).map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => setFilterDays(days)}
            className={`
              flex-1 min-h-[44px] rounded-xl border-2 font-semibold transition-colors ${textBase}
              ${filterDays === days ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-gray-300 text-gray-600 hover:border-teal-300'}
            `}
          >최근 {days}일</button>
        ))}
      </div>

      {/* ── 일기 목록 ────────────────────────── */}
      {filtered.length === 0 ? (
        <p className={`text-center text-gray-400 py-6 ${textBase}`}>기록된 증상 일기가 없습니다.</p>
      ) : (
        <div className="space-y-2" role="list" aria-label="증상 일기 목록">
          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
              className={`
                w-full text-left bg-gray-50 border-2 rounded-xl p-4 min-h-[44px]
                hover:border-teal-300 transition-colors
                ${selectedId === entry.id ? 'border-teal-400' : 'border-gray-200'}
              `}
              role="listitem"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`font-semibold text-gray-800 ${textBase}`}>{entry.core_symptom}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${INTENSITY_COLORS[entry.intensity]} ${textBase}`}>강도 {entry.intensity}/5</span>
                  <span className="text-gray-400 text-sm">{new Date(entry.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              {selectedId === entry.id && (
                <div className={`mt-3 space-y-1 text-gray-600 ${textBase}`}>
                  <p>• 시작: {new Date(entry.onset_at).toLocaleString('ko-KR')}</p>
                  {entry.aggravating_factors.length > 0 && <p>• 악화: {entry.aggravating_factors.join(', ')}</p>}
                  {entry.relieving_factors.length  > 0 && <p>• 완화: {entry.relieving_factors.join(', ')}</p>}
                  {entry.notes && <p>• 메모: {entry.notes}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── 의사 요약 카드 ───────────────────── */}
      <button
        type="button"
        onClick={handleSummary}
        className={`
          w-full border-2 border-teal-400 text-teal-700 font-bold rounded-xl
          min-h-[44px] ${seniorMode ? 'py-4' : 'py-3'}
          hover:bg-teal-50 transition-colors ${textBase}
        `}
      >📋 병원 가져갈 요약 카드</button>

      {showSummary && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 space-y-3">
          <pre className={`whitespace-pre-wrap text-gray-700 font-sans ${textBase}`}>{summaryText}</pre>
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl min-h-[44px] hover:bg-gray-300 transition-colors ${textBase}`}
          >{copied ? '✅ 복사됨!' : '📋 복사하기'}</button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">이는 의학적 진단이 아닙니다. AI 안내는 참고 용도로만 사용하세요.</p>
    </div>
  )
}
