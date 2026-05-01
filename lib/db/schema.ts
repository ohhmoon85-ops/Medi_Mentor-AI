export type UserRole = 'patient' | 'doctor' | 'admin'

export interface User {
  id: string
  email?: string
  role: UserRole
  created_at: string
}

export interface DoctorVerification {
  user_id: string
  license_number: string
  specialty?: string
  hospital?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_at?: string
}

export interface PatientSession {
  id: string
  user_id?: string
  pseudonym?: string
  age_band?: string
  sex?: string
  comorbidities?: string[]
  medications?: string[]
  pregnancy_status?: boolean
  location_lat?: number
  location_lng?: number
  created_at: string
}

export interface SymptomInput {
  id: string
  session_id: string
  raw_text: string
  normalized_terms?: Record<string, unknown>
  modality: 'text' | 'voice' | 'image'
  created_at: string
}

export interface TriageResult {
  id: string
  session_id: string
  acuity_level: 1 | 2 | 3 | 4 | 5
  recommended_department: string
  alternative_departments?: string[]
  red_flags?: string[]
  rationale?: string
  citations?: Citation[]
  created_at: string
}

export interface DoctorCase {
  id: string
  doctor_id: string
  case_pseudonym?: string
  chief_complaint?: string
  hpi?: Record<string, unknown>
  pmh?: Record<string, unknown>
  exam_findings?: Record<string, unknown>
  lab_results?: Record<string, unknown>
  expires_at: string
}

export interface DifferentialDiagnosis {
  id: string
  case_id: string
  rank: number
  diagnosis_name: string
  icd10?: string
  probability?: number
  evidence_strength?: 'strong' | 'moderate' | 'weak'
  supporting_findings?: string[]
  rule_out_findings?: string[]
  next_steps?: string[]
  is_dont_miss: boolean
  citations?: Citation[]
}

export interface Drug {
  id: string
  kfda_code?: string
  generic_name: string
  brand_name?: string
  ingredients?: Record<string, unknown>[]
  atc_code?: string
  is_otc?: boolean
  insurance_covered?: boolean
  contraindications?: string[]
  warnings?: string[]
  pregnancy_category?: string
  renal_dose_adjustment?: Record<string, unknown>
  hepatic_dose_adjustment?: Record<string, unknown>
  updated_at: string
}

export interface DrugInteraction {
  id: string
  drug_a: string
  drug_b: string
  severity: 'major' | 'moderate' | 'minor'
  mechanism?: string
  recommendation?: string
  source?: string
}

export interface KnowledgeChunk {
  id: string
  source_type: 'pubmed' | 'guideline' | 'mfds' | 'hira' | 'cochrane' | 'nice'
  source_id?: string
  source_url?: string
  title?: string
  content: string
  embedding?: number[]
  language: string
  publication_year?: number
  authority_score: number
  created_at: string
}

export interface HealthcareFacility {
  id: string
  hira_code?: string
  name: string
  facility_type?: string
  departments?: string[]
  address?: string
  lat?: number
  lng?: number
  phone?: string
  business_hours?: Record<string, unknown>
  is_emergency_center: boolean
  is_night_open: boolean
  rating?: number
  review_count?: number
  updated_at: string
}

export interface Citation {
  type: 'pubmed' | 'guideline' | 'mfds' | 'hira' | 'nice' | 'who'
  name: string
  url?: string
  pmid?: string
  year?: number
}

export interface SafetyReport {
  id: string
  reporter_role?: UserRole
  category: 'inaccurate' | 'unsafe' | 'biased' | 'other'
  context?: Record<string, unknown>
  description?: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}
