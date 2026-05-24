'use client'

/**
 * D2-5 2단계 — 부위별 증상 체크박스 (응급 신호 강조)
 */

import { symptomsByRegion, type RegionId } from '@/lib/checklist'

export interface SymptomCheckboxesProps {
  region: RegionId
  checkedIds: string[]
  onChange: (next: string[]) => void
}

export function SymptomCheckboxes({ region, checkedIds, onChange }: SymptomCheckboxesProps) {
  const symptoms = symptomsByRegion(region)
  const checkedSet = new Set(checkedIds)

  function toggle(id: string) {
    if (checkedSet.has(id)) onChange(checkedIds.filter((x) => x !== id))
    else onChange([...checkedIds, id])
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">해당되는 것을 모두 체크하세요 (복수 선택)</p>
      <ul className="space-y-1.5">
        {symptoms.map((s) => {
          const isChecked = checkedSet.has(s.id)
          const isUrgent = s.urgent
          return (
            <li key={s.id}>
              <label
                className={`flex items-start gap-2 rounded-xl border px-3 py-2 cursor-pointer transition-colors ${
                  isChecked
                    ? isUrgent
                      ? 'bg-red-50 border-red-300'
                      : 'bg-emerald-50 border-emerald-300'
                    : isUrgent
                      ? 'bg-white border-red-200 hover:bg-red-50/50'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(s.id)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600"
                />
                <span className={`text-sm ${isUrgent ? 'text-red-800 font-medium' : 'text-gray-800'}`}>
                  {isUrgent && <span aria-label="응급 신호" className="mr-1">⚠️</span>}
                  {s.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
