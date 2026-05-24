/**
 * D2-2 응급 신호 트리거 (KTAS L1~L2 분기)
 *
 * 36개 응급 증상이 단독 또는 조합으로 체크될 때 즉시 KTAS L1~L2 분기.
 * 자살 충동 #30 — specialBranch='suicide_1393' (1393 자동 표시).
 *
 * 매칭: signals 배열의 모든 id가 체크되어야 발동 (AND).
 * 우선순위: L1 > L2 (배열 순서대로 먼저 매칭 채택).
 */

import type { UrgentTrigger } from './types'

export const URGENT_TRIGGERS_L1: UrgentTrigger[] = [
  // 신경 응급
  { signals: ['h_headache_thunderclap'],                       possible: ['뇌출혈', '뇌동맥류 파열'], ktas: 1, action: 'CALL_119' },
  { signals: ['h_neck_stiff', 'h_consciousness_low'],           possible: ['뇌수막염', '뇌출혈'],     ktas: 1, action: 'CALL_119' },
  { signals: ['h_face_palsy'],                                  possible: ['뇌졸중', '벨마비'],       ktas: 1, action: 'CALL_119' },
  { signals: ['h_speech_slur'],                                 possible: ['뇌졸중'],                 ktas: 1, action: 'CALL_119' },
  { signals: ['h_consciousness_low'],                           possible: ['의식 저하 (다양한 원인)'], ktas: 1, action: 'CALL_119' },
  { signals: ['h_head_trauma', 'h_consciousness_low'],          possible: ['두개내 출혈'],            ktas: 1, action: 'CALL_119' },

  // 심혈관 응급
  { signals: ['c_chest_pain_crush', 'c_cold_sweat'],            possible: ['심근경색'],               ktas: 1, action: 'CALL_119' },
  { signals: ['c_chest_pain_crush'],                            possible: ['급성 관상동맥 증후군'],   ktas: 1, action: 'CALL_119' },
  { signals: ['c_dyspnea_sudden'],                              possible: ['폐색전증', '기흉'],       ktas: 1, action: 'CALL_119' },

  // 알레르기 응급
  { signals: ['s_anaphylaxis'],                                 possible: ['아나필락시스 쇼크'],      ktas: 1, action: 'CALL_119' },

  // 소화기 응급
  { signals: ['a_pain_sudden', 'a_vomit_blood'],                possible: ['위장관 천공', '대량 출혈'], ktas: 1, action: 'CALL_119' },
  { signals: ['a_vomit_blood'],                                 possible: ['상부 위장관 출혈'],        ktas: 1, action: 'CALL_119' },

  // 비뇨 응급
  { signals: ['u_pyuria_fever'],                                possible: ['신우신염 (패혈증 위험)'], ktas: 1, action: 'GO_ER' },

  // 사지 응급
  { signals: ['l_leg_cold_pale'],                               possible: ['사지 동맥 폐색증'],       ktas: 1, action: 'CALL_119' },
  { signals: ['l_leg_swell_unilateral'],                        possible: ['심부정맥혈전증 (DVT)', '폐색전 위험'], ktas: 1, action: 'GO_ER' },

  // 정신·전신 응급
  { signals: ['y_suicidal'],                                    possible: ['자살 위기'], ktas: 1, action: 'CALL_119', specialBranch: 'suicide_1393' },
  { signals: ['y_panic'],                                       possible: ['공황 발작 / 심혈관 감별 필요'], ktas: 2, action: 'GO_ER' },
  { signals: ['y_dehydration', 'y_fever_high'],                 possible: ['패혈증 의심'],            ktas: 1, action: 'CALL_119' },
]

export const URGENT_TRIGGERS_L2: UrgentTrigger[] = [
  // 소화기 L2
  { signals: ['a_pain_rlq'],                                    possible: ['충수염'],                  ktas: 2, action: 'GO_ER' },
  { signals: ['a_pain_ruq'],                                    possible: ['담낭염'],                  ktas: 2, action: 'GO_ER' },
  { signals: ['a_pain_radiate_back'],                           possible: ['췌장염'],                  ktas: 2, action: 'GO_ER' },
  { signals: ['a_pain_sudden'],                                 possible: ['장폐쇄', '복강 내 출혈'], ktas: 2, action: 'GO_ER' },
  { signals: ['a_stool_black'],                                 possible: ['상부 위장관 출혈 (서서히)'], ktas: 2, action: 'GO_ER' },
  { signals: ['a_diarrhea_blood'],                              possible: ['출혈성 장염'],            ktas: 2, action: 'GO_ER' },

  // 호흡 L2
  { signals: ['c_dyspnea'],                                     possible: ['폐렴', '천식 악화'],      ktas: 2, action: 'GO_ER' },
  { signals: ['c_phlegm_blood'],                                possible: ['폐결핵', '폐암 의심'],    ktas: 2, action: 'GO_ER' },
  { signals: ['c_throat_mass'],                                 possible: ['림프절 염', '종양 의심'], ktas: 2, action: 'GO_ER' },

  // 사지 L2
  { signals: ['l_fracture_susp'],                               possible: ['골절'],                   ktas: 2, action: 'GO_ER' },

  // 눈 L2
  { signals: ['e_vision_loss_sudden'],                          possible: ['망막박리', '중심망막동맥폐색'], ktas: 2, action: 'GO_ER' },
  { signals: ['e_eye_trauma'],                                  possible: ['안구 손상'],              ktas: 2, action: 'GO_ER' },
  { signals: ['e_hearing_loss_sudden'],                         possible: ['돌발성 난청 (72시간 이내 치료 골든타임)'], ktas: 2, action: 'GO_ER' },

  // 비뇨 L2
  { signals: ['u_hematuria'],                                   possible: ['요로 결석', '방광·신장 종양 감별'], ktas: 2, action: 'GO_ER' },
  { signals: ['u_flank_pain_severe'],                           possible: ['요로 결석'],              ktas: 2, action: 'GO_ER' },

  // 전신 L2
  { signals: ['y_weight_loss', 'y_night_sweat'],                possible: ['결핵', '악성 종양 감별'], ktas: 2, action: 'GO_ER' },
  { signals: ['y_fever_high'],                                  possible: ['중증 감염 감별'],         ktas: 2, action: 'GO_ER' },
  { signals: ['y_dehydration'],                                 possible: ['탈수'],                   ktas: 2, action: 'GO_ER' },
]

/** 우선순위 매칭 — L1 먼저, 그 다음 L2. 첫 매치 반환. */
export function matchUrgent(checkedIds: Set<string>): UrgentTrigger | null {
  for (const trigger of [...URGENT_TRIGGERS_L1, ...URGENT_TRIGGERS_L2]) {
    if (trigger.signals.every((id) => checkedIds.has(id))) {
      return trigger
    }
  }
  return null
}
