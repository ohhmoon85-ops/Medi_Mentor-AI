/**
 * G1-2 라우팅 정책 테이블 — 자문 회신 반영 완료 (2026-05-16)
 *
 * 8개 의제 (AGENDA-12 ~ AGENDA-19): 황 교수 구두 승인 2026-05-16
 * trigger_conditions: §10 기준값 + 의뢰서 v2 보충본 예상 조건 반영
 *
 * ★ 주의: recommendation-engine.ts 직접 수정 금지.
 *   본 테이블은 별도 통합 wrapper(미구현)에서 사용 예정.
 */

import type { SpecialtyCode } from '@/lib/constants/specialties'

// ─── 타입 정의 ─────────────────────────────────────────────────

export type TriageLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export type ReviewStatus = 'pending' | 'approved' | 'modified' | 'rejected'

export interface TriggerCondition {
  type: 'AND' | 'OR' | 'LEAF'
  /** LEAF 노드에서만 사용 */
  field?: string
  operator?: 'eq' | 'in' | 'gte' | 'lte' | 'contains' | 'any_of'
  value?: unknown
  /** AND/OR 노드에서만 사용 */
  conditions?: TriggerCondition[]
  /** 조건 설명 */
  description?: string
}

export interface RoutingPolicy {
  policy_id: string
  description: string
  trigger_conditions: TriggerCondition[]
  target_triage_level: TriageLevel
  /** 트리거 시 강제 라우팅 경로 (optional) */
  forced_routing?: string
  /** 트리거 시 권장 카드 (optional) */
  forced_card?: string
  clinical_review_status: ReviewStatus
  approved_by: string | null
  approved_date: string | null
  notes: string
}

// ─── 정책 테이블 (8개 의제 — 황 교수 구두 승인 2026-05-16) ────

export const ROUTING_POLICY_TABLE: readonly RoutingPolicy[] = [
  {
    policy_id:   'AGENDA-12',
    description: 'TIA 가정 라우팅 — 증상 일시 회복 시에도 L1 유지 정책',
    trigger_conditions: [
      {
        type: 'AND',
        description: 'TIA 가정: 일과성 신경학적 증상 발생 후 증상 회복 조합',
        conditions: [
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['일시적 마비', '반신 마비', '언어 장애', '말이 안 나옴', '시야 장애', '안면 마비', '팔다리 힘 빠짐', '갑자기 어눌'],
            description: '일과성 신경학적 결손 키워드 (TIA 의심)',
          },
          {
            type:     'LEAF',
            field:    'symptom_current_state',
            operator: 'any_of',
            value:    ['호전', '회복됨', '괜찮아짐', '없어짐', '지나감', '나았다'],
            description: '현재 증상 일시 회복 상태 — 회복 후에도 L1 유지',
          },
        ],
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-008 시나리오 기반. TIA 증상 자연 호전 시에도 즉시 L1 라우팅 유지. 황 교수 구두 승인. §10 의제 12.',
  },
  {
    policy_id:   'AGENDA-13',
    description: '복통+발열+우하복부 압통 조합 → 충수염 의심 L1 트리거',
    trigger_conditions: [
      {
        type: 'AND',
        description: '충수염 의심 트리플: 복통 + 발열 + 우하복부 국소 압통',
        conditions: [
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['복통', '배가 아프다', '배 통증', '배가 아파요', '배가 아파'],
            description: '복통 키워드',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['발열', '열이 난다', '열', '고열', '열 있음'],
            description: '발열 키워드',
          },
          {
            type:     'LEAF',
            field:    'pain_location',
            operator: 'any_of',
            value:    ['우하복부', '오른쪽 아랫배', '우측 하복부', '배꼽 아래 오른쪽'],
            description: '우하복부 국소 압통 부위',
          },
        ],
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_or_ER_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-009 시나리오 기반. 복통+발열+우하복부 압통 트리플 강제 L1 (충수염 의심). 황 교수 구두 승인. §10 의제 13.',
  },
  {
    policy_id:   'AGENDA-14',
    description: '영아(만 2세 이하) 무기력+수유 거부 → 체온 정상이어도 L1 정책',
    trigger_conditions: [
      {
        type: 'AND',
        description: '영아(≤24개월) 무기력 + 수유 거부 — 체온 정상이어도 L1',
        conditions: [
          {
            type:     'LEAF',
            field:    'patient_age_months',
            operator: 'lte',
            value:    24,
            description: '만 24개월(2세) 이하 영아',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['무기력', '늘어짐', '축 처짐', '처짐', '기운 없음', '반응 없음'],
            description: '영아 무기력/처짐 키워드',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['수유 거부', '젖을 안 먹음', '먹지 않음', '분유 거부', '모유 거부'],
            description: '수유 거부 키워드',
          },
        ],
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-010 시나리오 기반. 영아(≤24개월) 무기력+수유거부 강제 L1 (체온 정상 포함). 황 교수 구두 승인. §10 의제 14.',
  },
  {
    policy_id:   'AGENDA-15',
    description: '두통+목 경직+발열 조합 → 세균성 뇌막염 가정 L1 라우팅',
    trigger_conditions: [
      {
        type: 'AND',
        description: '세균성 뇌수막염 의심 트리플: 두통 + 항강직 + 발열',
        conditions: [
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['두통', '머리가 아프다', '머리 통증', '심한 두통'],
            description: '두통 키워드',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['목 경직', '항강직', '목이 뻣뻣', '목을 못 구부림', '고개를 못 숙임'],
            description: '항강직(목 뻣뻣함) 키워드',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['발열', '열이 난다', '열', '고열'],
            description: '발열 키워드',
          },
        ],
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_or_ER_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-011 시나리오 기반. 두통+목경직+발열 트리플 강제 L1 (광과민 동반 시 가중). 황 교수 구두 승인. §10 의제 15.',
  },
  {
    policy_id:   'AGENDA-16',
    description: '비전형 ACS (고령 여성 상복부 답답함+발한) → L1 트리거',
    trigger_conditions: [
      {
        type: 'AND',
        description: '비전형 ACS: 65세↑ 여성 + 상복부 증상 + 발한/이상감 조합 (§10 기준)',
        conditions: [
          {
            type:     'LEAF',
            field:    'patient_age_years',
            operator: 'gte',
            value:    65,
            description: '만 65세 이상 고령 여성 (§10 기준)',
          },
          {
            type:     'LEAF',
            field:    'patient_gender',
            operator: 'eq',
            value:    'female',
            description: '여성',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['소화불량', '명치 통증', '속이 답답', '상복부 불편', '위가 아프다', '명치 답답'],
            description: '비전형 ACS 상복부/소화기 증상 키워드',
          },
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['식은땀', '발한', '땀이 난다', '식은땀이 난다', '어지럽다', '구역질'],
            description: '발한/자율신경계 동반 증상 키워드',
          },
        ],
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-012 시나리오 기반. 비전형 ACS 고령(65세↑) 여성 강제 L1. §10 기준 연령 적용 (의뢰서 60세 → §10 65세로 통일). 황 교수 구두 승인. §10 의제 16.',
  },
  {
    policy_id:   'AGENDA-17',
    description: '자살 위기 → L1 + 119 + 1393 정신건강위기상담 병기 정책',
    trigger_conditions: [
      {
        type:     'LEAF',
        field:    'symptom_keywords',
        operator: 'any_of',
        value:    ['자살', '자해', '죽고 싶다', '죽고싶다', '살고 싶지 않다', '살기 싫다', '죽으면', '스스로 다치다'],
        description: '자살/자해 위기 키워드 감지',
      },
    ],
    target_triage_level:    'L1',
    forced_routing:         '119_immediate',
    forced_card:            'CriticalEmergencyCard',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-006 시나리오 기반. 자살 위기 119+1393(정신건강위기상담전화) 동시 안내. 황 교수 구두 승인. §10 의제 17.',
  },
  {
    policy_id:   'AGENDA-18',
    description: '진단력 컨텍스트 기반 과잉 라우팅 방지 정책',
    trigger_conditions: [
      {
        type: 'AND',
        description: '기존 진단력 보유 + 동일 패턴 증상 재발 → 과잉 라우팅 방지 (L4 하향)',
        conditions: [
          {
            type:     'LEAF',
            field:    'existing_diagnosis',
            operator: 'any_of',
            value:    ['공황장애', '편두통', '만성 위염', '과민성 대장 증후군', '기능성 소화불량'],
            description: '과잉 라우팅 방지 적용 대상 진단명 (§10 기준: 공황장애·편두통·만성 위염)',
          },
          {
            type:     'LEAF',
            field:    'symptom_matches_existing_diagnosis',
            operator: 'eq',
            value:    true,
            description: '현재 증상이 기존 진단 패턴과 일치 판정',
          },
        ],
      },
    ],
    target_triage_level:    'L4',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-025/026/027 시나리오 기반. 진단력 컨텍스트 입력 시 과잉 라우팅 방지 L4 하향 정책. 황 교수 구두 승인. §10 의제 18.',
  },
  {
    policy_id:   'AGENDA-19',
    description: '이동성 흉통 L4 라우팅 + 응급 징후(30분↑ 지속·방사통) 검출 정책',
    trigger_conditions: [
      {
        type: 'AND',
        description: '운동성/이동성 흉통 + 비심인성 기존 진단력 → L4. ★ 예외: 방사통·30분↑ 지속 → L1 경보 (RealRoutingAdapter 예외 처리)',
        conditions: [
          {
            type:     'LEAF',
            field:    'symptom_keywords',
            operator: 'any_of',
            value:    ['흉통', '가슴 통증', '가슴이 아프다', '가슴 아픔'],
            description: '흉통 키워드',
          },
          {
            type:     'LEAF',
            field:    'pain_character',
            operator: 'any_of',
            value:    ['운동성', '이동성', '체위 변화 시', '움직일 때', '누르면 아프다', '압통'],
            description: '운동성/이동성 흉통 특성 (비심인성 가능성 시사)',
          },
          {
            type:     'LEAF',
            field:    'existing_diagnosis',
            operator: 'any_of',
            value:    ['근골격계 질환', '늑연골염', '역류성 식도염', '불안장애'],
            description: '비심인성 흉통 기존 진단력',
          },
        ],
      },
    ],
    target_triage_level:    'L4',
    clinical_review_status: 'approved',
    approved_by:            '황 교수 (구두 승인 2026-05-16)',
    approved_date:          '2026-05-16',
    notes: 'ALPHA-021 시나리오 기반. 이동성 흉통 + 비심인성 진단력 → L4. ★ 예외: 방사통(어깨·팔·턱) 또는 30분↑ 지속 흉통 → L1 경보 (RealRoutingAdapter에서 예외 처리 필요). 황 교수 구두 승인. §10 의제 19.',
  },
]
