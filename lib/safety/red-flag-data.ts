/**
 * 8개 주증상별 Don't Miss 진단 매트릭스
 *
 * 진단 누락 시 치명적 결과를 초래하는 'cannot miss' 진단군.
 * 한국 응급의학회·미국 응급의학회(ACEP)·NICE 등 국제 임상 가이드라인
 * 및 임상적으로 확립된 cannot miss 진단 교육 체계에 기반한다.
 *
 * ⚠️ 출처 주의:
 *   source_guideline이 명시된 항목만 해당 가이드라인 출처를 가진다.
 *   명시되지 않은 항목은 임상적 expert consensus 수준이며,
 *   개별 인용은 9-C(RAG 시드 적재) 단계에서 확보한다.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

export interface RedFlagEntry {
  diagnosis: string
  icd10?: string
  specialty: SpecialtyCode
  rule_out_test: string
  why_critical: string
  patient_signs: string[]
  evidence_strength: 'high' | 'moderate' | 'expert_consensus'
  source_guideline?: string
  dont_miss_lay_term: string
}

// ─────────────────────────────────────────────────────────────
// 8개 주증상별 Don't Miss 매트릭스
// ─────────────────────────────────────────────────────────────

export const DONT_MISS_MATRIX: Record<string, RedFlagEntry[]> = {

  // ── 흉통 ──────────────────────────────────────────────────
  '흉통': [
    {
      diagnosis: '급성 심근경색',
      icd10: 'I21',
      specialty: 'EM',
      rule_out_test: 'EKG, troponin',
      why_critical: 'door-to-balloon time이 예후를 결정',
      patient_signs: ['식은땀', '왼팔 방사통', '왼팔 저림', '턱 통증', '갑자기', '숨 막힘'],
      evidence_strength: 'high',
      source_guideline: 'AHA/ACC 2021 Chest Pain Guideline',
      dont_miss_lay_term: '심장 응급 가능성',
    },
    {
      diagnosis: '대동맥박리',
      icd10: 'I71.0',
      specialty: 'EM',
      rule_out_test: 'CT angiography',
      why_critical: 'Stanford A형은 즉시 수술 미시행 시 사망률 시간당 1%',
      patient_signs: ['찢어지는', '등으로 방사', '등 통증', '갑자기 시작', '극심한'],
      evidence_strength: 'high',
      source_guideline: 'ESC 2014 Aortic Diseases Guideline',
      dont_miss_lay_term: '대동맥 응급 가능성',
    },
    {
      diagnosis: '폐색전증',
      icd10: 'I26',
      specialty: 'EM',
      rule_out_test: 'D-dimer, CT pulmonary angiography',
      why_critical: '대량 PE는 사망률 30% 이상',
      patient_signs: ['갑작스러운 호흡곤란', '한쪽 다리 부종', '다리 붓기', '실신'],
      evidence_strength: 'high',
      source_guideline: 'ESC 2019 PE Guideline',
      dont_miss_lay_term: '폐 혈전 응급 가능성',
    },
    {
      diagnosis: '긴장성기흉',
      icd10: 'J93.0',
      specialty: 'EM',
      rule_out_test: '청진, 흉부방사선',
      why_critical: '즉시 감압 미시행 시 순환부전',
      patient_signs: ['외상', '한쪽 가슴 통증', '숨쉬기 힘들'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '폐 공기 응급 가능성',
    },
  ],

  // ── 두통 ──────────────────────────────────────────────────
  '두통': [
    {
      diagnosis: '지주막하출혈(SAH)',
      icd10: 'I60',
      specialty: 'EM',
      rule_out_test: 'CT, 요추천자',
      why_critical: '재출혈 시 사망률 50%',
      patient_signs: ['생애 가장 심한', '갑자기 최고조', '구토', '목 뻣뻣', '의식 변화'],
      evidence_strength: 'high',
      dont_miss_lay_term: '뇌출혈 응급 가능성',
    },
    {
      diagnosis: '뇌수막염',
      icd10: 'G03',
      specialty: 'EM',
      rule_out_test: '요추천자, CSF 분석',
      why_critical: '세균성 수막염은 시간당 사망률 상승',
      patient_signs: ['발열', '목 뻣뻣', '의식 변화', '눈부심', '발진'],
      evidence_strength: 'high',
      dont_miss_lay_term: '뇌 감염 응급 가능성',
    },
    {
      diagnosis: '측두동맥염',
      icd10: 'M31.6',
      specialty: 'IM',
      rule_out_test: 'ESR/CRP, 측두동맥 생검',
      why_critical: '치료 지연 시 영구 시력 소실',
      patient_signs: ['관자놀이 통증', '50세 이상', '시력 변화', '씹을 때 턱 통증', '두피 압통'],
      evidence_strength: 'high',
      dont_miss_lay_term: '혈관 염증 응급 가능성',
    },
    {
      diagnosis: '급성 폐쇄각 녹내장',
      icd10: 'H40.2',
      specialty: 'OPH',
      rule_out_test: '안압 측정, 세극등 검사',
      why_critical: '24시간 내 시신경 영구 손상',
      patient_signs: ['편측 안구 통증', '시야 흐림', '구역', '구토', '빛 주변 무지개'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '눈 압력 응급 가능성',
    },
  ],

  // ── 복통 ──────────────────────────────────────────────────
  '복통': [
    {
      diagnosis: '복부대동맥류 파열',
      icd10: 'I71.3',
      specialty: 'EM',
      rule_out_test: 'CT, 침상 초음파',
      why_critical: '파열 후 사망률 80% 이상',
      patient_signs: ['60대 이상', '남성', '갑작스러운 등 통증', '실신', '박동성'],
      evidence_strength: 'high',
      dont_miss_lay_term: '복부 혈관 응급 가능성',
    },
    {
      diagnosis: '장간막 허혈',
      icd10: 'K55.0',
      specialty: 'GS',
      rule_out_test: 'CT angiography, 혈중 lactate',
      why_critical: '진단 6시간 초과 시 장 괴사',
      patient_signs: ['통증과 진찰 소견 불일치', '부정맥', '고령', '갑자기 심한 복통'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '장 혈류 응급 가능성',
    },
    {
      diagnosis: '이소성 임신 파열',
      icd10: 'O00',
      specialty: 'OBGYN',
      rule_out_test: 'β-hCG, 골반 초음파',
      why_critical: '복강 내 출혈로 쇼크',
      patient_signs: ['가임기 여성', '월경 지연', '편측 하복부 통증', '질출혈', '어지럼'],
      evidence_strength: 'high',
      source_guideline: 'ACOG Practice Bulletin on Ectopic Pregnancy',
      dont_miss_lay_term: '임신 관련 응급 가능성',
    },
    {
      diagnosis: '급성 충수염 천공',
      icd10: 'K35.2',
      specialty: 'GS',
      rule_out_test: 'CT, CBC',
      why_critical: '천공 후 복막염·패혈증',
      patient_signs: ['우하복부 통증', '발열', '식욕 저하', '반동 압통'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '충수염 응급 가능성',
    },
  ],

  // ── 요통 ──────────────────────────────────────────────────
  '요통': [
    {
      diagnosis: '마미증후군(Cauda equina syndrome)',
      icd10: 'G83.4',
      specialty: 'NS',
      rule_out_test: '응급 MRI',
      why_critical: '48시간 내 감압 안 하면 영구 마비·요실금',
      patient_signs: ['회음부 감각 이상', '항문 주변 감각 없음', '소변 못 봄', '대변 못 봄', '양측 다리 마비', '양쪽 다리 힘 빠짐'],
      evidence_strength: 'high',
      dont_miss_lay_term: '신경 압박 응급 가능성',
    },
    {
      diagnosis: '척추 압박골절',
      icd10: 'M48.5',
      specialty: 'OS',
      rule_out_test: 'X-ray, MRI',
      why_critical: '골다공증성 골절 후 추가 골절·사망률 상승',
      patient_signs: ['고령', '가벼운 외상', '키 감소', '갑작스러운 통증'],
      evidence_strength: 'moderate',
      dont_miss_lay_term: '척추 골절 가능성',
    },
    {
      diagnosis: '복부대동맥류 파열',
      icd10: 'I71.3',
      specialty: 'EM',
      rule_out_test: 'CT, 침상 초음파',
      why_critical: '요통으로 위장한 AAA 파열 — 사망률 80%',
      patient_signs: ['60대 이상 남성', '갑작스러운 통증', '복부 박동', '실신'],
      evidence_strength: 'high',
      dont_miss_lay_term: '복부 혈관 응급 가능성',
    },
    {
      diagnosis: '급성 신우신염',
      icd10: 'N10',
      specialty: 'IM',
      rule_out_test: '소변 검사, CBC, CT',
      why_critical: '패혈증 진행 가능',
      patient_signs: ['발열', '옆구리 통증', '배뇨통', '소변 볼 때 아픔', '오한'],
      evidence_strength: 'moderate',
      dont_miss_lay_term: '신장 감염 가능성',
    },
  ],

  // ── 어지럼증 ────────────────────────────────────────────────
  '어지럼증': [
    {
      diagnosis: '후순환 뇌졸중',
      icd10: 'I63',
      specialty: 'EM',
      rule_out_test: 'HINTS 검사, MRI',
      why_critical: '말초성으로 오인 빈도 높음 — 치료 지연 시 영구 손상',
      patient_signs: ['복시', '두 개로 보임', '발음 어눌', '편측 팔다리 힘 빠짐', '걷기 어려움', '안면 저림'],
      evidence_strength: 'high',
      source_guideline: 'AHA/ASA 2021 Stroke Guideline',
      dont_miss_lay_term: '뇌졸중 응급 가능성',
    },
    {
      diagnosis: '청신경종',
      icd10: 'D33.3',
      specialty: 'NS',
      rule_out_test: '뇌 MRI',
      why_critical: '진행성 청력 손실, 안면신경 마비 위험',
      patient_signs: ['한쪽 청력 저하', '한쪽 이명', '수개월 지속', '천천히 악화'],
      evidence_strength: 'moderate',
      dont_miss_lay_term: '청신경 이상 가능성',
    },
    {
      diagnosis: '심실성 부정맥',
      icd10: 'I47',
      specialty: 'IM',
      rule_out_test: 'EKG, Holter 모니터',
      why_critical: '실신·돌연사 위험',
      patient_signs: ['실신', '두근거림', '가슴 두근', '흉통 동반', '순간적으로 의식 잃음'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '심장 부정맥 응급 가능성',
    },
  ],

  // ── 시력 변화 ──────────────────────────────────────────────
  '시력 변화': [
    {
      diagnosis: '망막박리',
      icd10: 'H33.0',
      specialty: 'OPH',
      rule_out_test: '안저검사, 안구 초음파',
      why_critical: '24시간 내 수술 안 하면 영구 실명',
      patient_signs: ['갑작스러운 비문증', '날파리', '빛 번쩍', '커튼이 내려오는 느낌', '시야 가림'],
      evidence_strength: 'high',
      dont_miss_lay_term: '망막 응급 가능성',
    },
    {
      diagnosis: '급성 폐쇄각 녹내장',
      icd10: 'H40.2',
      specialty: 'OPH',
      rule_out_test: '안압 측정',
      why_critical: '24시간 내 시신경 영구 손상',
      patient_signs: ['편측 안구 통증', '구역', '빛 주변 무지개', '시야 흐림', '두통'],
      evidence_strength: 'high',
      dont_miss_lay_term: '눈 압력 응급 가능성',
    },
    {
      diagnosis: '시신경염',
      icd10: 'H46',
      specialty: 'NEU',
      rule_out_test: '뇌 MRI, 시야검사',
      why_critical: '다발성경화증 첫 발현일 수 있음',
      patient_signs: ['편측 시력 저하', '안구 움직일 때 통증', '색깔이 흐릿', '눈 움직임 통증'],
      evidence_strength: 'high',
      dont_miss_lay_term: '시신경 이상 가능성',
    },
  ],

  // ── 소아 발열 ──────────────────────────────────────────────
  '소아 발열': [
    {
      diagnosis: '가와사키병',
      icd10: 'M30.3',
      specialty: 'PED',
      rule_out_test: '심초음파, CBC, CRP, ESR',
      why_critical: '치료 지연 시 관상동맥류',
      patient_signs: ['5일 이상 열', '눈 충혈', '딸기혀', '손발 부종', '손발 껍질 벗겨짐', '목 림프절 부음'],
      evidence_strength: 'high',
      source_guideline: 'AHA 2017 Kawasaki Disease Scientific Statement',
      dont_miss_lay_term: '소아 혈관 응급 가능성',
    },
    {
      diagnosis: '수막구균 감염',
      icd10: 'A39',
      specialty: 'PED',
      rule_out_test: '요추천자, 혈액배양',
      why_critical: '24시간 내 사망 가능 — 점상출혈 발견 즉시 항생제',
      patient_signs: ['고열', '점상 출혈', '붉은 반점', '의식 저하', '목 뻣뻣', '빛 싫어함'],
      evidence_strength: 'high',
      dont_miss_lay_term: '뇌 감염 응급 가능성',
    },
    {
      diagnosis: '소아 충수염',
      icd10: 'K35',
      specialty: 'PED',
      rule_out_test: '복부 초음파, CT',
      why_critical: '소아는 천공률이 성인보다 높음',
      patient_signs: ['배 오른쪽 아래 통증', '밥 못 먹음', '식욕 없음', '열', '구토'],
      evidence_strength: 'expert_consensus',
      dont_miss_lay_term: '충수염 응급 가능성',
    },
  ],

  // ── 임산부 복통 ────────────────────────────────────────────
  '임산부 복통': [
    {
      diagnosis: '이소성 임신',
      icd10: 'O00',
      specialty: 'OBGYN',
      rule_out_test: 'β-hCG, 골반 초음파',
      why_critical: '파열 시 복강 내 출혈로 쇼크',
      patient_signs: ['임신 12주 이내', '편측 하복부 통증', '질출혈', '어지럼', '실신'],
      evidence_strength: 'high',
      source_guideline: 'ACOG Practice Bulletin on Ectopic Pregnancy',
      dont_miss_lay_term: '임신 관련 응급 가능성',
    },
    {
      diagnosis: '태반조기박리',
      icd10: 'O45',
      specialty: 'OBGYN',
      rule_out_test: '산과 초음파, NST',
      why_critical: '태아 사망·산모 DIC',
      patient_signs: ['임신 후반기', '심한 복통', '질출혈', '자궁 딱딱해짐', '태동 감소'],
      evidence_strength: 'high',
      source_guideline: 'ACOG Practice Bulletin on Placental Abruption',
      dont_miss_lay_term: '태반 응급 가능성',
    },
    {
      diagnosis: 'HELLP 증후군',
      icd10: 'O14.2',
      specialty: 'OBGYN',
      rule_out_test: 'CBC, 간기능검사, 혈소판',
      why_critical: '간 파열·DIC',
      patient_signs: ['임신 후반기', '오른쪽 위배 통증', '두통', '시야 흐림', '구역 구토'],
      evidence_strength: 'high',
      source_guideline: 'ACOG Hypertension in Pregnancy Task Force',
      dont_miss_lay_term: '임신 합병증 응급 가능성',
    },
  ],
}

// ─────────────────────────────────────────────────────────────
// 주증상 카테고리 감지 패턴 (한국어 자유 어순 양방향)
// ─────────────────────────────────────────────────────────────

export const CATEGORY_PATTERNS: Array<{
  category: string
  pattern: RegExp
  urgency: 'immediate' | 'urgent'
}> = [
  {
    category: '흉통',
    // 단독 '흉통' 키워드 제거 — "흉통이 가끔 있어요" FP 차단. 복합 패턴으로 대체.
    pattern: /(가슴|흉부).{0,15}(아프|아파|아픔|통증|쑤심|쑤셔|압박|답답|조임|뻐근|찌름|타는|쥐어짬)|(아프|아파|아픔|통증|쑤심|쑤셔|압박|답답|조임|뻐근|찌름|타는|쥐어짬).{0,15}(가슴|흉부)|(심한|극심한|갑자기|갑작스러운|평생\s*처음|쥐어짜는|쥐어짜듯).{0,5}흉통|흉통.{0,10}(극심|최악|참을\s*수\s*없|견딜\s*수\s*없|방사|식은땀|호흡)/,
    urgency: 'immediate',
  },
  {
    category: '두통',
    // SAH thunderclap 표현 명시 커버(망치·벼락·깨질 등) — 미보완 시 24h 내 사망률 30~40%.
    // 단독 '두통' 키워드 제거 — "두통이 좀 있어요" FP 차단. 임상 위험 수식어 복합 패턴으로 대체.
    pattern: /머리.{0,12}(아프|아파|아픔|통증|쑤심|쑤셔|지끈|쥐어|폭발|터질|찢어질|깨질|쪼개질)|(아프|아파|아픔|통증|쑤심|쑤셔|지끈|쥐어|폭발).{0,12}머리|(머리|뇌|두부).{0,15}(터질|찢어질|깨질|폭발할|쪼개질|망치)|(망치|벽돌|곤봉).{0,20}(머리|두통|아프|아파)|갑자기.{0,15}(극심한|평생\s*처음|최고).{0,10}(두통|머리|아프|아파)|(천둥|벼락).{0,5}(치는|치듯|같은|같듯).{0,10}(두통|머리)|(심한|극심한|갑자기|갑작스러운|평생\s*처음|최악의).{0,10}두통|두통.{0,10}(극심|최악|참을\s*수\s*없|견딜\s*수\s*없|구토|실신|발열)/,
    urgency: 'immediate',
  },
  {
    category: '복통',
    // 단독 '복통' 키워드 제거 — "복통이 좀 있어요" FP 차단. 복합 패턴으로 대체.
    pattern: /(배|복부|배꼽|위장|하복부|상복부|옆구리).{0,10}(아프|아파|아픔|통증|쑤심|쑤셔|꼬임|찌름|쥐어|뒤틀)|(아프|아파|아픔|통증|쑤심|쑤셔|꼬임|찌름|쥐어|뒤틀).{0,10}(배|복부|배꼽|하복부|상복부|옆구리)|(심한|극심한|갑자기|갑작스러운|참을\s*수\s*없는|견딜\s*수\s*없는).{0,5}복통|복통.{0,10}(극심|최악|참을\s*수\s*없|견딜\s*수\s*없|발열|출혈|기절|쓰러)/,
    urgency: 'immediate',
  },
  {
    category: '요통',
    // 단독 '요통' 키워드 제거 — 복합 패턴으로 대체.
    pattern: /(허리|요부).{0,10}(아프|아파|아픔|통증|쑤심|쑤셔|저려|묵직|뻐근|당김|찌름)|(아프|아파|아픔|통증|쑤심|쑤셔|저려|묵직|뻐근|당김|찌름).{0,10}(허리|요부)|(심한|극심한|갑자기|갑작스러운|참을\s*수\s*없는).{0,5}요통|요통.{0,10}(극심|최악|참을\s*수\s*없|견딜\s*수\s*없|마비|대소변|감각)/,
    urgency: 'urgent',
  },
  {
    category: '어지럼증',
    // 단독 어지럼·현기증 키워드 제거 — "어지럼증을 느낄 때가 있어요" FP 차단.
    // 발병 수식어(갑자기·심한) 또는 신경학적 동반 증상과의 복합 패턴만 허용.
    // 보행 실조(비틀·휘청)는 기능 장애 표현이므로 단독 유지.
    pattern: /(갑자기|갑작스럽게|갑작스러운|심한|극심한|심하게).{0,5}(어지럼|어지럽|어지러|현기증|현훈|빙빙|어질어질)|(어지럼|어지럽|어지러|현기증|현훈|빙빙|어질어질).{0,15}(구토|실신|쓰러|복시|발음|마비|힘\s*빠|걷기\s*어|서\s*있기|넘어)|비틀|휘청/,
    urgency: 'urgent',
  },
  {
    category: '시력 변화',
    // 형태론 보강 (9-F-4-Δ): 어두워(B1/B2/B8), 흐려·흐림(B5/B8만 — B1 추가 시 "눈이 가끔 흐려요" FP), 잘려(B5), 가림(B5)
    pattern: /(눈|시력|시야|안구).{0,10}(흐릿|침침|저하|안\s*보|못\s*보|이상|변화|어둡|어두워|검은\s*점|번쩍)|(흐릿|침침|안\s*보|못\s*보|어둡|어두워|번쩍).{0,10}(눈|시력|시야|보임)|눈앞.{0,10}(커튼|어두|장막)|(커튼|장막).{0,10}(내려|쳤|친)|시야.{0,15}(가려|가림|잘리|잘려|반\s*보|흐려|흐림)|(섬광|광시)|(날파리|먼지|점).{0,15}(보|떠다|움직|아른)|(한쪽|좌측|우측|왼쪽|오른쪽).{0,5}눈.{0,15}(안\s*보|못\s*보|어둡|어두워|흐릿|흐려|흐림)/,
    urgency: 'urgent',
  },
]

// ─────────────────────────────────────────────────────────────
// 인구학적 특수 케이스 감지 패턴
// ─────────────────────────────────────────────────────────────

export const FEVER_PATTERN = /발열|열이?\s*(남|나|있|오르|높)|고열/

export const ABDOMINAL_PATTERN = /(배|복부|배꼽|위장|하복부|상복부|옆구리).{0,10}(아프|아파|아픔|통증|쑤심|쑤셔|꼬임|찌름|쥐어|뒤틀)|(아프|아파|아픔|통증|쑤심|쑤셔|꼬임|찌름|쥐어|뒤틀).{0,10}(배|복부|배꼽|하복부|상복부|옆구리)|복통/

export const PREGNANCY_PATTERN = /임신|임산부|산모|태아|태반|임신\s*\d+\s*주/

export const MINOR_PATTERN = /소아|어린이|아이|아기|애기|\d+\s*(개월|살).{0,5}(아이|아기|아동|소아)|(아이|아기|아동|소아).{0,5}\d+\s*(개월|살)/
