/**
 * D2-1 8개 대분류 메타 + 매핑 진료과
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { RegionId } from './types'

export interface RegionMeta {
  id: RegionId
  label: string
  emoji: string
  /** 주요 매핑 진료과 (UI 보조 표시) */
  primarySpecialty: SpecialtyCode
  /** D1 Vision 사진 첨부 권장 여부 */
  visionRecommended: boolean
}

export const REGIONS: Record<RegionId, RegionMeta> = {
  HEAD_FACE:  { id: 'HEAD_FACE',  label: '머리·얼굴',     emoji: '🧠', primarySpecialty: 'NEU',   visionRecommended: false },
  NECK_CHEST: { id: 'NECK_CHEST', label: '목·가슴',       emoji: '🫁', primarySpecialty: 'IM',    visionRecommended: false },
  ABDOMEN:    { id: 'ABDOMEN',    label: '배·소화',       emoji: '🍽️', primarySpecialty: 'IM',    visionRecommended: false },
  LIMBS:      { id: 'LIMBS',      label: '팔·다리·관절',  emoji: '🦵', primarySpecialty: 'OS',    visionRecommended: true },
  SKIN:       { id: 'SKIN',       label: '피부',          emoji: '🩹', primarySpecialty: 'DERM',  visionRecommended: true },
  ENT_EYE:    { id: 'ENT_EYE',    label: '눈·코·귀',      emoji: '👁️', primarySpecialty: 'ENT',   visionRecommended: false },
  URO_OBGYN:  { id: 'URO_OBGYN',  label: '비뇨·여성',     emoji: '🌸', primarySpecialty: 'URO',   visionRecommended: false },
  SYSTEMIC:   { id: 'SYSTEMIC',   label: '전신·기분',     emoji: '💭', primarySpecialty: 'FM',    visionRecommended: false },
}

export const REGION_LIST: RegionMeta[] = Object.values(REGIONS)
