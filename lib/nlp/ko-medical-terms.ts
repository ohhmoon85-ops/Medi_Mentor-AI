// 한국어 일상어 → 의학 용어 매핑

export const KO_MEDICAL_MAP: Record<string, string> = {
  // 통증
  '배가 아프다': 'abdominal pain',
  '배 아파': 'abdominal pain',
  '배통': 'abdominal pain',
  '무릎이 아프다': 'knee pain',
  '무릎 아파': 'knee pain',
  '허리가 아프다': 'low back pain',
  '허리통증': 'low back pain',
  '머리가 아프다': 'headache',
  '두통': 'headache',
  '가슴이 아프다': 'chest pain',
  '흉통': 'chest pain',
  '어깨 아파': 'shoulder pain',
  '목이 아프다': 'neck pain',
  '발목 아파': 'ankle pain',

  // 소화기
  '속이 쓰리다': 'heartburn / epigastric pain',
  '속쓰림': 'heartburn',
  '체했다': 'indigestion',
  '소화 안 돼': 'indigestion',
  '설사': 'diarrhea',
  '변비': 'constipation',
  '구토': 'vomiting',
  '메스껍다': 'nausea',
  '토할 것 같아': 'nausea',

  // 호흡기
  '기침': 'cough',
  '가래': 'sputum',
  '숨이 차다': 'dyspnea',
  '숨 막혀': 'dyspnea',
  '코가 막혀': 'nasal congestion',
  '콧물': 'rhinorrhea',
  '목이 아파': 'sore throat',
  '편도선 부었어': 'tonsilitis',

  // 전신
  '열이 나다': 'fever',
  '오한': 'chills',
  '피곤해': 'fatigue',
  '기운이 없다': 'fatigue / weakness',
  '어지럽다': 'dizziness',
  '눈앞이 빙빙': 'vertigo',
  '식은땀': 'diaphoresis',

  // 피부
  '두드러기': 'urticaria',
  '가렵다': 'pruritus',
  '붓다': 'edema / swelling',
  '빨개지다': 'erythema',

  // 비뇨기
  '소변이 자주 마렵다': 'urinary frequency',
  '소변 볼 때 아파': 'dysuria',
  '혈뇨': 'hematuria',
}

export function normalizeToMedical(koreanText: string): string[] {
  const found: string[] = []
  const lowerText = koreanText.toLowerCase()

  for (const [ko, en] of Object.entries(KO_MEDICAL_MAP)) {
    if (lowerText.includes(ko.toLowerCase())) {
      found.push(en)
    }
  }

  return found.length > 0 ? found : [koreanText]
}
