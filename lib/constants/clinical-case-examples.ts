/**
 * 의사용(Pro) DDx 입력 페이지 placeholder 회전용 임상 시나리오 풀.
 *
 * 설계 원칙:
 * 1. 임상 표기로 작성 (의사 입력 형식 그대로) — 환자용 일상어와 구분.
 * 2. 진료과 다양성 확보 — 단일 진료과 시나리오 편중 금지. 각 과 1개씩.
 * 3. 한 시나리오는 chief_complaint / hpi / physical_exam / lab_results
 *    4개 필드를 일관되게 채움 (4개 placeholder에 동시 노출).
 * 4. expected_specialty 필드로 9-B-1 department-router 테스트 시나리오로 재사용 가능.
 *
 * 항목 추가/수정 시 위 4가지 원칙 준수.
 * 현재 커버 진료과 (8개): GS, IM, NEU, OS, OBGYN, PED, ENT, PSY
 */

import type { SpecialtyCode } from './specialties'

export interface ClinicalCaseExample {
  expected_specialty: SpecialtyCode
  chief_complaint: string
  hpi: string
  physical_exam: string
  lab_results: string
}

export const CLINICAL_CASE_EXAMPLES: ClinicalCaseExample[] = [
  // GS — 급성 담낭염
  {
    expected_specialty: 'GS',
    chief_complaint: 'RUQ pain 3일, 발열 38.2°C',
    hpi: 'fatty meal 후 악화, 오심 동반, 우측 어깨 방사통 (+)',
    physical_exam: 'BP 120/80, HR 92, T 38.2°C, Murphy sign (+)',
    lab_results: 'WBC 13,500, CRP 4.2, AST/ALT 정상, lipase 정상',
  },
  // IM — 안정형 협심증
  {
    expected_specialty: 'IM',
    chief_complaint: '운동 시 흉통 1개월, 계단 오르기 시 압박감',
    hpi: '휴식 시 호전, 5~10분 지속, 과거력 고혈압·흡연 20갑년',
    physical_exam: 'BP 145/90, HR 78, S1/S2 정상, 잡음 없음',
    lab_results: 'troponin 음성, EKG 휴식 시 정상, LDL 142',
  },
  // NEU — 무조짐 편두통
  {
    expected_specialty: 'NEU',
    chief_complaint: '편측 박동성 두통 6개월, 월 3~4회',
    hpi: '4시간 지속, 광공포·구역 동반, NSAIDs 부분 호전, 가족력 (+)',
    physical_exam: 'GCS 15, 신경학적 검사 정상, 눈부심 호소',
    lab_results: '뇌영상 미실시, CBC 정상',
  },
  // OS — 회전근개 파열
  {
    expected_specialty: 'OS',
    chief_complaint: '우측 어깨 통증 2개월, 외전 제한',
    hpi: '운동 후 발생, 야간 통증 (+), 머리 빗기 어려움',
    physical_exam: 'painful arc 60-120°, empty can test (+), drop arm test (-)',
    lab_results: 'X-ray 견봉하 경화, MRI 미실시',
  },
  // OBGYN — 점막하 자궁근종
  {
    expected_specialty: 'OBGYN',
    chief_complaint: '38세 여성, 월경 과다 6개월',
    hpi: '주기 28일 규칙적, 7일 지속, 큰 응혈 (+), 빈혈 증상',
    physical_exam: '복부 부드러움, 자궁 1.5배 종대 촉지',
    lab_results: 'Hb 9.8, 골반초음파 4cm 점막하 근종',
  },
  // PED — 가와사키병 의심
  {
    expected_specialty: 'PED',
    chief_complaint: '3세 남아, 5일째 39°C 발열 지속',
    hpi: '항생제 효과 없음, 양측 결막충혈, 입술 갈라짐, 손발 부종',
    physical_exam: 'T 39.2°C, 양측 결막충혈, 딸기혀, 경부 림프절 비대',
    lab_results: 'WBC 15,000, CRP 8.5, ESR 60, 심초음파 미실시',
  },
  // ENT — 돌발성 난청
  {
    expected_specialty: 'ENT',
    chief_complaint: '좌측 청력 저하 3일, 갑작스럽게 발생',
    hpi: '이명 동반, 어지럼 없음, 발병 전 상기도 감염력 있음',
    physical_exam: '고막 정상, Weber 우측 편위, Rinne AC>BC 양측',
    lab_results: '순음청력검사 좌측 60dB 감각신경성 난청',
  },
  // PSY — 주요우울장애
  {
    expected_specialty: 'PSY',
    chief_complaint: '45세 여성, 우울감·의욕 저하 3개월',
    hpi: '불면, 식욕 감소, 체중 감소 4kg, 집중력 저하, 자살 사고 (-)',
    physical_exam: '바이탈 정상, 외관 단정, 정신상태검사 우울한 기분',
    lab_results: 'PHQ-9 18점 (중등도-중증), TSH 정상, CBC 정상',
  },
]

export function getRandomClinicalCase(): ClinicalCaseExample {
  return CLINICAL_CASE_EXAMPLES[Math.floor(Math.random() * CLINICAL_CASE_EXAMPLES.length)]
}
