/**
 * G4-1 답변 근거 표시 컴포넌트
 *
 * - 결론 메시지 (응급도 분류 완료 시점) 에만 마운트
 * - KTAS Level 인용 + 추가 출처 (선택)
 * - 면책 라인 영구 표시
 * - 디자인: 옅은 회색 박스 + 상단 구분선 (메인 답변과 시각 분리)
 *   2단계 G3-3~6 ui-tokens v2 정착 후 재정비 예정
 */

import { KTAS_CITATION } from '@/lib/medical-knowledge/ktas'

// G4-1 마이너 패치: KTAS 원문 정적 링크 — 보건복지부 고시(법령정보센터) + 학회 임상 적용 논문
const KTAS_LAW_URL = 'https://www.law.go.kr/'
const KTAS_JKSEM_URL = 'https://www.jksem.org/upload/pdf/jksem-28-6-547.pdf'

export interface AnswerSourceFooterProps {
  ktasLevel?: 1 | 2 | 3 | 4 | 5
  additionalSources?: { name: string; reference: string; url?: string }[]
}

function SourceLink({ href, label = '[원문 보기]' }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-teal-700 hover:text-teal-800 underline underline-offset-2 font-medium"
    >
      {label}
    </a>
  )
}

export function AnswerSourceFooter({ ktasLevel, additionalSources }: AnswerSourceFooterProps) {
  return (
    <div className="mt-3 border-t border-gray-200 pt-3 text-xs sm:text-[13px] leading-relaxed text-gray-600 bg-gray-50 rounded-b-2xl px-3 sm:px-4 py-3 space-y-2">
      <p className="font-semibold text-gray-700 flex items-center gap-1">
        📚 참고 근거
      </p>
      <ul className="space-y-1 list-disc list-inside marker:text-gray-400">
        {typeof ktasLevel === 'number' && (
          <>
            <li>
              응급도 분류: <span className="font-medium text-gray-800">KTAS Level {ktasLevel}</span>{' '}
              <span className="text-gray-500">({KTAS_CITATION})</span>{' '}
              <SourceLink href={KTAS_LAW_URL} />
            </li>
            <li>
              KTAS 임상 적용 논문 <span className="text-gray-500">(Lim et al., JKSEM 28-6-547, 2017)</span>{' '}
              <SourceLink href={KTAS_JKSEM_URL} />
            </li>
          </>
        )}
        {(additionalSources ?? []).map((s, i) => (
          <li key={`${s.name}-${i}`}>
            {s.name}: <span className="text-gray-500">{s.reference}</span>
            {s.url && <> <SourceLink href={s.url} /></>}
          </li>
        ))}
      </ul>
      <p className="text-amber-700 font-medium pt-1 border-t border-gray-100 mt-2">
        ⚠️ 본 안내는 의학적 진단이 아닙니다. 응급 시 즉시 119, 정확한 진단은 의료기관 방문이 필요합니다.
      </p>
    </div>
  )
}
