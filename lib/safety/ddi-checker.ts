import { getServiceClient } from '@/lib/db/supabase'
import type { DrugInteraction } from '@/lib/db/schema'

export interface DDIResult {
  interactions: DDIAlert[]
  hasMajor: boolean
}

export interface DDIAlert {
  drug_a_name: string
  drug_b_name: string
  severity: 'major' | 'moderate' | 'minor'
  mechanism?: string
  recommendation?: string
}

export async function checkDrugInteractions(drugIds: string[]): Promise<DDIResult> {
  if (drugIds.length < 2) return { interactions: [], hasMajor: false }

  const supabase = getServiceClient()

  const pairs: { drug_a: string; drug_b: string }[] = []
  for (let i = 0; i < drugIds.length; i++) {
    for (let j = i + 1; j < drugIds.length; j++) {
      pairs.push({ drug_a: drugIds[i], drug_b: drugIds[j] })
    }
  }

  const alerts: DDIAlert[] = []

  for (const pair of pairs) {
    const { data } = await supabase
      .from('drug_interactions')
      .select('*, drug_a_info:drugs!drug_a(generic_name), drug_b_info:drugs!drug_b(generic_name)')
      .or(
        `and(drug_a.eq.${pair.drug_a},drug_b.eq.${pair.drug_b}),and(drug_a.eq.${pair.drug_b},drug_b.eq.${pair.drug_a})`
      )
      .limit(10)

    if (data) {
      data.forEach((row: DrugInteraction & { drug_a_info: { generic_name: string }, drug_b_info: { generic_name: string } }) => {
        alerts.push({
          drug_a_name: row.drug_a_info?.generic_name ?? row.drug_a,
          drug_b_name: row.drug_b_info?.generic_name ?? row.drug_b,
          severity: row.severity,
          mechanism: row.mechanism ?? undefined,
          recommendation: row.recommendation ?? undefined,
        })
      })
    }
  }

  return {
    interactions: alerts,
    hasMajor: alerts.some((a) => a.severity === 'major'),
  }
}
