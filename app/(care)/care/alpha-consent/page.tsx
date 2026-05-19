/**
 * G1-5 알파 5명 동의 절차 페이지
 * 경로: /care/alpha-consent
 *
 * - 알파 코드 입력 + 동의 항목 4건 체크
 * - 서버 액션으로 코드 검증 + 동의 기록 저장
 * - 성공 시 /care/alpha-consent?success=1 리디렉션
 */

import { ConsentForm } from '@/components/care/consent/consent-form'

interface AlphaConsentPageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function AlphaConsentPage({ searchParams }: AlphaConsentPageProps) {
  const params = await searchParams
  const error   = params.error ?? null
  const success = params.success === '1'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-teal-700">
            🏥 medimentor Care 알파 참여
          </h1>
          <p className="text-sm text-gray-500">
            알파 테스트에 참여하기 전 아래 사항을 확인해 주세요.
          </p>
        </div>

        {/* 동의 폼 */}
        <ConsentForm error={error} success={success} />

        {/* 푸터 안내 */}
        {!success && (
          <p className="text-xs text-gray-400 text-center">
            알파 코드가 없으신 경우 운영자에게 문의하세요.
          </p>
        )}
      </div>
    </div>
  )
}
