/**
 * E-1 가족 대리 입력 감지 — M3-3 신설
 *
 * 설계 원칙:
 * - capturedDemographics(1인칭 LLM 기반) 와 독립된 별도 state
 * - 가족 호칭 표준 19개 기반 (v4 §1.2): 어머니·아버지·남편·아내·아들·딸·부모·형·동생·언니·할아버지·할머니·아이·아기·가족·엄마·아빠·오빠·누나
 * - J-2 준수: 존댓말 삽입어미(-시-) 포함 3인칭 표현 커버
 * - 탐색 우선순위: 소유격("저희/우리 호칭") → 조사 후행("호칭+조사")
 */

export type KinshipRelation =
  | '어머니' | '엄마' | '아버지' | '아빠'
  | '할머니' | '할아버지'
  | '남편' | '아내'
  | '아들' | '딸'
  | '형' | '오빠' | '언니' | '누나' | '동생'
  | '아이' | '아기'
  | '부모' | '가족'

export interface FamilyDemographics {
  isThirdPerson: boolean
  relation: KinshipRelation | null
  /** 호칭에서 추론한 성별 (확정 불가 시 null) */
  inferredSex: 'M' | 'F' | null
  /** 호칭에서 추론한 연령군 (확정 불가 시 null) */
  inferredAgeGroup: 'infant' | 'child' | 'adult' | 'elderly' | null
}

export const DEFAULT_FAMILY_DEMOGRAPHICS: FamilyDemographics = {
  isThirdPerson: false,
  relation: null,
  inferredSex: null,
  inferredAgeGroup: null,
}

// ─── 호칭별 메타데이터 + 조사 후행 감지 패턴 ────────────────────

interface KinshipEntry {
  relation: KinshipRelation
  /** 조사 후행 패턴: "호칭.{0,3}조사" */
  pattern: RegExp
  sex: 'M' | 'F' | null
  ageGroup: 'infant' | 'child' | 'adult' | 'elderly' | null
}

const KINSHIP_TABLE: KinshipEntry[] = [
  // ── 연장자 여성 ─────────────────────────────────────────────
  {
    relation: '어머니',
    pattern: /어머니.{0,3}(가|이|을|의|는|께서|께|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'elderly',
  },
  {
    relation: '엄마',
    pattern: /엄마.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'adult',
  },
  {
    relation: '할머니',
    pattern: /할머니.{0,3}(가|이|을|의|는|께서|께|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'elderly',
  },

  // ── 연장자 남성 ─────────────────────────────────────────────
  {
    relation: '아버지',
    pattern: /아버지.{0,3}(가|이|을|의|는|께서|께|한테|에게|도|서)/,
    sex: 'M', ageGroup: 'elderly',
  },
  {
    relation: '아빠',
    pattern: /아빠.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'M', ageGroup: 'adult',
  },
  {
    relation: '할아버지',
    pattern: /할아버지.{0,3}(가|이|을|의|는|께서|께|한테|에게|도|서)/,
    sex: 'M', ageGroup: 'elderly',
  },

  // ── 배우자 ──────────────────────────────────────────────────
  {
    relation: '남편',
    pattern: /남편.{0,3}(이|을|의|는|한테|에게|도|서)/,
    sex: 'M', ageGroup: 'adult',
  },
  {
    relation: '아내',
    pattern: /아내.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'adult',
  },

  // ── 자녀 ────────────────────────────────────────────────────
  {
    relation: '아들',
    pattern: /아들.{0,3}(이|을|의|는|한테|에게|이가|도|서)/,
    sex: 'M', ageGroup: 'child',
  },
  {
    relation: '딸',
    pattern: /딸.{0,3}(이|을|의|는|한테|에게|이가|도|서)/,
    sex: 'F', ageGroup: 'child',
  },

  // ── 형제자매 ────────────────────────────────────────────────
  {
    relation: '형',
    pattern: /형.{0,3}(이|을|의|는|한테|에게|이가|도|서)/,
    sex: 'M', ageGroup: 'adult',
  },
  {
    relation: '오빠',
    pattern: /오빠.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'M', ageGroup: 'adult',
  },
  {
    relation: '언니',
    pattern: /언니.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'adult',
  },
  {
    relation: '누나',
    pattern: /누나.{0,3}(가|를|의|는|한테|에게|도|서)/,
    sex: 'F', ageGroup: 'adult',
  },
  {
    relation: '동생',
    // J-2: "동생이", "동생이가", "동생한테" 등 — 남/여 미구분
    pattern: /동생.{0,3}(이|을|의|는|한테|에게|이가|도|서)/,
    sex: null, ageGroup: 'adult',
  },

  // ── 영유아·아동 ─────────────────────────────────────────────
  {
    relation: '아기',
    pattern: /아기.{0,3}(가|를|의|는|한테|에게|이가|도|서)/,
    sex: null, ageGroup: 'infant',
  },
  {
    relation: '아이',
    pattern: /아이.{0,3}(가|를|의|는|한테|에게|이가|도|서)/,
    sex: null, ageGroup: 'child',
  },

  // ── 복수·집합 ───────────────────────────────────────────────
  {
    relation: '부모',
    pattern: /부모.{0,3}(님|가|를|의|는|한테|에게|도|서)/,
    sex: null, ageGroup: 'elderly',
  },
  {
    relation: '가족',
    pattern: /가족.{0,3}(이|을|의|는|한테|에게|도|서)/,
    sex: null, ageGroup: null,
  },
]

// ─── 소유격 "저희/우리 + 호칭" 패턴 ─────────────────────────────

const POSSESSIVE_KINSHIP_PATTERN =
  /(?:저희|우리)\s*(어머니|아버지|엄마|아빠|할머니|할아버지|남편|아내|아들|딸|형|오빠|언니|누나|동생|아기|아이|부모|가족)/

// ─── 공개 API ─────────────────────────────────────────────────────

/**
 * 텍스트에서 가족 대리 입력 여부 및 호칭 메타데이터를 추출한다.
 * 1) 소유격("저희/우리 + 호칭") 우선 탐색
 * 2) 개별 조사 후행 패턴 탐색
 */
export function detectFamilyDemographics(text: string): FamilyDemographics {
  // 1) 소유격 우선
  const possMatch = text.match(POSSESSIVE_KINSHIP_PATTERN)
  if (possMatch) {
    const rel = possMatch[1] as KinshipRelation
    const entry = KINSHIP_TABLE.find((e) => e.relation === rel)
    if (entry) {
      return {
        isThirdPerson: true,
        relation: rel,
        inferredSex: entry.sex,
        inferredAgeGroup: entry.ageGroup,
      }
    }
  }

  // 2) 조사 후행 패턴
  for (const entry of KINSHIP_TABLE) {
    if (entry.pattern.test(text)) {
      return {
        isThirdPerson: true,
        relation: entry.relation,
        inferredSex: entry.sex,
        inferredAgeGroup: entry.ageGroup,
      }
    }
  }

  return DEFAULT_FAMILY_DEMOGRAPHICS
}

/** 텍스트가 가족 대리(3인칭) 입력인지 빠른 판별 */
export function isThirdPerson(text: string): boolean {
  return detectFamilyDemographics(text).isThirdPerson
}
