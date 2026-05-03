'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'

const SPECIALTY_OPTIONS = Object.values(KOREAN_SPECIALTIES).map((s) => ({
  code: s.code as SpecialtyCode,
  ko: s.ko,
}))

export default function VerifyPage() {
  const router = useRouter()
  const [step, setStep] = useState<'license' | 'consent' | 'verifying'>('license')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [specialtyCode, setSpecialtyCode] = useState<SpecialtyCode | ''>('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [error, setError] = useState('')

  async function submitVerification() {
    if (!licenseNumber.trim()) {
      setError('면허번호를 입력해 주세요.')
      return
    }
    setStep('verifying')

    // Phase 4에서 실제 PASS 본인인증 연동 예정
    // 현재는 면허번호 형식 검증만 수행
    await new Promise((r) => setTimeout(r, 1500))

    // 임시: 숫자만으로 구성된 6자리 이상 면허번호 허용
    if (/^\d{6,}$/.test(licenseNumber.replace(/-/g, ''))) {
      sessionStorage.setItem('pro_verified', 'true')
      sessionStorage.setItem('pro_license', licenseNumber)
      sessionStorage.setItem('pro_specialty_code', specialtyCode)
      router.push('/pro/dashboard')
    } else {
      setError('면허번호 형식을 확인해 주세요. (예: 123456)')
      setStep('license')
    }
  }

  if (step === 'verifying') {
    return (
      <div className="max-w-md mx-auto pt-16 text-center space-y-4">
        <div className="text-5xl animate-pulse">⚕️</div>
        <h2 className="text-xl font-bold text-gray-800">인증 확인 중...</h2>
        <p className="text-gray-500 text-sm">잠시만 기다려 주세요.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto pt-8 space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">⚕️</div>
        <h2 className="text-2xl font-bold text-gray-800">의사 인증</h2>
        <p className="text-gray-500 text-sm mt-2">
          MediMentor Pro는 면허 인증된 의료인만 이용할 수 있습니다
        </p>
      </div>

      {step === 'license' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              의사 면허번호 <span className="text-red-500">*</span>
            </label>
            <input
              value={licenseNumber}
              onChange={(e) => {
                setLicenseNumber(e.target.value)
                setError('')
              }}
              placeholder="예: 123456"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">진료과</label>
            <select
              value={specialtyCode}
              onChange={(e) => setSpecialtyCode(e.target.value as SpecialtyCode | '')}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">선택 (선택사항)</option>
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.ko}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>
          )}

          <button
            onClick={() => setStep('consent')}
            disabled={!licenseNumber.trim()}
            className="w-full bg-[#003876] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-800 transition-colors"
          >
            다음 →
          </button>
        </div>
      )}

      {step === 'consent' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-800">이용 동의</h3>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
            <p><strong>1. 의사결정 보조 도구 성격</strong><br />
            본 도구는 임상 의사결정 보조 목적이며, 최종 진단·처방의 책임은 의료인 본인에게 있습니다.</p>
            <p><strong>2. 환자 노출 금지</strong><br />
            의사용 화면을 환자에게 직접 보여주지 않겠습니다.</p>
            <p><strong>3. 근거 기반 활용</strong><br />
            AI 출력물은 근거 자료와 함께 제시되며, 임상적 판단을 대체하지 않습니다.</p>
            <p><strong>4. 개인정보 처리</strong><br />
            입력한 증례 정보는 24시간 후 자동 삭제됩니다.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-[#003876]"
            />
            <span className="text-sm text-gray-700">
              위 내용을 모두 읽었으며 동의합니다. 본 도구는 의사결정 보조이며, 최종 결정 책임은 저에게 있습니다.
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('license')}
              className="flex-1 border border-gray-200 py-3 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              ← 이전
            </button>
            <button
              onClick={submitVerification}
              disabled={!consentChecked}
              className="flex-1 bg-[#003876] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-800"
            >
              인증하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
