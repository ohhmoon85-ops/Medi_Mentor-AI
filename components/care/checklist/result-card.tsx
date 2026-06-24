'use client'

/**
 * D4 결과 화면 카드형 리디자인 (D3 PDF와 디자인 언어 통일)
 *
 * 정책 (presentation only):
 * - 트리아지 엔진·진료과 매칭·건기식 추천 로직 무변경
 * - 단정 표현 금지 (~입니다 / ~로 진단)
 * - 효능 단언 금지, 면책 화면 노출
 * - 이모지 금지 (lucide-react 아이콘만)
 * - L1·L2 = 빨강 배너 + 응급 행동 버튼 (PDF 대비 화면 전용 강점)
 * - 모바일 우선 반응형 (2열 카드 → 1열)
 *
 * 8블록 구조 (위→아래):
 * 1. 헤더 + 부제
 * 2. 응급도 배너
 * 3. 진료과·증상 카드 2열
 * 4. 알려진 가능성 리스트
 * 5. 권장/주의 2단
 * 6. 건기식 카드 (있을 때만)
 * 7. 액션 버튼 (PDF — D3 wire 보류)
 * 8. 응급 행동 버튼 (L1·L2만)
 */

import Link from 'next/link'
import {
  ShieldAlert,
  CircleAlert,
  Stethoscope,
  ListChecks,
  ThumbsUp,
  Ban,
  Pill,
  FileText,
  Download,
  Phone,
  MapPin,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react'
import type { ChecklistMatchResult } from '@/lib/checklist'
import { KOREAN_SPECIALTIES, type SpecialtyCode } from '@/lib/constants/specialties'
import { SupplementInfoCard } from '@/components/care/supplement-info-card'
import { DH_COLORS, DH_BANNER_BY_KTAS } from '@/lib/ui/tokens'

function specialtyLabel(code: SpecialtyCode | null): string {
  if (!code) return '가정의학과'
  return KOREAN_SPECIALTIES[code]?.ko ?? '가정의학과'
}

/** 부위·등급 무관 기본 권장/주의 항목 (효능 단언 금지 톤) */
const RECOMMENDED_ACTIONS = [
  '충분한 수분 섭취와 휴식을 권장합니다',
  '증상 변화를 시간대별로 메모해 두면 진료 시 도움이 됩니다',
  '권장 진료과 방문 시 현재까지의 증상·복용 약을 함께 전달',
]
const AVOID_ACTIONS = [
  '자가 약물 복용·용량 조절은 권장하지 않습니다',
  '증상이 갑자기 악화되거나 새로운 증상이 동반되면 즉시 응급실',
  '인터넷 검색만으로 자가 진단·자가 치료는 권장하지 않습니다',
]

export interface ResultCardProps {
  result: ChecklistMatchResult
  llmReply?: string
}

export function ResultCard({ result, llmReply }: ResultCardProps) {
  // 자살 충동 1393 — 별도 분기 (응급 행동 우선)
  if (result.suicide1393) {
    return (
      <div
        className="rounded-2xl p-5 sm:p-6 space-y-4"
        style={{
          background: '#FBE7E4',
          border: `2px solid ${DH_COLORS.red}`,
        }}
      >
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-7 w-7" strokeWidth={2} style={{ color: DH_COLORS.red }} aria-hidden="true" />
          <h2 className="text-xl font-bold" style={{ color: '#7A1F15' }}>
            지금 매우 힘드신 것 같습니다
          </h2>
        </div>
        <p style={{ color: '#7A1F15' }}>혼자 견디지 마세요. 즉시 도움을 받을 수 있습니다.</p>
        <div className="space-y-2">
          <a
            href="tel:1393"
            className="flex items-center justify-center gap-2 w-full text-white font-bold rounded-xl text-lg"
            style={{ background: DH_COLORS.red, minHeight: 56 }}
          >
            <Phone className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            1393 자살예방상담전화 (24시간)
          </a>
          <a
            href="tel:119"
            className="flex items-center justify-center gap-2 w-full text-white font-bold rounded-xl text-lg"
            style={{ background: '#7A1F15', minHeight: 56 }}
          >
            <Phone className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            119 응급실
          </a>
        </div>
        <p className="text-sm pt-3 border-t" style={{ borderColor: DH_COLORS.red, color: '#7A1F15' }}>
          가족·친구에게도 도움을 요청하세요. 당신은 혼자가 아닙니다.
        </p>
      </div>
    )
  }

  const banner = DH_BANNER_BY_KTAS[result.ktas]
  const isCritical = result.ktas === 1 || result.ktas === 2
  const specialty = specialtyLabel(result.primarySpecialty)
  const possibilities = result.combinationMatches.slice(0, 3)

  return (
    <div className="space-y-4">
      {/* 블록 1 — 헤더 */}
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: DH_COLORS.navy }}>
          증상 상담 결과 안내
        </h1>
        <p className="text-sm" style={{ color: DH_COLORS.blue }}>
          참고용이며 진단이 아닙니다
        </p>
      </header>

      {/* 블록 2 — 응급도 배너 */}
      <section
        className="rounded-xl p-4 sm:p-5 flex items-center gap-3"
        style={{
          background: banner.bg,
          border: `1px solid ${banner.border}`,
        }}
        aria-label="응급도 안내"
      >
        {isCritical ? (
          <ShieldAlert className="h-7 w-7 flex-shrink-0" strokeWidth={2} style={{ color: banner.border }} aria-hidden="true" />
        ) : (
          <CircleAlert className="h-7 w-7 flex-shrink-0" strokeWidth={2} style={{ color: banner.border }} aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg font-bold" style={{ color: banner.text }}>
            {banner.label}
          </p>
          {result.urgentMatch && (
            <p className="text-sm" style={{ color: banner.text }}>
              {result.urgentMatch.possible.length > 0
                ? `가능성 확인 권장: ${result.urgentMatch.possible.join(', ')}`
                : '응급 신호가 확인되었습니다'}
            </p>
          )}
        </div>
      </section>

      {/* 블록 3 — 진료과·증상 카드 (2열, 모바일 1열) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article
          className="rounded-xl p-4"
          style={{ background: '#FFFFFF', border: `1px solid ${DH_COLORS.sky}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-5 w-5" strokeWidth={2} style={{ color: DH_COLORS.blue }} aria-hidden="true" />
            <h3 className="text-sm font-semibold" style={{ color: DH_COLORS.navy }}>
              권장 진료과
            </h3>
          </div>
          <p className="text-base font-bold" style={{ color: DH_COLORS.navy }}>
            {specialty}
          </p>
          <p className="text-xs mt-1" style={{ color: DH_COLORS.blue }}>
            평점·순위 없이 일반 안내로 제공
          </p>
        </article>

        <article
          className="rounded-xl p-4"
          style={{ background: '#FFFFFF', border: `1px solid ${DH_COLORS.sky}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-5 w-5" strokeWidth={2} style={{ color: DH_COLORS.blue }} aria-hidden="true" />
            <h3 className="text-sm font-semibold" style={{ color: DH_COLORS.navy }}>
              주요 증상 요약
            </h3>
          </div>
          <p className="text-sm text-gray-700">{result.rationale}</p>
        </article>
      </section>

      {/* 블록 4 — 알려진 가능성 */}
      {possibilities.length > 0 && (
        <section
          className="rounded-xl p-4 sm:p-5"
          style={{ background: '#FFFFFF', border: `1px solid ${DH_COLORS.sky}` }}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: DH_COLORS.navy }}>
            <ListChecks className="h-5 w-5" strokeWidth={2} style={{ color: DH_COLORS.blue }} aria-hidden="true" />
            알려진 가능성
          </h3>
          <ol className="space-y-2 text-sm text-gray-800">
            {possibilities.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold" style={{ color: DH_COLORS.blue }}>{i + 1}.</span>
                <span>
                  <span className="font-medium">{p.name}</span> 가능성이 알려져 있습니다
                  <span className="text-gray-500"> ({specialtyLabel(p.specialty)})</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* LLM 자연어 응답 (선택) — 면책 라인 strip된 본문만 */}
      {llmReply && llmReply.trim().length > 0 && (
        <section
          className="rounded-xl p-4 text-sm italic"
          style={{
            background: '#F4F8FB',
            border: `1px solid ${DH_COLORS.sky}`,
            color: DH_COLORS.navy,
            lineHeight: 1.6,
          }}
        >
          {llmReply}
        </section>
      )}

      {/* 블록 5 — 권장 / 주의 2단 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <article
          className="rounded-xl p-4"
          style={{ background: '#DCEEDD', border: `1px solid ${DH_COLORS.green}` }}
        >
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#0F4D2A' }}>
            <ThumbsUp className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            이렇게 하세요
          </h3>
          <ul className="space-y-1 text-sm" style={{ color: '#0F4D2A' }}>
            {RECOMMENDED_ACTIONS.map((a, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="rounded-xl p-4"
          style={{ background: '#FBE7E4', border: `1px solid ${DH_COLORS.red}` }}
        >
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#7A1F15' }}>
            <Ban className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            피하세요
          </h3>
          <ul className="space-y-1 text-sm" style={{ color: '#7A1F15' }}>
            {AVOID_ACTIONS.map((a, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* 블록 6 — 건기식 카드 (있을 때만) */}
      {result.supplementKey && (
        <section
          className="rounded-xl p-4"
          style={{ background: '#FFFFFF', border: `1px solid ${DH_COLORS.sky}` }}
        >
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: DH_COLORS.navy }}>
            <Pill className="h-5 w-5" strokeWidth={2} style={{ color: DH_COLORS.blue }} aria-hidden="true" />
            관련 건강기능식품 안내
          </h3>
          <SupplementInfoCard symptomKey={result.supplementKey} />
        </section>
      )}

      {/* 면책 — 화면 노출 의무 */}
      <p
        className="text-[11px] sm:text-xs rounded-lg px-3 py-2 leading-relaxed"
        style={{
          background: '#FBF1D5',
          border: `1px solid ${DH_COLORS.amber}`,
          color: '#7A5B00',
        }}
      >
        본 안내는 추정이며 의학적 진단이 아닙니다. 자세한 진단은 의료기관 방문이 필요합니다.
        체크리스트 결과는 의료 상담을 대체할 수 없습니다.
      </p>

      {/* 블록 7 — 액션 버튼 (PDF, D3 wire 보류) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          aria-label="결과를 PDF로 보기 (준비 중)"
          className="flex items-center justify-center gap-2 rounded-xl text-sm font-semibold cursor-not-allowed opacity-60"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${DH_COLORS.blue}`,
            color: DH_COLORS.blue,
            minHeight: 44,
          }}
        >
          <FileText className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          결과를 PDF로 보기 (준비 중)
        </button>
        <button
          type="button"
          disabled
          aria-label="PDF 내려받기 (준비 중)"
          className="flex items-center justify-center gap-2 rounded-xl text-sm font-semibold cursor-not-allowed opacity-60"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${DH_COLORS.blue}`,
            color: DH_COLORS.blue,
            minHeight: 44,
          }}
        >
          <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          PDF 내려받기 (준비 중)
        </button>
      </section>

      {/* 블록 8 — 응급 행동 버튼 (L1·L2만, 화면 전용 강점) */}
      {isCritical && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="즉시 행동">
          <a
            href="tel:119"
            className="flex items-center justify-center gap-2 text-white font-bold rounded-xl text-base"
            style={{ background: DH_COLORS.red, minHeight: 56 }}
          >
            <Phone className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            지금 119
          </a>
          <a
            href="https://www.e-gen.or.kr/egen/emergency_room_search.do"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-white font-bold rounded-xl text-base"
            style={{ background: DH_COLORS.navy, minHeight: 56 }}
          >
            <MapPin className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
            응급실 찾기
          </a>
        </section>
      )}

      {/* 자세한 대화 상담 옵션 (응급 분기 제외) */}
      {!isCritical && (
        <Link
          href="/care/chat"
          className="flex items-center gap-3 rounded-xl p-4 transition-colors"
          style={{
            background: '#F4F8FB',
            border: `1px solid ${DH_COLORS.sky}`,
            minHeight: 60,
          }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: DH_COLORS.sky }}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={2} style={{ color: DH_COLORS.blue }} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: DH_COLORS.navy }}>
              자세한 대화 상담 (선택)
            </p>
            <p className="text-xs" style={{ color: DH_COLORS.blue }}>
              사진 첨부 + 자세한 증상 설명이 필요할 때
            </p>
          </div>
        </Link>
      )}
    </div>
  )
}
