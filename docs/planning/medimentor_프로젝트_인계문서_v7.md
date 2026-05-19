# medimentor 프로젝트 인계 문서 v7 (Care)

> **이 문서는 새 Claude 채팅창에 그대로 복사하여 붙여넣기 위한 인계 문서입니다.**
>
> **사용법**: 새 채팅창을 열고 이 문서 전체를 복사한 뒤, 첫 메시지로 다음과 같이 보내주십시오:
>
> ```
> 이 인계 문서를 읽어주세요. medimentor Care 프로젝트를 이어서 진행하려고 합니다.
>
> [여기에 본 인계 문서 전체 붙여넣기]
>
> 다음 작업은 [작업 명칭]입니다.
> ```

---

**작성일**: 2026-05-03 (v7)
**작성자**: 문형철 (KDVA 사무총장, 퇴역 대령)
**프로젝트**: MediMentor AI - Care 채팅 (Pro는 별도 채팅으로 분리 운영)
**현재 위치**: Care 폐쇄 베타 출시 준비 — C1 사이클 종결 (visit-prep 라우트 + wrapper 신설), C1.5 사이클 진입 직전
**v6 → v7 주요 변경**:
- C1 사이클 종결 (visit-prep 라우트 + specialty-recommendation-card-wrapper 신설, 27/27 PASS, 구현 파일 자가 패치 0건)
- 누적 검증 1,131건 → **1,158건** (+27)
- 자가 패치 0건 연속 5회 → **연속 6회** (M3-3, M3-4-final, M5, M6, M4, C1)
- **M5 Work 4 잔존 코드 사실 명시** (인계 v6 미기재) — specialty-recommendation-card.tsx 내부 "방문 전 준비하기" 버튼 존재, A-3 응급 라우팅 분기 미적용
- **신규 결정 ID M-1**: 내부 버튼 제거 + wrapper 외부 버튼 단일 진입점 (L-4 정신 일관 적용)
- C1.5 사이클 신설 (M-1 적용 + 회귀 검증)
- N1 메트릭 4종 확정 (만족도·매칭 정확도·응급 라우팅 적정성·**베타 잔존율**)
- 옵션 D 채택 (병렬 분리: 코드 트랙 + 비코드 트랙)

---

## 1. 프로젝트 정체성

### 1.1 한 줄 정의 (기획서 v2 기준, 변경 없음)

MediMentor AI는 환자에게는 "1차 의료 안내자"가 되고, 의사에게는 "24시간 옆을 지키는 임상 멘토"가 되어 주는, 전 세계 의료 지식을 통합한 양방향 AI 진료 지원 플랫폼이다.

### 1.2 medimentor 사용자 정체성 (E-1, 변경 없음)

medimentor는 "노년층 대상 의료 AI"가 아니라 **"한국 가정 누구에게나 필요한 가정 주치의 안내자"**이다.

- **노년층**: 가장 취약한 1차 고려 대상이지만 유일 사용자가 아님. 빈발 증상 가중치 유지.
- **전 연령 시나리오 정식 지원**: 영유아·소아·청장년·임산부·노년 모두 커버.
- **가족 단위 3인칭 입력 정식 지원**: "내 아이가", "부모님이", "남편이" 등.
- **3인칭 가족 호칭 표준 목록** (M3-2-a-fix4 확정): 어머니, 아버지, 남편, 아내, 아들, 딸, 부모, 형, 동생, 언니, 할아버지, 할머니, 아이, 아기, 가족, 엄마, 아빠, 오빠, 누나.

### 1.3 브로드 추천 정책 (G-1, 변경 없음)

medimentor는 닥터나우·굿닥의 단정적 병원 추천("이 병원으로 가세요")과 차별화하여 "안내자형 메시지"("이런 진료과들 중 가까운 곳으로 가세요")를 채택한다.

- 환자에게 `secondary_specialties`와 `tertiary_specialties`를 적극 노출
- 추천 문구 형식: "OO과를 우선 권합니다. ~한 경우 OO과·OO과도 고려하실 수 있습니다."
- M3-2 50개 entries 매핑 완성, M3-3 추천 로직, M3-5-γ UI, M4 야간/주말 안내 모두 일관 적용 완료

### 1.4 Critical 응급 라우팅 정책 (A-3, 변경 없음)

- `primary_specialty`는 증상별 차등 (의학적 정확성 유지)
- M3-3 추천 로직에서 red_flag classifier critical 판정 시 `emergency:true` 진료과(EM)로 강제 라우팅
- 환자 안내 메시지: "119 응급실로 가세요. 내원 후 OO과 진료가 필요할 수 있습니다."
- `secondary_specialties`는 "응급 처치 후 follow-up 진료과" 의미 (B-3 정책)

### 1.5 현재 작업 범위 (Option β, C1 종결, 2026-05-03 갱신)

**Option β — Care + Pro 병렬 진행** (기획서 v2 정합):

**Care 채팅 (본 문서)**:
- ✅ Care MVP 핵심 모듈 완료 (M3-1 ~ M3-5 + M4 + M5 + M6 종결)
- 🔄 Care 폐쇄 베타 출시 준비 진입 (옵션 D 병렬 분리 채택)
  - ✅ C1 사이클 종결: visit-prep 라우트 + specialty-recommendation-card-wrapper 신설 (27/27 PASS)
  - 📋 C1.5 사이클 진입 예정: M-1 적용 (내부 버튼 제거 + wrapper 외부 버튼 단일 진입점)
  - 📋 코드 트랙 후속: C2 verify (라우트 통합 회귀)
  - 📋 비코드 트랙 진행 중: N1 메트릭 4종 확정 → N2~N4 (모집 채널·피드백 인프라·동의서)
- 📋 Care 채팅은 베타 출시 준비 완료 시점에 종결, 이후 결과 분석은 별도 채팅

**Pro 채팅 (별도 신설)**:
- 📋 Pro 인계 문서 v1 신설 (Care 인계 v6 작성과 동시 진행)
- 📋 P1 (의사 인증 인프라) 진입 → P2 → P5 → P3·P4 → P6 → P7 순
- 외부 의존성 협상은 사용자 직접 영역 (의사협회 API, UpToDate 라이선스)

### 1.6 의도적으로 "하지 않는 것" (변경 없음)

| 제외 기능 | 사유 |
|----------|------|
| **위치 기반 병원 추천 알고리즘** | 닥터나우·굿닥과 차별화 |
| **영업시간·실시간 진료 가능 여부 추적** | medimentor는 안내자, 닥터나우 영역 회피 |
| 진단 단정 표현 | 의료법 제27조 무면허 의료행위 회피 |
| 처방 정보 환자 직접 제공 | 약사법·의약분업 위반 |
| 원격 진료 행위 | 의료법 제34조 회피 |
| 병원 후기·평점 알고리즘 | 의료광고법 시비 가능성 |

### 1.7 차별화 포지셔닝 (변경 없음)

---

## 2. 작업 진척 현황

### 2.1 Care MVP 27개 모듈 진척 (베타 출시 준비 진입)

- **완료**: 약 17.6개 모듈 + C1 사이클 (**약 67%**)
  - M3-1 + M3-2 (50개 entries) + M3-3 + M3-4 + M3-5 + M4 + M5 + M6 + C1 (visit-prep 라우트·wrapper)
- **부분 진행**: 2개 모듈 (7%)
- **미착수**: 약 7개 모듈 (26%)
- **범위 외**: 5개 모듈 (의도적 제외)

### 2.2 마감된 산출물

| 파일명 | 내용 | 상태 |
|--------|------|------|
| `MediMentor_AI_기획서_v2.docx` | 사업 기획서 v2 | 완료 |
| `medimentor_Care_MVP_모듈지도_v1.docx` | 28개 모듈 분해 (v7 갱신 예정) | 완료 |
| `medimentor_단계B_임상자문_사후검토_v1.docx` | 황 교수님 자문 자료 | 완료 |
| `medimentor_프로젝트_인계문서_v7.md/.docx` | 본 인계 문서 v7 (Care) | 완료 |
| `medimentor_Pro_프로젝트_인계문서_v1.md/.docx` | Pro 분리 채팅용 인계 문서 | v6 시점 작성 |

### 2.3 마감된 코드 산출물 — 단계 A·B + M3-1 + M3-2 (변경 없음)

### 2.4 M3-2-a critical 5개 entries 안정화 (변경 없음)

### 2.5 한국어 패턴 학습 결과 7건 (변경 없음)

### 2.6 Pro MVP 모듈 지도 (Pro 채팅으로 이관, 변경 없음)

### 2.7 마감된 코드 산출물 — M3-3 + M3-4 + M5 + M6 + M4 + C1

```
[M3-3 마감 코드 — 추천 우선순위 로직 (156/156 PASS, 자가 패치 0건)]
lib/specialty/family-demographics.ts
lib/specialty/recommendation-engine.ts
lib/specialty/external-map-link.ts
lib/specialty/recommendation-message.ts

[M3-4-final 마감 코드 — LLM fallback + UI 통합 (72/72 PASS, 자가 패치 0건)]
lib/specialty/llm-fallback.ts
components/specialty/specialty-recommendation-card.tsx
  ★ 본 파일에는 M5 Work 4 시점 추가된 내부 "방문 전 준비하기" 버튼이 존재 (인계 v6 미기재)
  ★ 내부 버튼은 A-3 응급 라우팅 분기(critical 미노출) 미적용 — M-1로 제거 예정 (C1.5)

[M5 마감 코드 — 방문 전 안내 (93/93 PASS, 자가 패치 0건)]
lib/care/symptom-journal.ts
lib/care/medication-list.ts
lib/care/visit-checklist.ts
components/care/symptom-journal-card.tsx
components/care/medication-list-card.tsx
components/care/visit-checklist-card.tsx

[M6 마감 코드 — 공통 시스템 보강 (77/77 PASS, 자가 패치 0건)]
lib/shared/llm-client.ts
lib/care/ui-tokens.ts

[M4 마감 코드 — 야간/주말 분기 안내 (97/97 PASS, 구현 파일 자가 패치 0건)]
lib/specialty/night-weekend-mapping.ts
lib/specialty/night-weekend-message.ts
components/specialty/night-weekend-info-card.tsx

[C1 마감 코드 — 방문 전 준비 라우트 + wrapper (27/27 PASS, 구현 파일 자가 패치 0건)]
app/(care)/care/visit-prep/page.tsx
  · query string 처리: ?specialty=<코드>&triage=<레벨>&seniorMode=<bool>
  · 26개 진료과 코드 유효성 검증 (KOREAN_SPECIALTIES)
  · 5개 TriageLevel 유효성 검증
  · M5 카드 3종 import만 (무변경 보장): SymptomJournalCard, MedicationListCard, VisitChecklistCard
  · M6 ui-tokens 활용 (CareCardTokens, getCareCardClasses, getCareTitleClasses)
  · 1.6 정책 준수: new Date()/Date.now()/위치/영업시간 코드 일체 미사용 (L-3)
  · Suspense 경계로 useSearchParams 감싸기

components/specialty/specialty-recommendation-card-wrapper.tsx
  · D-1 wrapper 방식 (8.3 + L-4)
  · SpecialtyRecommendationCard import만 (무변경 보장)
  · 외부 "방문 전 준비하기" 버튼 보유, isCritical 분기 적용 (A-3 정합)
  · derivedCritical = isCritical ?? recommendation.effectiveTriageLevel === 'critical'
  · /care/visit-prep?specialty=<코드>&triage=<레벨>&seniorMode=<bool> 라우팅
  · M6 getCareTouchTarget·CareCardTokens 활용
```

### 2.8 자가 패치 0건 연속 사이클

**구현 파일 자가 패치 0건 연속 6회**: M3-3, M3-4-final, M5, M6, M4, C1
- M4: verify 스크립트 정규식만 1회 수정, 구현 파일 무변경
- C1: verify_c1.mjs 정규식만 1회 수정, 구현 파일 2개 무변경
- 패턴 C 위임이 안정화 단계.

---

## 3. 단계 A·B 검증 매트릭스 + Care 핵심 모듈 + C1 (마감)

**누적 검증 시나리오 총계: 1,158건** (전 회 100% 통과)

| 구분 | 건수 |
|------|------|
| 단계 A·B | 127건 |
| M3-1 + M3-1-fix | 35건 |
| M3-2-a (7회 사이클) | 132건 |
| M3-2-b (urgent 10개) | 64건 |
| M3-2-c (outpatient 15개) | 90건 |
| M3-2-d (self_care 20개) | 120건 |
| M3-2 종결 검증 | 68건 |
| M3-3 (추천 우선순위 로직) | 156건 |
| M3-4-final (LLM fallback + UI) | 72건 |
| M5 (방문 전 안내) | 93건 |
| M6 (공통 시스템 보강) | 77건 |
| M4 (야간/주말 분기) | 97건 |
| **C1 (visit-prep 라우트 + wrapper)** | **27건** |
| **합계** | **1,158건** |

### 3.1 양방향 회귀 차단 달성 (변경 없음)

### 3.2 황 교수님 임상 자문 컨펌 4가지 UX 결정 (변경 없음)

---

## 4. 5단계 트리아지 시스템 (변경 없음)

---

## 5. 다음 작업 예정 (우선순위 순)

### 우선순위 1: Care 폐쇄 베타 출시 준비 — 옵션 D 병렬 분리 (Care 채팅)

기획서 X.1 Phase 1 MVP: **환자 1,000명 폐쇄 베타**.

**6개 준비 항목 진척**:
| # | 항목 | 분류 | 상태 |
|---|---|---|---|
| 1 | 베타 사용자 모집 채널 결정 | 비코드 N2 | 미착수 |
| 2 | 사용자 동의서 / 개인정보 처리 방침 | 비코드 N4 | 미착수 |
| 3 | 피드백 수집 인프라 | 비코드 N3 | 미착수 |
| 4 | 메트릭 정의 | 비코드 N1 | ✅ 4종 확정 (5.1.1절) |
| 5 | /care/visit-prep 라우트 구현 | 코드 C1 | ✅ 종결 (27/27 PASS) |
| 6 | night-weekend-info-card 통합 (specialty-recommendation-card 진입점) | 코드 C3 | C1.5 종결 후 진입 |

**코드 트랙 후속 사이클**:
- 📋 **C1.5** (다음 진입): M-1 적용 — specialty-recommendation-card.tsx 내부 "방문 전 준비하기" 버튼 제거 + 회귀 검증
- 📋 C2: 라우트 통합 회귀 검증 (선택)
- 📋 C3: night-weekend-info-card wrapper 또는 진입점 통합 (L-4 베타 단계 통합 허용)

**비코드 트랙 후속 단계**:
- 📋 N2: 베타 모집 채널 결정 (KDVA 회원 가족·의료자문위)
- 📋 N3: 피드백 인프라 도구 선정 (Tally·Typeform·Google Forms 등)
- 📋 N4: 동의서·개인정보 정책 초안 (법률 자문)

### 5.1.1 N1 메트릭 4종 확정 (2026-05-03)

| # | 메트릭 | 측정 방식 | 목표 | 출처 |
|---|---|---|---|---|
| 1 | **사용자 만족도** | 5점 리커트 (사용 직후 / 7일 / 30일) | 평균 ≥ 4.0/5.0 | 5.1 |
| 2 | **진료과 매칭 정확도** | 실제 방문 진료과 vs 추천 진료과 자기 보고 | primary∪secondary ≥ 80% | 5.1 + G-1 (1.3) |
| 3 | **응급 라우팅 적정성** | critical 시나리오 후속 보고 (적정 이송 / 비응급 오이송 / Type II 놓침) | Type II 0건, 적정 이송 ≥ 95% | 5.1 + A-3 (1.4) + 3.1 |
| 4 | **베타 잔존율** | 30/60/90일 활성 사용자 비율 (활성 = 1회 이상 증상 입력 + 카드 조회) | 30일 70% / 60일 50% / 90일 40% | N1 사용자 결정 (2026-05-03) |

### 우선순위 2: Pro 분리 채팅 진입 (Pro 인계 v1 별도)

### 우선순위 3: 잔여 Care 모듈 (Phase 2 또는 베타 후 결정)

---

## 6. 9-G 이관 항목 (잔여 작업)

### 6.1 단계 A·B + M3-1 항목 (변경 없음)

### 6.2 M3-1 / M3-2-a 작업 결정사항 (변경 없음)

### 6.3 M3-2-a 작업 중 신규 발견 결정사항 (변경 없음)

### 6.4 M3-2-d 작업 결정사항 (변경 없음)

### 6.5 M5 + M4 작업 결정사항 (K-1 ~ K-5)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **K-1** | **Option β 채택** — Care + Pro 병렬 진행 | v5 명문화 |
| **K-2** | **출처 명시 의무** — 결정 ID + 사유 + 후보 옵션 + 출처 | v5부터 적용 |
| **K-3** | **단축 회신 형식** — Claude Code 보고서 압축 | M3-4-final부터 적용 |
| **K-4** | **M5-B OCR Phase 2 이관** — 사진 첨부는 의사 참고용 | M5 적용 |
| **K-5** | **Pro 분리 채팅 진입** — Care와 Pro 페르소나 완전 분리 | v6 명문화 |

### 6.6 M4 작업 결정사항 (L-1 ~ L-4, 변경 없음)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **L-1** | night_weekend는 별도 매핑 테이블 운영 | M4 적용 |
| **L-2** | 연령 분기 안내 (18세 미만 달빛어린이병원 / 18세 이상 야간진료) | M4 적용 |
| **L-3** | 시각 추적 미운영 (new Date()/Date.now() 일체 미사용) | M4 적용 |
| **L-4** | night-weekend-info-card 별도 컴포넌트 — specialty-recommendation-card 무변경. 통합은 베타 출시 준비 단계로 분리 | M4 적용 |

### 6.7 베타 출시 준비 단계 결정사항 (M-1, 신설, 2026-05-03)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **M-1** | **specialty-recommendation-card.tsx 내부 "방문 전 준비하기" 버튼 제거 + wrapper 외부 버튼 단일 진입점**. 사유: M5 Work 4 시점 추가된 내부 버튼이 A-3 응급 라우팅 분기(critical 미노출) 미적용 상태로 잔존. wrapper 외부 버튼은 isCritical 분기 적용으로 정합. UI 중복 해소 + L-4 "별도 컴포넌트" 정신 일관 적용. 후보 옵션: (i) 인계만 정정 / (ii) hideInternalPrepButton prop 추가 / (iii) wrapper 폐기·내부 버튼에 isCritical 추가 / **(iv) 내부 버튼 제거 + wrapper 단일 진입점 — 사용자 채택**. 출처: A-3 (1.4) + L-4 (6.6) + 8.3 + C1 발견사항 (2026-05-03 사용자 회신) | C1.5 사이클에서 적용 예정 |

### 6.8 베타 출시 준비 진행 결정 (N-1, 신설, 2026-05-03)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **N-1** | **옵션 D 병렬 분리 채택** — 코드 트랙(C1·C1.5·C2·C3) + 비코드 트랙(N1·N2·N3·N4) 병렬 진행. 트랙 동기화는 베타 출시 직전 통합 점검 사이클(BETA-0)에서. 후보: A 코드 우선 / B 메트릭 우선 / C 법적 기반 우선 / **D 병렬 분리 — 사용자 채택**. 출처: K-1 Option β (1.5) + 자가 패치 0건 연속 5회 (2.8) + L-4 (6.6) | v7 명문화 |

| **N-2** | **N1 메트릭 4번 후보 — 베타 잔존율 채택**. 1,000명 코호트 직접 평가 지표. 자동 산출 가능. 후보: **(a) 잔존율 — 사용자 채택** / (b) NPS / (c) 완료율 / (d) 자가관리 적정성. 출처: 5.1 메트릭 4종 + N1 사용자 결정 (2026-05-03) | v7 명문화 |

---

## 7. 기획서 v1 → v2 변경 사항 (변경 없음)

---

## 8. 검증된 작업 패턴 (반드시 유지)

### 8.1 보고 형식 의무화 (변경 없음)

### 8.2 시나리오 기반 검증 (변경 없음)

### 8.3 절대 금지 사항 (모든 작업 공통)

[코드 측면]

- A-2 변환표(28개) 변경 금지
- red-flag-data.ts·classifier 변경 금지
- 디바운싱/capturedDemographics 로직 변경 금지
- red-flag-warning-card.tsx, app/(care)/chat/page.tsx, app/api/triage·ddx/route.ts 변경 금지
- **M3-2 50개 entries 변경 금지** (J-3 종결 정책)
- **M3-3 4파일 변경 금지**
- **M3-4-final 3파일 변경 금지** — 단, **M-1 적용 시 specialty-recommendation-card.tsx 내부 버튼 제거는 사전 인가된 예외** (C1.5 사이클에서만)
- **M5 6파일 변경 금지**
- **M6 2파일 변경 금지**
- **M4 3파일 변경 금지**
- **C1 2파일 변경 금지** (app/(care)/care/visit-prep/page.tsx, components/specialty/specialty-recommendation-card-wrapper.tsx) — C1.5 시점부터 추가
- 위치 기반 병원 추천 알고리즘 코드 추가 금지
- 영업시간 추적·시각 판정 코드 추가 금지 (L-3 강화)
- 진단 단정 표현 추가 금지
- LLM API 호출 코드 추가 금지 (M3-4 fallback 외)
- OCR 코드 추가 금지 (K-4)

[운영 측면 — F-3, F-4-α/β/γ, F-5, K-2, K-3, K-5]

- Claude Code 프롬프트 명시 사양 자체 변경 금지 (F-3)
- 검증 시나리오 ID-내용 1:1 매핑 의무 (F-4-α, F-4-γ)
- "■■■ CRITICAL — 작업 시작 전 필독 ■■■" 박스 의무
- F-5 한국어 형태론 사전 점검 의무 (해당 작업에 한정, N/A 명시 가능)
- **K-2 결정사항 출처 명시 의무**
- **K-3 단축 회신 형식**
- **K-5 Care와 Pro 작업 분리** — Care 채팅에서 Pro 코드 작성 금지, Pro 채팅에서 Care 코드 작성 금지

### 8.4 작업 패턴 C — 임상 안전 등급별 차등 위임

**구현 파일 자가 패치 0건 연속 6회** (M3-3, M3-4-final, M5, M6, M4, C1) — 패턴 C 안정화 진척.

---

## 9. 사용자(문형철)에 대한 컨텍스트 (변경 없음)

---

## 10. 황 교수님 자문 컨텍스트 — 차기 자문 종합 의제 (11건 묶음, 변경 없음)

---

## 11. 새 채팅창에서 첫 작업 시작 안내 (변경 없음)

---

## 12. 본 인계 문서 업데이트 정책 (변경 없음)

---

**※ 본 Care 인계 문서 v7는 medimentor Care 채팅의 단일 진실 원천입니다. Pro 채팅은 별도 인계 문서 v1로 운영됩니다.**

**v6 → v7 변경 요약**:
- C1 사이클 종결 (visit-prep 라우트 + wrapper, 27/27 PASS)
- 누적 검증 1,131 → 1,158건 (+27)
- 자가 패치 0건 연속 5회 → 6회
- M5 Work 4 잔존 코드 사실 명시 (인계 v6 미기재 보완)
- 신규 결정 ID **M-1** (내부 버튼 제거), **N-1** (옵션 D 병렬 분리), **N-2** (잔존율 채택)
- C1.5 사이클 진입 직전
- N1 메트릭 4종 확정 (잔존율 채택)
