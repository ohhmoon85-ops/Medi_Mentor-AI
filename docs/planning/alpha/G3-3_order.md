# Claude Code 발주: 동의 저장 Vercel Blob 마이그레이션 (G3-3, A안)

## 0. 본 발주의 위치

선행 마감:
- G3-pre / G3-1 / G3-2 (자가 패치 0건 연속 14회, 보호 23건 무변경)
- Push 마감 (origin/main 동기화, 3 커밋 반영)

본 발주의 역할:
- ALPHA-0 진입 직전 발견된 **Vercel serverless 환경 호환성 이슈** 해소
- 현 구조: `logs/consent/<alpha_code>.json` (Node.js `fs` API) — Vercel serverless에서 영속성 손실
- 변경: Vercel Blob SDK 사용으로 마이그레이션 (스키마 무변경, 라우팅 무영향)

본 발주 외부:
- 트랙 2 점검 (본 발주 마감 + Vercel 배포 + `BLOB_READ_WRITE_TOKEN` 설정 후 진행)
- Vercel 외 다른 호스팅 검토 (B/C/D안)
- 메트릭(N1) 저장 마이그레이션 — `logs/metrics/`는 별도 사이클 (LAUNCH-0 권고)

## 1. 적용 정책

K-1 / K-2 / K-3 / K-5 / O-2 / P-1 / P-2 / §1.8 (회귀 차단 — 본 발주 핵심) / §8.6 / §8.7

**§8.6 분류**: 단발 패치 (마이너 + 신규 패키지 1건 + 신규 환경 변수 1건)
**§8.7 적용**: W-1·W-2 단계 3-α 사전 조사 → **사용자 ACK 필수** → 단계 3-β 패치

## 2. 작업 항목

### W-1. 동의 저장 모듈 식별 + 보호 여부 확인 (단계 3-α, read-only)

**조사 항목**:

1. G3-2 W-4 보고에서 식별된 동의 저장 모듈 경로 재인용
2. `fs` API 호출 위치 전수 식별:
   - `fs.writeFile` / `fs.writeFileSync` / `fs.promises.writeFile`
   - `fs.readFile` / `fs.readFileSync` / `fs.promises.readFile`
   - `fs.mkdir` / `fs.access` / `fs.existsSync`
3. 호출자 식별 (어느 API route / page component / server action에서 호출되는지)
4. **v13 §2.7 보호 23건과의 교집합 확인** (보호 18건 + G2 신규 5건 전수)
5. 단위 테스트 존재 여부 + 현 테스트 모킹 방식

**산출 형식**:

```markdown
## W-1 단계 3-α 조사 결과

### 동의 저장 모듈
- 경로: [경로]
- export: [함수명/객체명]

### fs API 호출 위치
| 파일 | 라인 | API | 동작 | 호출자 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

### 보호 파일 교집합
- 보호 23건 중 본 모듈 또는 그 호출자와 교집합: [없음 / 있는 경우 항목]
- ⚠️ 교집합 있는 경우: 본 발주 중단 권고 (사용자 보호 해제 결정 대기)

### 단위 테스트
- 존재 여부: [Yes/No]
- 모킹 방식: [fs 모킹 / 임시 디렉토리 / 기타]
```

### W-2. Vercel Blob 마이그레이션 범위 설계 (단계 3-α, read-only)

**전제**: W-1에서 보호 파일 교집합 없음 확인 후 진행.

**설계 항목**:

1. `@vercel/blob` 패키지 도입 (package.json + lock)
2. fs API → Blob SDK 매핑 설계:
   - `fs.writeFile(path, JSON.stringify(data))` → `put(pathname, body, { access: 'public' or 'private' })`
   - `fs.readFile(path)` → `fetch(blobUrl)` 또는 `list({ prefix })` + `fetch`
   - 디렉토리 자동 생성 → Blob은 디렉토리 개념 없음 (prefix 사용)
3. **동의 스키마 보존** (alpha_code + consented_at + session_hash + checks{a,b,c,d} — 그대로)
4. Blob pathname 설계: `consent/<alpha_code>.json` (현 `logs/consent/<alpha_code>.json` 패턴 유지)
5. 환경 변수 추가: `BLOB_READ_WRITE_TOKEN` (Vercel Dashboard 발급)
6. `.env.example` 갱신
7. `.gitignore` 영향: `logs/consent/` 무관 (Blob은 git 추적 외부)
8. **라우팅 로직 무영향 확인** — 동의 모듈 ↔ 라우팅 모듈 의존 그래프 점검
9. 단위 테스트 갱신 범위:
   - Blob SDK 모킹 (msw 또는 vitest mock)
   - 기존 fs 모킹 제거
10. 알파 미시작 상태 확인 — 기존 `logs/consent/` 디렉토리 데이터 없음 (G3-2 W-4 §5 보고)

**산출 형식**:

```markdown
## W-2 단계 3-α 설계 결과

### 변경 대상 파일 목록 (예상 N건)
| 파일 | 변경 종류 | 예상 라인 수 |
|---|---|---|
| package.json | 의존성 1건 추가 | +1 |
| [동의 저장 모듈] | fs → put | +N -M |
| [동의 읽기 모듈] | fs → fetch | +N -M |
| [단위 테스트] | 모킹 갱신 | +N -M |
| .env.example | 1줄 추가 | +1 |

### 동의 스키마 보존 확인
- W-4 보고 스키마와 1bit 일치 유지 ✅

### 라우팅 무영향 확인
- 동의 모듈 → 라우팅 모듈: [의존 그래프 결과]
- 라우팅 모듈 → 동의 모듈: [의존 그래프 결과]
- 의존 차단성: [완전 분리 / 부분 의존 / 강결합]

### 권고
- 단계 3-β 진입 가능 여부: [Yes / No / 조건부]
```

**사용자 ACK 대기 신호**:

W-1 + W-2 보고 후 단계 3-β 진입은 **사용자 명시 ACK 없이 절대 진행 금지**.

### W-3. 단계 3-β 패치 (사용자 ACK 후 실행)

**진입 조건**:
- W-1 보호 파일 교집합 없음 확인 (또는 사용자 보호 해제 결정)
- W-2 라우팅 무영향 확인
- 사용자 명시 ACK 수령

**패치 내용**:

1. `@vercel/blob` 설치:
   ```
   npm install @vercel/blob
   ```
2. 동의 저장 함수 마이그레이션:
   - `fs.writeFile` 호출 → `put(pathname, blob, { access: 'private', addRandomSuffix: false })`
   - Blob URL은 응답으로 받아 메타데이터 저장 또는 pathname 기반 재구성
3. 동의 읽기 함수 마이그레이션:
   - `list({ prefix: 'consent/' })` 또는 직접 pathname `fetch`
4. 단위 테스트 갱신:
   - Blob SDK 모킹 도입
   - 기존 fs 모킹 코드 제거
5. `.env.example` 갱신:
   ```
   # Vercel Blob (동의 영속 저장)
   BLOB_READ_WRITE_TOKEN=
   ```

**제약**:
- 동의 스키마 무변경 (필드명·타입 그대로)
- 라우팅 모듈 무수정
- 메트릭(N1) `logs/metrics/`는 본 발주 외부 — 손대지 않음
- 보호 파일 23건 무변경 (W-1에서 교집합 0건 확인 전제)
- G3-1에서 추가된 `.gitignore` `!.env.example` 패턴 유지

### W-4. 회귀 검증 (단계 3-β 직후)

- `tsc --noEmit` → 0 오류
- 단위 테스트 전수 PASS (363/363 또는 신규 모킹 테스트 포함 +N건 전수)
- G2-5 28 시나리오 재실행 → Type II 0/5 + 적정 28/28 (라우팅 무영향 확인)
- 보호 23건 hash 시작·종료 1bit 일치

**실패 시**: 패치 즉시 롤백 + 보고 + 정지.

## 3. 절대 금지 사항

본 발주 전 기간 동안:

1. **보호 파일 23건 수정 금지** — W-1에서 교집합 발견 시 본 발주 즉시 중단
2. **자가 패치 금지** — 발견 시 즉시 정지 + 보고
3. **라우팅 모듈 수정 금지** — 동의 모듈만 한정
4. **동의 스키마 변경 금지** — alpha_code / consented_at / session_hash / checks{a,b,c,d} 그대로
5. **메트릭 모듈(N1) 수정 금지** — `logs/metrics/`는 본 발주 외부
6. **Vercel Blob 외 다른 저장소 도입 금지** (KV, Supabase, Postgres 등)
7. **사용자 ACK 없이 단계 3-β 진입 금지** — W-1·W-2 보고 후 정지
8. **`@vercel/blob` 외 패키지 추가 금지**
9. **`.gitignore` 패턴 변경 금지** (G3-1 c-1 패턴 유지)

**자가 패치 카운트 목표**: 0건 연속 **15회** 달성.

## 4. 산출물

### 4.1 신규 파일

| 경로 | 용도 |
|---|---|
| `docs/alpha/G3-3_report_[YYYY-MM-DDTHH-MM-SS].md` | 본 발주 종합 보고서 |

### 4.2 마이너 패치 파일 (예상)

| 파일 | 변경 종류 |
|---|---|
| `package.json` + lock | `@vercel/blob` 의존성 추가 |
| [동의 저장 모듈] | fs → put 마이그레이션 |
| [동의 읽기 모듈] | fs → fetch 마이그레이션 |
| [단위 테스트] | Blob 모킹 갱신 |
| `.env.example` | `BLOB_READ_WRITE_TOKEN` 추가 |

### 4.3 종합 보고서 형식

**경로**: `docs/alpha/G3-3_report_[YYYY-MM-DDTHH-MM-SS].md`

**구성**:
- §1 본 발주 ID + 실행 시각 + 적용 정책
- §2 W-1 사전 조사 결과 (보호 파일 교집합 + fs 호출 위치)
- §3 W-2 마이그레이션 설계 (변경 대상 + 스키마 보존 + 라우팅 무영향)
- §4 W-3 패치 내용 (또는 단계 3-α 정지 시 사유)
- §5 W-4 회귀 검증 결과 (tsc / 단위 테스트 / G2-5 / 보호 hash)
- §6 자가 패치 카운트 (목표: 0건, 마이너 패치 5건 이하 별개)
- §7 ALPHA-0 §3 게이트 영향: C-5.2.4 (동의 영속 저장) Vercel 환경 호환성 확보
- §8 후속 작업: Vercel 배포 가이드 1페이지 (`BLOB_READ_WRITE_TOKEN` 발급 + 환경 변수 설정 안내)

## 5. 분기 정책

- **W-1 보호 파일 교집합 발견** → 즉시 중단 + 보고. 사용자 보호 해제 결정 또는 B/D안 재검토 대기.
- **W-2 라우팅 모듈 의존 발견** → 즉시 중단 + 보고. 사용자 판단으로 본 발주 보류 또는 더 큰 범위 재발주.
- **W-2 변경 대상 파일 6건 이상** → 즉시 중단 + 보고. 단발 패치 범위 초과로 G-복합 발주 재설계 권고.
- **W-3 패치 후 tsc 오류 또는 테스트 실패** → 즉시 패치 롤백 + 보고.
- **W-4 G2-5 28 시나리오 결과 1건이라도 변화** → 즉시 패치 롤백 + 보고 (라우팅 회귀 발생).
- **W-4 보호 23건 hash 변경 발견** → 즉시 패치 롤백 + 보고.

## 6. 본 발주 종료 시점

- W-1~W-4 마감 또는 단계 3-α 정지 후 사용자 결정 보고
- 종합 보고서 1건 작성 완료
- 보호 23건 hash 무변경 확인
- 자가 패치 0건 연속 15회 달성 (목표)
- G2-5 28/28 + Type II 0/5 비트 동등 재확인

마감 후 사용자(문형철) 보고 → Vercel 배포 가이드 적용 → 트랙 2 점검 시작.

---

**발주 끝.** 시작 전 본 발주문 + ALPHA-0_checklist_v1.md + G3-pre / G3-1 / G3-2 보고서 + v13 인계 문서 정독 후 시작.

**가장 중요한 분기**: W-1에서 보호 파일 교집합 발견 시 본 발주는 즉시 중단됩니다. 그 경우 사용자(문형철)가 (a) 보호 해제 결정 (b) D안(Railway/Render)으로 전환 (c) 본 발주 보류 중 선택합니다.
