/**
 * G5-3 건강기능식품 정보 모듈 — 조회 함수
 *
 * 매칭 방식:
 * - LLM 의존 X. 정적 키워드 부분 일치 우선.
 * - 증상 텍스트 → symptomKey 매칭 (한글 라벨 부분 일치 + 추가 동의어)
 * - 진료과 코드 → 관련 매핑 전체 반환
 */

import { SUPPLEMENT_DATA } from './data'
import type { SymptomSupplementMapping } from './types'

/** 한글 라벨 부분 일치 외 추가로 매핑할 동의어 표 */
const SYNONYM_TO_KEY: ReadonlyArray<[string, string]> = [
  ['무릎', 'knee_pain'],
  ['관절', 'joint_general'],
  ['비염', 'rhinitis'],
  ['코막힘', 'rhinitis'],
  ['알레르기', 'rhinitis'],
  ['고혈압', 'hypertension'],
  ['혈압', 'hypertension'],
  ['고지혈', 'hyperlipidemia'],
  ['콜레스테롤', 'hyperlipidemia'],
  ['면역', 'immune'],
  ['감기', 'immune'],
  ['피로', 'fatigue'],
  ['기력', 'fatigue'],
  ['눈', 'eye_health'],
  ['시력', 'eye_health'],
  ['간', 'liver'],
  ['위', 'stomach'],
  ['속쓰림', 'stomach'],
  ['장', 'intestinal'],
  ['변비', 'intestinal'],
  ['설사', 'intestinal'],
  ['뼈', 'bone'],
  ['골다공증', 'bone'],
  ['모발', 'hair'],
  ['탈모', 'hair'],
  ['피부', 'skin'],
  ['수면', 'sleep'],
  ['불면', 'sleep'],
  ['스트레스', 'stress'],
  ['긴장', 'stress'],
  ['기억', 'memory'],
  ['집중', 'memory'],
  ['갱년기', 'menopause'],
  ['폐경', 'menopause'],
  ['전립선', 'prostate'],
  ['건강', 'general_wellness'],
]

/**
 * 증상 텍스트로 매핑 1건 조회.
 * 우선순위: 1) 한글 라벨 부분 일치 → 2) 동의어 표 부분 일치 → 3) null.
 */
export function findSupplementsBySymptom(symptomText: string): SymptomSupplementMapping | null {
  if (!symptomText) return null
  const text = symptomText.trim()
  if (text.length === 0) return null

  // 1) 한글 라벨 정확 부분 일치
  for (const m of SUPPLEMENT_DATA) {
    if (text.includes(m.symptomLabel)) return m
  }

  // 2) 동의어 표 부분 일치 (가장 먼저 매칭되는 항목 채택)
  for (const [synonym, key] of SYNONYM_TO_KEY) {
    if (text.includes(synonym)) {
      const found = SUPPLEMENT_DATA.find((m) => m.symptomKey === key)
      if (found) return found
    }
  }

  return null
}

/** symptomKey로 직접 조회 (LLM이 메타 필드로 키를 반환할 때 사용) */
export function findSupplementsByKey(symptomKey: string): SymptomSupplementMapping | null {
  return SUPPLEMENT_DATA.find((m) => m.symptomKey === symptomKey) ?? null
}

/** 진료과 코드 매칭 전체 반환 */
export function findSupplementsBySpecialty(specialtyCode: string): SymptomSupplementMapping[] {
  return SUPPLEMENT_DATA.filter((m) => m.relatedSpecialty === specialtyCode)
}
