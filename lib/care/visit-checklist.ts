/**
 * M5-C 준비물 체크리스트 — 진료과별 자동 생성 + 사용자 커스터마이징
 * LLM 호출 없음. 정적 매핑 기반.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'
import type { TriageLevel } from '@/lib/specialty/symptom-mapping-schema'

export interface ChecklistItem {
  id: string
  text: string
  category: 'document' | 'fasting' | 'preparation' | 'custom'
  is_checked: boolean
  is_default: boolean
  source_specialty?: SpecialtyCode
}

// ─── 공통 준비물 ──────────────────────────────────────────────

type ItemTemplate = Omit<ChecklistItem, 'id' | 'is_checked' | 'source_specialty'>

const COMMON_ITEMS: ItemTemplate[] = [
  { text: '보험증 또는 신분증',         category: 'document',     is_default: true },
  { text: '이전 처방전 (있는 경우)',    category: 'document',     is_default: true },
  { text: '복용 중인 약 목록',          category: 'preparation',  is_default: true },
  { text: '증상 일기',                  category: 'preparation',  is_default: true },
]

// critical/urgent 시 간소화 — 응급 직행 준비물만
const EMERGENCY_ITEMS: ItemTemplate[] = [
  { text: '보험증 또는 신분증', category: 'document',    is_default: true },
  { text: '복용 중인 약 목록', category: 'preparation', is_default: true },
]

// ─── 진료과별 특화 준비물 ─────────────────────────────────────

const SPECIALTY_ITEMS: Partial<Record<SpecialtyCode, ItemTemplate[]>> = {
  IM: [
    { text: '최근 혈액검사 결과 (있는 경우)',                        category: 'preparation', is_default: true },
    { text: '혈압 측정 기록',                                         category: 'preparation', is_default: true },
    { text: '금식 필요 여부 확인 (위내시경 예약 시 8시간 금식)',      category: 'fasting',     is_default: true },
  ],
  FM: [
    { text: '기저질환 목록',                                          category: 'preparation', is_default: true },
    { text: '가족력 메모 (당뇨·고혈압·암 등)',                        category: 'preparation', is_default: true },
    { text: '최근 건강검진 결과',                                     category: 'preparation', is_default: true },
  ],
  PED: [
    { text: '예방접종 수첩',                                          category: 'document',    is_default: true },
    { text: '성장·발달 기록 (있는 경우)',                             category: 'preparation', is_default: true },
    { text: '출생 시 체중·분만 방법 메모 (영아의 경우)',               category: 'preparation', is_default: true },
  ],
  NEU: [
    { text: '두통·발작 일기 (있는 경우)',                             category: 'preparation', is_default: true },
    { text: '뇌 MRI/CT 영상 (있는 경우)',                            category: 'preparation', is_default: true },
    { text: '발작 당시 동영상 (있는 경우)',                           category: 'preparation', is_default: true },
  ],
  PSY: [
    { text: '증상 기록 (수면·기분·식욕 변화 일지)',                   category: 'preparation', is_default: true },
    { text: '가족 동행 권장 (필요 시)',                               category: 'preparation', is_default: true },
    { text: '현재 복용 중인 정신과 약 목록',                          category: 'preparation', is_default: true },
  ],
  DERM: [
    { text: '증상 부위 사진 (스마트폰 촬영)',                         category: 'preparation', is_default: true },
    { text: '알레르기 이력 (음식·약물·화장품)',                       category: 'preparation', is_default: true },
    { text: '사용 중인 피부 제품 목록',                               category: 'preparation', is_default: true },
  ],
  GS: [
    { text: '영상 검사 결과 (X-ray, CT, 초음파) (있는 경우)',         category: 'preparation', is_default: true },
    { text: '이전 수술 기록·수술 소견서',                             category: 'document',    is_default: true },
    { text: '금식 필요 여부 확인 (수술 전 8시간 금식)',               category: 'fasting',     is_default: true },
  ],
  OS: [
    { text: 'X-ray 결과 (있는 경우)',                                 category: 'preparation', is_default: true },
    { text: 'MRI 영상 (있는 경우)',                                   category: 'preparation', is_default: true },
    { text: '통증 부위·기간 메모',                                    category: 'preparation', is_default: true },
  ],
  NS: [
    { text: 'MRI/CT 영상 (반드시 준비)',                              category: 'preparation', is_default: true },
    { text: '신경학적 증상 기록 (마비·감각이상·보행장애 발생 시각)',   category: 'preparation', is_default: true },
    { text: '의뢰서 (타 과 의뢰 시)',                                 category: 'document',    is_default: true },
  ],
  CS: [
    { text: '심전도(ECG) 결과 (있는 경우)',                           category: 'preparation', is_default: true },
    { text: '흉부 X-ray (있는 경우)',                                 category: 'preparation', is_default: true },
    { text: '심장초음파 결과 (있는 경우)',                            category: 'preparation', is_default: true },
    { text: '금식 필요 여부 확인 (수술 전 금식)',                     category: 'fasting',     is_default: true },
  ],
  PS: [
    { text: '이전 수술 기록 (있는 경우)',                             category: 'document',    is_default: true },
    { text: '증상 부위 사진',                                         category: 'preparation', is_default: true },
  ],
  OBGYN: [
    { text: '마지막 생리 시작일 (LMP) 메모',                          category: 'preparation', is_default: true },
    { text: '임신 여부 확인',                                         category: 'preparation', is_default: true },
    { text: '이전 산부인과 검사 결과 (있는 경우)',                    category: 'preparation', is_default: true },
    { text: '금식 필요 여부 확인 (수술·시술 시)',                     category: 'fasting',     is_default: true },
  ],
  URO: [
    { text: '소변 검사 결과 (있는 경우)',                             category: 'preparation', is_default: true },
    { text: '배뇨 기록 (빈도·양·색깔 메모)',                          category: 'preparation', is_default: true },
    { text: '복부 초음파 결과 (있는 경우)',                           category: 'preparation', is_default: true },
  ],
  OPH: [
    { text: '현재 착용 중인 안경·렌즈 처방전',                        category: 'preparation', is_default: true },
    { text: '안압 기록 (있는 경우)',                                  category: 'preparation', is_default: true },
    { text: '이전 안과 검사 결과',                                    category: 'preparation', is_default: true },
  ],
  ENT: [
    { text: '청력 검사 결과 (있는 경우)',                             category: 'preparation', is_default: true },
    { text: '부비동 CT (있는 경우)',                                  category: 'preparation', is_default: true },
    { text: '알레르기 검사 결과 (있는 경우)',                         category: 'preparation', is_default: true },
  ],
  DENT: [
    { text: '치과 X-ray (파노라마, 있는 경우)',                       category: 'preparation', is_default: true },
    { text: '이전 치과 치료 기록',                                    category: 'document',    is_default: true },
  ],
  EM: [],  // 응급실 — 공통 emergency items만
  REH: [
    { text: 'MRI/X-ray 영상 (있는 경우)',                            category: 'preparation', is_default: true },
    { text: '물리치료 기록 (있는 경우)',                              category: 'preparation', is_default: true },
    { text: '수술 소견서 (수술 후 재활의 경우)',                      category: 'document',    is_default: true },
  ],
  PAIN: [
    { text: '통증 기록 (부위·강도·지속 기간)',                        category: 'preparation', is_default: true },
    { text: '이전 통증 치료 기록',                                    category: 'preparation', is_default: true },
    { text: '영상 검사 결과 (있는 경우)',                             category: 'preparation', is_default: true },
  ],
  ANES: [
    { text: '마취 이력 및 부작용 기록',                               category: 'preparation', is_default: true },
    { text: '약물 알레르기 이력',                                     category: 'preparation', is_default: true },
    { text: '수술 전 금식 (8시간 이상)',                              category: 'fasting',     is_default: true },
  ],
  RAD: [
    { text: '의뢰서',                                                 category: 'document',    is_default: true },
    { text: '이전 영상 검사 결과 (비교용)',                           category: 'preparation', is_default: true },
    { text: '금식 필요 여부 확인 (조영제 검사 시 4~6시간 금식)',      category: 'fasting',     is_default: true },
  ],
  PATH: [
    { text: '조직 검체 의뢰서',                                       category: 'document',    is_default: true },
  ],
  LAB: [
    { text: '검사 의뢰서',                                            category: 'document',    is_default: true },
    { text: '금식 (공복 혈액검사 시 8시간)',                          category: 'fasting',     is_default: true },
  ],
  NM: [
    { text: '의뢰서',                                                 category: 'document',    is_default: true },
    { text: '이전 영상 결과 (있는 경우)',                             category: 'preparation', is_default: true },
  ],
  RO: [
    { text: '병리 결과지',                                            category: 'document',    is_default: true },
    { text: '의뢰서',                                                 category: 'document',    is_default: true },
    { text: '이전 CT/MRI 영상',                                      category: 'preparation', is_default: true },
  ],
  PM: [
    { text: '최근 건강검진 결과',                                     category: 'preparation', is_default: true },
    { text: '생활습관 기록 (운동·식이·흡연·음주)',                    category: 'preparation', is_default: true },
  ],
}

// ─── ID 생성 ──────────────────────────────────────────────────

let _seq = 0

function makeItem(template: ItemTemplate, specialty?: SpecialtyCode): ChecklistItem {
  return {
    id: `ci-${++_seq}`,
    is_checked: false,
    source_specialty: specialty,
    ...template,
  }
}

// ─── 공개 API ─────────────────────────────────────────────────

/**
 * 진료과 + triage level 기반 자동 준비물 체크리스트를 생성한다.
 * critical/urgent: 간소화 (응급 직행 준비물만).
 */
export function generateDefaultChecklist(
  specialty: SpecialtyCode,
  triageLevel: TriageLevel
): ChecklistItem[] {
  if (triageLevel === 'critical' || triageLevel === 'urgent') {
    return EMERGENCY_ITEMS.map((t) => makeItem(t, specialty))
  }

  const items: ChecklistItem[] = COMMON_ITEMS.map((t) => makeItem(t, specialty))
  const extra = SPECIALTY_ITEMS[specialty] ?? []
  for (const t of extra) items.push(makeItem(t, specialty))

  return items
}

export function addCustomItem(text: string): ChecklistItem {
  return {
    id: `ci-custom-${++_seq}`,
    text,
    category: 'custom',
    is_checked: false,
    is_default: false,
  }
}

export function toggleChecklistItem(
  items: ChecklistItem[],
  id: string
): ChecklistItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, is_checked: !item.is_checked } : item
  )
}
