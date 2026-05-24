/**
 * D1-2 Vision 모듈 — public API
 *
 * 외부 import는 본 index 경유:
 *   import { ..., VisionAnalysisResult } from '@/lib/vision'
 */

export type {
  BodyRegion,
  AnalysisConfidence,
  VisionAnalysis,
  VisionAnalysisResult,
} from './types'

export { BODY_REGIONS, classifyRegion } from './regions'
export type { RegionMeta } from './regions'

export { validateOutput, softenOutput, VISION_DISCLAIMER } from './safety-rules'
export type { OutputValidation } from './safety-rules'

export { VISION_SYSTEM_PROMPT } from './prompt'
