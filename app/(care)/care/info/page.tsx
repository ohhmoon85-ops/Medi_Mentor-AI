/**
 * G3-8 사용자 정보 입력 페이지
 * 경로: /care/info
 *
 * - chat 진입 전 1회 demographics 수집
 * - 저장 후 /chat 자동 이동 (UserInfoForm 내부 router.push)
 * - 푸터 [내 정보 수정·삭제] 로 재진입 가능
 */

import { UserInfoForm } from '@/components/care/user-info-form'

export default function CareInfoPage() {
  return (
    <div className="flex items-center justify-center py-6 sm:py-10">
      <UserInfoForm />
    </div>
  )
}
