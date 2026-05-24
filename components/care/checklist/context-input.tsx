'use client'

/**
 * D2-5 3단계 — 시간·강도·보호자·자유입력 컨텍스트 입력
 */

import type { ChecklistContext } from '@/lib/checklist'

const DURATION_OPTIONS: Array<{ id: ChecklistContext['duration']; label: string }> = [
  { id: 'just_now',  label: '방금' },
  { id: 'within_1h', label: '1시간 이내' },
  { id: 'today',     label: '오늘' },
  { id: 'days',      label: '며칠 전' },
  { id: 'week_plus', label: '일주일 이상' },
]

const INTENSITY_OPTIONS: Array<{ id: ChecklistContext['intensity']; label: string }> = [
  { id: 'mild',       label: '참을만' },
  { id: 'discomfort', label: '불편' },
  { id: 'severe',     label: '심함' },
  { id: 'extreme',    label: '극심' },
]

const COMPANION_OPTIONS: Array<{ id: ChecklistContext['companion']; label: string; emoji: string }> = [
  { id: 'self',   label: '본인',     emoji: '🙋' },
  { id: 'family', label: '가족',     emoji: '👨‍👩‍👧' },
  { id: 'child',  label: '어린이',   emoji: '🧒' },
  { id: 'elder',  label: '노인',     emoji: '👴' },
]

export interface ContextInputProps {
  value: ChecklistContext
  onChange: (next: ChecklistContext) => void
}

export function ContextInput({ value, onChange }: ContextInputProps) {
  return (
    <div className="space-y-4">
      {/* 보호자 토글 */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">누구의 증상인가요?</label>
        <div className="grid grid-cols-4 gap-2">
          {COMPANION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...value, companion: opt.id })}
              aria-pressed={value.companion === opt.id}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-2 transition-colors ${
                value.companion === opt.id
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className={`text-xs ${value.companion === opt.id ? 'text-emerald-800 font-semibold' : 'text-gray-700'}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 시간 */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">언제부터?</label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...value, duration: opt.id })}
              aria-pressed={value.duration === opt.id}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                value.duration === opt.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 강도 */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">얼마나 심한가요?</label>
        <div className="flex flex-wrap gap-2">
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...value, intensity: opt.id })}
              aria-pressed={value.intensity === opt.id}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                value.intensity === opt.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 자유 입력 */}
      <div>
        <label htmlFor="freeText" className="text-sm font-semibold text-gray-700 block mb-2">
          추가로 하고 싶은 말 (선택)
        </label>
        <textarea
          id="freeText"
          value={value.freeText ?? ''}
          onChange={(e) => onChange({ ...value, freeText: e.target.value })}
          placeholder="자세한 설명이 있다면 적어 주세요"
          rows={2}
          className="w-full resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
    </div>
  )
}
