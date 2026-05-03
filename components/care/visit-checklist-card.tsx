'use client'

/**
 * M5-C 진료 준비물 체크리스트 카드
 * M3-5-γ 디자인 언어 적용 (노년층 친화, min-h-[44px], text-base+)
 */

import { useState } from 'react'
import {
  generateDefaultChecklist,
  addCustomItem,
  toggleChecklistItem,
  type ChecklistItem,
} from '@/lib/care/visit-checklist'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { TriageLevel } from '@/lib/specialty/symptom-mapping-schema'

interface VisitChecklistCardProps {
  specialty: SpecialtyCode
  triageLevel: TriageLevel
  seniorMode?: boolean
}

const CATEGORY_LABELS: Record<ChecklistItem['category'], string> = {
  document:    '📄 서류',
  fasting:     '🍽️ 금식',
  preparation: '🗂️ 준비물',
  custom:      '✏️ 추가 항목',
}

const CATEGORY_ORDER: ChecklistItem['category'][] = [
  'document', 'fasting', 'preparation', 'custom',
]

export function VisitChecklistCard({
  specialty,
  triageLevel,
  seniorMode = false,
}: VisitChecklistCardProps) {
  const [items, setItems]           = useState<ChecklistItem[]>(() =>
    generateDefaultChecklist(specialty, triageLevel)
  )
  const [customInput, setCustomInput] = useState('')

  const textBase    = seniorMode ? 'text-xl'  : 'text-base'
  const textLg      = seniorMode ? 'text-2xl' : 'text-lg'
  const pad         = seniorMode ? 'p-6'      : 'p-4'
  const specialtyKo = KOREAN_SPECIALTIES[specialty]?.ko ?? specialty

  const checkedCount = items.filter((i) => i.is_checked).length
  const totalCount   = items.length
  const pct          = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  function handleToggle(id: string) {
    setItems((prev) => toggleChecklistItem(prev, id))
  }

  function handleAddCustom() {
    const trimmed = customInput.trim()
    if (!trimmed) return
    setItems((prev) => [...prev, addCustomItem(trimmed)])
    setCustomInput('')
  }

  function handleDeleteCustom(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  // 카테고리별 그룹화
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div
      className={`bg-white border-2 border-indigo-400 rounded-2xl ${pad} space-y-4`}
      role="region"
      aria-label="진료 준비물 체크리스트"
    >
      {/* ── 헤더 ─────────────────────────────── */}
      <div className="space-y-1">
        <h2 className={`${textLg} font-bold text-indigo-700`}>✅ 진료 준비물 체크리스트</h2>
        <p className={`${textBase} text-gray-600`}>{specialtyKo} 방문 기준</p>
      </div>

      {/* ── 진행률 ───────────────────────────── */}
      <div className="bg-indigo-50 rounded-xl p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className={`font-semibold text-indigo-700 ${textBase}`}>
            {checkedCount}/{totalCount} 준비 완료
          </span>
          <span className="text-gray-500 text-sm">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ── 체크리스트 ───────────────────────── */}
      <div className="space-y-4" role="list">
        {CATEGORY_ORDER.map((cat) => {
          const catItems = grouped[cat]
          if (!catItems || catItems.length === 0) return null
          return (
            <div key={cat}>
              <p className="font-semibold text-gray-500 text-sm mb-2">{CATEGORY_LABELS[cat]}</p>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 min-h-[44px]"
                    role="listitem"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      role="checkbox"
                      aria-checked={item.is_checked}
                      className={`
                        flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center
                        transition-colors font-bold text-sm
                        ${item.is_checked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 bg-white'}
                      `}
                    >{item.is_checked ? '✓' : ''}</button>

                    <span className={`flex-1 ${textBase} ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.text}
                    </span>

                    {!item.is_default && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(item.id)}
                        aria-label="항목 삭제"
                        className="text-red-400 hover:text-red-600 font-bold text-lg flex-shrink-0"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 항목 직접 추가 ───────────────────── */}
      <div className="space-y-2">
        <label className={`block font-semibold text-gray-700 ${textBase}`}>✏️ 항목 직접 추가</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() } }}
            placeholder="추가할 준비물 입력"
            className={`flex-1 border-2 border-gray-300 rounded-xl px-3 py-2 min-h-[44px] focus:border-indigo-400 outline-none ${textBase}`}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className={`min-h-[44px] px-4 bg-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 transition-colors ${textBase}`}
          >추가</button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        진료과별 자동 생성 준비물입니다. 실제 준비물은 병원 예약 시 안내를 따르세요.
      </p>
    </div>
  )
}
