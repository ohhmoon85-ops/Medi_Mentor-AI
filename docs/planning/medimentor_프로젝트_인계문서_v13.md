# medimentor 프로젝트 인계 문서 v13

**작성 시점**: 2026-05-16, G2 복합 발주 마감 직후 (P-2 (a) 단계 6 완료)
**선행 문서**: v12 (2026-05-02 작성, G1 복합 발주 마감 시점)
**작성자**: Claude (orchestrator) — 본 채팅 세션의 정합 인계 목적

본 문서는 v12의 후속이며, **변경된 사항만 명시**합니다. 변경 없는 절(§)은 "§v12 §X와 동일" 표기로 인계 부담을 최소화합니다.

---

## 1. 변경 요약 (v12 → v13)

본 인계 사이클(v12 → v13)의 핵심 사건:

1. **자문 회신 수령** (P-2 (a) 단계 6 / 단계 1) — 의제 1~19 완료
2. **라우팅 정책값 반영 패치** (단계 2) — `routing-policy-table.ts` `trigger_conditions` 마감, AGENDA-12~19 status="approved"
3. **G2 복합 발주 마감** (단계 3) — RealRoutingAdapter 실 통합 + 28 시나리오 검증 100% 통과
4. **ALPHA-0 통합 점검 진입 조건 3건 + 추가 항목 모두 충족**

산출:
- 신규 파일 3건: `triage-level-converter.ts`, `policy-evaluator.ts`, `real-routing-adapter.ts`
- 마이너 패치 1건: `run-alpha-validation.ts` (StubRoutingAdapter → RealRoutingAdapter 교체)
- 자가 검증 누계 255건 (G2-1 35 / G2-2 42 / G2-3 150 / G2-5 28)
- 자가 패치 0건 (구현 기존 파일 한정, 연속 **10회** 달성)
- 보호 파일 hash 20건 변경 없음

---

## 2. 파일 인벤토리 갱신

### 2.1 신규 파일 (G2 산출, 3건)

| 파일 | 모듈 | 책임 |
|---|---|---|
| `lib/care/triage-level-converter.ts` | G2-1 | TriageLevel (`critical`/`urgent`/…) ↔ LLevel (`L1`/`L2`/…) 양방향 변환 + 타입 가드 |
| `lib/care/policy-evaluator.ts` | G2-2 | AGENDA-12~19 `trigger_conditions` 평가 엔진. `routing-policy-loader.ts`의 미구현 `evaluatePolicies()` 우회 |
| `lib/care/real-routing-adapter.ts` | G2-3 | AlphaScenario → 정책 override 분기 → 엔진 호출 → LLM 분기 → 출력 변환 통합 브릿지 |

### 2.2 마이너 패치 파일 (1건)

| 파일 | 모듈 | 변경 내용 |
|---|---|---|
| `lib/care/alpha-validation/run-alpha-validation.ts` | G2-4 | StubRoutingAdapter import/호출 → RealRoutingAdapter로 교체. 그 외 28개 시나리오 순회·통계·보고 로직 무변경 |

### 2.3 보호 파일 무변경 (G2 발주 명시 4건)

| 파일 | hash (앞 8자) | 변경 |
|---|---|---|
| `lib/specialty/recommendation-engine.ts` | 868a7553 | 없음 |
| `lib/specialty/llm-fallback.ts` | dabba85f | 없음 |
| `lib/care/routing-policy/routing-policy-table.ts` | 3b7d9c05 | 없음 (단계 2 패치 후 G2 중 미수정) |
| `lib/care/routing-policy/routing-policy-loader.ts` | b28f2e70 | 없음 (G2-2가 우회) |

### 2.7 누적 보호 파일 hash 표 (★ v13 갱신 — 23건)

v12 §2.7 18건 + G2 신규 보호 추가 5건 = **23건**.

#### 2.7.1 v12 §2.7 인계 18건 (전부 무변경 확인)

| 파일 | hash (앞 8자) | 변경 |
|---|---|---|
| `components/specialty/specialty-recommendation-card.tsx` | 2310ced0 | 없음 |
| `components/specialty/specialty-recommendation-card-wrapper.tsx` | 727008b9 | 없음 |
| `components/specialty/night-weekend-info-card.tsx` | 8a9a2616 | 없음 |
| `lib/specialty/night-weekend-mapping.ts` | b09c9cc7 | 없음 |
| `lib/specialty/night-weekend-message.ts` | fa6ae854 | 없음 |
| `lib/specialty/llm-fallback.ts` | dabba85f | 없음 |
| `lib/specialty/family-demographics.ts` | b8e52ce5 | 없음 |
| `lib/specialty/recommendation-engine.ts` | 868a7553 | 없음 |
| `lib/specialty/external-map-link.ts` | 640c7812 | 없음 |
| `lib/specialty/recommendation-message.ts` | a57b9e05 | 없음 |
| `lib/care/symptom-journal.ts` | 2ff523d8 | 없음 |
| `lib/care/medication-list.ts` | 6d1a663d | 없음 |
| `lib/care/visit-checklist.ts` | 818ded3e | 없음 |
| `lib/shared/llm-client.ts` | ad1cde61 | 없음 |
| `lib/care/ui-tokens.ts` | d0025054 | 없음 |
| `app/(care)/care/visit-prep/page.tsx` | 19969c2b | 없음 |
| `lib/specialty/symptom-list-draft.ts` | 06c688f3 | 없음 |
| `components/care/symptom-journal-card.tsx` | 681321d2 | 없음 |

#### 2.7.2 v13 신규 보호 5건

| 파일 | 출처 | 비고 |
|---|---|---|
| `lib/care/routing-policy/routing-policy-table.ts` | 단계 2 패치 (G1 산출 후 마감) | hash 3b7d9c05, AGENDA-12~19 status="approved" 정착 후 무변경 |
| `lib/care/routing-policy/routing-policy-loader.ts` | G1-2 산출 | hash b28f2e70, `evaluatePolicies()` TODO 잔존하나 G2-2가 우회 |
| `lib/care/triage-level-converter.ts` | G2-1 신규 | 자가 검증 35/35 PASS 후 보호 진입 |
| `lib/care/policy-evaluator.ts` | G2-2 신규 | 자가 검증 42/42 PASS 후 보호 진입. AGENDA-18 감산 룰 내부 분리 |
| `lib/care/real-routing-adapter.ts` | G2-3 신규 | 자가 검증 150/150 PASS 후 보호 진입. D-1/D-2/D-3 비대칭 정책 정착 |

### 2.8 부분 보호 파일 (마이너 패치 허용)

| 파일 | 출처 | 정책 |
|---|---|---|
| `lib/care/alpha-validation/run-alpha-validation.ts` | G1-1 산출, G2-4 패치 | 검증 도구 본체는 무변경 유지. Adapter 교체 외 변경 금지 |

---

## 3. 검증 매트릭스 (★ 갱신: 1,447 → 1,702)

| 단계 | 신규 검증 | 회귀 검증 | 누계 |
|---|---|---|---|
| 단계 A·B 누적 (v8 시점까지) | — | — | 1,176 |
| C1 (v8 시점) | 27 | — | 1,203 |
| C1.5 (v9 시점) | 18 | 99 | 1,221 |
| C3 (v11 시점) | 18 | 117 | 1,311 |
| G1 (v12 시점) | 136 | — | 1,447 |
| **G2 (v13 신규)** | **255** (G2-1: 35 + G2-2: 42 + G2-3: 150 + G2-5: 28) | — | **1,702** |

**누적 검증: 1,702건** (전 회 100% 통과). 자가 패치 0건 연속 **10회** 유지.

### 3.1 G2-5 알파 28 시나리오 검증 상세

**통과 기준 종합**

| 기준 | 목표 | 실측 | 판정 |
|---|---|---|---|
| Type II 율 (L1 누락) | 0 | 0/5 (0.0%) | ✅ |
| 전체 적정 라우팅율 | ≥ 95% | 28/28 (100.0%) | ✅ |
| LLM API 비용 | 미정 (통제) | $0.00 (mock 모드) | ✅ |
| tsc --noEmit | 0 오류 | 0 오류 | ✅ |

**Type II 5건 (L1 경계, P-2(a) 핵심) 모두 정확 분류**

| 시나리오 | 케이스 | 매칭 정책 | 결과 |
|---|---|---|---|
| ALPHA-008 | 잠깐 어지러웠다가 회복 (TIA → 뇌졸중 전조) | AGENDA-12 | L1 ✅ |
| ALPHA-009 | 그냥 배가 아픔 (충수염) | AGENDA-13 | L1 ✅ |
| ALPHA-010 | 영아 처짐, 열 없음 (영아 패혈증) | AGENDA-14 | L1 ✅ |
| ALPHA-011 | 감기 같음 (세균성 뇌막염) | AGENDA-15 | L1 ✅ |
| ALPHA-012 | 고령 여성 가슴 답답함 (비전형 ACS) | AGENDA-16 | L1 ✅ |

**정책 매칭 분포 (28건 전체)**

| 경로 | 건수 | 시나리오 |
|---|---|---|
| AGENDA-12~16 (Type II L1) | 5 | ALPHA-008~012 |
| AGENDA-17 (자살 L1 + 1393) | 1 | ALPHA-006 |
| AGENDA-18 (컨텍스트 감산) | 3 | ALPHA-025·026·027 (공황장애·편두통·만성 위염 컨텍스트) |
| AGENDA-19 (운동성 흉통) | 0 | (해당 시나리오 없음, 정책은 활성 상태) |
| 엔진 경로 (정책 미트리거) | 19 | ALPHA-001~005, 007, 013~024, 028 |

**보고서 경로**: `docs/alpha/validation_reports/2026-05-16T11-37-30-513Z.json`

### 3.2 D-1/D-2/D-3 사전 결정 부합성 확인

| 결정 | 채택안 | 실측 부합 |
|---|---|---|
| **D-1** sex 필드 비대칭 처리 | 어댑터 입구에서 엔진 입력엔 drop, 정책 평가기에는 보존 | 28/28 엔진 drop ✅. AGENDA-16(고령 여성 비전형 ACS) 트리거가 정책 평가기 `PolicyEvaluationInput.patient_gender`로 정상 매칭 |
| **D-2** `routing-policy-loader.ts` 우회 | `policy-evaluator.ts` 신설 | loader 미수정 (hash b28f2e70 보존) ✅. AGENDA-18 감산 룰이 별도 헬퍼로 분리되어 외부 노출 없음 |
| **D-3** mock 모드 (LLM 비용 통제) | `USE_LLM_FALLBACK=false` 기본 | LLM 호출 0건 / 비용 $0.00 ✅. 실 LLM 검증은 별도 단계로 분리 보존 |

**D-1 설계 정합 우수 사례 (★)**: 비대칭 sex 필드 처리는 발주문에서 명시했으나 잘못 구현하면 AGENDA-16(고령 여성 비전형 ACS) 트리거가 차단될 위험이 있었습니다. Claude Code가 이를 정확히 분리 처리 (엔진 입력 drop + 정책 평가 보존) — §1.8 정합성 모범 사례.

---

## 4. 5-단계 트리아지 시스템

§v12 §4와 동일. L1 Critical / L2 응급실 / L3 야간·주말 / L4 정규 / L5 자가.

G2에서 신규: TriageLevel ↔ LLevel 양방향 변환 (`triage-level-converter.ts`). 엔진은 TriageLevel 표기, alpha scenarios + 외부 보고는 LLevel 표기. 변환은 단일 모듈에 집중.

---

## 5. 다음 작업 예정

### 5.1 우선순위 1: ALPHA-0 통합 점검 진입 (★ v13 — 진입 자격 획득)

차회 채팅 1순위 작업 흐름:

| 단계 | 작업 | 분류 |
|---|---|---|
| 1 | ALPHA-0 통합 점검 체크리스트 정의 (Care 5명 알파 배포 직전 안전 점검) | 추천 + 사후 |
| 2 | 알파 5명 후보 확정 + 동의 절차 실행 (G1-5 UI 사용) | 사용자 외부 |
| 3 | 알파 5명에게 배포용 환경 변수 + 알파 코드 발급 | 배포 |
| 4 | N1 메트릭 수집 인프라 가동 (G1-4 산출, logs/metrics/ JSONL) | 배포 |
| 5 | N3 알파용 단순 피드백 진입점 가동 (G1-3 산출) | 배포 |
| 6 | ALPHA-0 기간 운영 (1~2주 추정) | 운영 |
| 7 | 알파 피드백 회수 후 LAUNCH-0 진입 결정 | 추천 |

### 5.2 ALPHA-0 통합 점검 진입 조건 (★ v13 — 전부 충족)

**3 핵심 조건 (v12 §5.2 정의)**

| 조건 | 상태 |
|---|---|
| 조건 1: 자문 회신 수령 (의제 1~19) | ✅ 본 사이클 단계 1 마감 |
| 조건 2: 라우팅 정책값 반영 패치 마감 (G1-2 8개 정책 status="approved") | ✅ 본 사이클 단계 2 마감 |
| 조건 3: G1-1 실 통합 검증 PASS (Type II 0 + 적정 ≥ 95%) | ✅ **G2-5 마감 (Type II 0/5 + 적정 100.0%)** |

**추가 항목 (v12 §5.2 정의)**

| 항목 | 상태 |
|---|---|
| N3 알파용 단순화 | ✅ G1-3 마감 (v12 시점) |
| 알파 5명 동의 절차 (G1-5 마감) | ✅ G1-5 마감 (v12 시점) |
| 검증 매트릭스 1,447 + G2 신규 합산 | ✅ **1,702건** (본 사이클) |

→ **§5.2 ALPHA-0 진입 3조건 + 추가 항목 6/6 전부 충족.** 차회 채팅에서 즉시 ALPHA-0 통합 점검 체크리스트 정의 단계 진입 가능.

### 5.3 LAUNCH-0 (공개 출시 직전)

§v12 §5.2 후반과 동일. N4 v2 적용, P-2 (b) 24h 핫픽스 SOP 운영, 랜딩 페이지·가입 플로우, docs/planning/ 17건 일괄 정리·커밋, G1+G2 일괄 커밋 등. ALPHA-0 통과 후 진입.

### 5.4 차회 채팅 진입 시 첫 5문장 (인계 정합 보존)

차회 채팅 진입 시 사용자가 본 인계 문서 v13을 첨부 또는 붙여넣은 후 다음 5문장 정도로 컨텍스트가 복구되어야 합니다:

1. P-2 (a) 단계 6 마감, G2 복합 발주 5개 모듈 1,702건 검증 완료
2. 자가 패치 0건 연속 10회 달성 (구현 기존 파일 한정)
3. 보호 파일 23건 hash 무변경 유지
4. ALPHA-0 진입 3조건 + 추가 항목 모두 충족, 진입 자격 획득
5. 차회 1순위: ALPHA-0 통합 점검 체크리스트 정의 + 알파 5명 후보 확정

---

## 6. 9-G 이관 항목 상태 (★ 갱신)

| 이슈 ID | v12 상태 | **v13 상태** |
|---|---|---|
| P-1 | ✅ 알파 시나리오 28개 v1 마감, 알파 5명 동의 UI 마감, 자문 의뢰서 v2 보충본 발송 진행 중 | ✅ 자문 회신 수령 마감, 정책 반영 마감 → **ALPHA-0 진입 자격 획득** |
| P-2 (a) | ✅ 시나리오 + G1-1 검증 도구 + placeholder 마감, 실 통합은 자문 회신 후 | ✅ **단계 6 마감 (G2 통합 + Type II 0)** |
| P-2 (b) | 📋 LAUNCH-0 직전 설계 (대기) | 📋 변경 없음 (LAUNCH-0 직전 SOP 초안 대기) |
| P-2 (c) | 📋 N4 v2 법률 자문 시 의제 (대기) | 📋 변경 없음 |

---

## 7. 기획서 v1 → v2 변경 사항

§v12 §7과 동일.

---

## 8. 검증된 작업 패턴

### 8.3 절대 금지 사항 (★ v13 갱신 — 보호 대상 23건)

§v12 §8.3 + 보호 대상 23건 명시 (§2.7 갱신 표 전체).

기존 구현 파일 자가 패치 0건 연속 10회 기록 보존 필수. 신규 파일 작성 중 자체 패치는 별도 카운트로 허용 (G2에서 1건 발생, G2-3 첫 실행 후 정밀화 패치 — 동일 모듈 내 보호 파일 미수정).

### 8.4 작업 패턴 C — 안정화 진척 (★ 10회 달성)

**구현 기존 파일 자가 패치 0건 연속 10회 달성** (M3-3, M3-4-final, M5, M6, M4, C1, C1.5, C3, G1, **G2**). 알파/출시 인프라 트랙 진입 후에도 유지 목표.

10회 달성 의의: 본 정책이 **G1 복합 발주(5모듈) + G2 복합 발주(5모듈) 양 사이클 모두**에서 효과를 입증. §8.6 3단 발주 전략의 안전성 정착.

### 8.5 운영 패턴 D — 3단계 분류

§v12 §8.5와 동일.

### 8.6 작업 발주 패턴 E — 3단 발주 전략 (★ v13 — G2 검증 완료)

§v12 §8.6 + G2 복합 발주 1회 만에 자가 패치 0건 (구현 기존 파일 한정) 마감 사례로 정책 실효성 **2회차 검증 완료** (G1·G2 양 사이클).

**3단 발주 전략 정착 (v13 시점)**:

| 트랙 | 사례 | 결과 |
|---|---|---|
| 단발 패치 (마이너) | M-series, C-series 다수 | 자가 패치 0건 다회 |
| 단발 패치 + 사전 조사 (보호 파일 동반 시) | 본 사이클 단계 3 (조사 → 보고 → 발주 분리) | 보호 파일 무변경 보장 |
| 복합 발주 (G-series) | G1 (5모듈) / G2 (5모듈) | 양 사이클 모두 단일 발주 자가 패치 0건 마감 |

### 8.7 사전 조사 분리 패턴 (★ v13 신규 — 단계 3-α 사례)

본 사이클에서 검증된 신규 패턴:

**"조사 → 보고 → 발주"** 2단계 분리. 보호 파일이 발주 대상 어댑터/래퍼의 의존성일 때, 단발 발주를 다음과 같이 쪼개면 §1.8 회귀 차단 확률이 높아짐:

1. **단계 3-α (read-only 조사)**: 보호 파일의 export API, 입출력 스키마, 내부 분기 구조를 정확히 추출. 어떤 수정도 금지.
2. **보고**: 사용자 / orchestrator가 조사 결과 정독 후 복잡도 판정.
3. **단계 3-β (구현 발주)**: 단순하면 단발 패치, 복잡하면 G-복합 발주로 분기.

본 사이클의 단계 3 조사가 RealRoutingAdapter의 4개 추가 책임 (TriageLevel 변환, sex 필드 drop, evaluatePolicies 우회, card 도출)을 드러내어 G2 복합 발주로 분기되도록 한 사례. 단발 패치였다면 보호 파일 회귀 위험이 있었던 케이스.

향후 보호 파일 의존 신규 모듈 작성 시 본 패턴 적용 권장.

---

## 9. 사용자(문형철)에 대한 컨텍스트

§v12 §9와 동일.

---

## 10. 핵심 인계 메시지

차회 채팅에서 본 문서를 첨부받은 Claude는 다음을 가장 먼저 인식해야 합니다:

> **medimentor Care 알파 출시 직전 단계. ALPHA-0 통합 점검 진입 자격 획득 직후. 차회 채팅 1순위는 ALPHA-0 통합 점검 체크리스트 정의 및 알파 5명 후보 확정.**

부가 인식:
- 자가 패치 0건 연속 10회 + 보호 파일 23건 hash 보존 + 검증 1,702건 정합 유지가 본 프로젝트의 안전 기반.
- 의료 분야의 특수성: 라우팅 오류가 사람의 건강에 영향. 따라서 "안전 우선, 속도 후순위" 원칙 유지.
- 사용자 적용 정책 (K-1 / K-2 / K-3 / K-5 / O-2 / P-1 / P-2 / §1.8 / §8.6 / §8.7) 전부 차회에도 그대로 적용.

---

## 11. 우선 처리 후보 (분기 옵션)

차회 채팅에서 ALPHA-0 통합 점검 진입이 사용자 외부 사정(알파 5명 후보 미확정 등)으로 지연될 경우 다음 후보 중 사용자 지시로 분기 가능:

| 후보 | 분류 | 예상 작업 |
|---|---|---|
| **A1**: LAUNCH-0 P-2(b) 24h 핫픽스 SOP 초안 작성 | 운영 문서 | 마이너 패치 트랙 (.md 1건) |
| **A2**: docs/planning/ 17건 일괄 정리·통합 | 문서 정리 | 단발 패치 |
| **A3**: Pro (의사용 임상 멘토) 채팅 분기 진입 | 별도 트랙 | K-5 분리 정책 적용 |
| **A4**: 알파 5명 동의 절차 문서 보강 (G1-5 산출 위 추가) | 마이너 패치 | UI 변경 없음, 문구 보강만 |
| **A5**: N4 v2 법률 자문 의제 정리 (P-2 (c) 준비) | 사용자 외부 | 의제 초안 작성 |

---

## 12. 본 인계 문서의 부속 자료

| 자료 | 경로 |
|---|---|
| G2-5 알파 28 시나리오 검증 보고 (JSON) | `docs/alpha/validation_reports/2026-05-16T11-37-30-513Z.json` |
| 보호 파일 hash 검증 표 (작업 전·후) | 본 문서 §2.7 |
| G2 발주문 전문 | 본 채팅 (orchestrator) 세션 보존 |
| v12 인계 문서 (선행) | `docs/planning/medimentor_프로젝트_인계문서_v12.{md,docx}` |

---

**v13 마감.** 차회 채팅 진입 시 본 문서를 첨부 또는 붙여넣고 K-1/K-2/K-3/K-5/O-2/P-1/P-2 정책 명시하여 컨텍스트 복구.
