/**
 * M3-3 카카오맵·네이버지도 외부 링크 생성
 *
 * 설계 원칙 (v4 §1.6):
 * - 위치 기반 병원 추천 알고리즘 미운영 — GPS/거리 계산 없음
 * - 환자가 직접 지도 앱을 열어 검색하도록 URL만 생성
 * - isEmergency=true 시 진료과 무관하게 "응급실" 키워드로 고정
 *
 * lib/connectors/kakao-map.ts (서버사이드 API 호출) 와 용도 다름:
 * 이 파일은 클라이언트 측 외부 링크 URL 생성 전용.
 */

import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'

// ─── 검색 키워드 오버라이드 ───────────────────────────────────────

const SPECIALTY_SEARCH_OVERRIDE: Partial<Record<SpecialtyCode, string>> = {
  EM: '응급실',
  GS: '외과',
  NS: '신경외과',
  CS: '흉부외과',
  PS: '성형외과',
  PAIN: '통증의학과',
  ANES: '마취통증의학과',
  RAD: '영상의학과',
  PATH: '병리과',
  LAB: '진단검사의학과',
  NM: '핵의학과',
  RO: '방사선종양학과',
  PM: '예방의학과',
}

function getSearchKeyword(code: SpecialtyCode, isEmergency: boolean): string {
  if (isEmergency) return '응급실'
  return SPECIALTY_SEARCH_OVERRIDE[code] ?? KOREAN_SPECIALTIES[code]?.ko ?? '병원'
}

// ─── 공개 API ─────────────────────────────────────────────────────

/**
 * 카카오맵 외부 검색 링크 생성
 * 위치 기반 알고리즘 미운영 — 검색어 기반 URL만 반환
 * @param code 진료과 코드
 * @param isEmergency true 시 '응급실' 키워드로 고정
 */
export function generateKakaoMapUrl(code: SpecialtyCode, isEmergency = false): string {
  const q = encodeURIComponent(getSearchKeyword(code, isEmergency))
  return `https://map.kakao.com/?q=${q}`
}

/**
 * 네이버 지도 외부 검색 링크 생성
 * 위치 기반 알고리즘 미운영 — 검색어 기반 URL만 반환
 * @param code 진료과 코드
 * @param isEmergency true 시 '응급실' 키워드로 고정
 */
export function generateNaverMapUrl(code: SpecialtyCode, isEmergency = false): string {
  const q = encodeURIComponent(getSearchKeyword(code, isEmergency))
  return `https://map.naver.com/v5/search/${q}`
}
