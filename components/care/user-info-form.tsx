'use client'

/**
 * G3-8 사용자 정보 수집 폼 (chat 진입 전 1회)
 *
 * - 성별 / 나이 / 임신 / 지병 / 기타 자유 입력
 * - localStorage 키: medimentor_care_user_info_v1
 * - 저장 후 /chat 이동
 * - 건너뛰기 시 빈 객체 저장 + /chat 이동
 * - AGENDA-14 (영아 <1세) / AGENDA-16 (고령 여성 ACS) 정책 정확도 향상 목적
 * - PII 클라이언트 한정 (서버 전송은 chat fetch body에 일회성만)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const USER_INFO_STORAGE_KEY = 'medimentor_care_user_info_v1'

export type UserInfoSex = 'female' | 'male' | 'prefer_not_to_say'

export interface UserInfo {
  sex: UserInfoSex | null
  age: number | null
  pregnancy: boolean
  conditions: string[]
  custom: string
}

export const EMPTY_USER_INFO: UserInfo = {
  sex: null,
  age: null,
  pregnancy: false,
  conditions: [],
  custom: '',
}

const CONDITION_OPTIONS = ['당뇨', '고혈압', '심장질환', '천식', '없음'] as const

export function UserInfoForm() {
  const router = useRouter()
  const [sex, setSex] = useState<UserInfoSex | null>(null)
  const [ageInput, setAgeInput] = useState('')
  const [pregnancy, setPregnancy] = useState(false)
  const [conditions, setConditions] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  function toggleCondition(value: string) {
    setConditions((prev) => {
      if (value === '없음') {
        return prev.includes('없음') ? [] : ['없음']
      }
      const next = prev.filter((c) => c !== '없음')
      return next.includes(value) ? next.filter((c) => c !== value) : [...next, value]
    })
  }

  function save() {
    const ageNum = ageInput.trim() === '' ? null : Number(ageInput)
    const info: UserInfo = {
      sex,
      age: Number.isFinite(ageNum) ? ageNum : null,
      pregnancy: sex === 'female' && pregnancy,
      conditions,
      custom: custom.trim(),
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(info))
    }
    router.push('/chat')
  }

  function skip() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(EMPTY_USER_INFO))
    }
    router.push('/chat')
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-teal-700">내 정보 입력</h1>
        <p className="text-sm text-gray-600">
          더 정확한 안내를 위해 기본 정보를 입력해 주세요. 입력하지 않으셔도 서비스 이용은 가능합니다.
        </p>
      </header>

      {/* 성별 */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-800">성별</legend>
        <div className="flex gap-2 flex-wrap">
          {([
            { v: 'female',              label: '여성' },
            { v: 'male',                label: '남성' },
            { v: 'prefer_not_to_say',   label: '응답하지 않음' },
          ] as const).map((opt) => (
            <label
              key={opt.v}
              className={`flex-1 min-w-[100px] cursor-pointer rounded-xl border-2 px-3 py-2 text-sm text-center font-medium transition-colors ${
                sex === opt.v
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="sex"
                value={opt.v}
                checked={sex === opt.v}
                onChange={() => setSex(opt.v)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* 나이 */}
      <div className="space-y-2">
        <label htmlFor="age" className="block text-sm font-semibold text-gray-800">
          나이 (만 나이)
        </label>
        <input
          id="age"
          type="number"
          min={0}
          max={120}
          inputMode="numeric"
          value={ageInput}
          onChange={(e) => setAgeInput(e.target.value)}
          placeholder="예: 35"
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-teal-400"
        />
        <p className="text-xs text-gray-500">영아(만 1세 미만)는 0을 입력해 주세요.</p>
      </div>

      {/* 임신 (여성일 때만) */}
      {sex === 'female' && (
        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-rose-50 border-2 border-rose-200">
          <input
            type="checkbox"
            checked={pregnancy}
            onChange={(e) => setPregnancy(e.target.checked)}
            className="h-5 w-5 accent-rose-600"
          />
          <span className="text-sm font-medium text-rose-900">현재 임신 중입니다</span>
        </label>
      )}

      {/* 지병 */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-800">지병 (해당 항목 모두 선택)</legend>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CONDITION_OPTIONS.map((cond) => (
            <label
              key={cond}
              className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-sm text-center font-medium transition-colors ${
                conditions.includes(cond)
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={conditions.includes(cond)}
                onChange={() => toggleCondition(cond)}
                className="sr-only"
              />
              {cond}
            </label>
          ))}
        </div>
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="기타 지병 (선택, 1줄)"
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-teal-400"
        />
      </fieldset>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={skip}
          className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl py-3 hover:bg-gray-50 transition-colors"
        >
          건너뛰기
        </button>
        <button
          type="button"
          onClick={save}
          className="flex-[2] bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-2xl py-3 transition-colors"
        >
          확인하고 시작하기
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center leading-relaxed">
        입력 정보는 본인 기기에만 저장되며 서버에 영구 저장되지 않습니다.
        <br />
        푸터의 [내 정보 수정·삭제] 로 언제든지 변경할 수 있습니다.
      </p>
    </div>
  )
}
