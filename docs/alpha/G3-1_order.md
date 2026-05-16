# Claude Code 발주: G3-pre Finding 1·2 해소 (G3-1, 단발 패치)

## 0. 본 발주의 위치

선행 마감: G3-pre 보고 (`docs/alpha/G3-pre_report_2026-05-16T13-51-53.md`)
- W-1~W-4 4/4 PASS, 자가 패치 0건 연속 11회 달성
- 본 발주는 G3-pre Finding 1·2 해소 단발 패치 (B안 트랙 1)

본 발주에서 처리:
- Finding 1 (G1-3·G1-4 페이지 wiring 부재) — ALPHA-0 §3 C-6 P1 차단 해소
- Finding 2 (.env.example 부재) — 배포자 가이드 보완

본 발주 외부:
- Finding 3 (kill switch 후보 A 즉시 가용) — 코드 변경 불요, 사용자 토글 시연(C-7.1)으로 처리
- C-2 라이브 캡처 / C-4 UI 캡처 / C-5 E2E 시연 — 사용자 외부 (B안 트랙 2)
- kill switch 후보 B (전용 게이트 변수) — LAUNCH-0 P-2(b) 본격 SOP 시점으로 이연

## 1. 적용 정책

K-1 / K-2 / K-3 / K-5 / O-2 / P-1 / P-2 / §1.8 / §8.6 / §8.7

**§8.6 분류**: 단발 패치 (마이너 + 신규 1건)
**§8.7 적용**: W-1·W-2는 G3-pre W-4 조사 결과 기반 + 단계 3-α(target 식별 보고) → 단계 3-β(wire-in 패치) 2단계 분리. target이 자명한 경우(예: care 메인 진입점이 단일 page.tsx)에는 단일 사이클 처리 허용.

## 2. 작업 항목 (3건)

### W-1. G1-3 FeedbackEntryButton wire-in (Finding 1-a 해소)

**전제** (G3-pre W-4 조사 2 결과):
- G1-3 산출 모듈 경로: G3-pre 보고 §5에 명시된 경로 그대로 인용
- export: `FeedbackEntryButton` (또는 G3-pre 보고가 식별한 정확한 export 명)
- 현재 상태: 어떤 `page.tsx`에서도 import되지 않음

**절차** (§8.7 2단계 분리):

**단계 3-α (조사, read-only)**:
1. `app/(care)/` 하위 모든 `page.tsx` 열거
2. 각 페이지의 역할 (메인 진입 / 결과 / 방문 준비 등) 식별
3. `FeedbackEntryButton` wire-in 적합 후보 1~3건 평가 (사용자 도달 빈도 / 라우팅 결과 직후 표시 / 보호 파일 회피)
4. **보호 23건 (v13 §2.7)** 중 `app/(care)/care/visit-prep/page.tsx`는 wire-in **대상 제외** (보호)
5. 보고 형식:

   ```
   ## W-1 단계 3-α 조사 결과
   
   ### 후보 page.tsx 목록
   | 경로 | 역할 | 보호 여부 | wire-in 적합도 | 사유 |
   |---|---|---|---|---|
   | app/(care)/care/page.tsx | (역할) | (없음/있음) | (높음/중간/낮음) | (사유) |
   | ... | ... | ... | ... | ... |
   
   ### 권고 target
   [경로] — 사유: [간단 설명]
   
   ### 보호 파일 회피 확인
   - 보호 23건 중 본 후보 목록과의 교집합: [없음 / 있는 경우 항목 명시]
   ```

**단계 3-β (패치 실행 조건)**:
- target 후보가 1건이고 보호 파일 무관 + 사용자 도달 동선상 자명한 경우 → **즉시 wire-in 패치** (마이너)
- target 후보가 2건 이상이거나 사용자 판단 필요 → **단계 3-α 보고에서 정지**, 사용자 ACK 대기

**wire-in 패치 내용**:
- target `page.tsx`에 `import { FeedbackEntryButton } from "..."` 추가
- 적절한 위치에 `<FeedbackEntryButton />` 삽입 (라우팅 결과 표시 직후 권고)
- **기존 로직 무수정** (props·state·effects 변경 금지)

### W-2. G1-4 collectMetric wire-in (Finding 1-b 해소)

**전제** (G3-pre W-4 조사 2 결과):
- G1-4 산출 모듈 경로: G3-pre 보고 §5에 명시
- export: `collectMetric` (또는 G3-pre 보고가 식별한 함수명)
- 4 메트릭 타입: G1-4 산출 시점의 메트릭 타입 4종 — 보고에서 식별
- 현재 상태: 어떤 page에서도 호출되지 않음

**절차** (§8.7 2단계 분리):

**단계 3-α (조사, read-only)**:
1. `collectMetric` 4 메트릭 타입 각각의 호출 적합 시점 식별
   - 예: 라우팅 결과 표시 시점 / 사용자 진입 시점 / 피드백 제출 시점 / 알파 코드 검증 시점
2. 각 메트릭 타입별 wire-in 적합 위치 후보 보고
3. 보호 파일 회피 확인 (보호 23건과 교집합 없음 검증)

**단계 3-β (패치 실행 조건)**:
- 메트릭 타입별 wire-in 위치가 자명하면 즉시 패치
- 판단 필요 시 보고 후 정지

**wire-in 패치 내용**:
- `collectMetric` import 추가
- 적절한 시점에 호출 (`useEffect` / 이벤트 핸들러 / Promise then 등)
- **개인 식별 정보 미저장** (v13 §10 / 알파 익명화 정책 정합)
- **기존 로직 무수정**

### W-3. .env.example 추가 (Finding 2 해소)

**신규 파일 1건**: `.env.example` (프로젝트 루트)

**포함 키 (placeholder 값으로)**:

```
# Alpha 코드 게이팅 (kill switch 후보 A — Finding 3)
# 알파 5명 코드를 콤마 구분으로 입력. 차단 시 빈 문자열 또는 미설정으로 토글.
ALPHA_USER_CODES=alpha-001,alpha-002,alpha-003,alpha-004,alpha-005

# LLM fallback 모드 (D-3 정합)
# false: mock 모드 (LLM 호출 0건, 비용 $0). 알파 검증 기본값.
# true: 실 LLM 호출. ALPHA-0 단계 사용자 결정 후 활성화.
USE_LLM_FALLBACK=false

# LLM API 키 (USE_LLM_FALLBACK=true 시에만 필요)
ANTHROPIC_API_KEY=

# [기타 G3-pre W-4 조사 1에서 식별된 환경 변수가 있다면 여기 추가]
```

**검증**:
- `.gitignore`에 `.env` (정확한 매칭) 또는 `.env.local` 등 패턴 존재 확인
- `.env.example`은 `.gitignore`에서 제외되어야 함 (커밋 대상)

## 3. 절대 금지 사항

본 발주 전 기간 동안:

1. **보호 파일 23건 수정 금지** (v13 §2.7 — `app/(care)/care/visit-prep/page.tsx` 포함)
2. **부분 보호 파일 1건 수정 금지** (`lib/care/alpha-validation/run-alpha-validation.ts`)
3. **G1-3·G1-4 모듈 자체 수정 금지** — wire-in은 호출자(page.tsx)에서만, 모듈 export·내부 로직 무수정
4. **자가 패치 금지** — wire-in 첫 시도 후 동작 안 한다고 호출자 page.tsx 외 파일 수정 금지. 발견 시 즉시 정지 + 보고
5. **정책 테이블 수정 금지** (`routing-policy-table.ts`)
6. **환경 변수 토글 금지** (.env 실파일 수정 금지, .env.example만 신규 생성)
7. **G2 신규 보호 5건 수정 금지** (`triage-level-converter.ts` / `policy-evaluator.ts` / `real-routing-adapter.ts` / `routing-policy-table.ts` / `routing-policy-loader.ts`)

**자가 패치 카운트 보호 목표**: 본 발주 종료 시점 자가 패치 0건 연속 **12회** 달성.

## 4. 산출물

### 4.1 신규 파일

| 경로 | 용도 | 비고 |
|---|---|---|
| `.env.example` | W-3 산출 | 신규 1건 |
| `docs/alpha/G3-1_report_[YYYY-MM-DDTHH-MM-SS].md` | 본 발주 종합 보고 | 신규 1건 |

### 4.2 마이너 패치 파일 (예상)

| 경로 | 변경 내용 | 출처 |
|---|---|---|
| `app/(care)/.../page.tsx` (W-1 target) | `FeedbackEntryButton` import + 1줄 삽입 | W-1 |
| `app/(care)/.../page.tsx` (W-2 target, 동일 또는 별개 page) | `collectMetric` import + 호출 추가 | W-2 |

W-1·W-2 target이 동일 페이지일 가능성 — 그 경우 1건 마이너 패치로 통합.

### 4.3 종합 보고서 형식

**경로**: `docs/alpha/G3-1_report_[YYYY-MM-DDTHH-MM-SS].md`

**구성**:
- §1 본 발주 ID + 실행 시작·종료 시각 + 적용 정책
- §2 W-1 단계 3-α 조사 결과 + 단계 3-β 패치 내용 (또는 정지 사유)
- §3 W-2 단계 3-α 조사 결과 + 단계 3-β 패치 내용 (또는 정지 사유)
- §4 W-3 .env.example 내용 + `.gitignore` 확인 결과
- §5 보호 파일 23건 hash 시작·종료 비교 표 (전부 무변경 확인)
- §6 자가 패치 카운트 (목표: 0건, 마이너 패치는 별도 카운트)
- §7 ALPHA-0 §3 게이트 진척 갱신:
  - C-6.1·6.2: 페이지 wiring 완료 후 가동 가능 상태 (단, 실 가동 시험은 사용자 외부)
  - 그 외 게이트: G3-pre 시점과 동일
- §8 후속 분기 권고:
  - C-6 가동 시험 → ALPHA-0 진입 후 알파 사용자 실 입력으로 자연 검증 가능
  - 또는 G3-2로 분리 가동 시험 발주 가능

## 5. 분기 정책

- **W-1·W-2 단계 3-α에서 target 후보 0건** (모든 page가 보호 또는 부적합) → 즉시 정지 + 보고. 사용자가 신규 page.tsx 생성 여부 판단.
- **W-1·W-2 단계 3-α에서 target 후보 1건** → 단계 3-β 즉시 진행.
- **W-1·W-2 단계 3-α에서 target 후보 2건 이상** → 권고 1건만 표시 + 단계 3-β 정지, 사용자 ACK 대기.
- **wire-in 패치 후 tsc 오류** → 즉시 보고 + 패치 롤백 + 정지. 임의 수정 절대 금지.
- **W-3 `.gitignore`에 `.env` 패턴 부재** → `.env.example` 생성하되 보고서 §4에 경고 명시. `.gitignore` 임의 수정 금지.

## 6. 본 발주 종료 시점

- W-1·W-2·W-3 마감 (또는 단계 3-α 정지 시 사용자 ACK 대기)
- 종합 보고서 1건 작성 완료
- 보호 파일 23건 hash 무변경 확인
- 자가 패치 0건 (구현 기존 파일 한정, 마이너 패치는 별개 카운트)

마감 후 사용자(문형철) 보고 → ALPHA-0 §3 게이트 P1 C-6 통과 판정 → B안 트랙 2 (사용자 수동 점검) 결과와 수렴 → v13 §5.1 단계 2 (알파 5명 후보 확정) 진입.

---

**발주 끝.** 시작 전 본 발주문 + ALPHA-0_checklist_v1.md + G3-pre_report + v13 인계 문서 4건 모두 정독 후 시작.
