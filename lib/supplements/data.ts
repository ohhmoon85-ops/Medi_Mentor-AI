/**
 * G5-3 건강기능식품 정보 모듈 — 초기 데이터 (20개 증상 매핑)
 *
 * 데이터 정책:
 * - notes 톤: "{성분}은 {기능}과 관련해 일반적으로 알려져 있습니다.
 *   효능을 의학적으로 보증하지 않으며, 복용 전 의사 또는 약사의 상담을 권장합니다."
 * - 식약처 인증 기능성 원료 기준. 임상 처방 대체 아님.
 * - relatedSpecialty: lib/constants/specialties.ts SpecialtyCode 정합
 */

import type { SymptomSupplementMapping } from './types'

const NOTE = (name: string, area: string) =>
  `${name}은(는) ${area}과 관련해 일반적으로 알려져 있습니다. 효능을 의학적으로 보증하지 않으며, 복용 전 의사 또는 약사의 상담을 권장합니다.`

export const SUPPLEMENT_DATA: SymptomSupplementMapping[] = [
  {
    symptomKey: 'knee_pain',
    symptomLabel: '무릎 통증',
    relatedSpecialty: 'OS',
    supplements: [
      { id: 'glucosamine', name: '글루코사민', knownFor: ['관절 건강', '연골 보호'], commonDoses: '1500mg/일', notes: NOTE('글루코사민', '관절 건강') },
      { id: 'chondroitin', name: '콘드로이친', knownFor: ['관절 건강'], commonDoses: '1200mg/일', notes: NOTE('콘드로이친', '관절 건강'), warningTags: ['항응고제 복용 시 주의'] },
      { id: 'msm', name: 'MSM', knownFor: ['관절·근육 건강'], commonDoses: '1500~3000mg/일', notes: NOTE('MSM', '관절·근육 건강') },
      { id: 'boswellia', name: '보스웰리아', knownFor: ['관절 건강'], commonDoses: '300~500mg/일', notes: NOTE('보스웰리아', '관절 건강') },
    ],
  },
  {
    symptomKey: 'joint_general',
    symptomLabel: '관절 일반',
    relatedSpecialty: 'OS',
    supplements: [
      { id: 'glucosamine', name: '글루코사민', knownFor: ['관절 건강'], commonDoses: '1500mg/일', notes: NOTE('글루코사민', '관절 건강') },
      { id: 'collagen', name: '콜라겐', knownFor: ['관절·연골 건강'], commonDoses: '5~10g/일', notes: NOTE('콜라겐', '관절·연골 건강') },
      { id: 'omega3', name: '오메가-3', knownFor: ['관절 염증 완화'], commonDoses: 'EPA+DHA 1000mg/일', notes: NOTE('오메가-3', '관절 염증 완화'), warningTags: ['항응고제 복용 시 주의'] },
    ],
  },
  {
    symptomKey: 'rhinitis',
    symptomLabel: '비염',
    relatedSpecialty: 'ENT',
    supplements: [
      { id: 'probiotics_rhinitis', name: '프로바이오틱스', knownFor: ['면역 균형', '알레르기 완화'], commonDoses: '1억 CFU/일', notes: NOTE('프로바이오틱스', '면역 균형') },
      { id: 'vitamin_c', name: '비타민C', knownFor: ['면역 기능'], commonDoses: '500~1000mg/일', notes: NOTE('비타민C', '면역 기능') },
      { id: 'rutin', name: '루테올린', knownFor: ['항히스타민 작용'], commonDoses: '100~200mg/일', notes: NOTE('루테올린', '알레르기 반응 완화') },
    ],
  },
  {
    symptomKey: 'hypertension',
    symptomLabel: '고혈압 보조',
    relatedSpecialty: 'IM',
    supplements: [
      { id: 'coq10', name: '코엔자임Q10', knownFor: ['혈압 관리 보조', '심장 건강'], commonDoses: '100~200mg/일', notes: NOTE('코엔자임Q10', '혈압 관리 보조'), warningTags: ['항고혈압제와 병용 시 주의'] },
      { id: 'omega3', name: '오메가-3', knownFor: ['혈압 관리', '심혈관 건강'], commonDoses: 'EPA+DHA 1000mg/일', notes: NOTE('오메가-3', '혈압·혈관 건강'), warningTags: ['항응고제 복용 시 주의'] },
      { id: 'magnesium', name: '마그네슘', knownFor: ['혈압 조절 보조'], commonDoses: '300~400mg/일', notes: NOTE('마그네슘', '혈압 조절 보조') },
    ],
  },
  {
    symptomKey: 'hyperlipidemia',
    symptomLabel: '고지혈증 보조',
    relatedSpecialty: 'IM',
    supplements: [
      { id: 'omega3', name: '오메가-3', knownFor: ['중성지방 관리'], commonDoses: 'EPA+DHA 2000mg/일', notes: NOTE('오메가-3', '중성지방 관리') },
      { id: 'red_yeast_rice', name: '홍국', knownFor: ['콜레스테롤 관리'], commonDoses: '1200mg/일', notes: NOTE('홍국', '콜레스테롤 관리'), warningTags: ['스타틴 병용 금기', '간기능 이상 시 주의'] },
      { id: 'policosanol', name: '폴리코사놀', knownFor: ['콜레스테롤 관리'], commonDoses: '10~20mg/일', notes: NOTE('폴리코사놀', '콜레스테롤 관리') },
    ],
  },
  {
    symptomKey: 'immune',
    symptomLabel: '면역력',
    relatedSpecialty: 'FM',
    supplements: [
      { id: 'vitamin_d', name: '비타민D', knownFor: ['면역 기능', '뼈 건강'], commonDoses: '1000~2000IU/일', notes: NOTE('비타민D', '면역 기능') },
      { id: 'zinc', name: '아연', knownFor: ['면역 기능'], commonDoses: '15mg/일', notes: NOTE('아연', '면역 기능') },
      { id: 'selenium', name: '셀레늄', knownFor: ['항산화·면역'], commonDoses: '55µg/일', notes: NOTE('셀레늄', '항산화 작용') },
      { id: 'probiotics_immune', name: '프로바이오틱스', knownFor: ['장-면역 축'], commonDoses: '1억 CFU/일', notes: NOTE('프로바이오틱스', '장-면역 균형') },
    ],
  },
  {
    symptomKey: 'fatigue',
    symptomLabel: '피로',
    relatedSpecialty: 'FM',
    supplements: [
      { id: 'vitamin_b_complex', name: '비타민B군', knownFor: ['에너지 대사', '피로 완화'], commonDoses: '1정/일', notes: NOTE('비타민B군', '에너지 대사') },
      { id: 'coq10', name: '코엔자임Q10', knownFor: ['세포 에너지'], commonDoses: '100mg/일', notes: NOTE('코엔자임Q10', '세포 에너지 생성') },
      { id: 'magnesium', name: '마그네슘', knownFor: ['근육·신경 기능'], commonDoses: '300mg/일', notes: NOTE('마그네슘', '근육·신경 기능') },
    ],
  },
  {
    symptomKey: 'eye_health',
    symptomLabel: '눈 건강',
    relatedSpecialty: 'OPH',
    supplements: [
      { id: 'lutein', name: '루테인', knownFor: ['황반 건강', '시력 보호'], commonDoses: '10~20mg/일', notes: NOTE('루테인', '황반 건강') },
      { id: 'zeaxanthin', name: '지아잔틴', knownFor: ['황반·시력'], commonDoses: '2mg/일', notes: NOTE('지아잔틴', '황반 건강') },
      { id: 'bilberry', name: '빌베리', knownFor: ['눈 피로 완화'], commonDoses: '160mg/일', notes: NOTE('빌베리', '눈 피로 완화') },
      { id: 'omega3', name: '오메가-3', knownFor: ['건조한 눈'], commonDoses: 'EPA+DHA 1000mg/일', notes: NOTE('오메가-3', '건조한 눈') },
    ],
  },
  {
    symptomKey: 'liver',
    symptomLabel: '간 건강',
    relatedSpecialty: 'IM',
    supplements: [
      { id: 'milk_thistle', name: '밀크씨슬', knownFor: ['간 건강'], commonDoses: '실리마린 130mg/일', notes: NOTE('밀크씨슬', '간 기능 보호') },
      { id: 'udca', name: 'UDCA(우르소데옥시콜산)', knownFor: ['간 기능'], commonDoses: '의사 처방', notes: NOTE('UDCA', '간 기능'), warningTags: ['의사 처방 필수'] },
      { id: 'glutathione', name: '글루타치온', knownFor: ['항산화·간 건강'], commonDoses: '250~500mg/일', notes: NOTE('글루타치온', '항산화·간 건강') },
    ],
  },
  {
    symptomKey: 'stomach',
    symptomLabel: '위 건강',
    relatedSpecialty: 'IM',
    supplements: [
      { id: 'probiotics_stomach', name: '프로바이오틱스', knownFor: ['위·장 균형'], commonDoses: '1억 CFU/일', notes: NOTE('프로바이오틱스', '위·장 균형') },
      { id: 'aloe', name: '알로에', knownFor: ['위 점막 보호'], commonDoses: '100~200mg/일', notes: NOTE('알로에', '위 점막 보호'), warningTags: ['임산부 주의'] },
    ],
  },
  {
    symptomKey: 'intestinal',
    symptomLabel: '장 건강',
    relatedSpecialty: 'IM',
    supplements: [
      { id: 'probiotics_intestine', name: '프로바이오틱스', knownFor: ['장 건강'], commonDoses: '1억 CFU/일', notes: NOTE('프로바이오틱스', '장 건강') },
      { id: 'psyllium', name: '차전자피', knownFor: ['장 운동'], commonDoses: '5~10g/일', notes: NOTE('차전자피', '장 운동') },
      { id: 'glutamine', name: '글루타민', knownFor: ['장 점막 회복'], commonDoses: '5g/일', notes: NOTE('글루타민', '장 점막 회복') },
    ],
  },
  {
    symptomKey: 'bone',
    symptomLabel: '뼈 건강',
    relatedSpecialty: 'OS',
    supplements: [
      { id: 'calcium', name: '칼슘', knownFor: ['뼈 건강'], commonDoses: '600~1000mg/일', notes: NOTE('칼슘', '뼈 건강') },
      { id: 'vitamin_d', name: '비타민D', knownFor: ['칼슘 흡수·뼈 건강'], commonDoses: '1000~2000IU/일', notes: NOTE('비타민D', '칼슘 흡수·뼈 건강') },
      { id: 'magnesium', name: '마그네슘', knownFor: ['뼈·근육 기능'], commonDoses: '300mg/일', notes: NOTE('마그네슘', '뼈·근육 기능') },
    ],
  },
  {
    symptomKey: 'hair',
    symptomLabel: '모발',
    relatedSpecialty: 'DERM',
    supplements: [
      { id: 'biotin', name: '비오틴', knownFor: ['모발·손톱 건강'], commonDoses: '300~1000µg/일', notes: NOTE('비오틴', '모발·손톱 건강') },
      { id: 'zinc', name: '아연', knownFor: ['모발 건강'], commonDoses: '15mg/일', notes: NOTE('아연', '모발 건강') },
      { id: 'pantothenic_acid', name: '판토텐산', knownFor: ['모발 영양'], commonDoses: '5~10mg/일', notes: NOTE('판토텐산', '모발 영양') },
    ],
  },
  {
    symptomKey: 'skin',
    symptomLabel: '피부',
    relatedSpecialty: 'DERM',
    supplements: [
      { id: 'collagen', name: '콜라겐', knownFor: ['피부 탄력·수분'], commonDoses: '5~10g/일', notes: NOTE('콜라겐', '피부 탄력·수분') },
      { id: 'vitamin_c', name: '비타민C', knownFor: ['콜라겐 합성·항산화'], commonDoses: '500~1000mg/일', notes: NOTE('비타민C', '항산화·콜라겐 합성') },
      { id: 'hyaluronic_acid', name: '히알루론산', knownFor: ['피부 수분'], commonDoses: '120~200mg/일', notes: NOTE('히알루론산', '피부 수분') },
    ],
  },
  {
    symptomKey: 'sleep',
    symptomLabel: '수면',
    relatedSpecialty: 'PSY',
    supplements: [
      { id: 'magnesium', name: '마그네슘', knownFor: ['수면 질 보조'], commonDoses: '300~400mg/일', notes: NOTE('마그네슘', '수면 질 보조') },
      { id: 'melatonin', name: '멜라토닌', knownFor: ['수면 유도'], commonDoses: '0.5~3mg/취침 전', notes: NOTE('멜라토닌', '수면 유도'), warningTags: ['장기 복용 시 의사 상담'] },
      { id: 'l_theanine', name: 'L-테아닌', knownFor: ['이완·수면'], commonDoses: '100~200mg/일', notes: NOTE('L-테아닌', '이완·수면') },
    ],
  },
  {
    symptomKey: 'stress',
    symptomLabel: '스트레스',
    relatedSpecialty: 'PSY',
    supplements: [
      { id: 'magnesium', name: '마그네슘', knownFor: ['신경 안정'], commonDoses: '300mg/일', notes: NOTE('마그네슘', '신경 안정') },
      { id: 'l_theanine', name: 'L-테아닌', knownFor: ['이완·스트레스 완화'], commonDoses: '100~200mg/일', notes: NOTE('L-테아닌', '이완·스트레스 완화') },
      { id: 'ashwagandha', name: '아슈와간다', knownFor: ['스트레스 적응'], commonDoses: '300~600mg/일', notes: NOTE('아슈와간다', '스트레스 적응'), warningTags: ['임산부 금기', '갑상선 약 병용 시 주의'] },
    ],
  },
  {
    symptomKey: 'memory',
    symptomLabel: '기억력',
    relatedSpecialty: 'NEU',
    supplements: [
      { id: 'omega3', name: '오메가-3', knownFor: ['인지 기능'], commonDoses: 'DHA 500mg/일', notes: NOTE('오메가-3', '인지 기능') },
      { id: 'phosphatidylserine', name: '포스파티딜세린', knownFor: ['기억력 보조'], commonDoses: '100~300mg/일', notes: NOTE('포스파티딜세린', '기억력 보조') },
      { id: 'ginkgo', name: '은행잎', knownFor: ['혈류·기억력'], commonDoses: '120~240mg/일', notes: NOTE('은행잎 추출물', '혈류 개선'), warningTags: ['항응고제 복용 시 주의'] },
    ],
  },
  {
    symptomKey: 'menopause',
    symptomLabel: '갱년기 여성',
    relatedSpecialty: 'OBGYN',
    supplements: [
      { id: 'black_cohosh', name: '블랙코호시', knownFor: ['갱년기 증상 완화'], commonDoses: '20~40mg/일', notes: NOTE('블랙코호시', '갱년기 증상 완화'), warningTags: ['간기능 이상 시 주의'] },
      { id: 'soy_isoflavone', name: '대두 이소플라본', knownFor: ['여성 호르몬 균형'], commonDoses: '40~80mg/일', notes: NOTE('대두 이소플라본', '여성 호르몬 균형'), warningTags: ['호르몬 민감 질환 시 주의'] },
      { id: 'evening_primrose', name: '감마리놀렌산(달맞이꽃 종자유)', knownFor: ['갱년기 피부·관절'], commonDoses: '1000mg/일', notes: NOTE('감마리놀렌산', '갱년기 피부·관절') },
    ],
  },
  {
    symptomKey: 'prostate',
    symptomLabel: '전립선 남성',
    relatedSpecialty: 'URO',
    supplements: [
      { id: 'saw_palmetto', name: '쏘팔메토', knownFor: ['전립선 건강'], commonDoses: '320mg/일', notes: NOTE('쏘팔메토', '전립선 건강') },
      { id: 'zinc', name: '아연', knownFor: ['전립선·생식 건강'], commonDoses: '15mg/일', notes: NOTE('아연', '전립선·생식 건강') },
      { id: 'lycopene', name: '라이코펜', knownFor: ['전립선 건강·항산화'], commonDoses: '15~30mg/일', notes: NOTE('라이코펜', '전립선 건강') },
    ],
  },
  {
    symptomKey: 'general_wellness',
    symptomLabel: '일반 건강',
    relatedSpecialty: 'FM',
    supplements: [
      { id: 'multivitamin', name: '종합비타민', knownFor: ['종합 영양'], commonDoses: '1정/일', notes: NOTE('종합비타민', '종합 영양') },
      { id: 'omega3', name: '오메가-3', knownFor: ['심혈관·뇌 건강'], commonDoses: 'EPA+DHA 1000mg/일', notes: NOTE('오메가-3', '심혈관·뇌 건강') },
      { id: 'vitamin_d', name: '비타민D', knownFor: ['뼈·면역'], commonDoses: '1000IU/일', notes: NOTE('비타민D', '뼈·면역') },
    ],
  },
]
