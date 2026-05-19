'use server'

/**
 * G1-5 알파 5명 동의 절차 — 서버 컴포넌트 + 서버 액션
 *
 * 동의 항목 (N4 v1 §5 베타 특약 알파용 축소판):
 *   (a) AI 안내가 진단/처방이 아님을 인지
 *   (b) 응급 판단 도구 아님을 인지 (P-2 (c) 면책)
 *   (c) 통계·운영 로그용 시각 기록 동의 (L-5)
 *   (d) 알파 단계 피드백 제공 의사
 *
 * 알파 코드: 환경변수 ALPHA_USER_CODES (콤마 구분 5건)
 * 동의 완료: Vercel Blob `consent/<alpha_code>.json` 저장 (G3-3 A안 마이그레이션)
 *   - 환경 변수: BLOB_READ_WRITE_TOKEN (Vercel 배포 시 자동 주입)
 *   - access: 'public' (Vercel Blob v2: private 미지원, addRandomSuffix=false 로 URL 추측 차단)
 *   - 스키마 1bit 보존: alpha_code + consented_at + session_hash + checks{a,b,c,d}
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { put } from '@vercel/blob'

// ─── 서버 액션 ─────────────────────────────────────────────────

export async function submitConsent(formData: FormData): Promise<void> {
  'use server'

  const alphaCode   = (formData.get('alpha_code') as string | null)?.trim() ?? ''
  const checkA      = formData.get('check_a') === 'on'
  const checkB      = formData.get('check_b') === 'on'
  const checkC      = formData.get('check_c') === 'on'
  const checkD      = formData.get('check_d') === 'on'
  const sessionHash = (formData.get('session_hash') as string | null) ?? ''

  // 코드 검증
  const validCodes = (process.env.ALPHA_USER_CODES ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  if (!validCodes.includes(alphaCode)) {
    redirect('/care/alpha-consent?error=invalid_code')
  }

  // 동의 항목 4건 전부 체크 필수
  if (!checkA || !checkB || !checkC || !checkD) {
    redirect('/care/alpha-consent?error=incomplete')
  }

  // Vercel Blob `consent/<alpha_code>.json` 저장 (스키마 G3-2 W-4 §5.2 보존)
  const consentRecord = {
    alpha_code:    alphaCode,
    consented_at:  new Date().toISOString(),
    session_hash:  sessionHash,
    checks: {
      a_not_diagnosis:     checkA,
      b_not_emergency_tool: checkB,
      c_log_consent:       checkC,
      d_feedback_willing:  checkD,
    },
  }

  try {
    await put(
      `consent/${alphaCode}.json`,
      JSON.stringify(consentRecord, null, 2),
      {
        access:           'public',
        addRandomSuffix:  false,
        contentType:      'application/json',
      },
    )
  } catch {
    // 로그 저장 실패는 동의 완료 흐름에 영향 주지 않음
  }

  redirect('/care/alpha-consent?success=1')
}

// ─── 컴포넌트 ─────────────────────────────────────────────────

interface ConsentFormProps {
  error?: string | null
  success?: boolean
}

export async function ConsentForm({ error, success }: ConsentFormProps) {
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-2xl font-bold text-teal-700">✅ 동의 완료</p>
        <p className="text-gray-600">
          알파 테스트에 참여해 주셔서 감사합니다.
          <br />
          진료 지원 서비스를 이용하실 수 있습니다.
        </p>
        <Link
          href="/chat"
          className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-2xl px-8 py-3 transition-colors"
        >
          진료 지원 서비스 시작하기 →
        </Link>
      </div>
    )
  }

  return (
    <form action={submitConsent} className="space-y-6">
      {error === 'invalid_code' && (
        <p className="text-red-600 font-semibold text-sm">
          알파 코드가 올바르지 않습니다. 사전 발급된 코드를 확인해 주세요.
        </p>
      )}
      {error === 'incomplete' && (
        <p className="text-red-600 font-semibold text-sm">
          동의 항목 4가지를 모두 체크해 주세요.
        </p>
      )}

      {/* 알파 코드 입력 */}
      <div className="space-y-2">
        <label htmlFor="alpha_code" className="block text-sm font-semibold text-gray-700">
          알파 참여 코드
        </label>
        <input
          id="alpha_code"
          name="alpha_code"
          type="text"
          required
          placeholder="예: ALPHA-MM-001"
          className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400"
          aria-describedby="alpha_code_hint"
        />
        <p id="alpha_code_hint" className="text-xs text-gray-400">
          사전에 발급받은 알파 코드를 입력하세요.
        </p>
      </div>

      {/* 동의 항목 */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700">동의 항목 (4가지 모두 필수)</legend>

        {[
          {
            name: 'check_a',
            label: '본 서비스의 AI 안내는 의학적 진단 또는 처방이 아님을 이해하였습니다.',
          },
          {
            name: 'check_b',
            label: '본 서비스는 응급 상황 판단 도구가 아니며, 응급 시 119에 즉시 연락해야 함을 이해하였습니다.',
          },
          {
            name: 'check_c',
            label: '서비스 개선을 위한 통계·운영 로그(익명 기록)가 수집됨에 동의합니다.',
          },
          {
            name: 'check_d',
            label: '알파 테스트 기간 중 서비스 피드백 제공에 적극 협조합니다.',
          },
        ].map(({ name, label }) => (
          <label key={name} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name={name}
              className="mt-1 w-5 h-5 accent-teal-600 cursor-pointer"
              required
            />
            <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
          </label>
        ))}
      </fieldset>

      {/* 숨김 세션 hash (client에서 주입 불가 — 빈값 허용) */}
      <input type="hidden" name="session_hash" value="" />

      <button
        type="submit"
        className="w-full bg-teal-600 text-white font-bold rounded-xl py-4 min-h-[56px] text-base hover:bg-teal-700 transition-colors"
      >
        동의하고 시작하기
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        본 동의는 알파 테스트 참여를 위한 것이며, 수집된 정보는 서비스 개선에만 사용됩니다.
        개인 식별 정보는 저장되지 않습니다.
      </p>
    </form>
  )
}
