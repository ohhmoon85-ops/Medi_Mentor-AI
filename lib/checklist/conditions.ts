/**
 * D2-2 잠정 진단 카탈로그 (88건)
 *
 * urgent_triggers + combinations에서 참조하는 진단명을 메타 정보와 함께 정의.
 * UI에서 진단명 클릭 시 brief 설명 노출 (선택적 확장).
 */

import type { ConditionEntry } from './types'

export const CONDITIONS: ConditionEntry[] = [
  // ─── HEAD_FACE (9건, 응급 4) ────────────────────────────────────────
  { name: '긴장성 두통',        region: 'HEAD_FACE', urgent: false, specialty: 'FM',  brief: '가장 흔한 두통. 양측, 조이는 듯한 통증.' },
  { name: '편두통',             region: 'HEAD_FACE', urgent: false, specialty: 'NEU', brief: '한쪽 머리, 박동성. 빛·소리 민감, 구토 동반 가능.' },
  { name: '군발성 두통',        region: 'HEAD_FACE', urgent: false, specialty: 'NEU', brief: '한쪽 눈 주위 극심한 통증. 군발성으로 반복.' },
  { name: '부비동염',           region: 'HEAD_FACE', urgent: false, specialty: 'ENT', brief: '코막힘 + 얼굴 통증 + 누런 콧물.' },
  { name: '말초성 어지럼증',    region: 'HEAD_FACE', urgent: false, specialty: 'ENT', brief: '양성 발작성 체위 어지럼증. 움직임에 유발.' },
  { name: '뇌출혈',             region: 'HEAD_FACE', urgent: true,  specialty: 'NEU', brief: '벼락치는 듯한 극심한 두통. 즉시 119.' },
  { name: '뇌졸중',             region: 'HEAD_FACE', urgent: true,  specialty: 'NEU', brief: '얼굴 마비·발음 어눌·팔 마비. F.A.S.T. 즉시 119.' },
  { name: '뇌수막염',           region: 'HEAD_FACE', urgent: true,  specialty: 'IM',  brief: '발열 + 두통 + 목 뻣뻣함. 응급실.' },
  { name: '벨마비',             region: 'HEAD_FACE', urgent: false, specialty: 'NEU', brief: '편측 안면 마비. 뇌졸중과 감별 필요.' },

  // ─── NECK_CHEST (11건, 응급 5) ──────────────────────────────────────
  { name: '심근경색',           region: 'NECK_CHEST', urgent: true,  specialty: 'IM', brief: '쥐어짜는 가슴 통증 + 식은땀. 즉시 119.' },
  { name: '협심증',             region: 'NECK_CHEST', urgent: false, specialty: 'IM', brief: '활동 시 가슴 답답함. 휴식 시 호전.' },
  { name: '폐색전증',           region: 'NECK_CHEST', urgent: true,  specialty: 'IM', brief: '갑작스러운 호흡 곤란 + 흉통. 응급실.' },
  { name: '기흉',               region: 'NECK_CHEST', urgent: true,  specialty: 'CS', brief: '갑작스러운 일측 흉통 + 호흡 곤란. 응급실.' },
  { name: '늑간 신경통',        region: 'NECK_CHEST', urgent: false, specialty: 'IM', brief: '찌르는 듯한 흉통. 호흡·기침에 악화.' },
  { name: '역류성 식도염',      region: 'NECK_CHEST', urgent: false, specialty: 'IM', brief: '속쓰림 + 신물 + 목 이물감.' },
  { name: '편도염',             region: 'NECK_CHEST', urgent: false, specialty: 'ENT', brief: '목 통증 + 발열 + 삼킴 곤란.' },
  { name: '후두염',             region: 'NECK_CHEST', urgent: false, specialty: 'ENT', brief: '쉰 목소리 + 목 통증.' },
  { name: '기관지염 / 감기',    region: 'NECK_CHEST', urgent: false, specialty: 'IM',  brief: '기침 + 가래 + 미열. 1~2주 호전.' },
  { name: '폐렴',               region: 'NECK_CHEST', urgent: true,  specialty: 'IM',  brief: '고열 + 호흡 곤란 + 화농성 가래. 응급실.' },
  { name: '부정맥',             region: 'NECK_CHEST', urgent: false, specialty: 'IM',  brief: '두근거림 + 어지럼. 24시간 심전도 권고.' },

  // ─── ABDOMEN (12건, 응급 5) ─────────────────────────────────────────
  { name: '위염',               region: 'ABDOMEN', urgent: false, specialty: 'IM', brief: '명치 통증 + 메스꺼움. 식사 관련.' },
  { name: '위궤양',             region: 'ABDOMEN', urgent: false, specialty: 'IM', brief: '공복 시 명치 통증. 흑변 시 응급.' },
  { name: '충수염',             region: 'ABDOMEN', urgent: true,  specialty: 'GS', brief: '우하복부 통증 + 발열. 응급실 (수술).' },
  { name: '담낭염',             region: 'ABDOMEN', urgent: true,  specialty: 'GS', brief: '우상복부 통증 + 식사 후 악화. 응급실.' },
  { name: '췌장염',             region: 'ABDOMEN', urgent: true,  specialty: 'IM', brief: '명치 통증이 등으로 뻗침. 응급실.' },
  { name: '요로 결석',          region: 'ABDOMEN', urgent: false, specialty: 'URO', brief: '심한 옆구리 통증 + 혈뇨.' },
  { name: '장폐쇄',             region: 'ABDOMEN', urgent: true,  specialty: 'GS', brief: '복부 팽만 + 구토 + 가스 배출 안 됨. 응급실.' },
  { name: '과민성 대장 증후군', region: 'ABDOMEN', urgent: false, specialty: 'IM', brief: '복통 + 설사·변비 반복. 스트레스 관련.' },
  { name: '장염 / 식중독',      region: 'ABDOMEN', urgent: false, specialty: 'IM', brief: '설사 + 구토 + 미열.' },
  { name: '출혈성 장염',        region: 'ABDOMEN', urgent: true,  specialty: 'IM', brief: '혈변 + 발열. 응급실.' },
  { name: '변비',               region: 'ABDOMEN', urgent: false, specialty: 'IM', brief: '배변 곤란. 식이·수분 부족.' },
  { name: '상부 위장관 출혈',   region: 'ABDOMEN', urgent: true,  specialty: 'IM', brief: '토혈 또는 흑변. 즉시 119.' },

  // ─── LIMBS (11건, 응급 3) ───────────────────────────────────────────
  { name: '관절염',             region: 'LIMBS', urgent: false, specialty: 'OS', brief: '관절 통증·부종. 퇴행성 또는 염증성.' },
  { name: '류마티스 관절염',    region: 'LIMBS', urgent: false, specialty: 'IM', brief: '아침 강직 1시간+ . 대칭성. 류마티스 내과.' },
  { name: '통풍',               region: 'LIMBS', urgent: false, specialty: 'IM', brief: '엄지발가락 등 갑작스런 발적·통증.' },
  { name: '인대 손상 (염좌)',   region: 'LIMBS', urgent: false, specialty: 'OS', brief: '관절 삐끗 + 부음. 1~3주 회복.' },
  { name: '근육통',             region: 'LIMBS', urgent: false, specialty: 'OS', brief: '운동·자세 관련. 휴식·찜질.' },
  { name: '요통',               region: 'LIMBS', urgent: false, specialty: 'OS', brief: '허리 통증. 자세·근육 관련.' },
  { name: '디스크 (추간판 탈출증)', region: 'LIMBS', urgent: false, specialty: 'NS', brief: '허리 통증 + 다리 저림. 신경외과.' },
  { name: '외상 (열상·찰과)',   region: 'LIMBS', urgent: false, specialty: 'OS', brief: '소독 + 봉합 필요 여부 판단.' },
  { name: '골절',               region: 'LIMBS', urgent: true,  specialty: 'OS', brief: '변형·체중 부하 불가. 응급실.' },
  { name: '심부정맥혈전증 (DVT)', region: 'LIMBS', urgent: true,  specialty: 'IM', brief: '한쪽 다리 갑작스런 부음. 폐색전증 위험.' },
  { name: '사지 동맥 폐색증',   region: 'LIMBS', urgent: true,  specialty: 'CS', brief: '다리 차고 창백·통증. 즉시 119.' },

  // ─── SKIN (10건, 응급 1) ────────────────────────────────────────────
  { name: '두드러기',           region: 'SKIN', urgent: false, specialty: 'DERM', brief: '발진 + 가려움. 항히스타민.' },
  { name: '접촉성 피부염',      region: 'SKIN', urgent: false, specialty: 'DERM', brief: '국소 발진. 알레르겐·자극원 회피.' },
  { name: '아토피 / 습진',      region: 'SKIN', urgent: false, specialty: 'DERM', brief: '만성 가려움 + 건조. 보습 + 스테로이드.' },
  { name: '대상포진',           region: 'SKIN', urgent: false, specialty: 'DERM', brief: '편측 띠 모양 물집 + 통증. 72시간 내 항바이러스제.' },
  { name: '봉와직염',           region: 'SKIN', urgent: false, specialty: 'DERM', brief: '피부 발적 + 부종 + 열감. 항생제.' },
  { name: '피부암 감별',        region: 'SKIN', urgent: false, specialty: 'DERM', brief: '점·종괴 변화. 조직검사 권고.' },
  { name: '탈모',               region: 'SKIN', urgent: false, specialty: 'DERM', brief: '안드로겐성 또는 원형. 피부과 상담.' },
  { name: '손발톱 곰팡이',      region: 'SKIN', urgent: false, specialty: 'DERM', brief: '조갑 변색·변형. 항진균제.' },
  { name: '아나필락시스',       region: 'SKIN', urgent: true,  specialty: 'IM',   brief: '전신 두드러기 + 호흡 곤란. 즉시 119.' },
  { name: '건성 피부',          region: 'SKIN', urgent: false, specialty: 'DERM', brief: '건조·갈라짐. 보습.' },

  // ─── ENT_EYE (10건, 응급 3) ─────────────────────────────────────────
  { name: '결막염',             region: 'ENT_EYE', urgent: false, specialty: 'OPH', brief: '눈 충혈 + 분비물. 세균·바이러스·알레르기.' },
  { name: '다래끼 (맥립종)',    region: 'ENT_EYE', urgent: false, specialty: 'OPH', brief: '눈꺼풀 부종 + 통증.' },
  { name: '망막박리',           region: 'ENT_EYE', urgent: true,  specialty: 'OPH', brief: '갑작스러운 시력 저하·비문증. 응급실.' },
  { name: '안구 손상',          region: 'ENT_EYE', urgent: true,  specialty: 'OPH', brief: '외상 또는 이물질. 응급실.' },
  { name: '비염',               region: 'ENT_EYE', urgent: false, specialty: 'ENT', brief: '코막힘 + 콧물. 알레르기성·계절성.' },
  { name: '부비동염',           region: 'ENT_EYE', urgent: false, specialty: 'ENT', brief: '얼굴 통증 + 누런 콧물. 항생제 고려.' },
  { name: '중이염',             region: 'ENT_EYE', urgent: false, specialty: 'ENT', brief: '귀 통증 + 발열. 소아 흔함.' },
  { name: '외이도염',           region: 'ENT_EYE', urgent: false, specialty: 'ENT', brief: '귀 분비물 + 가려움.' },
  { name: '돌발성 난청',        region: 'ENT_EYE', urgent: true,  specialty: 'ENT', brief: '72시간 이내 치료 골든타임. 응급실.' },
  { name: '이명',               region: 'ENT_EYE', urgent: false, specialty: 'ENT', brief: '귀울림. 다양한 원인.' },

  // ─── URO_OBGYN (9건, 응급 3) ────────────────────────────────────────
  { name: '방광염',             region: 'URO_OBGYN', urgent: false, specialty: 'URO', brief: '배뇨통 + 빈뇨. 항생제.' },
  { name: '신우신염',           region: 'URO_OBGYN', urgent: true,  specialty: 'URO', brief: '발열 + 옆구리 통증. 응급실.' },
  { name: '요로 결석',          region: 'URO_OBGYN', urgent: true,  specialty: 'URO', brief: '심한 옆구리 통증 + 혈뇨. 응급실.' },
  { name: '전립선 비대',        region: 'URO_OBGYN', urgent: false, specialty: 'URO', brief: '소변 시작 지연 + 빈뇨 (남성).' },
  { name: '질염',               region: 'URO_OBGYN', urgent: false, specialty: 'OBGYN', brief: '분비물 이상 + 가려움.' },
  { name: '월경 이상',          region: 'URO_OBGYN', urgent: false, specialty: 'OBGYN', brief: '주기·양·통증 이상. 부인과 검진.' },
  { name: '갱년기 증후군',      region: 'URO_OBGYN', urgent: false, specialty: 'OBGYN', brief: '안면홍조·발한·불면.' },
  { name: '임신 합병증',        region: 'URO_OBGYN', urgent: true,  specialty: 'OBGYN', brief: '출혈·복통·자간전증. 응급실.' },
  { name: '혈뇨 (감별)',        region: 'URO_OBGYN', urgent: false, specialty: 'URO',   brief: '결석·종양·감염 감별 필요.' },

  // ─── SYSTEMIC (16건, 응급 12 — 자살 위기 포함) ──────────────────────
  { name: '감기 / 일반 감염',   region: 'SYSTEMIC', urgent: false, specialty: 'FM',  brief: '발열 + 기침. 1주 호전.' },
  { name: '고열 (중증 감염)',   region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '38.5°C 3일+. 응급실.' },
  { name: '독감 (인플루엔자)',  region: 'SYSTEMIC', urgent: false, specialty: 'IM',  brief: '고열 + 근육통 + 오한. 항바이러스제.' },
  { name: '코로나',             region: 'SYSTEMIC', urgent: false, specialty: 'IM',  brief: '기침 + 발열 + 후각 저하. 검사 권고.' },
  { name: '폐렴 (감별)',        region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '고열 + 호흡 곤란. 응급실.' },
  { name: '결핵 (감별)',        region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '체중 감소 + 야간 발한 + 만성 기침. 응급실 검진.' },
  { name: '악성 종양 감별',     region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '체중 감소 + 야간 발한. 정밀 검진.' },
  { name: '만성 피로',          region: 'SYSTEMIC', urgent: false, specialty: 'FM',  brief: '6개월+ 피로. 다양한 원인 검진.' },
  { name: '불면증',             region: 'SYSTEMIC', urgent: false, specialty: 'PSY', brief: '입면·유지 곤란. 수면 위생.' },
  { name: '불안 장애',          region: 'SYSTEMIC', urgent: false, specialty: 'PSY', brief: '지속적 불안. 인지행동치료.' },
  { name: '공황 발작',          region: 'SYSTEMIC', urgent: true,  specialty: 'PSY', brief: '돌발 두근거림 + 호흡곤란 + 죽음 공포. 심혈관 감별 필요.' },
  { name: '우울증',             region: 'SYSTEMIC', urgent: false, specialty: 'PSY', brief: '2주+ 우울·무기력. 정신과 상담.' },
  { name: '자살 위기',          region: 'SYSTEMIC', urgent: true,  specialty: 'PSY', brief: '자해·자살 충동. 즉시 1393.' },
  { name: '패혈증 의심',        region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '고열 + 탈수 + 의식 변화. 즉시 119.' },
  { name: '탈수',               region: 'SYSTEMIC', urgent: true,  specialty: 'IM',  brief: '심한 갈증 + 소변 감소. 응급실.' },
  { name: '식욕 부진 (감별)',   region: 'SYSTEMIC', urgent: false, specialty: 'IM',  brief: '체중 감소 동반 시 정밀 검진.' },
]

/** 조회 — 진단명 단위 */
export function getCondition(name: string): ConditionEntry | undefined {
  return CONDITIONS.find((c) => c.name === name)
}
