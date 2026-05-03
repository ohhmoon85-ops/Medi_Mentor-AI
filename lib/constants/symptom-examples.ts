/**
 * 환자용(Care) 챗·자가관리·증상일기 페이지 placeholder 회전용 증상 예시 풀.
 *
 * 설계 원칙:
 * 1. 일상어로 작성 — 의학 용어 회피, 환자가 실제로 사용하는 표현 사용.
 * 2. 첫 화면 노출에 부담 없을 것 — 자극적/구체적 표현 회피.
 * 3. 진료과 균등 분포 — 단, IM(내과)은 한국 1차 의료 빈도 1위로
 *    소화기/심혈관 분과 다양성을 위해 2개 허용.
 * 4. EM(응급의학) 시나리오는 의도적으로 제외함.
 *    - 응급도 판정은 lib/triage/mts-engine.ts와
 *      lib/safety/red-flag-classifier.ts가 담당.
 *    - placeholder에 EM 시나리오를 노출하면 응급 환자가 "이 정도는 챗에
 *      입력해도 된다"고 오판할 위험이 있어 UX상 부적절.
 *
 * 항목 추가/수정 시 위 4가지 원칙을 반드시 준수할 것.
 *
 * 현재 커버 진료과 (11개): IM(2), NEU, OS, ENT, DENT, OPH, PED, PSY,
 * OBGYN, URO, DERM
 * 의도적 제외: EM, FM, REH, 외과계(GS/NS/CS/PS), 의뢰전용(RAD/PATH/LAB/NM/RO/PM)
 */

import type { SpecialtyCode } from './specialties'

export interface SymptomExample {
  text: string          // placeholder로 노출되는 일상어 예시
  specialty: SpecialtyCode  // 해당 증상의 대표 진료과
}

export const SYMPTOM_EXAMPLES: SymptomExample[] = [
  // IM — 내과 (소화기)
  { text: '명치가 쓰리고 신물이 올라와요',            specialty: 'IM' },
  // NEU — 신경과
  { text: '관자놀이가 욱신거리고 빛이 부셔요',        specialty: 'NEU' },
  // OS — 정형외과
  { text: '무릎이 계단 내려갈 때 시큰거려요',         specialty: 'OS' },
  // ENT — 이비인후과
  { text: '목이 따끔거리고 가래가 끼어요',            specialty: 'ENT' },
  // DENT — 치과
  { text: '잇몸에서 피가 나고 시려요',               specialty: 'DENT' },
  // OPH — 안과
  { text: '눈이 충혈되고 누런 눈곱이 끼어요',         specialty: 'OPH' },
  // PED — 소아청소년과
  { text: '5세 아이가 38.5도 열이 나요',             specialty: 'PED' },
  // PSY — 정신건강의학과
  { text: '잠을 못 자고 우울해요',                   specialty: 'PSY' },
  // 추가 다양성 — IM (심혈관), OBGYN, URO, DERM
  { text: '가슴이 답답하고 숨이 가빠요',              specialty: 'IM' },
  { text: '생리통이 너무 심해요',                    specialty: 'OBGYN' },
  { text: '소변 볼 때 따갑고 자주 마려워요',          specialty: 'URO' },
  { text: '팔에 두드러기가 갑자기 생겼어요',          specialty: 'DERM' },
]

/**
 * 매 렌더링마다 랜덤 예시 1개 반환 (서버 컴포넌트에서도 사용 가능)
 * useMemo와 함께 사용하면 리렌더 시 고정됨
 */
export function getRandomSymptomExample(): SymptomExample {
  return SYMPTOM_EXAMPLES[Math.floor(Math.random() * SYMPTOM_EXAMPLES.length)]
}

/**
 * 특정 진료과 계열을 제외한 예시 반환
 * 직전에 보여줬던 진료과를 피할 때 사용
 */
export function getRandomExampleExcluding(
  excludeSpecialty?: SpecialtyCode
): SymptomExample {
  const pool = excludeSpecialty
    ? SYMPTOM_EXAMPLES.filter((e) => e.specialty !== excludeSpecialty)
    : SYMPTOM_EXAMPLES
  return pool[Math.floor(Math.random() * pool.length)]
}
