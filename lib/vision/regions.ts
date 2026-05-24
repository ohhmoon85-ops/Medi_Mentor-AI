/**
 * D1-2 신체 부위 분류 + 진료과 매핑
 *
 * specialties.ts SpecialtyCode 정합 (DERM, OS, OPH, ENT, FM).
 * out_of_scope: 적용 범위 외 — Vision 분석 카드는 "추정 어렵다" 메시지만 표시.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { BodyRegion, AnalysisConfidence } from './types'

export interface RegionMeta {
  /** 한글 라벨 (UI 노출) */
  label: string
  /** 본 부위 분석 신뢰도 일반값 */
  confidence: AnalysisConfidence
  /** 추천 진료과. out_of_scope는 null. */
  specialty: SpecialtyCode | null
}

export const BODY_REGIONS: Record<BodyRegion, RegionMeta> = {
  skin:         { label: '피부',         confidence: 'high',   specialty: 'DERM' },
  trauma:       { label: '외상',         confidence: 'high',   specialty: 'OS' },
  eye:          { label: '눈·외관',      confidence: 'medium', specialty: 'OPH' },
  throat:       { label: '목·구강',      confidence: 'medium', specialty: 'ENT' },
  mass:         { label: '체표면 종괴',  confidence: 'medium', specialty: 'FM' },
  nail:         { label: '손발톱',       confidence: 'medium', specialty: 'DERM' },
  out_of_scope: { label: '적용 범위 외', confidence: 'low',    specialty: null },
}

/**
 * 키워드 기반 부위 분류 폴백 (LLM이 bodyRegion을 반환하지 못한 경우).
 * LLM 결과 우선, 본 함수는 보조용.
 */
export function classifyRegion(text: string): BodyRegion {
  const t = text.toLowerCase()
  if (/외상|상처|찰과|타박|골절|찢어|베인|화상/.test(text)) return 'trauma'
  if (/눈|안검|충혈|결막|눈꺼풀|다래끼/.test(text)) return 'eye'
  if (/목|편도|인후|구강|혀|입안/.test(text)) return 'throat'
  if (/혹|덩어리|혹\b|혹이|종괴|결절/.test(text)) return 'mass'
  if (/손톱|발톱|조갑/.test(text)) return 'nail'
  if (/피부|두드러기|발진|뾰루지|여드름|습진|점\b|점이/.test(text)) return 'skin'
  if (t.length === 0) return 'out_of_scope'
  return 'skin' // 기본값: 사진 + 증상 동반 시 다수가 피부 케이스
}
