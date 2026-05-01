// 증상 키워드 → 진료과 매칭 (룰 기반 + LLM 보완)

const DEPARTMENT_RULES: { keywords: RegExp[]; departments: string[] }[] = [
  {
    keywords: [/무릎|관절|허리|골절|뼈|어깨|인대|척추/],
    departments: ['정형외과', '재활의학과'],
  },
  {
    keywords: [/가슴|심장|부정맥|고혈압|협심증/],
    departments: ['심장내과', '순환기내과'],
  },
  {
    keywords: [/복통|설사|구토|소화|위장|장|간|담낭/],
    departments: ['소화기내과', '외과'],
  },
  {
    keywords: [/두통|어지럼|뇌|신경|마비|경련|치매/],
    departments: ['신경과', '신경외과'],
  },
  {
    keywords: [/피부|두드러기|습진|여드름|건선/],
    departments: ['피부과'],
  },
  {
    keywords: [/눈|시력|결막|안압/],
    departments: ['안과'],
  },
  {
    keywords: [/귀|청력|이명|코|부비동|목|편도/],
    departments: ['이비인후과'],
  },
  {
    keywords: [/소변|신장|방광|전립선|요로/],
    departments: ['비뇨의학과', '신장내과'],
  },
  {
    keywords: [/임신|생리|자궁|난소|유방/],
    departments: ['산부인과'],
  },
  {
    keywords: [/어린이|소아|아이|신생아/],
    departments: ['소아청소년과'],
  },
  {
    keywords: [/당뇨|갑상선|호르몬|내분비/],
    departments: ['내분비내과'],
  },
  {
    keywords: [/기침|가래|폐|천식|결핵|호흡/],
    departments: ['호흡기내과', '흉부외과'],
  },
  {
    keywords: [/우울|불안|스트레스|수면|정신/],
    departments: ['정신건강의학과'],
  },
  {
    keywords: [/치아|잇몸|입안|구강/],
    departments: ['치과'],
  },
]

export interface DepartmentMatch {
  primary: string
  alternatives: string[]
}

export function matchDepartment(symptomText: string): DepartmentMatch {
  const matched = new Set<string>()

  for (const rule of DEPARTMENT_RULES) {
    if (rule.keywords.some((kw) => kw.test(symptomText))) {
      rule.departments.forEach((d) => matched.add(d))
    }
  }

  const departments = Array.from(matched)

  if (departments.length === 0) {
    return { primary: '가정의학과', alternatives: ['내과'] }
  }

  return {
    primary: departments[0],
    alternatives: departments.slice(1, 3),
  }
}
