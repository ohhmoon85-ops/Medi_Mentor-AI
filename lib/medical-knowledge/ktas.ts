/**
 * G4-1 KTAS (한국형 응급환자 분류도구) 지식 모듈
 *
 * 출처: 보건복지부 고시 제2023-287호 (한국 응급환자 중증도 분류기준)
 * 운영: 대한응급의학회 KTAS 위원회
 * 참고: jksem-28-6-547 (KTAS 이해 논문, https://www.jksem.org/upload/pdf/jksem-28-6-547.pdf)
 *
 * medimentor Care L1~L5 → KTAS Level 1~5 1:1 매핑.
 * recommendation-engine 무수정 (보호 파일). 본 모듈은 호출자가 참조.
 */

export interface KTASLevel {
  level: 1 | 2 | 3 | 4 | 5
  name: string
  timeLimit: string
  description: string
  examples: string[]
  ourLLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
}

export const KTAS_LEVELS: Record<1 | 2 | 3 | 4 | 5, KTASLevel> = {
  1: {
    level: 1,
    name: '소생 (Resuscitation)',
    timeLimit: '즉시 진료',
    description: '심정지, 무호흡, 의식 없음, 활력징후 매우 불안정',
    examples: ['심정지', '무호흡', '의식 없음', '심한 외상 쇼크', '대량 출혈', '심한 화상'],
    ourLLevel: 'L1',
  },
  2: {
    level: 2,
    name: '긴급 (Emergent)',
    timeLimit: '15분 이내',
    description: '의식 저하, 심한 호흡곤란, 흉통(ACS 의심), 뇌졸중 의심',
    examples: [
      '갑작스러운 의식저하',
      '심한 흉통',
      '편마비',
      '심한 호흡곤란',
      '심한 복통(장폐색·충수염 의심)',
      '비전형 ACS(고령 여성 가슴 답답함)',
      '자살 위기',
    ],
    ourLLevel: 'L2',
  },
  3: {
    level: 3,
    name: '응급 (Urgent)',
    timeLimit: '30분 이내',
    description: '중등도 통증, 의식 명료하나 활력징후 이상, 발열 동반',
    examples: ['중등도 복통', '38.5도 이상 발열', '경한 호흡곤란', '구토 동반 두통', '경한 외상'],
    ourLLevel: 'L3',
  },
  4: {
    level: 4,
    name: '준응급 (Less Urgent)',
    timeLimit: '60분 이내',
    description: '경증 외상, 일반 증상, 활력징후 안정',
    examples: ['감기 증상', '경한 복통', '단순 두통', '경증 외상', '치통'],
    ourLLevel: 'L4',
  },
  5: {
    level: 5,
    name: '비응급 (Non-Urgent)',
    timeLimit: '120분 이내 또는 정기 외래',
    description: '만성·경미한 증상',
    examples: ['만성 피부 트러블', '만성 가벼운 통증', '예방접종 상담', '건강 검진 문의'],
    ourLLevel: 'L5',
  },
} as const

export const KTAS_CLASSIFICATION_FLOW = [
  '1. 첫인상 평가 (Impression evaluation)',
  '2. 감염 관리 확인 (발열 등 감염 의심 시 격리)',
  '3. 주증상 선택',
  '4. 1차·2차 고려사항 (활력징후 + 통증 강도 + 사고기전)',
  '5. 최종 레벨 결정',
] as const

const L_TO_KTAS: Record<'L1' | 'L2' | 'L3' | 'L4' | 'L5', 1 | 2 | 3 | 4 | 5> = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
}

export function getKTASLevel(ourLLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'): KTASLevel {
  return KTAS_LEVELS[L_TO_KTAS[ourLLevel]]
}

/** acuity_level (1~5 정수) 으로 KTASLevel 객체 반환. 범위 외는 null. */
export function getKTASByAcuity(acuity: number): KTASLevel | null {
  if (acuity < 1 || acuity > 5 || !Number.isInteger(acuity)) return null
  return KTAS_LEVELS[acuity as 1 | 2 | 3 | 4 | 5]
}

/** 출처 인용 표준 문구 */
export const KTAS_CITATION = '보건복지부 고시 제2023-287호'
export const KTAS_SOURCE_LABEL = '한국형 응급환자 분류도구 (KTAS)'
