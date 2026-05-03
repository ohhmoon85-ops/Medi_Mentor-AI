'use client'

/**
 * M5-B 복용약 등록 카드
 * M3-5-γ 디자인 언어 적용 (노년층 친화, min-h-[44px], text-base+)
 *
 * OCR Phase 2 이관 사유:
 * (1) 의약품안전나라 API 연동 인프라 구축 비용
 * (2) OCR 정확도 검증 시간
 * (3) MVP 폐쇄 베타 일정 우선
 * 사진 첨부 자체는 MVP에서 운영 (의사 참고용)
 */

import { useState, useRef } from 'react'
import {
  createMedicationEntry,
  listMedications,
  getMedicationSummaryForDoctor,
  isValidPhotoType,
  isValidPhotoSize,
  MAX_PHOTO_SIZE_BYTES,
  type MedicationEntry,
  type PatientRelation,
} from '@/lib/care/medication-list'

interface MedicationListCardProps {
  seniorMode?: boolean
  patientRelation?: PatientRelation
}

export function MedicationListCard({
  seniorMode = false,
  patientRelation = 'self',
}: MedicationListCardProps) {
  // 폼 상태
  const [name, setName]           = useState('')
  const [dose, setDose]           = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration]   = useState('')
  const [notes, setNotes]         = useState('')
  const [photoUrl, setPhotoUrl]   = useState<string | undefined>()
  const [photoError, setPhotoError] = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // 목록 상태
  const [medications, setMedications] = useState<MedicationEntry[]>([])

  // 요약 카드 상태
  const [showSummary, setShowSummary] = useState(false)
  const [summaryText, setSummaryText] = useState('')
  const [copied, setCopied]           = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const textBase = seniorMode ? 'text-xl' : 'text-base'
  const textLg   = seniorMode ? 'text-2xl' : 'text-lg'
  const pad      = seniorMode ? 'p-6'      : 'p-4'

  // ── 폼 초기화 ──────────────────────────────────────────────

  function resetForm() {
    setName(''); setDose(''); setFrequency(''); setDuration('')
    setNotes(''); setPhotoUrl(undefined); setPhotoError(''); setEditingId(null)
  }

  // ── 사진 첨부 ──────────────────────────────────────────────

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')

    if (!isValidPhotoType(file.type)) {
      setPhotoError('JPG, PNG, HEIC 형식만 첨부 가능합니다.')
      return
    }
    if (!isValidPhotoSize(file.size)) {
      setPhotoError(`파일 크기가 ${MAX_PHOTO_SIZE_BYTES / 1024 / 1024}MB를 초과합니다.`)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── 저장·편집 ──────────────────────────────────────────────

  function handleSave() {
    if (!name.trim() || !dose.trim() || !frequency.trim()) return

    if (editingId) {
      setMedications((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                name:      name.trim(),
                dose:      dose.trim(),
                frequency: frequency.trim(),
                duration:  duration.trim() || undefined,
                notes:     notes.trim()    || undefined,
                photo_url: photoUrl,
              }
            : m
        )
      )
    } else {
      const entry = createMedicationEntry({
        name:             name.trim(),
        dose:             dose.trim(),
        frequency:        frequency.trim(),
        duration:         duration.trim()  || undefined,
        notes:            notes.trim()     || undefined,
        photo_url:        photoUrl,
        patient_relation: patientRelation,
      })
      setMedications((prev) => [entry, ...prev])
    }

    resetForm()
    setShowForm(false)
  }

  function handleEdit(med: MedicationEntry) {
    setName(med.name); setDose(med.dose); setFrequency(med.frequency)
    setDuration(med.duration ?? ''); setNotes(med.notes ?? '')
    setPhotoUrl(med.photo_url); setEditingId(med.id)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id))
  }

  // ── 요약 카드 ──────────────────────────────────────────────

  function handleSummary() {
    setSummaryText(getMedicationSummaryForDoctor(listMedications(medications)))
    setShowSummary(true)
  }

  async function handleCopy() {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* unavailable */ }
  }

  const listed = listMedications(medications)

  return (
    <div className={`bg-white border-2 border-purple-400 rounded-2xl ${pad} space-y-4`} role="region" aria-label="복용약 목록">

      {/* ── 헤더 ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className={`${textLg} font-bold text-purple-700`}>💊 복용약 목록</h2>
        <button
          type="button"
          onClick={() => { resetForm(); setShowForm((v) => !v) }}
          className={`bg-purple-600 text-white font-semibold rounded-xl min-h-[44px] px-4 py-2 hover:bg-purple-700 transition-colors ${textBase}`}
        >{showForm ? '접기 ▲' : '+ 약 추가'}</button>
      </div>

      {/* ── 약 추가·편집 폼 ──────────────────── */}
      {showForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-4">

          {/* 약 이름 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              약 이름 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="예: 타이레놀 500mg"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-purple-400 outline-none ${textBase}`} />
          </div>

          {/* 용량 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              용량 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={dose} onChange={(e) => setDose(e.target.value)}
              placeholder="예: 1정"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-purple-400 outline-none ${textBase}`} />
          </div>

          {/* 복용 횟수 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              복용 횟수 <span className="text-red-500">*</span>
            </label>
            <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)}
              placeholder="예: 하루 3회"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-purple-400 outline-none ${textBase}`} />
          </div>

          {/* 기간 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>복용 기간 (선택)</label>
            <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
              placeholder="예: 3일째"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-purple-400 outline-none ${textBase}`} />
          </div>

          {/* 메모 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>메모 (선택)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={2} placeholder="추가 메모"
              className={`w-full border-2 border-gray-300 rounded-xl px-3 py-2 focus:border-purple-400 outline-none resize-none ${textBase}`} />
          </div>

          {/* 사진 첨부 */}
          <div>
            <label className={`block font-semibold text-gray-700 mb-1 ${textBase}`}>
              사진 첨부 <span className="text-gray-400 font-normal text-sm">(약 봉투·처방전, 의사 참고용)</span>
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-purple-300 text-purple-700 font-semibold rounded-xl min-h-[44px] px-4 py-2 hover:bg-purple-50 transition-colors ${textBase}`}>
                📷 사진 선택
              </button>
              {photoUrl && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="첨부 사진" className="h-12 w-12 object-cover rounded-lg border" />
                  <button type="button" onClick={() => setPhotoUrl(undefined)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file"
              accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic"
              onChange={handlePhotoChange} className="hidden" />
            {photoError && <p className="text-red-500 text-sm mt-1">{photoError}</p>}
            <p className="text-xs text-gray-400 mt-1">
              OCR(자동 인식)은 Phase 2에서 지원 예정입니다. 현재는 텍스트 직접 입력 후 사진 보강 용도로 활용하세요.
            </p>
          </div>

          <button type="button" onClick={handleSave}
            disabled={!name.trim() || !dose.trim() || !frequency.trim()}
            className={`
              w-full bg-purple-600 text-white font-bold rounded-xl
              min-h-[44px] ${seniorMode ? 'py-4' : 'py-3'}
              hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${textBase}
            `}>
            💾 {editingId ? '수정 완료' : '저장'}
          </button>
        </div>
      )}

      {/* ── 복용약 목록 ─────────────────────── */}
      {listed.length === 0 ? (
        <p className={`text-center text-gray-400 py-6 ${textBase}`}>등록된 복용약이 없습니다.</p>
      ) : (
        <div className="space-y-2" role="list" aria-label="복용약 목록">
          {listed.map((med) => (
            <div key={med.id} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-2" role="listitem">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-gray-800 ${textBase}`}>{med.name}</span>
                    {med.photo_url && (
                      <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">📷 사진</span>
                    )}
                  </div>
                  <p className={`text-gray-600 ${textBase}`}>{med.dose} · {med.frequency}</p>
                  {med.duration && <p className="text-gray-500 text-sm">복용 기간: {med.duration}</p>}
                  {med.notes    && <p className="text-gray-500 text-sm">메모: {med.notes}</p>}
                </div>
                {med.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={med.photo_url} alt="약 사진" className="h-16 w-16 object-cover rounded-lg border flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(med)}
                  className={`flex-1 min-h-[44px] border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors ${textBase}`}>
                  편집
                </button>
                <button type="button" onClick={() => handleDelete(med.id)}
                  className={`flex-1 min-h-[44px] border-2 border-red-200 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors ${textBase}`}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 의사 요약 카드 ──────────────────── */}
      <button type="button" onClick={handleSummary}
        className={`
          w-full border-2 border-purple-400 text-purple-700 font-bold rounded-xl
          min-h-[44px] ${seniorMode ? 'py-4' : 'py-3'}
          hover:bg-purple-50 transition-colors ${textBase}
        `}>
        📋 병원 가져갈 복용약 목록
      </button>

      {showSummary && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 space-y-3">
          <pre className={`whitespace-pre-wrap text-gray-700 font-sans ${textBase}`}>{summaryText}</pre>
          <button type="button" onClick={handleCopy}
            className={`w-full bg-gray-200 text-gray-700 font-semibold rounded-xl min-h-[44px] hover:bg-gray-300 transition-colors ${textBase}`}>
            {copied ? '✅ 복사됨!' : '📋 복사하기'}
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">이는 의학적 진단이 아닙니다. AI 안내는 참고 용도로만 사용하세요.</p>
    </div>
  )
}
