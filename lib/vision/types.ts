/**
 * D1-2 Vision 분석 모듈 — 타입 정의
 *
 * 정책 (D1 §사전 결정 §5 톤 규약):
 * - "추정" only. "진단합니다·확실히·분명히·의심됩니다" 등 단언 어휘 금지.
 * - 모든 응답에 "본 안내는 추정이며 자세한 진단은 병원 방문이 필요합니다" 포함.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

/** 적용 범위 6개 영역 + 범위 외 (§사전 결정 §6) */
export type BodyRegion =
  | 'skin'         // 피부
  | 'trauma'       // 외상
  | 'eye'          // 눈·외관
  | 'throat'       // 목·구강
  | 'mass'         // 체표면 종괴
  | 'nail'         // 손발톱
  | 'out_of_scope' // 범위 외

export type AnalysisConfidence = 'low' | 'medium' | 'high'

/** 사진 한 장 단위 분석 결과 */
export interface VisionAnalysis {
  bodyRegion: BodyRegion
  observations: string[]      // "~ 패턴이 관찰됩니다" 톤
  unanalyzable: boolean       // true → 단독 단정 카드만 마운트
}

/** 사진 종합 결과 + 진료과 추천 + KTAS 보정 */
export interface VisionAnalysisResult {
  analyses: VisionAnalysis[]
  combinedEstimate: {
    bodyRegion: BodyRegion
    estimatedConditions: string[]   // 최대 3개, "추정 가능성" 톤
    confidence: AnalysisConfidence
    unanalyzable: boolean
    rationale: string
  }
  specialtyRecommendation: SpecialtyCode | null
  ktasAdjustment?: {
    level: 1 | 2 | 3 | 4 | 5
    reason: string
  }
  disclaimer: string[]             // 면책 6건 표시용
}
