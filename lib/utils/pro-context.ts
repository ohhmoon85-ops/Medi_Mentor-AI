import { KOREAN_SPECIALTIES } from '@/lib/constants/specialties'
import type { SpecialtyCode } from '@/lib/constants/specialties'

export function isValidSpecialtyCode(s: unknown): s is SpecialtyCode {
  return typeof s === 'string' && s in KOREAN_SPECIALTIES
}

export function getProSpecialtyCode(): SpecialtyCode | null {
  if (typeof window === 'undefined') return null
  const code = sessionStorage.getItem('pro_specialty_code')
  return isValidSpecialtyCode(code) ? code : null
}
