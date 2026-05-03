'use client'

/**
 * M3-5 진료과 추천 카드 컴포넌트 (M3-5-γ 정책)
 *
 * 구조:
 * 1. 1차 추천 카드 — 진료과명(24px+) + 트리아지 배지 + 핵심 메시지
 * 2. 카카오맵/네이버지도 링크 — "지도에서 찾기"
 * 3. "더 보기" 버튼 — 2차/3차 대안 진료과 펼치기 (G-1 정책)
 * 4. critical 시 — "119 응급실로 즉시 가세요" 배너 + tel:119 a 태그 버튼 (자동 다이얼 금지, 8.3 정책)
 * 5. LLM fallback 시 — "🤖 AI가 추천한 결과" 배지 + 신뢰도 표시
 *
 * 노년층 친화 UI (E-1 정체성 정책):
 * - 본문 텍스트: text-base(16px) 이상
 * - 1차 진료과명: text-2xl(24px) 이상
 * - 최소 클릭 영역: min-h-[44px] (모바일 터치 44x44px)
 * - WCAG AA 색상 대비 충족
 *
 * 의존 관계:
 * - lib/specialty/recommendation-engine.ts (RecommendationResult)
 * - lib/specialty/external-map-link.ts (generateKakaoMapUrl, generateNaverMapUrl)
 * - lib/constants/specialties.ts (KOREAN_SPECIALTIES, SpecialtyCode)
 */

import { useState } from 'react'
import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { RecommendationResult } from '@/lib/specialty/recommendation-engine'
import { generateKakaoMapUrl, generateNaverMapUrl } from '@/lib/specialty/external-map-link'

// ─── 트리아지 등급별 설정 ─────────────────────────────────────────

const TRIAGE_CONFIG = {
  critical: {
    emoji: '🔴',
    label: '즉시 응급',
    bg: 'bg-red-50',
    border: 'border-red-500',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-600 text-white',
    mapBorder: 'border-red-400',
  },
  urgent: {
    emoji: '🟠',
    label: '응급',
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-500 text-white',
    mapBorder: 'border-orange-300',
  },
  night_weekend: {
    emoji: '🟡',
    label: '야간·주말',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    textColor: 'text-yellow-800',
    badgeBg: 'bg-yellow-500 text-white',
    mapBorder: 'border-yellow-300',
  },
  outpatient: {
    emoji: '🟢',
    label: '외래',
    bg: 'bg-green-50',
    border: 'border-green-400',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-600 text-white',
    mapBorder: 'border-green-300',
  },
  self_care: {
    emoji: '🔵',
    label: '자가관리',
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-600 text-white',
    mapBorder: 'border-blue-300',
  },
} as const

// ─── Props ────────────────────────────────────────────────────────

export interface SpecialtyRecommendationCardProps {
  recommendation: RecommendationResult
  /** 지도 링크 클릭 핸들러 (선택 — 분석/로깅용) */
  onMapClick?: (specialty: SpecialtyCode) => void
  /** 60+ 노년층 모드 (글씨 추가 확대) */
  seniorMode?: boolean
}

// ─── 내부 헬퍼 ───────────────────────────────────────────────────

function koName(code: SpecialtyCode): string {
  return KOREAN_SPECIALTIES[code]?.ko ?? code
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────

export function SpecialtyRecommendationCard({
  recommendation,
  onMapClick,
  seniorMode = false,
}: SpecialtyRecommendationCardProps) {
  const [showAlts, setShowAlts] = useState(false)

  const {
    effectiveSpecialty,
    effectiveTriageLevel,
    alternativeSpecialties,
    isEmergency,
    isLLMFallback,
    recommendation_reason,
    confidence,
  } = recommendation

  const cfg = TRIAGE_CONFIG[effectiveTriageLevel]
  const isCritical = effectiveTriageLevel === 'critical'
  const primaryKo = koName(effectiveSpecialty)
  const kakaoUrl = generateKakaoMapUrl(effectiveSpecialty, isEmergency)
  const naverUrl = generateNaverMapUrl(effectiveSpecialty, isEmergency)

  // 노년층 모드 글씨 확대
  const textBase = seniorMode ? 'text-xl' : 'text-base'
  const textLg   = seniorMode ? 'text-2xl' : 'text-lg'
  const textXl   = seniorMode ? 'text-3xl' : 'text-2xl'
  const pad      = seniorMode ? 'p-6' : 'p-5'

  const confidenceLabel =
    confidence === 'high' ? '높음' :
    confidence === 'medium' ? '보통' :
    confidence === 'low' ? '낮음' : null

  return (
    <div
      className={`${cfg.bg} border-2 ${cfg.border} rounded-2xl ${pad} space-y-4`}
      role="region"
      aria-label="진료과 추천 결과"
    >
      {/* ── Critical 응급 배너 ─────────────────────────────── */}
      {isCritical && (
        <div className="bg-red-600 text-white text-center font-bold text-lg py-3 rounded-xl">
          🚨 119 응급실로 즉시 가세요
        </div>
      )}

      {/* ── LLM fallback 배지 ─────────────────────────────── */}
      {isLLMFallback && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-2 py-0.5 font-medium">
            🤖 AI가 추천한 결과
          </span>
          {confidenceLabel && (
            <span className="text-xs text-gray-500">
              신뢰도: {confidenceLabel}
            </span>
          )}
        </div>
      )}

      {/* ── 1차 추천 카드 ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cfg.emoji}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>
            {cfg.label}
          </span>
        </div>
        {/* 진료과명: 24px 이상 (노년층 친화 필수) */}
        <h2 className={`${textXl} font-bold ${cfg.textColor} leading-snug`}>
          {primaryKo}
        </h2>
        {recommendation_reason && (
          <p className={`${textBase} text-gray-700 leading-relaxed`}>
            {recommendation_reason}
          </p>
        )}
      </div>

      {/* ── 카카오맵 / 네이버지도 링크 ──────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onMapClick?.(effectiveSpecialty)}
          className={`
            flex items-center gap-1 ${cfg.textColor} font-semibold hover:underline
            min-h-[44px] min-w-[44px] px-4 py-2
            border-2 ${cfg.mapBorder} rounded-xl bg-white
            transition-colors hover:bg-gray-50
            ${textBase}
          `}
        >
          🗺️ 지도에서 찾기
        </a>
        <a
          href={naverUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 hover:underline text-sm"
        >
          네이버 지도로 찾기
        </a>
      </div>

      {/* ── Critical: 119 직통 버튼 ───────────────────────────
       * 8.3 정책: tel:119 a 태그 href만 사용, onClick 핸들러 금지
       * 자동 다이얼 금지 — OS 표준 전화 인터페이스로 위임
       */}
      {isCritical && (
        <a
          href="tel:119"
          className={`
            flex items-center justify-center gap-2 w-full
            bg-red-600 text-white font-bold rounded-xl
            hover:bg-red-700 transition-colors
            ${textLg}
            ${seniorMode ? 'py-5 min-h-[64px]' : 'py-4 min-h-[56px]'}
          `}
        >
          📞 119 전화하기
        </a>
      )}

      {/* ── "더 보기" 버튼 ────────────────────────────────── */}
      {alternativeSpecialties.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAlts((v) => !v)}
          className={`
            w-full text-center ${cfg.textColor} font-semibold
            border-2 ${cfg.border} rounded-xl bg-white
            hover:bg-gray-50 transition-colors
            min-h-[44px] ${textBase}
            ${seniorMode ? 'py-4' : 'py-3'}
          `}
          aria-expanded={showAlts}
        >
          {showAlts
            ? '접기 ▲'
            : `더 보기 ▼ (${alternativeSpecialties.length}개 대안 진료과)`}
        </button>
      )}

      {/* ── 2차/3차 대안 진료과 펼치기 ───────────────────────── */}
      {showAlts && alternativeSpecialties.length > 0 && (
        <div className="space-y-3 pt-1" role="list" aria-label="대안 진료과 목록">
          <p className={`${textBase} font-semibold text-gray-600`}>
            이런 진료과도 방문하실 수 있습니다:
          </p>
          {alternativeSpecialties.map((code) => {
            const altKo    = koName(code)
            const altKakao = generateKakaoMapUrl(code, false)
            const altNaver = generateNaverMapUrl(code, false)
            return (
              <div
                key={code}
                className="bg-white border border-gray-200 rounded-xl p-4 space-y-2"
                role="listitem"
              >
                <p className={`${textLg} font-semibold text-gray-800`}>{altKo}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={altKakao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      flex items-center gap-1 text-gray-600 hover:underline
                      min-h-[44px] min-w-[44px] px-3 py-2
                      border border-gray-200 rounded-lg
                      ${textBase}
                    `}
                  >
                    🗺️ 지도에서 찾기
                  </a>
                  <a
                    href={altNaver}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 hover:underline text-xs"
                  >
                    네이버 지도
                  </a>
                </div>
              </div>
            )
          })}
          {/* G-1 안내자형 메시지 */}
          <p className={`text-xs text-gray-500 text-center pt-1`}>
            {primaryKo}를 우선 권합니다. 위 진료과도 고려하실 수 있습니다.
          </p>
        </div>
      )}

      {/* ── 면책 표시 ─────────────────────────────────────── */}
      <p className="text-xs text-gray-400 text-center pt-1">
        이는 의학적 진단이 아닙니다. AI 안내는 참고 용도로만 사용하세요.
      </p>
    </div>
  )
}
