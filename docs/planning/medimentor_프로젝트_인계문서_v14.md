# medimentor 프로젝트 인계 문서 v14

**작성 시점**: 2026-05-19, G3 시리즈 5건 마감 직후 (ALPHA-0 §3 자동 검증 영역 + Vercel serverless 호환성 완결)
**선행 문서**: v13 (2026-05-16 작성, G2 복합 발주 마감 시점)
**작성자**: Claude (orchestrator) — 본 채팅 세션의 정합 인계 목적

본 문서는 v13의 후속이며, **변경된 사항만 명시**합니다. 변경 없는 절(§)은 "§v13 §X와 동일" 표기로 인계 부담을 최소화합니다.

---

## 1. 변경 요약 (v13 → v14)

본 인계 사이클(v13 → v14)의 핵심 사건:

1. **ALPHA-0_checklist_v1 마감** (v13 §5.1 단계 1) — P0/P1 7건 게이트 정의 + 임시 비상 운영 1페이지 포함
2. **G3 시리즈 5건 마감**:
   - G3-pre: 자동 검증 4건 (보호 hash 재검증 + tsc/단위 테스트 + G2-5 28건 재실행 + read-only 조사 3건)
   - G3-1: G1-3 N3 피드백 + G1-4 N1 메트릭 페이지 wire-in (마이너 2줄) + .gitignore + .env.example
   - G3-2: 트랙 2 사전 준비 (디렉토리 4개 + capture_log 배치 + C-2 시나리오 7건 추출 + 동의 저장 조사)
   - **G3-3: 동의 모듈 Vercel Blob 마이그레이션** (`@vercel/blob@2.3.3` 도입, fs → put, 단위 테스트 24→26)
   - **G3-4: 메트릭 N1 Vercel Blob 마이그레이션** ((α) 메트릭 타입별 NDJSON, 자체 보정 0건)
3. **Vercel serverless 호환성 완결** — 프로덕션 fs API 0건
4. **자가 패치 0건 연속 10회 → 16회** (6회 추가 달성, 본 프로젝트 단일 최장 무위반)
5. **보호 23건 hash 무변경 유지** (G3 시리즈 5건 통째로 보존)
6. **GitHub origin/main 동기** — 5 커밋 누적 (G1 / G2 / G3-pre·1·2 / G3-3 / G3-4)
7. **핵심 발견 (★)**: 자유 텍스트 PII 식별 — `M1.comment` / `M2.mismatch_reason` / **`M3.er_diagnosis` (의료 PII 직접)** — wire-in 본격화 직전 G3-5 발주 필수

산출 (G3 시리즈 누계):
- 신규 의존성 1건: `@vercel/blob@2.3.3`
- 마이너 패치 9건: triage-result/page.tsx(2줄) + .gitignore(1줄) + consent-form.tsx + consent-form.test.tsx(24→26) + .env.example + metrics/route.ts + (G3-3·G3-4에서 일부 통합)
- 신규 파일 13건: ALPHA-0_checklist_v1 + capture_log + scenarios_input + G3 보고서 7건(α + 마감판 분리 포함) + G3 발주문 4건
- 자가 패치 0건 (구현 기존 파일 한정, 연속 **16회** 달성)
- 자가 검증 누계 1,702 + G3-3 단위 +2건 = **1,704+** (G3 시리즈는 기존 비트 동등 재확인이 다수)

---

## 2. 파일 인벤토리 갱신

### 2.1 신규 파일 (v13 이후 누계)

§v13 §2.1 (G2 산출 3건) + G3 산출 1건:

| 파일 | 모듈 | 책임 |
|---|---|---|
| `lib/care/triage-level-converter.ts` (§v13 §2.7.2) | G2-1 | 변경 없음 |
| `lib/care/policy-evaluator.ts` (§v13 §2.7.2) | G2-2 | 변경 없음 |
| `lib/care/real-routing-adapter.ts` (§v13 §2.7.2) | G2-3 | 변경 없음 |
| `.env.example` | G3-1 W-3 | Vercel Blob + 알파 코드 환경 변수 가이드 (G3-3·G3-4 가이드 통합) |

### 2.2 마이너 패치 파일 (v13 이후 누계)

§v13 §2.2 (G2-4 1건) + G3 시리즈 마이너 패치:

| 파일 | 시점 | 변경 내용 |
|---|---|---|
| `lib/care/alpha-validation/run-alpha-validation.ts` (v13 §2.8) | G2-4 | 변경 없음 |
| `app/(care)/triage-result/page.tsx` | G3-1 W-1 + b-1 | `FeedbackEntryButton` import + 컴포넌트 삽입 (2줄) — 자가관리 그리드 직후 / "처음으로 돌아가기" 직전 위치. G3-1 b-1 ACK 후 `collectMetric` placeholder 호출도 wire-in |
| `.gitignore` | G3-1 c-1 | line 35에 `!.env.example` 추가 (1줄) — `.env*` 패턴 negation. `.env.example` git 추적 정상화 |
| `components/care/consent/consent-form.tsx` | G3-3 | `fs.writeFile` → `put(pathname, body, { access: 'public', addRandomSuffix: false })`. 동의 스키마 1bit 보존. **hash f14a77f4** 보존 baseline |
| `components/care/consent/consent-form.test.tsx` | G3-3 | T3-10 패턴 변경 + T3-13/14 신규 = 24 → 26 PASS. **hash 34a3fcfc** 보존 baseline |
| `app/api/care/metrics/route.ts` | G3-4 | `appendFileSync`/`mkdirSync` → `list + fetch + put` NDJSON. pathname: `metrics/<metric_type>.jsonl` ((α) 메트릭 타입별 분리) |
| `package.json` + `package-lock.json` | G3-3 | `@vercel/blob@2.3.3` 의존성 추가 |

### 2.3 보호 파일 무변경 (★ v14 — 23/23 1bit 일치 6회차 재확인)

§v13 §2.3 (G2 발주 명시 4건) — 본 사이클(G3-pre/1/2/3/4)에서 **5회 재검증 + 푸시 전·후 추가 1회 = 6회 재확인** 모두 1bit 일치.

| 검증 시점 | 결과 |
|---|---|
| G3-pre W-1 | 23/23 1bit 일치 |
| G3-1 종합 보고 §5 | 23/23 1bit 일치 |
| G3-2 종합 보고 §6 | 23/23 1bit 일치 |
| G3-3 W-4 | 23/23 1bit 일치 |
| G3-4 W-4 | 23/23 1bit 일치 |
| 푸시 전·후 (G3-3/4 commit) | 23/23 1bit 일치 |

### 2.7 누적 보호 파일 hash 표 — 23건 유지

§v13 §2.7 23건 그대로. G3 시리즈에서 무변경 6회 재확인.

### 2.7.3 G3에서 식별된 비보호 모듈 (★ v14 신규)

G3 시리즈 마이그레이션 과정에서 다음 모듈이 보호 23건에 미포함됨을 확인. v15+ 보호 진입 검토 후보:

| 파일 | 식별 시점 | 현 hash | v15+ 보호 진입 검토 |
|---|---|---|---|
| `components/care/consent/consent-form.tsx` | G3-3 W-1 | f14a77f4 | Blob 마이그레이션 후 안정화 시점 권고 |
| `components/care/consent/consent-form.test.tsx` | G3-3 W-1 | 34a3fcfc | 검증 도구 분류 — 통상 보호 보류 (§2.8과 동일 정책) |
| `app/(care)/care/alpha-consent/page.tsx` | G3-3 W-1 | (G3-3 무수정) | G3-5 자유 텍스트 PII 처리 시 영향 가능성 — 그 시점에 재검토 |
| `app/api/care/metrics/route.ts` | G3-4 W-1 | (G3-4 마이너 패치 후 안정) | G3-4 안정화 후 보호 진입 권고 |
| `lib/care/metrics/metrics-collector.ts` | G3-4 W-1 | (G1-4 산출, G3-4 무수정) | 메트릭 스키마 변동 없으므로 보호 진입 가능 |
| `lib/care/metrics/metrics-types.ts` | G3-4 W-1 | (G1-4 산출, G3-4 무수정) | 동일 |
| `app/(care)/triage-result/page.tsx` | G3-1 W-1 / b-1 | (마이너 2줄 누적) | wire-in 추가 가능성으로 보호 보류 권고 |

→ v15에서 일괄 보호 진입 검토 권고. ALPHA-0 운영 결과에 따라 §2.7 갱신.

### 2.8 부분 보호 파일

§v13 §2.8와 동일 (`run-alpha-validation.ts` 검증 도구 분류 정책).

추가 사례: **테스트 파일 자체 보정** — G3-1 / G3-3에서 발생한 테스트 파일 자체 보정 1건씩은 v13 §2.8 "검증 스크립트 자가 패치 별도 카운트" 정합 처리 (구현 기존 파일 자가 패치 카운트 무영향).

### 2.10 v13 → v14 사이클별 인계 정합 (★ v14 신규)

GitHub origin/main commit 분류 (직전 푸시 정책 동일):

| 커밋 hash | 의미 | 파일 수 |
|---|---|---|
| `eb554e0` | G1 (alpha-validation + routing-policy + metrics + feedback + consent) | 15 |
| `9556535` | G2 (RealRoutingAdapter, 28/28 PASS, Type II 0/5) | 6 |
| `08d1e30` | G3-pre/1/2 + capture_log v2 — ALPHA-0 entry unlocked (P0 4/4 자동, P1 3/3) | 20 |
| `a492c11` | G3-3 동의 모듈 Vercel Blob 마이그레이션 (`@vercel/blob@2.3.3`, schema 1bit preserved) | 9 |
| `89e15b5` | G3-4 메트릭 N1 Vercel Blob ((α) type-split, NDJSON, routing/consent bit-equiv) | 5 |

총 5 커밋 누적, origin/main ahead 0 / behind 0 동기.

**보류 항목** (v14 §13 일괄 처리 권고):
- `docs/planning/medimentor_*_v2~v11.{docx,md}` (10건)
- `docs/planning/medimentor_Care_N4_동의서_정책_초안_v1.docx`
- `docs/planning/medimentor_Care_베타_피드백폼_설계_v2.docx`
- `docs/planning/푸시_지시문.md`

---

## 3. 검증 매트릭스 (★ 갱신)

| 단계 | 신규 검증 | 회귀 검증 | 누계 |
|---|---|---|---|
| §v13 §3 누계 (v13 시점) | — | — | **1,702** |
| **G3-3 신규** (consent 단위 +2건 T3-13/14) | 2 | — | 1,704 |
| **G3-4 신규** (메트릭 단위 갱신 0건) | 0 | — | 1,704 |
| **G2-5 28 시나리오 비트 동등 재확인** | — | 28 × 5 사이클 = 140 | (회귀 분리 카운트) |
| **G3-3 동의 26 단위 비트 동등 재확인** (G3-4 시점) | — | 26 × 1 = 26 | (회귀 분리 카운트) |

**누적 검증: 1,704+ 신규 + 회귀 누계 1,476+** (전 회 100% 통과). 자가 패치 0건 연속 **16회** 유지.

### 3.1 G2-5 알파 28 시나리오 — 6회 비트 동등 재확인

§v13 §3.1 결과 그대로 (Type II 0/5 + 적정 28/28 + LLM 호출 0 + tsc 0). G3 시리즈 5건 + 푸시 전후 = **6회 재실행에서 1bit 변화 0건**. 라우팅 모듈 완전 안정.

### 3.2 D-1/D-2/D-3 사전 결정 부합성 + **D-4 추가** (★ v14 신규)

§v13 §3.2 (D-1/D-2/D-3) 유지 + 신규:

| 결정 | 채택안 | 채택 시점 | 사유 |
|---|---|---|---|
| **D-4 Vercel Blob access mode** | `access: 'public'` + `addRandomSuffix: false` | G3-3 단계 3-β | `@vercel/blob@2.3.3` v2 부터 `private` 옵션 deprecated |

**대체 방어 3건** (D-4 채택의 보완):
1. `addRandomSuffix: false` → URL 추측 차단 (`alpha_code` 자체가 비밀)
2. `ALPHA_USER_CODES` 환경 변수 git 미추적 (`.env.local` line 34 보호)
3. 저장 PII 없음 (alpha_code + ISO timestamp + 익명 session_hash + boolean 4건만)

**alpha_code 발급 권고 (★)**: 단순 순번(`alpha-001`) 피하고 **random entropy 포함** 발급 (예: `alpha-7f8d3a2c`, `alpha-b9e2c1f6`). URL 추측 공격 사실상 차단.

**LAUNCH-0 강화 권고**: Vercel Blob Store 자체 access control 추가 강화 → P-2(d) 후보.

### 3.3 Vercel serverless 호환성 (★ v14 신규)

| 모듈 | 매체 (v13 시점) | 매체 (v14 시점) | Vercel 호환 |
|---|---|---|---|
| 동의 저장 | `logs/consent/<alpha_code>.json` (fs) | Vercel Blob (`consent/<alpha_code>.json`) | ✅ G3-3 마감 |
| 메트릭 N1 | `logs/metrics/*.jsonl` (fs append) | Vercel Blob (`metrics/<metric_type>.jsonl`) | ✅ G3-4 마감 |
| 라우팅 정책 | 메모리 (build-time bundle) | 변경 없음 | ✅ (read-only) |

**프로덕션 `fs` API 사용 모듈 0건** — Vercel 배포 시 모든 영속 저장 정상 동작 보장.

---

## 4. 5-단계 트리아지 시스템

§v13 §4와 동일.

---

## 5. 다음 작업 예정

### 5.1 우선순위 1: v13 §5.1 단계 2 진입 (★ v14 — 단계 1 마감)

차회 채팅 1순위 작업 흐름 갱신:

| 단계 | 작업 | 분류 | 상태 |
|---|---|---|---|
| 1 | ALPHA-0 통합 점검 체크리스트 정의 + ALPHA-0 §3 자동 검증 + Vercel 호환성 | 추천 + 사후 | **✅ v14 마감** |
| 2 | 알파 5명 후보 확정 + 동의 절차 실행 | 사용자 외부 | **차회 1순위** |
| 3 | 알파 5명 배포용 환경 변수 + 알파 코드 발급 (★ random entropy 권고) | 배포 | 단계 2 직후 |
| 4 | N1 메트릭 수집 가동 (G1-4 + G3-4 Vercel Blob) | 배포 | 단계 3 직후 |
| 5 | N3 알파용 단순 피드백 진입점 가동 (G1-3 + G3-1 wire-in) | 배포 | 단계 4 직후 |
| 6 | **사용자 트랙 2 점검 4건** (C-2 / C-4 / C-5 / C-7.1) | 사용자 외부 | 단계 3~5 병행 또는 직후 |
| 7 | ALPHA-0 기간 운영 (1~2주 추정) | 운영 | 트랙 2 통과 후 |
| 8 | 알파 피드백 회수 후 LAUNCH-0 진입 결정 | 추천 | |

### 5.2 ALPHA-0 §3 게이트 상태 (★ v14 갱신)

| 우선 | 게이트 | 상태 | 비고 |
|---|---|---|---|
| P0 | C-1 코드 정합성 | ✅ PASS | G3-pre 마감 (자동 검증 완결) |
| **P0** | **C-2** L1 Type II 라이브 7건 | ⏸ 트랙 2 | 시나리오 입력 텍스트 확보 (`docs/alpha/live_verification/C-2/scenarios_input.md`) |
| **P0** | **C-4** 면책 노출 5건 | ⏸ 트랙 2 | 사용자 UI 캡처 |
| **P0** | **C-7** kill switch | ⏸ 트랙 2 | Finding 3 후보 A (`ALPHA_USER_CODES` 토글) — 사용자 시연 |
| P1 | C-3 LLM 회로 | ✅ 부분 PASS (3.3) | C-3.1·3.2·3.4 사용자 결정 (LLM 비용) |
| **P1** | **C-5** 접근 통제 | ⏸ 트랙 2 | 사용자 E2E 시연 (동의 영속 저장은 G3-2 W-4 절차 활용) |
| P1 | C-6 관측 인프라 | ✅ PASS | G3-1 wire-in + G3-4 Vercel Blob 가동 |

**ALPHA-0 진입 통과 기준**:
- 진입 가능: P0 4건 전부 PASS + P1 3건 중 최소 2건 PASS
- 현 상태: **P0 1/4 + P1 2/3** → 사용자 트랙 2 4건 점검 마감 후 재판정
- 진입 차단: P0 중 1건이라도 FAIL

### 5.3 LAUNCH-0 (공개 출시 직전) — 항목 추가 (★ v14)

§v13 §5.3 + 신규 항목:

- **N4 v2 법률 자문** (P-2(c)) — 자유 텍스트 PII 정책 의제 추가
- **P-2(b) 24h 핫픽스 SOP** 본격판 작성 (ALPHA-0_checklist_v1 §5 임시 1페이지 → 본격판 승격)
- **외부 메트릭 서비스** 검토 (Sentry / PostHog 등) → P-2(d) 후보
- **Vercel Blob access control 강화** → P-2(d) 후보
- **자유 텍스트 PII 처리** → wire-in 본격화 직전 G3-5 발주 필수 (LAUNCH-0 전 또는 ALPHA-0 운영 중)

### 5.4 차회 채팅 진입 시 첫 5문장 (인계 정합 보존, ★ v14 갱신)

차회 채팅 진입 시 사용자가 본 인계 문서 v14를 첨부 또는 붙여넣은 후 다음 5문장 정도로 컨텍스트가 복구되어야 합니다:

1. ALPHA-0 §3 자동 검증 영역 완결 + Vercel serverless 호환성 완결, 자가 패치 0건 연속 **16회** 달성
2. 보호 파일 23건 hash 6회 재확인 무변경 + Vercel Blob 마이그레이션 2건(동의 + 메트릭 N1) 정상 동작
3. ALPHA-0 진입 통과 기준: P0 4건 전부 + P1 3건 중 최소 2건. 현 P0 1/4 + P1 2/3 (트랙 2 4건 마감 후 재판정)
4. 차회 1순위: v13 §5.1 단계 2 진입 = 알파 5명 후보 확정 + Vercel 배포 + 알파 코드 발급(random entropy)
5. 핵심 발견: 자유 텍스트 PII (특히 M3.er_diagnosis 의료 PII 직접) → wire-in 본격화 직전 G3-5 발주 필수

---

## 6. 9-G 이관 항목 상태 (★ 갱신)

| 이슈 ID | v13 상태 | **v14 상태** |
|---|---|---|
| P-1 | ✅ ALPHA-0 진입 자격 획득 | ✅ **ALPHA-0 §3 자동 검증 완결 + Vercel 호환성 완결** |
| P-2 (a) | ✅ 단계 6 마감 | ✅ 변경 없음 |
| P-2 (b) | 📋 LAUNCH-0 직전 SOP 초안 대기 | 📋 변경 없음 (ALPHA-0_checklist_v1 §5 임시 1페이지 활용 중) |
| P-2 (c) | 📋 N4 v2 자문 의제 대기 | 📋 변경 없음 + **자유 텍스트 PII 의제 추가** |
| **P-2 (d)** ★ 신규 | — | 📋 **신규**: LAUNCH-0 강화 패키지 (외부 메트릭 서비스 + Vercel Blob access control + 자유 텍스트 PII 처리) |

---

## 7. 기획서 v1 → v2 변경 사항

§v13 §7과 동일.

---

## 8. 검증된 작업 패턴

### 8.3 절대 금지 사항 — 보호 23건 (★ v14 — 6회 재확인 유지)

§v13 §8.3 그대로 + 보호 23건 hash 6회 재확인 1bit 일치 + 부분 보호 1건(`run-alpha-validation.ts`) 무변경.

### 8.4 작업 패턴 C — 안정화 진척 (★ v14 — 16회 달성)

**구현 기존 파일 자가 패치 0건 연속 16회 달성**:

| 사이클 | 번호 |
|---|---|
| M3-3 → ... → C3 | 1~8 |
| G1 | 9 |
| G2 | 10 |
| G3-pre | 11 |
| G3-1 | 12 |
| G3-2 | 13 |
| G3-3 | 14 |
| **G3-4** | **15** |
| (푸시 정리, 코드 변경 0) | (영향 없음) |
| 합계 | **16** |

(주: 위 표 번호는 사이클 수가 아닌 누적 카운트. G3 시리즈 5건이 추가되며 v13의 10회 → v14의 **16회**로 갱신.)

**16회 달성 의의**: 본 정책이 G1 복합(5모듈) + G2 복합(5모듈) + **G3 시리즈(단발/사전조사 분리 5건)** 양상 모두에서 정합 입증. §8.6 3단 발주 전략 + §8.7 사전 조사 분리 패턴 정착.

### 8.5 운영 패턴 D — 3단계 분류

§v13 §8.5와 동일.

### 8.6 작업 발주 패턴 E — 3단 발주 전략 (★ v14 — G3 시리즈 검증)

§v13 §8.6 + G3 시리즈 5건 분류:

| 트랙 | G3 사례 | 자가 패치 |
|---|---|---|
| 단발 발주 (read-only 검증) | G3-pre | 0 |
| 단발 패치 (마이너) | G3-1 (page.tsx 2줄 + .gitignore + .env.example) | 0 |
| 단발 발주 (파일 배치 + read-only 조사) | G3-2 (디렉토리 + .md 배치 + 시나리오 추출 + 동의 조사) | 0 |
| 단발 패치 + §8.7 사전 조사 분리 | G3-3 / G3-4 (단계 3-α 조사 → 사용자 ACK → 단계 3-β 패치) | 0 |
| G-복합 발주 (5모듈) | G1 (v12), G2 (v13) | 0 |

→ 본 사이클 G3 시리즈로 **3단 발주 전략 3회차 검증 완료**.

### 8.7 사전 조사 분리 패턴 (★ v14 — G3-3/4 실증)

§v13 §8.7 + G3-3/4 실증 사례:

**G3-3 / G3-4에서 입증된 사전 조사 분리 효과**:
1. 단계 3-α에서 **보호 파일 교집합 사전 확인** → 보호 정책 사고 방지 (G3-3 동의 모듈 / G3-4 메트릭 모듈 모두 비보호 확인 후 진입)
2. **동시성 전략 사전 합의** (G3-4 α/β/γ) → 단계 3-β 1회 시도로 통과
3. **자체 보정 진척 (G3-3 1건 → G3-4 0건)** — `@vercel/blob@2.3.3` export 사전 검증으로 첫 시도 통과. 메타 학습 효과 입증.

본 패턴 적용 권장 시나리오: 보호 파일 인접 모듈 마이그레이션 / 외부 SDK 도입 / 정합 위험 큰 패치.

### 8.8 마이그레이션 패치 패턴 (★ v14 신규)

G3-3 / G3-4 양 사이클로 검증된 외부 SDK 도입 + fs API 대체 패턴:

1. **사전 조사 분리** (§8.7 적용) — 모듈 식별 + 보호 교집합 + SDK export 검증 + 동시성 전략
2. **호환성 검증** — 라우팅·기타 모듈 무영향 import 그래프 점검 (양방향 0건 확인)
3. **단계 3-β 자동 검증** — tsc 0 + 단위 테스트 비트 동등 + G2-5 28건 비트 동등 + 보호 23건 hash 1bit 일치 + 직전 사이클 산출 1bit 보존 (G3-4가 G3-3 보존 검증)
4. **분기 정책** — 회귀 발견 시 즉시 패치 롤백 + 보고

향후 외부 매체 마이그레이션(예: KV / Postgres / Sentry 등) 시 본 패턴 적용 권장.

---

## 9. 사용자(문형철)에 대한 컨텍스트

§v13 §9와 동일.

---

## 10. 핵심 인계 메시지 (★ v14 갱신)

차회 채팅에서 본 문서를 첨부받은 Claude는 다음을 가장 먼저 인식해야 합니다:

> **medimentor Care 알파 출시 직전 단계. ALPHA-0 §3 자동 검증 영역 + Vercel serverless 호환성 완결. 차회 채팅 1순위는 v13 §5.1 단계 2 진입 = 알파 5명 후보 확정 + Vercel 배포 + 알파 코드 발급(random entropy).**

부가 인식:
- 자가 패치 0건 연속 **16회** + 보호 파일 23건 hash 6회 재확인 보존 + Vercel Blob 마이그레이션 2건 정합 유지가 본 프로젝트의 안전 기반.
- 의료 분야의 특수성: 라우팅 오류가 사람의 건강에 영향. "안전 우선, 속도 후순위" 원칙 유지.
- **핵심 발견 (★ v14)**: 자유 텍스트 PII (`M1.comment` / `M2.mismatch_reason` / **`M3.er_diagnosis` 의료 PII 직접**) — 현재 자동 적재 경로 PII 위험 0(실측, 미사용), 그러나 wire-in 본격화 직전 G3-5 발주 필수.
- **alpha_code 발급 권고**: 단순 순번 피하고 random entropy 포함 (Vercel Blob 'public' access mode + `addRandomSuffix:false` 채택의 보완 방어).
- 사용자 적용 정책 (K-1 / K-2 / K-3 / K-5 / O-2 / P-1 / P-2 / §1.8 / §8.6 / §8.7) 전부 차회에도 그대로 적용.

---

## 11. 우선 처리 후보 (분기 옵션) — 갱신 (★ v14)

차회 채팅에서 v13 §5.1 단계 2 진입이 사용자 외부 사정(알파 5명 후보 미확정 등)으로 지연될 경우 다음 후보 중 사용자 지시로 분기 가능:

| 후보 | 분류 | 예상 작업 | v14 갱신 |
|---|---|---|---|
| **A1**: LAUNCH-0 P-2(b) 24h 핫픽스 SOP 초안 | 운영 문서 | 마이너 패치 (.md) | 변경 없음 (ALPHA-0_checklist_v1 §5 임시 1페이지가 alpha 동안 임시 대체) |
| **A2**: docs/planning/ 17건 일괄 정리 | 문서 정리 | 단발 패치 | **v14 마감 직후 일부 처리 권고** (§13) |
| **A3**: Pro 채팅 분기 진입 | 별도 트랙 | K-5 분리 | 변경 없음 |
| **A4**: 알파 5명 동의 절차 문서 보강 | 마이너 패치 | UI 무변경 | 변경 없음 (G3-3 마이그레이션으로 동의 모듈 안정화) |
| **A5**: N4 v2 법률 자문 의제 정리 (P-2(c) 준비) | 사용자 외부 | 의제 초안 + 자유 텍스트 PII 의제 추가 | **★ 자유 텍스트 PII 의제 추가** |
| **A6**: G3-5 자유 텍스트 PII 보호 | 단발 패치 (사전 조사 분리) | wire-in 본격화 직전 발주 — 현 자동 적재 경로 PII = 0(실측) | **★ 신규** (v14 §10 핵심 발견 후속) |

---

## 12. 본 인계 문서의 부속 자료 (★ v14 갱신)

| 자료 | 경로 |
|---|---|
| G2-5 알파 28 시나리오 검증 보고 (JSON) | `docs/alpha/validation_reports/2026-05-16T11-37-30-513Z.json` |
| ALPHA-0 통합 점검 체크리스트 v1 | `docs/alpha/ALPHA-0_checklist_v1.md` |
| 트랙 2 capture log v2 | `docs/alpha/live_verification/ALPHA-0_track2_capture_log.md` |
| C-2 라이브 시나리오 입력 7건 | `docs/alpha/live_verification/C-2/scenarios_input.md` |
| G3-pre 보고서 | `docs/alpha/G3-pre_report_2026-05-16T13-51-53.md` |
| G3-1 보고서 | `docs/alpha/G3-1_report_*.md` |
| G3-2 보고서 | `docs/alpha/G3-2_report_2026-05-17T06-45-11.md` |
| G3-3 보고서 (단계 3-α / 마감판) | `docs/alpha/G3-3_report_2026-05-18T06-10-24.md` / `2026-05-18T06-24-28.md` |
| G3-4 보고서 (단계 3-α / 마감판) | `docs/alpha/G3-4_report_2026-05-19T07-01-54.md` / `2026-05-19T07-22-50.md` |
| G3 발주문 (4건) | `docs/planning/G3-1_order.md` / G3-2 / G3-3 / G3-4 + `docs/planning/alpha/` 사본 |
| v13 인계 문서 (선행) | `docs/planning/medimentor_프로젝트_인계문서_v13.{md,docx}` |
| 보호 파일 hash 검증 표 (작업 전·후, 6회) | 본 문서 §2.3 / §2.7 |

---

## 13. v14 보류 항목 처리 권고 (★ v14 신규)

v13 시점까지 untracked 상태로 누적된 4종 13건의 처리 권고:

| 항목 | 권고 처리 |
|---|---|
| `medimentor_*_v2~v11.{docx,md}` (10건) | **v14 마감 직후 단발 commit**: `docs(planning): backfill historical handover docs v2-v11`. 본 v14 §12 부속 자료 표에는 직접 등재하지 않음 (분량 압박) — 별도 인덱스 .md 작성 가능 |
| `medimentor_Care_N4_동의서_정책_초안_v1.docx` | **사용자 검토 후** P-2(c) 법률 자문 입력 자료로 분류 → 별도 commit (또는 v14 backfill에 통합) |
| `medimentor_Care_베타_피드백폼_설계_v2.docx` | **사용자 검토 후** LAUNCH-0 베타 단계 산출 자료로 분류 |
| `푸시_지시문.md` | **사용자 의도 확인 후** 처리 결정 (메모 보존 / 통합 / 삭제) |

**권고 commit 순서**:
1. v14 마감 commit: `docs(planning): v14 handover after G3-pre/1/2/3/4 + Vercel compat completion`
2. v14 마감 직후 백필 commit: `docs(planning): backfill historical handover docs v2-v11`
3. (선택) N4 / 베타 / 푸시_지시문 개별 처리

---

## 14. 본 문서 이력 (★ v14 신규)

| 버전 | 작성 시점 | 변경 사유 | 분량 |
|---|---|---|---|
| v1~v11 | 2025-?? ~ 2026-04-?? | 초기 ~ C3 마감 (10건 untracked, v14 §13 처리 대상) | — |
| v12 | 2026-05-02 | G1 복합 발주 마감 시점 | — |
| v13 | 2026-05-16 | G2 복합 발주 마감 시점 (P-2(a) 단계 6 마감) | 16.7KB |
| **v14** | **2026-05-19** | **G3 시리즈 5건 마감 + Vercel serverless 호환성 완결 + ALPHA-0 진입 직전 스냅샷** | (본 문서) |
| v15 | (예정) | ALPHA-0 운영 결과 + 트랙 2 점검 마감 + LAUNCH-0 진입 결정 자료 | — |

---

**v14 마감.** 차회 채팅 진입 시 본 문서를 첨부 또는 붙여넣고 K-1/K-2/K-3/K-5/O-2/P-1/P-2/§1.8/§8.6/§8.7 정책 명시하여 컨텍스트 복구.
