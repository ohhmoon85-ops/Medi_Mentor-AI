/*
 * knowledge_chunks 테이블에 specialty 컬럼 추가.
 *
 * 사용 시점: 9-C(RAG 시드 적재) 단계
 *
 * specialty 값 제약:
 *   - 26개 SpecialtyCode 중 하나만 허용 (lib/constants/specialties.ts 참조)
 *   - SQL CHECK 제약 미사용 (specialties.ts와의 동기화 부담 회피)
 *   - 적재 코드(scripts/seed-rag.ts 등)에서 isValidSpecialtyCode() 검증 필수
 *
 * 인덱스: idx_knowledge_chunks_specialty
 *   - 진료과별 RAG 검색 필터링용
 *   - 9-B-3 specialtyContext와 연계: 의사 멘토 모드에서
 *     자기 진료과 우선 검색 가능
 */

-- 9-C(RAG 시드 적재) 단계에서 진료과별 메타데이터 저장에 활용
-- 실행 전 반드시 사용자 승인 필요

ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS specialty TEXT;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_specialty
  ON knowledge_chunks(specialty);

-- specialty 코드 검증은 애플리케이션 레이어(isValidSpecialtyCode)에서 수행.
-- SQL CHECK 제약은 specialties.ts와 동기화 부담이 있어 적용하지 않음.
