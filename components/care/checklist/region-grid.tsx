'use client'

/**
 * D2-5 1단계 — 8개 대분류 카드 그리드
 */

import { REGION_LIST, type RegionId } from '@/lib/checklist'

export interface RegionGridProps {
  selected?: RegionId
  onSelect: (region: RegionId) => void
}

export function RegionGrid({ selected, onSelect }: RegionGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {REGION_LIST.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect(r.id)}
          aria-pressed={selected === r.id}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 sm:p-5 transition-all ${
            selected === r.id
              ? 'bg-emerald-50 border-emerald-500 shadow-md'
              : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <span className="text-3xl" aria-hidden="true">{r.emoji}</span>
          <span className={`text-sm sm:text-base font-semibold ${selected === r.id ? 'text-emerald-800' : 'text-gray-800'}`}>
            {r.label}
          </span>
        </button>
      ))}
    </div>
  )
}
