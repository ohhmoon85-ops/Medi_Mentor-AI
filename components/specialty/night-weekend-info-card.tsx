'use client'

/**
 * M4-D 야간·주말 진료 안내 카드
 *
 * - M6 ui-tokens (getCareCardClasses, getCareTitleClasses) 사용
 * - 지도 링크: kakao / naver a-tag href만 — onClick 자동 호출 없음 (8.3 정책)
 * - 실시간 데이터·GPS 없음 (1.6 정책)
 * - G-1 안내자형 표현: 특정 병원·위치 지정 없음
 * - E-1: min-h-[44px], seniorMode 지원
 */

import {
  getCareCardClasses,
  getCareTitleClasses,
  getCareTouchTarget,
  CareCardTokens,
} from '@/lib/care/ui-tokens'
import type { NightWeekendEligibilityEntry } from '@/lib/specialty/night-weekend-mapping'
import { buildNightWeekendMessage } from '@/lib/specialty/night-weekend-message'

// ─── 지도 URL 헬퍼 ────────────────────────────────────────────────

function kakaoNightUrl(keyword: string): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(keyword)}`
}

function naverNightUrl(keyword: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(keyword)}`
}

function buildMapKeyword(isMinor: boolean, specialtyKo: string): string {
  return isMinor ? '달빛어린이병원' : `야간진료 ${specialtyKo}`
}

// ─── 진료과 한국어 레이블 ─────────────────────────────────────────

const SPECIALTY_KO: Record<string, string> = {
  ENT:  '이비인후과',
  OPH:  '안과',
  IM:   '내과',
  OS:   '정형외과',
  URO:  '비뇨의학과',
  PED:  '소아청소년과',
  FM:   '가정의학과',
  NEU:  '신경과',
  DERM: '피부과',
  GS:   '외과',
  EM:   '응급의학과',
}

function resolveSpecialtyKo(code: string, override?: string): string {
  return override ?? SPECIALTY_KO[code] ?? code
}

// ─── Props ────────────────────────────────────────────────────────

interface NightWeekendInfoCardProps {
  entry: NightWeekendEligibilityEntry
  /** 환자 만 나이 — 18 미만 시 달빛어린이병원 경로 */
  ageYears?: number
  /** 진료과 한국어 이름 오버라이드 */
  specialtyKo?: string
  seniorMode?: boolean
}

// ─── 컴포넌트 ────────────────────────────────────────────────────

export function NightWeekendInfoCard({
  entry,
  ageYears,
  specialtyKo,
  seniorMode = false,
}: NightWeekendInfoCardProps) {
  const isMinor = typeof ageYears === 'number' && ageYears < 18
  const label   = resolveSpecialtyKo(entry.primary_specialty, specialtyKo)

  const message = buildNightWeekendMessage({ entry, ageYears, specialtyKo: label })

  const mapKeyword   = buildMapKeyword(isMinor, label)
  const kakaoUrl     = kakaoNightUrl(mapKeyword)
  const naverUrl     = naverNightUrl(mapKeyword)
  const erKakaoUrl   = kakaoNightUrl('응급실')
  const erNaverUrl   = naverNightUrl('응급실')

  const titleCls     = getCareTitleClasses(seniorMode)
  const touchTarget  = getCareTouchTarget(seniorMode)
  const textBase     = seniorMode ? 'text-xl' : CareCardTokens.typography.body
  const textSm       = seniorMode ? 'text-lg' : CareCardTokens.typography.caption

  const facilityLabel = isMinor ? '달빛어린이병원' : '야간 진료 클리닉'
  const facilityBadgeCls = isMinor
    ? 'bg-blue-100 text-blue-700 border border-blue-300'
    : 'bg-teal-100 text-teal-700 border border-teal-300'

  return (
    <div className={`${getCareCardClasses(seniorMode)} border-teal-400`}>
      {/* 헤더 */}
      <div className={CareCardTokens.layout.cardHeader}>
        <h2 className={`${titleCls} text-teal-700 flex items-center gap-2`}>
          🌙 야간·주말 진료 안내
        </h2>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${facilityBadgeCls}`}>
          {facilityLabel}
        </span>
      </div>

      {/* 안내 메시지 */}
      <p className={`${textBase} text-gray-800 whitespace-pre-line`}>
        {/* 마크다운 **볼드** 를 단순 텍스트로 표시 — 렌더러 미사용 */}
        {message.replace(/\*\*(.*?)\*\*/g, '$1')}
      </p>

      {/* 정책 안내 */}
      <p className={`${textSm} text-gray-400`}>
        실제 운영 여부는 방문 전 직접 확인해 주세요.
        위치·영업시간 정보는 제공되지 않습니다.
      </p>

      {/* 지도 검색 링크 */}
      <div className="flex flex-col gap-2">
        <p className={`${textSm} text-gray-500 font-medium`}>가까운 곳 검색하기</p>
        <div className="flex gap-2 flex-wrap">
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 px-4 text-sm font-semibold rounded-xl border-2 border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 transition-colors ${touchTarget}`}
          >
            🗺️ 카카오맵
          </a>
          <a
            href={naverUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 px-4 text-sm font-semibold rounded-xl border-2 border-green-400 bg-green-50 text-green-800 hover:bg-green-100 transition-colors ${touchTarget}`}
          >
            🗺️ 네이버지도
          </a>
        </div>
      </div>

      {/* 응급실 링크 (urgent + er_eligible) */}
      {entry.er_eligible && (
        <div className="flex flex-col gap-2">
          <p className={`${textSm} text-red-500 font-medium`}>증상 악화 시 응급실 검색</p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={erKakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1 px-4 text-sm font-semibold rounded-xl border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors ${touchTarget}`}
            >
              🚨 응급실 (카카오맵)
            </a>
            <a
              href={erNaverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1 px-4 text-sm font-semibold rounded-xl border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors ${touchTarget}`}
            >
              🚨 응급실 (네이버지도)
            </a>
          </div>
        </div>
      )}

      {/* 면책 */}
      <p className={CareCardTokens.colors.disclaimer}>
        본 안내는 참고용이며 실제 진료 결정은 의료진과 상담하세요.
      </p>
    </div>
  )
}
