/**
 * D2 체크리스트 방식 — public API
 *
 * 외부 import는 본 index 경유:
 *   import { runDecisionEngine, REGIONS, SYMPTOMS, ... } from '@/lib/checklist'
 */

export type {
  RegionId,
  Symptom,
  UrgentTrigger,
  CombinationRule,
  ConditionEntry,
  ChecklistContext,
  ChecklistMatchResult,
} from './types'

export type { RegionMeta } from './regions'
export { REGIONS, REGION_LIST } from './regions'

export { SYMPTOMS, URGENT_COUNT, symptomsByRegion, getSymptom } from './symptoms'
export { URGENT_TRIGGERS_L1, URGENT_TRIGGERS_L2, matchUrgent } from './urgent-triggers'
export { COMBINATIONS, matchCombinations } from './combinations'
export { CONDITIONS, getCondition } from './conditions'

export { runDecisionEngine } from './decision-engine'
export { CHECKLIST_SYSTEM_PROMPT } from './prompt'
