/**
 * RAG 지식베이스 시드 진단 목록
 * 보강 프롬프트 §3 기준 — 26개 진료과 코드를 모두 커버
 *
 * 시드 진단 분포:
 * - 비의뢰전용 17개과 (isReferralOnly:false) × 8~15개 목표
 *   단, PS(성형외과)는 5개 예외 — 아래 PS 배열 주석 참조
 * - 의뢰전용 9개과 (isReferralOnly:true) × 1~7개 (의사용 멘토 모드 전용)
 * - 합리적 목표 범위: 161~269개
 *
 * 현재 카운트: 186개 (비의뢰전용 17개과 165개 + 의뢰전용 9개과 21개)
 *
 * 각 항목의 구조:
 *   condition  : 진단명 (한국어, 1차 의료 표준 용어)
 *   enTerm     : 영문 PubMed 검색어
 *   icd10      : ICD-10 코드 (RAG 청크 메타데이터용)
 *   priority   : 'high' | 'medium' — 1차 PubMed 수집 우선순위
 *   pubmedQuery: PubMed E-utilities 최적화 검색식
 */

import type { SpecialtyCode } from './specialties'

export interface SeedCondition {
  condition: string
  enTerm: string
  icd10: string
  priority: 'high' | 'medium'
  pubmedQuery: string
}

export const SEED_CONDITIONS: Record<SpecialtyCode, SeedCondition[]> = {
  // ────────────────────────────────────────────────
  IM: [
    { condition: '본태성 고혈압',          enTerm: 'essential hypertension',           icd10: 'I10',   priority: 'high',   pubmedQuery: 'hypertension management guideline[TI] review[PT]' },
    { condition: '제2형 당뇨병',            enTerm: 'type 2 diabetes mellitus',         icd10: 'E11',   priority: 'high',   pubmedQuery: 'type 2 diabetes management guideline[TI] review[PT]' },
    { condition: '이상지질혈증',            enTerm: 'dyslipidemia',                     icd10: 'E78.5', priority: 'high',   pubmedQuery: 'dyslipidemia treatment guideline review[PT]' },
    { condition: '갑상선 기능저하증',       enTerm: 'hypothyroidism',                   icd10: 'E03.9', priority: 'high',   pubmedQuery: 'hypothyroidism diagnosis treatment review[PT]' },
    { condition: '갑상선 기능항진증',       enTerm: 'hyperthyroidism',                  icd10: 'E05.9', priority: 'medium', pubmedQuery: 'hyperthyroidism management review[PT]' },
    { condition: '위식도역류질환(GERD)',    enTerm: 'gastroesophageal reflux disease',   icd10: 'K21.0', priority: 'high',   pubmedQuery: 'GERD gastroesophageal reflux treatment guideline[TI] review[PT]' },
    { condition: '과민성장증후군',          enTerm: 'irritable bowel syndrome',         icd10: 'K58',   priority: 'high',   pubmedQuery: 'irritable bowel syndrome diagnosis treatment review[PT]' },
    { condition: '만성 B형 간염',           enTerm: 'chronic hepatitis B',              icd10: 'B18.1', priority: 'high',   pubmedQuery: 'chronic hepatitis B antiviral treatment guideline review[PT]' },
    { condition: '지방간',                  enTerm: 'non-alcoholic fatty liver disease', icd10: 'K76.0', priority: 'high',   pubmedQuery: 'NAFLD NASH management guideline review[PT]' },
    { condition: '철결핍성 빈혈',           enTerm: 'iron deficiency anemia',           icd10: 'D50',   priority: 'high',   pubmedQuery: 'iron deficiency anemia diagnosis treatment review[PT]' },
    { condition: '통풍',                    enTerm: 'gout',                             icd10: 'M10',   priority: 'high',   pubmedQuery: 'gout diagnosis management guideline review[PT]' },
    { condition: '하지불안증후군',          enTerm: 'restless legs syndrome',           icd10: 'G25.81',priority: 'medium', pubmedQuery: 'restless legs syndrome treatment review[PT]' },
    { condition: '만성 신부전',             enTerm: 'chronic kidney disease',           icd10: 'N18',   priority: 'high',   pubmedQuery: 'chronic kidney disease management guideline review[PT]' },
    { condition: '천식',                    enTerm: 'bronchial asthma',                 icd10: 'J45',   priority: 'high',   pubmedQuery: 'asthma management guideline review[PT]' },
    { condition: '만성 폐쇄성 폐질환',     enTerm: 'COPD',                             icd10: 'J44',   priority: 'high',   pubmedQuery: 'COPD management guideline review[PT]' },
  ],

  FM: [
    { condition: '상기도 감염',             enTerm: 'upper respiratory tract infection',icd10: 'J06.9', priority: 'high',   pubmedQuery: 'upper respiratory infection management primary care review[PT]' },
    { condition: '독감',                    enTerm: 'influenza',                        icd10: 'J11',   priority: 'high',   pubmedQuery: 'influenza treatment antiviral guideline review[PT]' },
    { condition: '급성 기관지염',           enTerm: 'acute bronchitis',                 icd10: 'J20',   priority: 'high',   pubmedQuery: 'acute bronchitis antibiotic treatment review[PT]' },
    { condition: '긴장형 두통',             enTerm: 'tension headache',                 icd10: 'G44.2', priority: 'high',   pubmedQuery: 'tension type headache treatment review[PT]' },
    { condition: '허리통증(비특이적)',      enTerm: 'nonspecific low back pain',        icd10: 'M54.5', priority: 'high',   pubmedQuery: 'nonspecific low back pain primary care management review[PT]' },
    { condition: '불면증',                  enTerm: 'insomnia',                         icd10: 'G47.00',priority: 'high',   pubmedQuery: 'insomnia cognitive behavioral treatment review[PT]' },
    { condition: '단순 인지',               enTerm: 'tinea infection',                  icd10: 'B35',   priority: 'medium', pubmedQuery: 'tinea infection treatment antifungal review[PT]' },
    { condition: '예방 접종 안내',          enTerm: 'adult vaccination',                icd10: 'Z23',   priority: 'high',   pubmedQuery: 'adult immunization schedule guideline review[PT]' },
    { condition: '건강검진 상담',           enTerm: 'preventive health screening',      icd10: 'Z00.0', priority: 'medium', pubmedQuery: 'preventive health screening guideline primary care review[PT]' },
    { condition: '비만',                    enTerm: 'obesity',                          icd10: 'E66',   priority: 'high',   pubmedQuery: 'obesity management lifestyle intervention review[PT]' },
    { condition: '금연 상담',               enTerm: 'smoking cessation',                icd10: 'Z71.6', priority: 'high',   pubmedQuery: 'smoking cessation pharmacotherapy guideline review[PT]' },
  ],

  PED: [
    { condition: '급성 비인두염',           enTerm: 'acute nasopharyngitis pediatric',  icd10: 'J06.9', priority: 'high',   pubmedQuery: 'pediatric nasopharyngitis treatment review[PT]' },
    { condition: '중이염',                  enTerm: 'acute otitis media',               icd10: 'H66.9', priority: 'high',   pubmedQuery: 'acute otitis media children antibiotic guideline review[PT]' },
    { condition: '아데노이드 비대',         enTerm: 'adenoid hypertrophy',              icd10: 'J35.2', priority: 'medium', pubmedQuery: 'adenoid hypertrophy children management review[PT]' },
    { condition: '소아 천식',               enTerm: 'pediatric asthma',                 icd10: 'J45',   priority: 'high',   pubmedQuery: 'pediatric asthma management guideline review[PT]' },
    { condition: '아토피 피부염',           enTerm: 'atopic dermatitis pediatric',      icd10: 'L20',   priority: 'high',   pubmedQuery: 'atopic dermatitis children treatment guideline review[PT]' },
    { condition: '성장 지연',               enTerm: 'growth delay children',            icd10: 'E34.3', priority: 'medium', pubmedQuery: 'growth failure pediatric evaluation review[PT]' },
    { condition: '발달 평가',               enTerm: 'developmental delay screening',    icd10: 'F80',   priority: 'high',   pubmedQuery: 'developmental screening pediatric guidelines review[PT]' },
    { condition: '예방접종 일정',           enTerm: 'childhood immunization schedule',  icd10: 'Z23',   priority: 'high',   pubmedQuery: 'childhood immunization schedule guideline review[PT]' },
    { condition: '소아 발열',               enTerm: 'fever in children',                icd10: 'R50.9', priority: 'high',   pubmedQuery: 'fever management children guideline review[PT]' },
    { condition: '영아구별',                enTerm: 'infantile colic',                  icd10: 'R10.4', priority: 'medium', pubmedQuery: 'infantile colic management review[PT]' },
    { condition: '장염',                    enTerm: 'pediatric gastroenteritis',         icd10: 'A09',   priority: 'high',   pubmedQuery: 'pediatric gastroenteritis rehydration management review[PT]' },
  ],

  NEU: [
    { condition: '편두통',                  enTerm: 'migraine',                         icd10: 'G43',   priority: 'high',   pubmedQuery: 'migraine treatment acute preventive guideline review[PT]' },
    { condition: '뇌졸중(허혈성)',          enTerm: 'ischemic stroke',                  icd10: 'I63',   priority: 'high',   pubmedQuery: 'ischemic stroke acute management guideline review[PT]' },
    { condition: '뇌졸중(출혈성)',          enTerm: 'hemorrhagic stroke',               icd10: 'I61',   priority: 'high',   pubmedQuery: 'intracerebral hemorrhage management guideline review[PT]' },
    { condition: '간질',                    enTerm: 'epilepsy',                         icd10: 'G40',   priority: 'high',   pubmedQuery: 'epilepsy treatment antiepileptic guideline review[PT]' },
    { condition: '파킨슨병',               enTerm: 'Parkinson disease',                 icd10: 'G20',   priority: 'high',   pubmedQuery: 'Parkinson disease management guideline review[PT]' },
    { condition: '치매',                    enTerm: 'dementia Alzheimer',               icd10: 'F00',   priority: 'high',   pubmedQuery: 'Alzheimer dementia management pharmacotherapy review[PT]' },
    { condition: '수면마비·기면증',        enTerm: 'narcolepsy sleep disorders',       icd10: 'G47.4', priority: 'medium', pubmedQuery: 'narcolepsy treatment review[PT]' },
    { condition: '이지러움증(말초성/중추성)',enTerm: 'vertigo peripheral central',      icd10: 'H81',   priority: 'high',   pubmedQuery: 'vertigo diagnosis treatment review[PT]' },
    { condition: '말초 신경병증',           enTerm: 'peripheral neuropathy',            icd10: 'G62.9', priority: 'high',   pubmedQuery: 'peripheral neuropathy diagnosis treatment review[PT]' },
  ],

  PSY: [
    { condition: '주요우울장애',            enTerm: 'major depressive disorder',        icd10: 'F32',   priority: 'high',   pubmedQuery: 'major depressive disorder treatment antidepressant guideline review[PT]' },
    { condition: '범불안장애',              enTerm: 'generalized anxiety disorder',     icd10: 'F41.1', priority: 'high',   pubmedQuery: 'generalized anxiety disorder treatment guideline review[PT]' },
    { condition: '공황장애',                enTerm: 'panic disorder',                   icd10: 'F41.0', priority: 'high',   pubmedQuery: 'panic disorder treatment CBT pharmacotherapy review[PT]' },
    { condition: '불면증',                  enTerm: 'insomnia psychiatric',             icd10: 'F51.0', priority: 'high',   pubmedQuery: 'insomnia CBT-I treatment guideline review[PT]' },
    { condition: '강박장애',                enTerm: 'obsessive compulsive disorder',    icd10: 'F42',   priority: 'high',   pubmedQuery: 'OCD treatment SSRI CBT guideline review[PT]' },
    { condition: '주의력결핍 과잉행동장애(ADHD)', enTerm: 'attention deficit hyperactivity disorder', icd10: 'F90', priority: 'high', pubmedQuery: 'ADHD treatment methylphenidate guideline review[PT]' },
    { condition: '알코올 사용 장애',        enTerm: 'alcohol use disorder',             icd10: 'F10.2', priority: 'high',   pubmedQuery: 'alcohol use disorder treatment guideline review[PT]' },
    { condition: '외상후스트레스장애',      enTerm: 'PTSD post-traumatic stress',       icd10: 'F43.1', priority: 'medium', pubmedQuery: 'PTSD treatment guideline review[PT]' },
    { condition: '양극성장애',              enTerm: 'bipolar disorder',                 icd10: 'F31',   priority: 'high',   pubmedQuery: 'bipolar disorder management mood stabilizer review[PT]' },
  ],

  DERM: [
    { condition: '아토피 피부염',           enTerm: 'atopic dermatitis',                icd10: 'L20',   priority: 'high',   pubmedQuery: 'atopic dermatitis treatment guideline review[PT]' },
    { condition: '건선',                    enTerm: 'psoriasis',                        icd10: 'L40',   priority: 'high',   pubmedQuery: 'psoriasis treatment biologic guideline review[PT]' },
    { condition: '두드러기',               enTerm: 'urticaria',                         icd10: 'L50',   priority: 'high',   pubmedQuery: 'chronic urticaria antihistamine treatment review[PT]' },
    { condition: '백선(무좀)',             enTerm: 'tinea pedis onychomycosis',          icd10: 'B35.3', priority: 'high',   pubmedQuery: 'tinea pedis onychomycosis antifungal treatment review[PT]' },
    { condition: '지루성 피부염',           enTerm: 'seborrheic dermatitis',            icd10: 'L21',   priority: 'high',   pubmedQuery: 'seborrheic dermatitis treatment review[PT]' },
    { condition: '여드름',                  enTerm: 'acne vulgaris',                    icd10: 'L70.0', priority: 'high',   pubmedQuery: 'acne vulgaris treatment topical systemic guideline review[PT]' },
    { condition: '접촉성 피부염',           enTerm: 'contact dermatitis',               icd10: 'L23',   priority: 'high',   pubmedQuery: 'contact dermatitis diagnosis treatment review[PT]' },
    { condition: '탈모',                    enTerm: 'alopecia areata androgenetic',     icd10: 'L63',   priority: 'high',   pubmedQuery: 'alopecia treatment minoxidil review[PT]' },
    { condition: '피부 종양',               enTerm: 'skin cancer melanoma basal cell',  icd10: 'C44',   priority: 'high',   pubmedQuery: 'skin cancer diagnosis management review[PT]' },
    { condition: '대상포진',                enTerm: 'herpes zoster',                    icd10: 'B02',   priority: 'high',   pubmedQuery: 'herpes zoster treatment antiviral guideline review[PT]' },
  ],

  GS: [
    { condition: '급성 충수염',             enTerm: 'acute appendicitis',               icd10: 'K35',   priority: 'high',   pubmedQuery: 'acute appendicitis diagnosis treatment surgery review[PT]' },
    { condition: '담낭결석',               enTerm: 'cholelithiasis',                    icd10: 'K80',   priority: 'high',   pubmedQuery: 'cholelithiasis cholecystectomy management review[PT]' },
    { condition: '담낭염',                  enTerm: 'acute cholecystitis',              icd10: 'K81.0', priority: 'high',   pubmedQuery: 'acute cholecystitis Tokyo guideline treatment review[PT]' },
    { condition: '서혜부 탈장',             enTerm: 'inguinal hernia',                  icd10: 'K40',   priority: 'high',   pubmedQuery: 'inguinal hernia repair laparoscopic open review[PT]' },
    { condition: '치질',                    enTerm: 'hemorrhoids',                      icd10: 'K64',   priority: 'high',   pubmedQuery: 'hemorrhoids treatment rubber band ligation review[PT]' },
    { condition: '치루',                    enTerm: 'anal fistula',                     icd10: 'K60.3', priority: 'medium', pubmedQuery: 'anal fistula fistulotomy treatment review[PT]' },
    { condition: '갑상선 결절',             enTerm: 'thyroid nodule',                   icd10: 'E04.1', priority: 'high',   pubmedQuery: 'thyroid nodule evaluation biopsy management review[PT]' },
    { condition: '유방 종괴',               enTerm: 'breast lump mass',                 icd10: 'N63',   priority: 'high',   pubmedQuery: 'breast mass evaluation imaging biopsy review[PT]' },
    { condition: '대장 용종',               enTerm: 'colorectal polyp',                 icd10: 'K63.5', priority: 'high',   pubmedQuery: 'colorectal polyp colonoscopy management review[PT]' },
  ],

  OS: [
    { condition: '요추 추간판탈출증',       enTerm: 'lumbar disc herniation',           icd10: 'M51.1', priority: 'high',   pubmedQuery: 'lumbar disc herniation conservative surgical treatment review[PT]' },
    { condition: '경추 추간판탈출증',       enTerm: 'cervical disc herniation',         icd10: 'M50.1', priority: 'high',   pubmedQuery: 'cervical disc herniation treatment conservative surgery review[PT]' },
    { condition: '척추관 협착증',           enTerm: 'lumbar spinal stenosis',           icd10: 'M48.0', priority: 'high',   pubmedQuery: 'lumbar spinal stenosis treatment decompression review[PT]' },
    { condition: '무릎 골관절염',           enTerm: 'knee osteoarthritis',              icd10: 'M17',   priority: 'high',   pubmedQuery: 'knee osteoarthritis management OARSI guideline review[PT]' },
    { condition: '회전근개 파열',           enTerm: 'rotator cuff tear',                icd10: 'M75.1', priority: 'high',   pubmedQuery: 'rotator cuff tear repair conservative treatment review[PT]' },
    { condition: '족저근막염',              enTerm: 'plantar fasciitis',                icd10: 'M72.2', priority: 'high',   pubmedQuery: 'plantar fasciitis treatment guideline review[PT]' },
    { condition: '십자인대 파열',           enTerm: 'ACL anterior cruciate ligament tear',icd10:'M23.61',priority: 'high',  pubmedQuery: 'ACL tear reconstruction conservative treatment review[PT]' },
    { condition: '오십견(유착성 관절낭염)', enTerm: 'adhesive capsulitis frozen shoulder',icd10:'M75.0', priority: 'high', pubmedQuery: 'frozen shoulder adhesive capsulitis treatment review[PT]' },
    { condition: '테니스엘보',              enTerm: 'lateral epicondylitis',            icd10: 'M77.1', priority: 'high',   pubmedQuery: 'lateral epicondylitis treatment PRP corticosteroid review[PT]' },
    { condition: '족관절 염좌',             enTerm: 'ankle sprain',                     icd10: 'S93.4', priority: 'high',   pubmedQuery: 'ankle sprain management rehabilitation review[PT]' },
    { condition: '골다공증',                enTerm: 'osteoporosis',                     icd10: 'M81',   priority: 'high',   pubmedQuery: 'osteoporosis prevention treatment bisphosphonate guideline review[PT]' },
    { condition: '척추측만증',              enTerm: 'scoliosis',                        icd10: 'M41',   priority: 'medium', pubmedQuery: 'scoliosis adolescent treatment bracing surgery review[PT]' },
    { condition: '골절(손목/대퇴 경부 등)', enTerm: 'fracture distal radius hip',       icd10: 'S52.5', priority: 'high',   pubmedQuery: 'osteoporotic fracture management surgical fixation review[PT]' },
    { condition: '스크루 건(건초염)',        enTerm: 'de Quervain tenosynovitis',        icd10: 'M65.4', priority: 'medium', pubmedQuery: 'de Quervain tenosynovitis treatment review[PT]' },
  ],

  NS: [
    { condition: '뇌출혈',                  enTerm: 'intracerebral hemorrhage',         icd10: 'I61',   priority: 'high',   pubmedQuery: 'intracerebral hemorrhage surgical treatment guideline review[PT]' },
    { condition: '뇌종양',                  enTerm: 'brain tumor glioma',               icd10: 'C71',   priority: 'high',   pubmedQuery: 'brain tumor glioma surgical treatment guideline review[PT]' },
    { condition: '척수 압박',               enTerm: 'spinal cord compression',          icd10: 'G95.2', priority: 'high',   pubmedQuery: 'spinal cord compression surgical treatment review[PT]' },
    { condition: '경막하혈종',              enTerm: 'subdural hematoma',                icd10: 'I62.0', priority: 'high',   pubmedQuery: 'subdural hematoma surgical treatment review[PT]' },
    { condition: '뇌동맥류',                enTerm: 'intracranial aneurysm',            icd10: 'I67.1', priority: 'high',   pubmedQuery: 'intracranial aneurysm clipping coiling treatment review[PT]' },
    { condition: '수두증',                  enTerm: 'hydrocephalus',                    icd10: 'G91',   priority: 'medium', pubmedQuery: 'hydrocephalus shunt treatment review[PT]' },
    { condition: '일차성 두통(신경외과)',   enTerm: 'secondary headache neurosurgical', icd10: 'G44',   priority: 'medium', pubmedQuery: 'secondary headache neurosurgical causes review[PT]' },
  ],

  CS: [
    { condition: '관상동맥질환(심장 협심증)',enTerm: 'coronary artery disease angina',  icd10: 'I25',   priority: 'high',   pubmedQuery: 'coronary artery disease CABG PCI guideline review[PT]' },
    { condition: '판막질환',                enTerm: 'valvular heart disease',           icd10: 'I35',   priority: 'high',   pubmedQuery: 'valvular heart disease surgical repair replacement review[PT]' },
    { condition: '폐암',                    enTerm: 'lung cancer surgery',              icd10: 'C34',   priority: 'high',   pubmedQuery: 'lung cancer surgical resection treatment review[PT]' },
    { condition: '기흉',                    enTerm: 'pneumothorax',                     icd10: 'J93',   priority: 'high',   pubmedQuery: 'pneumothorax management chest tube surgery review[PT]' },
    { condition: '대동맥류',                enTerm: 'aortic aneurysm',                  icd10: 'I71',   priority: 'high',   pubmedQuery: 'aortic aneurysm surgical endovascular treatment review[PT]' },
  ],

  PS: [
    // PS는 미용·재건 비중이 커서 1차 의료 부담이 작아 5개로 유지.
    // 다른 비의뢰전용 진료과의 8개 하한 적용에서 의도적으로 제외됨.
    { condition: '구순구개열',              enTerm: 'cleft lip palate',                 icd10: 'Q35',   priority: 'medium', pubmedQuery: 'cleft lip palate repair surgical treatment review[PT]' },
    { condition: '안면골 골절',             enTerm: 'facial bone fracture',             icd10: 'S02',   priority: 'high',   pubmedQuery: 'facial fracture surgical management review[PT]' },
    { condition: '화상',                    enTerm: 'burn wound management',            icd10: 'T30',   priority: 'high',   pubmedQuery: 'burn wound management skin graft review[PT]' },
    { condition: '화상 흉터 및 재건',      enTerm: 'scar reconstruction',              icd10: 'L90.5', priority: 'medium', pubmedQuery: 'scar treatment laser reconstruction review[PT]' },
    { condition: '지방 흡입술 합병증',     enTerm: 'liposuction complication',          icd10: 'T85.89',priority: 'medium', pubmedQuery: 'liposuction complication management review[PT]' },
  ],

  OBGYN: [
    { condition: '월경통(원발성/속발성)',   enTerm: 'dysmenorrhea primary secondary',   icd10: 'N94.4', priority: 'high',   pubmedQuery: 'dysmenorrhea treatment NSAID hormonal review[PT]' },
    { condition: '월경불순',               enTerm: 'irregular menstruation',            icd10: 'N92',   priority: 'high',   pubmedQuery: 'menstrual irregularity evaluation treatment review[PT]' },
    { condition: '다낭성 난소 증후군',     enTerm: 'polycystic ovary syndrome',         icd10: 'E28.2', priority: 'high',   pubmedQuery: 'PCOS diagnosis treatment guideline review[PT]' },
    { condition: '자궁근종',               enTerm: 'uterine fibroid leiomyoma',         icd10: 'D25',   priority: 'high',   pubmedQuery: 'uterine fibroid medical surgical treatment review[PT]' },
    { condition: '자궁내막증',             enTerm: 'endometriosis',                     icd10: 'N80',   priority: 'high',   pubmedQuery: 'endometriosis diagnosis hormonal surgical treatment review[PT]' },
    { condition: '질염(세균성/칸디다)',    enTerm: 'vaginitis bacterial candida',        icd10: 'N76',   priority: 'high',   pubmedQuery: 'bacterial vaginosis candida treatment guideline review[PT]' },
    { condition: '임신 중 이상 출혈',      enTerm: 'bleeding in pregnancy',             icd10: 'O20',   priority: 'high',   pubmedQuery: 'antepartum hemorrhage management guideline review[PT]' },
    { condition: '전자간증',               enTerm: 'preeclampsia',                      icd10: 'O14',   priority: 'high',   pubmedQuery: 'preeclampsia management guideline review[PT]' },
    { condition: '폐경기 증상',             enTerm: 'menopause HRT',                    icd10: 'N95.1', priority: 'high',   pubmedQuery: 'menopausal hormone therapy guideline review[PT]' },
  ],

  URO: [
    { condition: '요로감염',               enTerm: 'urinary tract infection',           icd10: 'N39.0', priority: 'high',   pubmedQuery: 'urinary tract infection antibiotic guideline review[PT]' },
    { condition: '전립선 비대증',          enTerm: 'benign prostatic hyperplasia',      icd10: 'N40',   priority: 'high',   pubmedQuery: 'BPH benign prostatic hyperplasia treatment guideline review[PT]' },
    { condition: '요석',                   enTerm: 'urolithiasis kidney stone',         icd10: 'N20',   priority: 'high',   pubmedQuery: 'urolithiasis kidney stone treatment ESWL review[PT]' },
    { condition: '요실금',                 enTerm: 'urinary incontinence',              icd10: 'N39.3', priority: 'high',   pubmedQuery: 'urinary incontinence treatment pelvic floor review[PT]' },
    { condition: '발기부전',               enTerm: 'erectile dysfunction',              icd10: 'N52',   priority: 'high',   pubmedQuery: 'erectile dysfunction treatment PDE5 inhibitor review[PT]' },
    { condition: '전립선암',               enTerm: 'prostate cancer',                   icd10: 'C61',   priority: 'high',   pubmedQuery: 'prostate cancer diagnosis treatment PSA guideline review[PT]' },
    { condition: '신우신염',               enTerm: 'pyelonephritis',                    icd10: 'N12',   priority: 'high',   pubmedQuery: 'pyelonephritis antibiotic treatment guideline review[PT]' },
    { condition: '만성 전립선염',          enTerm: 'chronic prostatitis',               icd10: 'N41.1', priority: 'high',   pubmedQuery: 'chronic prostatitis treatment antibiotic alpha-blocker review[PT]' },
    { condition: '야뇨증',                 enTerm: 'nocturia',                          icd10: 'R35.1', priority: 'high',   pubmedQuery: 'nocturia management desmopressin anticholinergic guideline review[PT]' },
  ],

  OPH: [
    { condition: '결막염(세균성/바이러스성/알레르기성)', enTerm: 'conjunctivitis bacterial viral allergic', icd10: 'H10', priority: 'high', pubmedQuery: 'conjunctivitis treatment antibiotic review[PT]' },
    { condition: '안구건조증',             enTerm: 'dry eye syndrome',                  icd10: 'H04.1', priority: 'high',   pubmedQuery: 'dry eye disease treatment artificial tears review[PT]' },
    { condition: '백내장',                 enTerm: 'cataract',                          icd10: 'H26',   priority: 'high',   pubmedQuery: 'cataract surgical management phacoemulsification review[PT]' },
    { condition: '녹내장',                 enTerm: 'glaucoma',                          icd10: 'H40',   priority: 'high',   pubmedQuery: 'glaucoma treatment IOP lowering guideline review[PT]' },
    { condition: '당뇨망막병증',           enTerm: 'diabetic retinopathy',              icd10: 'H36.0', priority: 'high',   pubmedQuery: 'diabetic retinopathy screening treatment review[PT]' },
    { condition: '근시·원시·난시',        enTerm: 'myopia hyperopia astigmatism',       icd10: 'H52',   priority: 'high',   pubmedQuery: 'myopia control spectacle contact lens review[PT]' },
    { condition: '다래끼',                 enTerm: 'stye hordeolum chalazion',          icd10: 'H00',   priority: 'medium', pubmedQuery: 'stye chalazion treatment review[PT]' },
    { condition: '비문증·광시증',          enTerm: 'floaters photopsia vitreous',       icd10: 'H43.9', priority: 'high',   pubmedQuery: 'vitreous floaters photopsia retinal detachment evaluation review[PT]' },
    { condition: '노안',                   enTerm: 'presbyopia',                        icd10: 'H52.4', priority: 'high',   pubmedQuery: 'presbyopia correction reading glasses contact lens review[PT]' },
  ],

  ENT: [
    { condition: '급성 부비동염',          enTerm: 'acute sinusitis rhinosinusitis',    icd10: 'J01',   priority: 'high',   pubmedQuery: 'acute sinusitis antibiotic treatment guideline review[PT]' },
    { condition: '만성 비염',              enTerm: 'chronic rhinitis',                  icd10: 'J31.0', priority: 'high',   pubmedQuery: 'chronic rhinitis treatment intranasal corticosteroid review[PT]' },
    { condition: '알레르기 비염',          enTerm: 'allergic rhinitis',                 icd10: 'J30',   priority: 'high',   pubmedQuery: 'allergic rhinitis ARIA guideline treatment review[PT]' },
    { condition: '편도염',                 enTerm: 'tonsillitis',                       icd10: 'J03',   priority: 'high',   pubmedQuery: 'tonsillitis antibiotic treatment tonsillectomy review[PT]' },
    { condition: '중이염',                 enTerm: 'otitis media',                      icd10: 'H66',   priority: 'high',   pubmedQuery: 'otitis media antibiotic treatment guideline review[PT]' },
    { condition: '난청(노인성)',           enTerm: 'presbycusis age-related hearing loss',icd10:'H91.1', priority: 'high',  pubmedQuery: 'age-related hearing loss treatment hearing aid review[PT]' },
    { condition: '이명',                   enTerm: 'tinnitus',                          icd10: 'H93.1', priority: 'high',   pubmedQuery: 'tinnitus management treatment review[PT]' },
    { condition: '코골이/수면무호흡',      enTerm: 'snoring obstructive sleep apnea',   icd10: 'G47.33',priority: 'high',   pubmedQuery: 'obstructive sleep apnea CPAP treatment guideline review[PT]' },
    { condition: '갑상선 결절(ENT)',       enTerm: 'thyroid nodule ENT',                icd10: 'E04.1', priority: 'medium', pubmedQuery: 'thyroid nodule FNA management review[PT]' },
  ],

  DENT: [
    { condition: '치아우식증(충치)',       enTerm: 'dental caries',                     icd10: 'K02',   priority: 'high',   pubmedQuery: 'dental caries prevention fluoride treatment review[PT]' },
    { condition: '치주염',                 enTerm: 'periodontitis',                     icd10: 'K05.3', priority: 'high',   pubmedQuery: 'periodontitis treatment scaling root planing review[PT]' },
    { condition: '치수염',                 enTerm: 'pulpitis',                          icd10: 'K04.0', priority: 'high',   pubmedQuery: 'pulpitis root canal treatment review[PT]' },
    { condition: '근관 치료 필요',         enTerm: 'root canal therapy endodontic',     icd10: 'K04',   priority: 'high',   pubmedQuery: 'root canal treatment endodontic review[PT]' },
    { condition: '사랑니 발치',            enTerm: 'third molar wisdom tooth extraction',icd10:'K01.1', priority: 'high',   pubmedQuery: 'third molar impaction extraction review[PT]' },
    { condition: '교합 이상',              enTerm: 'malocclusion',                      icd10: 'K07',   priority: 'medium', pubmedQuery: 'malocclusion orthodontic treatment review[PT]' },
    { condition: '측두하악관절 장애(TMD)', enTerm: 'temporomandibular disorder TMJ',    icd10: 'K07.6', priority: 'high',   pubmedQuery: 'temporomandibular disorder treatment occlusal splint review[PT]' },
    { condition: '구강 점막 이상',         enTerm: 'oral mucosal lesion',               icd10: 'K13',   priority: 'high',   pubmedQuery: 'oral mucosal lesion leukoplakia aphthous treatment review[PT]' },
    { condition: '구강건조증',             enTerm: 'xerostomia dry mouth',              icd10: 'K11.7', priority: 'medium', pubmedQuery: 'dry mouth xerostomia management review[PT]' },
  ],

  EM: [
    { condition: '흉통(감별)',             enTerm: 'chest pain emergency evaluation',   icd10: 'R07',   priority: 'high',   pubmedQuery: 'chest pain emergency differential diagnosis review[PT]' },
    { condition: '복통(급성)',             enTerm: 'acute abdominal pain emergency',    icd10: 'R10',   priority: 'high',   pubmedQuery: 'acute abdominal pain emergency evaluation review[PT]' },
    { condition: '의식 이상',              enTerm: 'altered consciousness emergency',   icd10: 'R41.3', priority: 'high',   pubmedQuery: 'altered mental status emergency evaluation review[PT]' },
    { condition: '아나필락시스',           enTerm: 'anaphylaxis',                       icd10: 'T78.2', priority: 'high',   pubmedQuery: 'anaphylaxis epinephrine management guideline review[PT]' },
    { condition: '열사병',                 enTerm: 'heat stroke',                       icd10: 'T67.0', priority: 'high',   pubmedQuery: 'heat stroke management cooling review[PT]' },
    { condition: '중독(다발성)',           enTerm: 'poisoning overdose emergency',      icd10: 'T65',   priority: 'high',   pubmedQuery: 'poisoning overdose emergency management review[PT]' },
    { condition: '심정지',                 enTerm: 'cardiac arrest resuscitation',      icd10: 'I46',   priority: 'high',   pubmedQuery: 'cardiac arrest CPR ALS guideline review[PT]' },
    { condition: '뇌졸중 의심',            enTerm: 'stroke triage emergency',           icd10: 'I63',   priority: 'high',   pubmedQuery: 'stroke emergency tPA thrombolysis guideline review[PT]' },
    { condition: '외상(다발성)',           enTerm: 'trauma multiple injury ATLS',       icd10: 'T07',   priority: 'high',   pubmedQuery: 'trauma ATLS management review[PT]' },
  ],

  REH: [
    { condition: '뇌졸중 후 재활',         enTerm: 'stroke rehabilitation',             icd10: 'I63',   priority: 'high',   pubmedQuery: 'stroke rehabilitation physiotherapy guideline review[PT]' },
    { condition: '척수손상 재활',          enTerm: 'spinal cord injury rehabilitation', icd10: 'T09.3', priority: 'high',   pubmedQuery: 'spinal cord injury rehabilitation review[PT]' },
    { condition: '근골격계 통증 재활',     enTerm: 'musculoskeletal pain rehabilitation',icd10:'M79.3', priority: 'high',   pubmedQuery: 'musculoskeletal pain exercise rehabilitation review[PT]' },
    { condition: '연하장애',               enTerm: 'dysphagia rehabilitation',          icd10: 'R13',   priority: 'high',   pubmedQuery: 'dysphagia swallowing rehabilitation review[PT]' },
    { condition: '뇌성마비 재활',          enTerm: 'cerebral palsy rehabilitation',     icd10: 'G80',   priority: 'medium', pubmedQuery: 'cerebral palsy rehabilitation therapy review[PT]' },
    { condition: '소아 발달 재활',         enTerm: 'pediatric developmental rehabilitation', icd10: 'F80', priority: 'medium', pubmedQuery: 'pediatric developmental rehabilitation review[PT]' },
    { condition: '노인 낙상 예방',         enTerm: 'fall prevention elderly',           icd10: 'R29.6', priority: 'high',   pubmedQuery: 'fall prevention elderly exercise balance rehabilitation review[PT]' },
    { condition: '수근관 증후군 재활',     enTerm: 'carpal tunnel syndrome conservative rehabilitation', icd10: 'G56.0', priority: 'high',   pubmedQuery: 'carpal tunnel syndrome conservative splint rehabilitation review[PT]' },
    { condition: '림프부종 관리',          enTerm: 'lymphedema management',             icd10: 'I89.0', priority: 'high',   pubmedQuery: 'lymphedema compression therapy manual drainage review[PT]' },
  ],

  PAIN: [
    { condition: '만성 요통',              enTerm: 'chronic low back pain',             icd10: 'M54.5', priority: 'high',   pubmedQuery: 'chronic low back pain interventional treatment review[PT]' },
    { condition: '경추성 두통',            enTerm: 'cervicogenic headache',             icd10: 'M53.0', priority: 'high',   pubmedQuery: 'cervicogenic headache nerve block treatment review[PT]' },
    { condition: '대상포진 후 신경통',     enTerm: 'post-herpetic neuralgia',           icd10: 'B02.2', priority: 'high',   pubmedQuery: 'postherpetic neuralgia treatment pregabalin review[PT]' },
    { condition: '복합부위통증증후군(CRPS)',enTerm: 'complex regional pain syndrome',   icd10: 'G90.5', priority: 'high',   pubmedQuery: 'CRPS complex regional pain syndrome treatment review[PT]' },
    { condition: '신경병증성 통증',        enTerm: 'neuropathic pain',                  icd10: 'G60',   priority: 'high',   pubmedQuery: 'neuropathic pain treatment gabapentin pregabalin review[PT]' },
    { condition: '근막통증증후군',         enTerm: 'myofascial pain syndrome trigger point', icd10: 'M79.1', priority: 'high',   pubmedQuery: 'myofascial pain syndrome trigger point injection review[PT]' },
    { condition: '군발두통 및 삼차신경통', enTerm: 'cluster headache trigeminal neuralgia', icd10: 'G44.0', priority: 'high',  pubmedQuery: 'cluster headache trigeminal neuralgia nerve block treatment review[PT]' },
    { condition: '암성 통증',             enTerm: 'cancer pain palliative',            icd10: 'G89.3', priority: 'high',   pubmedQuery: 'cancer pain opioid WHO analgesic ladder palliative care review[PT]' },
    { condition: '섬유근통',              enTerm: 'fibromyalgia',                      icd10: 'M79.7', priority: 'high',   pubmedQuery: 'fibromyalgia diagnosis treatment pregabalin duloxetine review[PT]' },
  ],

  // ── 의뢰 전용 진료과 — 의사용 멘토 모드 전용 ────────────────
  ANES: [
    { condition: '수술 전 마취 평가',      enTerm: 'preoperative anesthesia evaluation', icd10: 'Z01.81',priority: 'high',  pubmedQuery: 'preoperative assessment anesthesia risk review[PT]' },
    { condition: '만성통증 신경블록',      enTerm: 'chronic pain nerve block epidural', icd10: 'G89.2', priority: 'high',   pubmedQuery: 'chronic pain epidural steroid injection review[PT]' },
  ],
  RAD: [
    { condition: '영상검사 의뢰',          enTerm: 'imaging referral radiology',        icd10: 'Z13',   priority: 'medium', pubmedQuery: 'radiology imaging appropriateness criteria review[PT]' },
  ],
  PATH: [
    { condition: '조직 병리 진단',         enTerm: 'tissue biopsy pathology diagnosis', icd10: 'Z03',   priority: 'medium', pubmedQuery: 'tissue biopsy pathology diagnosis review[PT]' },
  ],
  LAB: [
    { condition: '검체 검사',              enTerm: 'laboratory test interpretation',    icd10: 'Z01.3', priority: 'medium', pubmedQuery: 'laboratory test interpretation clinical review[PT]' },
  ],
  NM: [
    { condition: '핵의학 영상',            enTerm: 'nuclear medicine imaging PET',      icd10: 'Z13',   priority: 'medium', pubmedQuery: 'PET scan FDG nuclear medicine clinical application review[PT]' },
  ],
  RO: [
    { condition: '방사선 치료 계획',       enTerm: 'radiation therapy cancer treatment', icd10: 'Z51.0', priority: 'medium', pubmedQuery: 'radiation therapy cancer IMRT SBRT review[PT]' },
  ],
  PM: [
    { condition: '건강검진 권고',          enTerm: 'health screening cancer prevention', icd10: 'Z12',   priority: 'medium', pubmedQuery: 'cancer screening guideline preventive medicine review[PT]' },
    { condition: '직업환경 평가',          enTerm: 'occupational health assessment',     icd10: 'Z57',   priority: 'medium', pubmedQuery: 'occupational health exposure assessment review[PT]' },
  ],
}

/** 전체 조건 리스트 (진료과 메타 포함) — RAG 적재 스크립트용 */
export interface SeedConditionWithSpecialty extends SeedCondition {
  specialty: SpecialtyCode
}

export function getAllSeedConditions(): SeedConditionWithSpecialty[] {
  return Object.entries(SEED_CONDITIONS).flatMap(([specialty, conditions]) =>
    conditions.map((c) => ({ ...c, specialty: specialty as SpecialtyCode }))
  )
}

/** 1차 의료 빈도 상위 5개과 우선 적재용 필터 */
export const PRIMARY_PRIORITY_SPECIALTIES: SpecialtyCode[] = ['IM', 'FM', 'PED', 'DERM', 'ENT']

export function getPriorityConditions(): SeedConditionWithSpecialty[] {
  return getAllSeedConditions().filter(
    (c) =>
      PRIMARY_PRIORITY_SPECIALTIES.includes(c.specialty) || c.priority === 'high'
  )
}
