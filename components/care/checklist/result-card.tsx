'use client'

/**
 * D2-6 4단계 — 결과 카드
 *
 * - 자살 충동 분기: 1393 (자살예방상담전화) 자동 표시 + 119
 * - 응급 트리거 매치: 즉시 KTAS L1~L2 + 권장 행동
 * - 조합 매칭: 최대 3건 잠정 진단 + KTAS + 진료과
 * - 매치 없음: 일반 안내 (FM)
 */

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import type { ChecklistMatchResult } from '@/lib/checklist'
import { KOREAN_SPECIALTIES, type SpecialtyCode } from '@/lib/constants/specialties'
import { SupplementInfoCard } from '@/components/care/supplement-info-card'

const ACTION_LABEL: Record<'CALL_119' | 'GO_ER' | 'NIGHT_CLINIC' | 'CONSULT', string> = {
  CALL_119: '지금 즉시 119 신고',
  GO_ER: '응급실 즉시 방문',
  NIGHT_CLINIC: '야간진료 또는 응급실',
  CONSULT: '의료기관 상담',
}

const KTAS_LABEL: Record<1 | 2 | 3 | 4 | 5, { color: string; label: string }> = {
  1: { color: 'bg-red-600 text-white',    label: 'L1 즉시 응급' },
  2: { color: 'bg-orange-500 text-white', label: 'L2 응급실' },
  3: { color: 'bg-amber-500 text-white',  label: 'L3 야간·주말' },
  4: { color: 'bg-emerald-500 text-white', label: 'L4 일반 외래' },
  5: { color: 'bg-blue-500 text-white',   label: 'L5 자가관리' },
}

function specialtyLabel(code: SpecialtyCode | null): string {
  if (!code) return '가정의학과'
  return KOREAN_SPECIALTIES[code]?.ko ?? '가정의학과'
}

export interface ResultCardProps {
  result: ChecklistMatchResult
  llmReply?: string
}

export function ResultCard({ result, llmReply }: ResultCardProps) {
  const ktas = KTAS_LABEL[result.ktas]
  const specialty = specialtyLabel(result.primarySpecialty)

  // 자살 충동 1393 분기 (최우선)
  if (result.suicide1393) {
    return (
      <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">💙</span>
          <h2 className="text-xl font-bold text-red-900">지금 매우 힘드신 것 같습니다</h2>
        </div>
        <p className="text-red-900">혼자 견디지 마세요. 즉시 도움을 받을 수 있습니다.</p>
        <div className="space-y-2">
          <a
            href="tel:1393"
            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-lg"
          >
            📞 1393 자살예방상담전화 (24시간)
          </a>
          <a
            href="tel:119"
            className="block w-full text-center bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl text-lg"
          >
            🚑 119 응급실
          </a>
        </div>
        <p className="text-sm text-red-800 pt-3 border-t border-red-300">
          가족·친구에게도 도움을 요청하세요. 당신은 혼자가 아닙니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 메인 결과 카드 */}
      <div className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${ktas.color}`}>
            {ktas.label}
          </span>
          <span className="text-sm font-medium text-gray-700">
            추천 진료과: <span className="text-emerald-700 font-semibold">{specialty}</span>
          </span>
        </div>

        {/* 응급 트리거 매치 */}
        {result.urgentMatch && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <p className="font-bold text-red-900">⚠️ 응급 신호 감지</p>
            <p className="text-sm text-red-800">
              추정 가능성: <span className="font-medium">{result.urgentMatch.possible.join(', ')}</span>
            </p>
            <a
              href={result.urgentMatch.action === 'CALL_119' ? 'tel:119' : '#'}
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl"
            >
              {result.urgentMatch.action === 'CALL_119' ? '📞 119 지금 신고' : '🚑 응급실 즉시 방문'}
            </a>
            <p className="text-xs text-red-700">{ACTION_LABEL[result.urgentMatch.action]}</p>
          </div>
        )}

        {/* 조합 매칭 결과 */}
        {result.combinationMatches.length > 0 && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-800">🎯 잠정 가능성</p>
            <ol className="space-y-1.5 list-decimal list-inside text-sm text-gray-700">
              {result.combinationMatches.map((m, i) => (
                <li key={i}>
                  <span className="font-medium text-gray-900">{m.name}</span>
                  <span className="text-gray-500"> — {specialtyLabel(m.specialty)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* LLM 자연어 응답 (선택) */}
        {llmReply && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-900 italic">
            {llmReply}
          </div>
        )}

        {/* rationale */}
        <p className="text-xs text-gray-500">{result.rationale}</p>

        {/* 면책 — UX 피드백 #4: 글자 축소 + 위 여백 추가 */}
        <p className="mt-4 text-[11px] sm:text-xs text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200 leading-relaxed">
          ⚠️ 본 안내는 추정이며 의학적 진단이 아닙니다. 자세한 진단은 의료기관 방문이 필요합니다.
          체크리스트 결과는 의료 상담을 대체할 수 없습니다.
        </p>
      </div>

      {/* 건강기능식품 카드 (G5-3 결합) — UX 피드백 #3: 명시적 섹션 표시 */}
      {result.supplementKey && (
        <SupplementInfoCard symptomKey={result.supplementKey} />
      )}

      {/* UX 피드백 #1·#3: 더 자세한 상담이 필요할 때 채팅으로 — 통합 흐름 */}
      <Link
        href="/care/chat"
        className="block bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-blue-700" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900 text-sm">자세한 대화 상담 (선택)</p>
            <p className="text-xs text-blue-700">사진 첨부 + 자세한 증상 설명이 필요할 때 →</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
