/**
 * G3-8 사용자 정보 입력 페이지
 * 경로: /care/info
 *
 * - chat 진입 전 1회 demographics 수집
 * - 저장 후 /chat 자동 이동 (UserInfoForm 내부 router.push)
 * - 푸터 [내 정보 수정·삭제] 로 재진입 가능
 * - D1-7: 하단에 사진 분석 개인정보 처리 정책 섹션 (chat 진입 전 자연 노출)
 */

import { UserInfoForm } from '@/components/care/user-info-form'

export default function CareInfoPage() {
  return (
    <div className="flex flex-col items-center py-6 sm:py-10 space-y-6">
      <UserInfoForm />

      {/* D1-7 사진 분석 개인정보 처리 정책 */}
      <section className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-2xl px-4 sm:px-5 py-4 text-sm text-blue-900 space-y-3">
        <h2 className="font-bold flex items-center gap-2">
          📷 사진 분석 개인정보 처리
        </h2>
        <p className="text-blue-800">
          닥터홈의 사진 분석 기능은 다음 정책을 준수합니다:
        </p>
        <ol className="space-y-1.5 list-decimal list-inside marker:text-blue-500 text-blue-900">
          <li>
            <span className="font-semibold">서버 미저장</span> — 첨부한 사진은 서버 또는 데이터베이스에 저장되지 않습니다.
          </li>
          <li>
            <span className="font-semibold">즉시 제거</span> — 분석을 위해 AI(Anthropic Claude)에 전송된 후 즉시 메모리에서 제거됩니다.
          </li>
          <li>
            <span className="font-semibold">재접근 불가</span> — 한 번 분석된 사진은 다시 접근할 수 없습니다.
          </li>
          <li>
            <span className="font-semibold">로그 미기록</span> — 사진 데이터는 어떠한 로그에도 기록되지 않습니다.
          </li>
          <li>
            <span className="font-semibold">분석 결과만 표시</span> — 사진 자체는 다음 채팅 turn에 표시되지 않습니다 (텍스트 결과만 노출).
          </li>
        </ol>
        <p className="text-xs text-blue-700 pt-2 border-t border-blue-200">
          ※ 단, 사용자가 채팅창에 사진을 첨부한 상태에서 본인이 직접 화면을 캡처하거나 저장하는 것은 사용자 책임입니다.
        </p>
      </section>
    </div>
  )
}
