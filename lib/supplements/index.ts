/**
 * G5-3 건강기능식품 정보 모듈 — public API
 *
 * 외부에서는 본 index를 통해서만 접근:
 *   import { findSupplementsBySymptom, ... } from '@/lib/supplements'
 */

export type { Supplement, SymptomSupplementMapping } from './types'
export { SUPPLEMENT_DATA } from './data'
export {
  findSupplementsBySymptom,
  findSupplementsByKey,
  findSupplementsBySpecialty,
} from './lookup'
