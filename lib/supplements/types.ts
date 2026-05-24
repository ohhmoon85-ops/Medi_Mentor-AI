/**
 * G5-3 건강기능식품 정보 모듈 — 타입 정의
 *
 * 정책:
 * - 효능·치료 추정 금지. "~과 관련해 알려져 있다" 톤 유지 (G4-1 §응답 원칙 정합)
 * - 식약처 인증 기능성 원료 기반 일반 정보. 의학적 진단 대체 아님.
 */

export interface Supplement {
  /** 영문 식별자 (예: 'glucosamine'). UI 노출 X */
  id: string
  /** 한글 명칭 (예: '글루코사민') */
  name: string
  /** 관련 기능 키워드 배열 (예: ['관절 건강', '연골 보호']) */
  knownFor: string[]
  /** 일반 권장 복용량 (예: '1500mg/일') */
  commonDoses: string
  /** "~과 관련해 알려져 있다" 톤의 일반 정보 문장 */
  notes: string
  /** 주의 태그 (예: ['임산부 주의', '항응고제 복용 시 주의']) */
  warningTags?: string[]
}

export interface SymptomSupplementMapping {
  /** 증상 키 (영문 snake_case, 예: 'knee_pain') */
  symptomKey: string
  /** 증상 라벨 (한글, UI 노출) */
  symptomLabel: string
  /**
   * 관련 진료과 코드 (lib/constants/specialties.ts의 SpecialtyCode 정합).
   * recommendation-engine 비변경 — 단순 참조 매칭에만 사용.
   */
  relatedSpecialty?: string
  /** 매핑된 건강기능식품 후보 */
  supplements: Supplement[]
}
