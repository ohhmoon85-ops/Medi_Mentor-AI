/**
 * D2-2 증상 조합 매칭 룰 (KTAS L3~L5 일반 분류)
 *
 * 매칭 흐름:
 * 1. required 모두 체크 → 후보
 * 2. contradictions 중 하나라도 체크 → 배제
 * 3. supporting 체크 수 + required 매치 = score
 * 4. score >= scoreThreshold → 매치 결과 (점수 내림차순 최대 3건)
 *
 * supplementKey: lib/supplements/data.ts symptomKey 매핑 (G5-3 정합)
 */

import type { CombinationRule } from './types'

export const COMBINATIONS: CombinationRule[] = [
  // ─── HEAD_FACE ───────────────────────────────────────────────────────
  {
    name: '편두통', region: 'HEAD_FACE',
    required: ['h_headache_unilateral'],
    supporting: ['h_headache_stab', 'h_photo_phobia', 'h_vomiting_head', 'h_visual_blur'],
    scoreThreshold: 2,
    ktas: 4, specialty: 'NEU', supplementKey: 'memory',
  },
  {
    name: '긴장성 두통', region: 'HEAD_FACE',
    required: ['h_headache_general'],
    supporting: ['h_headache_squeeze'],
    contradictions: ['h_headache_unilateral', 'h_face_palsy', 'h_speech_slur'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'FM', supplementKey: 'stress',
  },
  {
    name: '부비동염', region: 'HEAD_FACE',
    required: ['h_headache_general'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '말초성 어지럼증 (양성 발작성)', region: 'HEAD_FACE',
    required: ['h_dizziness'],
    supporting: ['h_vomiting_head'],
    contradictions: ['h_face_palsy', 'h_speech_slur', 'h_consciousness_low'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '안과 검진 필요 (시야 흐림)', region: 'HEAD_FACE',
    required: ['h_visual_blur'],
    supporting: [],
    contradictions: ['e_vision_loss_sudden'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OPH', supplementKey: 'eye_health',
  },

  // ─── NECK_CHEST ──────────────────────────────────────────────────────
  {
    name: '협심증 (감별 필요)', region: 'NECK_CHEST',
    required: ['c_chest_tight'],
    supporting: ['c_palpitation'],
    contradictions: ['c_chest_pain_crush'],
    scoreThreshold: 1,
    ktas: 3, specialty: 'IM',
  },
  {
    name: '늑간 신경통', region: 'NECK_CHEST',
    required: ['c_chest_pain_stab'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 4, specialty: 'IM',
  },
  {
    name: '역류성 식도염', region: 'NECK_CHEST',
    required: ['a_heartburn'],
    supporting: ['c_throat_pain'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'IM', supplementKey: 'stomach',
  },
  {
    name: '편도염', region: 'NECK_CHEST',
    required: ['c_throat_pain'],
    supporting: ['c_swallow_diff', 'y_fever'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT', supplementKey: 'immune',
  },
  {
    name: '후두염', region: 'NECK_CHEST',
    required: ['c_voice_hoarse'],
    supporting: ['c_throat_pain', 'c_cough'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '기관지염 / 감기', region: 'NECK_CHEST',
    required: ['c_cough'],
    supporting: ['c_phlegm', 'y_fever'],
    contradictions: ['c_phlegm_blood'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'IM', supplementKey: 'immune',
  },
  {
    name: '부정맥', region: 'NECK_CHEST',
    required: ['c_palpitation'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 4, specialty: 'IM',
  },

  // ─── ABDOMEN ─────────────────────────────────────────────────────────
  {
    name: '위염', region: 'ABDOMEN',
    required: ['a_pain_epigast'],
    supporting: ['a_nausea', 'a_heartburn'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'IM', supplementKey: 'stomach',
  },
  {
    name: '위궤양', region: 'ABDOMEN',
    required: ['a_pain_epigast'],
    supporting: ['a_nausea', 'a_vomiting'],
    contradictions: ['a_vomit_blood', 'a_stool_black'],
    scoreThreshold: 2,
    ktas: 3, specialty: 'IM', supplementKey: 'stomach',
  },
  {
    name: '과민성 대장 증후군', region: 'ABDOMEN',
    required: ['a_pain_general'],
    supporting: ['a_diarrhea', 'a_constipation'],
    contradictions: ['a_diarrhea_blood', 'a_stool_black'],
    scoreThreshold: 2,
    ktas: 5, specialty: 'IM', supplementKey: 'intestinal',
  },
  {
    name: '장염 / 식중독', region: 'ABDOMEN',
    required: ['a_diarrhea'],
    supporting: ['a_nausea', 'a_vomiting', 'y_fever'],
    contradictions: ['a_diarrhea_blood'],
    scoreThreshold: 2,
    ktas: 4, specialty: 'IM', supplementKey: 'intestinal',
  },
  {
    name: '변비', region: 'ABDOMEN',
    required: ['a_constipation'],
    supporting: ['a_pain_general'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'IM', supplementKey: 'intestinal',
  },

  // ─── LIMBS ───────────────────────────────────────────────────────────
  {
    name: '관절염', region: 'LIMBS',
    required: ['l_joint_pain'],
    supporting: ['l_joint_swell'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OS', supplementKey: 'joint_general',
  },
  {
    name: '류마티스 관절염 의심', region: 'LIMBS',
    required: ['l_joint_pain', 'l_joint_stiff_morning'],
    supporting: ['l_joint_swell'],
    scoreThreshold: 2,
    ktas: 3, specialty: 'IM',
  },
  {
    name: '요통', region: 'LIMBS',
    required: ['l_back_pain'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OS',
  },
  {
    name: '근육통', region: 'LIMBS',
    required: ['l_muscle_pain'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 5, specialty: 'OS',
  },
  {
    name: '염좌 / 인대 손상', region: 'LIMBS',
    required: ['l_sprain'],
    supporting: ['l_joint_swell'],
    contradictions: ['l_fracture_susp'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OS',
  },
  {
    name: '외상 (열상·찰과)', region: 'LIMBS',
    required: ['l_trauma'],
    supporting: ['l_open_wound'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OS',
  },
  {
    name: '디스크 (좌골 신경통 의심)', region: 'LIMBS',
    required: ['l_back_pain', 'l_numbness'],
    supporting: ['l_weakness'],
    scoreThreshold: 2,
    ktas: 3, specialty: 'NS',
  },

  // ─── SKIN ────────────────────────────────────────────────────────────
  {
    name: '두드러기', region: 'SKIN',
    required: ['s_urticaria'],
    supporting: ['s_itch'],
    contradictions: ['s_anaphylaxis'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'DERM',
  },
  {
    name: '접촉성 피부염', region: 'SKIN',
    required: ['s_rash_local'],
    supporting: ['s_itch'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'DERM', supplementKey: 'skin',
  },
  {
    name: '아토피 / 습진', region: 'SKIN',
    required: ['s_rash_general'],
    supporting: ['s_itch', 's_dry_cracked'],
    scoreThreshold: 2,
    ktas: 5, specialty: 'DERM', supplementKey: 'skin',
  },
  {
    name: '대상포진 (조기 의심)', region: 'SKIN',
    required: ['s_blister', 's_rash_local'],
    supporting: [],
    scoreThreshold: 2,
    ktas: 3, specialty: 'DERM',
  },
  {
    name: '봉와직염', region: 'SKIN',
    required: ['s_pus'],
    supporting: ['y_fever'],
    scoreThreshold: 1,
    ktas: 3, specialty: 'DERM',
  },
  {
    name: '점·종괴 의심 (피부암 감별 권고)', region: 'SKIN',
    required: ['s_mole_change'],
    supporting: ['s_mole_new'],
    scoreThreshold: 1,
    ktas: 3, specialty: 'DERM',
  },
  {
    name: '탈모', region: 'SKIN',
    required: ['s_hair_loss'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 5, specialty: 'DERM', supplementKey: 'hair',
  },
  {
    name: '손발톱 곰팡이 / 변형', region: 'SKIN',
    required: ['s_nail_change'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 5, specialty: 'DERM',
  },

  // ─── ENT_EYE ─────────────────────────────────────────────────────────
  {
    name: '결막염', region: 'ENT_EYE',
    required: ['e_eye_red'],
    supporting: ['e_eye_discharge', 'e_eye_pain'],
    contradictions: ['e_vision_loss_sudden', 'e_eye_trauma'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OPH',
  },
  {
    name: '다래끼 (맥립종)', region: 'ENT_EYE',
    required: ['e_eye_pain'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 5, specialty: 'OPH',
  },
  {
    name: '비염', region: 'ENT_EYE',
    required: ['e_nose_blocked'],
    supporting: ['e_nose_runny'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'ENT', supplementKey: 'rhinitis',
  },
  {
    name: '부비동염', region: 'ENT_EYE',
    required: ['e_sinus_pain'],
    supporting: ['e_nose_blocked', 'e_nose_runny'],
    scoreThreshold: 2,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '중이염', region: 'ENT_EYE',
    required: ['e_ear_pain'],
    supporting: ['e_ear_discharge', 'y_fever'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '외이도염', region: 'ENT_EYE',
    required: ['e_ear_discharge'],
    supporting: ['e_ear_pain'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '이명', region: 'ENT_EYE',
    required: ['e_tinnitus'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 4, specialty: 'ENT',
  },
  {
    name: '코피', region: 'ENT_EYE',
    required: ['e_nose_bleed'],
    supporting: [],
    scoreThreshold: 1,
    ktas: 5, specialty: 'ENT',
  },

  // ─── URO_OBGYN ───────────────────────────────────────────────────────
  {
    name: '방광염', region: 'URO_OBGYN',
    required: ['u_dysuria'],
    supporting: ['u_frequency', 'u_urgency'],
    contradictions: ['u_pyuria_fever', 'u_hematuria'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'URO',
  },
  {
    name: '전립선 비대 (남성)', region: 'URO_OBGYN',
    required: ['u_prostate_hesitancy'],
    supporting: ['u_frequency'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'URO', supplementKey: 'prostate',
  },
  {
    name: '질염', region: 'URO_OBGYN',
    required: ['u_vaginal_discharge'],
    supporting: ['u_vaginal_itch'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OBGYN',
  },
  {
    name: '월경 이상', region: 'URO_OBGYN',
    required: ['u_menstrual_irregular'],
    supporting: ['u_pelvic_pain'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'OBGYN',
  },
  {
    name: '갱년기 증후군', region: 'URO_OBGYN',
    required: ['u_menopause_sx'],
    supporting: ['y_insomnia'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'OBGYN', supplementKey: 'menopause',
  },

  // ─── SYSTEMIC ────────────────────────────────────────────────────────
  {
    name: '감기 / 일반 감염', region: 'SYSTEMIC',
    required: ['y_fever'],
    supporting: ['y_chills', 'c_cough', 'c_throat_pain'],
    contradictions: ['y_fever_high'],
    scoreThreshold: 2,
    ktas: 5, specialty: 'FM', supplementKey: 'immune',
  },
  {
    name: '만성 피로', region: 'SYSTEMIC',
    required: ['y_fatigue'],
    supporting: ['y_appetite_loss', 'y_insomnia'],
    scoreThreshold: 2,
    ktas: 5, specialty: 'FM', supplementKey: 'fatigue',
  },
  {
    name: '불면증', region: 'SYSTEMIC',
    required: ['y_insomnia'],
    supporting: ['y_anxiety'],
    scoreThreshold: 1,
    ktas: 5, specialty: 'PSY', supplementKey: 'sleep',
  },
  {
    name: '불안 장애', region: 'SYSTEMIC',
    required: ['y_anxiety'],
    supporting: ['y_insomnia'],
    contradictions: ['y_panic'],
    scoreThreshold: 1,
    ktas: 4, specialty: 'PSY', supplementKey: 'stress',
  },
  {
    name: '우울증', region: 'SYSTEMIC',
    required: ['y_depression'],
    supporting: ['y_fatigue', 'y_appetite_loss', 'y_insomnia'],
    contradictions: ['y_suicidal'],
    scoreThreshold: 2,
    ktas: 3, specialty: 'PSY',
  },
  {
    name: '식욕 부진 (정밀 검진 권고)', region: 'SYSTEMIC',
    required: ['y_appetite_loss', 'y_weight_loss'],
    supporting: [],
    scoreThreshold: 2,
    ktas: 3, specialty: 'IM',
  },
]

/**
 * 체크된 증상 id 집합으로 조합 매칭 — 점수 내림차순 상위 maxResults 반환.
 */
export function matchCombinations(checkedIds: Set<string>, maxResults = 3): Array<CombinationRule & { score: number }> {
  const results: Array<CombinationRule & { score: number }> = []
  for (const rule of COMBINATIONS) {
    // contradictions 체크
    if (rule.contradictions?.some((id) => checkedIds.has(id))) continue
    // required 전부 체크 필요
    if (!rule.required.every((id) => checkedIds.has(id))) continue
    // 점수 계산: required 매치 + supporting 매치
    const supportingHits = rule.supporting.filter((id) => checkedIds.has(id)).length
    const score = rule.required.length + supportingHits
    if (score < rule.scoreThreshold) continue
    results.push({ ...rule, score })
  }
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, maxResults)
}
