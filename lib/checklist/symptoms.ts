/**
 * D2-1 113개 증상 카탈로그
 *
 * 응급(urgent: true) 36건 (사전설계 33 + 추가 3: 돌발성 난청·췌장염·담낭염)
 * 자살 충동 #30 specialBranch='suicide_1393' (1393 자동 표시)
 *
 * id 규약: `{region-prefix}_{snake_case}` (region-prefix: h/c/a/l/s/e/u/y)
 */

import type { Symptom } from './types'

export const SYMPTOMS: Symptom[] = [
  // ─── HEAD_FACE (머리·얼굴) — 15건, 응급 6건 ───────────────────────────
  { id: 'h_headache_general',     label: '두통 (전체)',                       region: 'HEAD_FACE', urgent: false },
  { id: 'h_headache_unilateral',  label: '두통 (한쪽만)',                     region: 'HEAD_FACE', urgent: false },
  { id: 'h_headache_stab',        label: '두통 (찌르는 듯)',                  region: 'HEAD_FACE', urgent: false },
  { id: 'h_headache_squeeze',     label: '두통 (조이는 듯)',                  region: 'HEAD_FACE', urgent: false },
  { id: 'h_headache_thunderclap', label: '갑작스러운 극심한 두통 (벼락치기)', region: 'HEAD_FACE', urgent: true },
  { id: 'h_dizziness',            label: '어지러움 / 현기증',                 region: 'HEAD_FACE', urgent: false },
  { id: 'h_consciousness_low',    label: '의식 흐림 / 졸림',                  region: 'HEAD_FACE', urgent: true },
  { id: 'h_vomiting_head',        label: '구토 (두통 동반)',                  region: 'HEAD_FACE', urgent: false },
  { id: 'h_visual_blur',          label: '시야 흐림',                         region: 'HEAD_FACE', urgent: false },
  { id: 'h_photo_phobia',         label: '빛·소리에 민감함',                  region: 'HEAD_FACE', urgent: false },
  { id: 'h_neck_stiff',           label: '목 뻣뻣함 (고개 숙이기 어려움)',    region: 'HEAD_FACE', urgent: true },
  { id: 'h_face_palsy',           label: '한쪽 얼굴 마비',                    region: 'HEAD_FACE', urgent: true },
  { id: 'h_speech_slur',          label: '발음 어눌함',                       region: 'HEAD_FACE', urgent: true },
  { id: 'h_head_trauma',          label: '외상 (머리 부딪힘)',                region: 'HEAD_FACE', urgent: true },
  { id: 'h_etc',                  label: '기타 (자유 입력)',                  region: 'HEAD_FACE', urgent: false },

  // ─── NECK_CHEST (목·가슴) — 14건, 응급 6건 ─────────────────────────────
  { id: 'c_chest_pain_crush',     label: '가슴 통증 (쥐어짜는 듯)',           region: 'NECK_CHEST', urgent: true },
  { id: 'c_chest_pain_stab',      label: '가슴 통증 (찌르는 듯)',             region: 'NECK_CHEST', urgent: false },
  { id: 'c_chest_tight',          label: '가슴이 답답함',                     region: 'NECK_CHEST', urgent: false },
  { id: 'c_dyspnea',              label: '호흡 곤란',                         region: 'NECK_CHEST', urgent: true },
  { id: 'c_dyspnea_sudden',       label: '갑작스러운 호흡 곤란',              region: 'NECK_CHEST', urgent: true },
  { id: 'c_cold_sweat',           label: '식은땀',                            region: 'NECK_CHEST', urgent: true },
  { id: 'c_palpitation',          label: '두근거림 / 빠른 심박',              region: 'NECK_CHEST', urgent: false },
  { id: 'c_cough',                label: '기침',                              region: 'NECK_CHEST', urgent: false },
  { id: 'c_phlegm',               label: '가래',                              region: 'NECK_CHEST', urgent: false },
  { id: 'c_phlegm_blood',         label: '가래에 피',                         region: 'NECK_CHEST', urgent: true },
  { id: 'c_throat_pain',          label: '목 통증',                           region: 'NECK_CHEST', urgent: false },
  { id: 'c_throat_mass',          label: '목 멍울 / 부종',                    region: 'NECK_CHEST', urgent: true },
  { id: 'c_swallow_diff',         label: '삼키기 어려움',                     region: 'NECK_CHEST', urgent: false },
  { id: 'c_voice_hoarse',         label: '쉰 목소리',                         region: 'NECK_CHEST', urgent: false },

  // ─── ABDOMEN (배·소화) — 15건, 응급 6건 ───────────────────────────────
  { id: 'a_pain_general',         label: '복통 (전체)',                       region: 'ABDOMEN', urgent: false },
  { id: 'a_pain_rlq',             label: '복통 (오른쪽 아래)',                region: 'ABDOMEN', urgent: true },
  { id: 'a_pain_epigast',         label: '복통 (명치)',                       region: 'ABDOMEN', urgent: false },
  { id: 'a_pain_ruq',             label: '복통 (오른쪽 윗배)',                region: 'ABDOMEN', urgent: true },
  { id: 'a_pain_flank',           label: '복통 (옆구리)',                     region: 'ABDOMEN', urgent: false },
  { id: 'a_pain_sudden',          label: '갑작스러운 극심한 복통',            region: 'ABDOMEN', urgent: true },
  { id: 'a_pain_radiate_back',    label: '복통이 등으로 뻗침',                region: 'ABDOMEN', urgent: true },
  { id: 'a_nausea',               label: '메스꺼움',                          region: 'ABDOMEN', urgent: false },
  { id: 'a_vomiting',             label: '구토',                              region: 'ABDOMEN', urgent: false },
  { id: 'a_vomit_blood',          label: '구토에 피',                         region: 'ABDOMEN', urgent: true },
  { id: 'a_diarrhea',             label: '설사',                              region: 'ABDOMEN', urgent: false },
  { id: 'a_diarrhea_blood',       label: '설사에 피',                         region: 'ABDOMEN', urgent: true },
  { id: 'a_constipation',         label: '변비',                              region: 'ABDOMEN', urgent: false },
  { id: 'a_stool_black',          label: '검은색 변 (흑변)',                  region: 'ABDOMEN', urgent: true },
  { id: 'a_heartburn',            label: '속쓰림 / 가스 / 더부룩함',          region: 'ABDOMEN', urgent: false },

  // ─── LIMBS (팔·다리·관절) — 14건, 응급 3건 ─────────────────────────────
  { id: 'l_joint_pain',           label: '관절 통증',                         region: 'LIMBS', urgent: false },
  { id: 'l_joint_swell',          label: '관절 부음·열감',                    region: 'LIMBS', urgent: false },
  { id: 'l_joint_stiff_morning',  label: '아침 관절 뻣뻣함 (1시간+)',         region: 'LIMBS', urgent: false },
  { id: 'l_back_pain',            label: '허리·등 통증',                      region: 'LIMBS', urgent: false },
  { id: 'l_muscle_pain',          label: '근육통',                            region: 'LIMBS', urgent: false },
  { id: 'l_sprain',               label: '삐끗함 / 인대 손상 의심',           region: 'LIMBS', urgent: false },
  { id: 'l_trauma',               label: '외상 (찰과·타박)',                  region: 'LIMBS', urgent: false },
  { id: 'l_fracture_susp',        label: '심한 변형·체중 부하 불가 (골절 의심)', region: 'LIMBS', urgent: true },
  { id: 'l_numbness',             label: '저림 / 감각 둔화',                  region: 'LIMBS', urgent: false },
  { id: 'l_weakness',             label: '근력 약화 / 들기 어려움',           region: 'LIMBS', urgent: false },
  { id: 'l_leg_swell_unilateral', label: '한쪽 다리 갑작스러운 부음 (DVT 의심)', region: 'LIMBS', urgent: true },
  { id: 'l_leg_cold_pale',        label: '다리 차고 창백함 (혈관 폐색 의심)',  region: 'LIMBS', urgent: true },
  { id: 'l_open_wound',           label: '벌어진 상처 / 출혈',                region: 'LIMBS', urgent: false },
  { id: 'l_nail_injury',          label: '손발톱 손상',                       region: 'LIMBS', urgent: false },

  // ─── SKIN (피부) — 14건, 응급 1건 ─────────────────────────────────────
  { id: 's_rash_general',         label: '발진 (전신)',                       region: 'SKIN', urgent: false },
  { id: 's_rash_local',           label: '발진 (국소)',                       region: 'SKIN', urgent: false },
  { id: 's_itch',                 label: '가려움',                            region: 'SKIN', urgent: false },
  { id: 's_urticaria',            label: '두드러기',                          region: 'SKIN', urgent: false },
  { id: 's_anaphylaxis',          label: '전신 두드러기 + 호흡 곤란 (아나필락시스)', region: 'SKIN', urgent: true },
  { id: 's_pigment_change',       label: '피부 색 변화 (전반)',               region: 'SKIN', urgent: false },
  { id: 's_mole_new',             label: '점·종괴 (새로 생김)',               region: 'SKIN', urgent: false },
  { id: 's_mole_change',          label: '점·종괴 (모양·크기 변화)',          region: 'SKIN', urgent: false },
  { id: 's_blister',              label: '물집',                              region: 'SKIN', urgent: false },
  { id: 's_pus',                  label: '농·고름',                           region: 'SKIN', urgent: false },
  { id: 's_dry_cracked',          label: '건조 / 갈라짐',                     region: 'SKIN', urgent: false },
  { id: 's_bruise_unknown',       label: '멍 (이유 없음)',                    region: 'SKIN', urgent: false },
  { id: 's_hair_loss',            label: '머리카락 빠짐',                     region: 'SKIN', urgent: false },
  { id: 's_nail_change',          label: '손발톱 변색·변형',                  region: 'SKIN', urgent: false },

  // ─── ENT_EYE (눈·코·귀) — 14건, 응급 4건 ──────────────────────────────
  { id: 'e_eye_red',              label: '눈 충혈',                           region: 'ENT_EYE', urgent: false },
  { id: 'e_eye_pain',             label: '눈 통증',                           region: 'ENT_EYE', urgent: false },
  { id: 'e_eye_discharge',        label: '눈곱·분비물',                       region: 'ENT_EYE', urgent: false },
  { id: 'e_vision_loss_sudden',   label: '갑작스러운 시력 저하 (망막박리 의심)', region: 'ENT_EYE', urgent: true },
  { id: 'e_eye_trauma',           label: '눈 외상 (충격·이물질)',             region: 'ENT_EYE', urgent: true },
  { id: 'e_nose_blocked',         label: '코막힘',                            region: 'ENT_EYE', urgent: false },
  { id: 'e_nose_runny',           label: '콧물',                              region: 'ENT_EYE', urgent: false },
  { id: 'e_nose_bleed',           label: '코피',                              region: 'ENT_EYE', urgent: false },
  { id: 'e_sinus_pain',           label: '얼굴·이마 통증 (부비동)',           region: 'ENT_EYE', urgent: false },
  { id: 'e_ear_pain',             label: '귀 통증',                           region: 'ENT_EYE', urgent: false },
  { id: 'e_ear_discharge',        label: '귀에서 분비물',                     region: 'ENT_EYE', urgent: false },
  { id: 'e_hearing_loss',         label: '청력 저하 (점진적)',                region: 'ENT_EYE', urgent: false },
  { id: 'e_hearing_loss_sudden',  label: '갑작스러운 청력 상실 (돌발성 난청)', region: 'ENT_EYE', urgent: true },
  { id: 'e_tinnitus',             label: '이명 (귀울림)',                     region: 'ENT_EYE', urgent: false },

  // ─── URO_OBGYN (비뇨·여성) — 13건, 응급 3건 ───────────────────────────
  { id: 'u_dysuria',              label: '배뇨 시 통증·작열감',               region: 'URO_OBGYN', urgent: false },
  { id: 'u_frequency',            label: '빈뇨 (자주 마려움)',                region: 'URO_OBGYN', urgent: false },
  { id: 'u_urgency',              label: '급박뇨 (참기 어려움)',              region: 'URO_OBGYN', urgent: false },
  { id: 'u_hematuria',            label: '소변에 피',                         region: 'URO_OBGYN', urgent: true },
  { id: 'u_flank_pain_severe',    label: '심한 옆구리 통증 (요로 결석 의심)',  region: 'URO_OBGYN', urgent: true },
  { id: 'u_pyuria_fever',         label: '소변 탁함 + 발열 (신우신염 의심)',  region: 'URO_OBGYN', urgent: true },
  { id: 'u_vaginal_discharge',    label: '질 분비물 (이상)',                  region: 'URO_OBGYN', urgent: false },
  { id: 'u_vaginal_itch',         label: '외음부 가려움',                     region: 'URO_OBGYN', urgent: false },
  { id: 'u_menstrual_irregular',  label: '월경 이상 (불규칙·과다·통증)',      region: 'URO_OBGYN', urgent: false },
  { id: 'u_pelvic_pain',          label: '아랫배·골반 통증',                  region: 'URO_OBGYN', urgent: false },
  { id: 'u_prostate_hesitancy',   label: '소변 시작 지연 / 잔뇨감 (남성)',    region: 'URO_OBGYN', urgent: false },
  { id: 'u_menopause_sx',         label: '안면홍조 / 발한 (갱년기)',          region: 'URO_OBGYN', urgent: false },
  { id: 'u_etc',                  label: '기타 (자유 입력)',                  region: 'URO_OBGYN', urgent: false },

  // ─── SYSTEMIC (전신·기분) — 14건, 응급 7건 (자살 충동 포함) ───────────
  { id: 'y_fever',                label: '발열 (37.5°C+)',                    region: 'SYSTEMIC', urgent: false },
  { id: 'y_fever_high',           label: '고열 (38.5°C+ / 3일+)',             region: 'SYSTEMIC', urgent: true },
  { id: 'y_chills',               label: '오한 / 떨림',                       region: 'SYSTEMIC', urgent: false },
  { id: 'y_fatigue',              label: '심한 피로',                         region: 'SYSTEMIC', urgent: false },
  { id: 'y_weight_loss',          label: '체중 감소 (의도치 않음)',           region: 'SYSTEMIC', urgent: true },
  { id: 'y_night_sweat',          label: '식은땀 / 야간 발한',                region: 'SYSTEMIC', urgent: true },
  { id: 'y_appetite_loss',        label: '식욕 부진',                         region: 'SYSTEMIC', urgent: false },
  { id: 'y_insomnia',             label: '불면',                              region: 'SYSTEMIC', urgent: false },
  { id: 'y_anxiety',              label: '불안 / 긴장',                       region: 'SYSTEMIC', urgent: false },
  { id: 'y_depression',           label: '우울 / 무기력',                     region: 'SYSTEMIC', urgent: false },
  { id: 'y_panic',                label: '공황 발작 (두근거림 + 호흡곤란 + 죽음 공포)', region: 'SYSTEMIC', urgent: true },
  { id: 'y_suicidal',             label: '자해·자살 충동',                    region: 'SYSTEMIC', urgent: true, specialBranch: 'suicide_1393' },
  { id: 'y_dehydration',          label: '심한 갈증 + 소변 감소 (탈수)',      region: 'SYSTEMIC', urgent: true },
  { id: 'y_etc',                  label: '기타 (자유 입력)',                  region: 'SYSTEMIC', urgent: false },
]

/** 응급 신호 개수 (검증용) */
export const URGENT_COUNT = SYMPTOMS.filter((s) => s.urgent).length

/** region → symptoms 매핑 (UI 효율) */
export function symptomsByRegion(region: import('./types').RegionId): Symptom[] {
  return SYMPTOMS.filter((s) => s.region === region)
}

/** id 조회 */
export function getSymptom(id: string): Symptom | undefined {
  return SYMPTOMS.find((s) => s.id === id)
}
