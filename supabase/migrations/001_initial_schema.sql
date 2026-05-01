-- MediMentor AI 초기 스키마
-- Phase 1: 전체 테이블 정의

-- pgvector 확장 활성화
create extension if not exists vector;

-- 사용자 역할 enum
create type user_role as enum ('patient', 'doctor', 'admin');

-- 사용자 테이블
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  role user_role not null default 'patient',
  created_at timestamptz default now()
);

-- 의사 인증 (Pro 접근 제어)
create table doctor_verifications (
  user_id uuid primary key references users(id),
  license_number text unique not null,
  specialty text,
  hospital text,
  verification_status text default 'pending',
  verified_at timestamptz
);

-- 환자 세션 (PHI 분리, 익명/익명없는 모드 지원)
create table patient_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  pseudonym text,
  age_band text,
  sex text,
  comorbidities jsonb,
  medications jsonb,
  pregnancy_status boolean,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz default now()
);

-- 환자 증상 입력 로그
create table symptom_inputs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references patient_sessions(id),
  raw_text text not null,
  normalized_terms jsonb,
  modality text default 'text',
  created_at timestamptz default now()
);

-- 트리아지 결과
create table triage_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references patient_sessions(id),
  acuity_level int not null check (acuity_level between 1 and 5),
  recommended_department text not null,
  alternative_departments jsonb,
  red_flags jsonb,
  rationale text,
  citations jsonb,
  created_at timestamptz default now()
);

-- 의사용 사례 (미인증 → 기본 24시간 후 자동 삭제)
create table doctor_cases (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references users(id),
  case_pseudonym text,
  chief_complaint text,
  hpi jsonb,
  pmh jsonb,
  exam_findings jsonb,
  lab_results jsonb,
  expires_at timestamptz default (now() + interval '24 hours')
);

-- 감별진단 결과
create table differential_diagnoses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references doctor_cases(id),
  rank int not null,
  diagnosis_name text not null,
  icd10 text,
  probability numeric check (probability between 0 and 1),
  evidence_strength text check (evidence_strength in ('strong', 'moderate', 'weak')),
  supporting_findings jsonb,
  rule_out_findings jsonb,
  next_steps jsonb,
  is_dont_miss boolean default false,
  citations jsonb
);

-- 약품 마스터 (식약처 동기화)
create table drugs (
  id uuid primary key default gen_random_uuid(),
  kfda_code text unique,
  generic_name text not null,
  brand_name text,
  ingredients jsonb,
  atc_code text,
  is_otc boolean,
  insurance_covered boolean,
  contraindications jsonb,
  warnings jsonb,
  pregnancy_category text,
  renal_dose_adjustment jsonb,
  hepatic_dose_adjustment jsonb,
  updated_at timestamptz default now()
);

-- 약물 상호작용 (DDI)
create table drug_interactions (
  id uuid primary key default gen_random_uuid(),
  drug_a uuid references drugs(id),
  drug_b uuid references drugs(id),
  severity text check (severity in ('major', 'moderate', 'minor')),
  mechanism text,
  recommendation text,
  source text,
  created_at timestamptz default now()
);

-- 지식 베이스 청크 (RAG용)
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text,
  source_url text,
  title text,
  content text not null,
  embedding vector(3072),
  language text default 'en',
  publication_year int,
  authority_score numeric default 0.5 check (authority_score between 0 and 1),
  created_at timestamptz default now()
);

create index on knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 의료기관 마스터 (HIRA 동기화)
create table healthcare_facilities (
  id uuid primary key default gen_random_uuid(),
  hira_code text unique,
  name text not null,
  facility_type text,
  departments text[],
  address text,
  lat double precision,
  lng double precision,
  phone text,
  business_hours jsonb,
  is_emergency_center boolean default false,
  is_night_open boolean default false,
  rating numeric,
  review_count int,
  updated_at timestamptz default now()
);

-- 안전성 모니터링 (이상사례 신고)
create table safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_role user_role,
  category text check (category in ('inaccurate', 'unsafe', 'biased', 'other')),
  context jsonb,
  description text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- RLS 활성화
alter table users enable row level security;
alter table patient_sessions enable row level security;
alter table symptom_inputs enable row level security;
alter table triage_results enable row level security;
alter table doctor_cases enable row level security;
alter table differential_diagnoses enable row level security;
alter table safety_reports enable row level security;

-- 기본 RLS 정책 (자신의 데이터만 접근)
create policy "users_own_data" on users
  for all using (auth.uid() = id);

create policy "patient_sessions_own" on patient_sessions
  for all using (auth.uid() = user_id or user_id is null);

create policy "doctor_cases_own" on doctor_cases
  for all using (auth.uid() = doctor_id);

-- 공개 읽기 가능 테이블
alter table knowledge_chunks enable row level security;
create policy "knowledge_chunks_read" on knowledge_chunks
  for select using (true);

alter table drugs enable row level security;
create policy "drugs_read" on drugs
  for select using (true);

alter table healthcare_facilities enable row level security;
create policy "facilities_read" on healthcare_facilities
  for select using (true);
