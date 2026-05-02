# medimentor 프로젝트 인계 문서 v6 (Care)

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

**작성일**: 2026-05-02 (v6)
**작성자**: 문형철 (KDVA 사무총장, 퇴역 대령)
**프로젝트**: MediMentor AI - Care 채팅 (Pro는 별도 채팅으로 분리 운영)
**현재 위치**: Care MVP 핵심 모듈 완료 (M3-1 ~ M3-5 + M4 + M5 + M6 종결), 폐쇄 베타 출시 준비 단계
**v5 → v6 주요 변경**:
- M4 야간/주말 분기 모듈 종결 (1.5/2.7/3/4 갱신)
- Care MVP 핵심 모듈 완료 선언 (Phase 1 MVP 기획서 정합 충족)
- 누적 검증 1,131건 (3절)
- Pro 분리 채팅 진입 결정 명문화 (1.5, 5절, 6.5 K-5 신설)
- 자문 의제 10건 → 11건 (Care 베타 출시 검토 추가)
- 다음 작업: Care 폐쇄 베타 출시 준비 + Pro 인계 문서 v1 신설

---

## 1. 프로젝트 정체성

### 1.1 한 줄 정의 (기획서 v2 기준)

MediMentor AI는 환자에게는 "1차 의료 안내자"가 되고, 의사에게는 "24시간 옆을 지키는 임상 멘토"가 되어 주는, 전 세계 의료 지식을 통합한 양방향 AI 진료 지원 플랫폼이다.

### 1.2 medimentor 사용자 정체성 (E-1, 2026-05-02 재정의, 변경 없음)

medimentor는 "노년층 대상 의료 AI"가 아니라 **"한국 가정 누구에게나 필요한 가정 주치의 안내자"**이다.

- **노년층**: 가장 취약한 1차 고려 대상이지만 유일 사용자가 아님. 빈발 증상 가중치 유지.
- **전 연령 시나리오 정식 지원**: 영유아·소아·청장년·임산부·노년 모두 커버.
- **가족 단위 3인칭 입력 정식 지원**: "내 아이가", "부모님이", "남편이" 등 입력자 ≠ 환자 시나리오. 단계 A·B의 1인칭 가정 로직(`capturedDemographics`)은 변경 없이 보존하고, M3-2/M3-3에서 3인칭 패턴 그룹 및 가족 인구학 라우팅을 별도 추가했다(M3-3 family-demographics.ts 신설).
- **3인칭 가족 호칭 표준 목록** (M3-2-a-fix4 확정): 어머니, 아버지, 남편, 아내, 아들, 딸, 부모, 형, 동생, 언니, 할아버지, 할머니, 아이, 아기, 가족, **엄마, 아빠, 오빠, 누나** (구어체 4개 추가).

### 1.3 브로드 추천 정책 (G-1, 변경 없음)

medimentor는 닥터나우·굿닥의 단정적 병원 추천("이 병원으로 가세요")과 차별화하여 "안내자형 메시지"("이런 진료과들 중 가까운 곳으로 가세요")를 채택한다.

- 환자에게 `secondary_specialties`와 `tertiary_specialties`를 적극 노출
- 추천 문구 형식: "OO과를 우선 권합니다. ~한 경우 OO과·OO과도 고려하실 수 있습니다."
- M3-2 50개 entries 매핑 완성 — secondary_specialties ≥ 2 의무 모두 충족
- M3-3 추천 로직, M3-5-γ UI, M4 야간/주말 안내 모두 일관 적용 완료

### 1.4 Critical 응급 라우팅 정책 (A-3, 변경 없음)

Critical 시나리오의 진료과 매핑은 다음 하이브리드 정책을 따른다.

- `primary_specialty`는 증상별 차등 (의학적 정확성 유지)
- M3-3 추천 로직에서 red_flag classifier critical 판정 시 `emergency:true` 진료과(EM)로 강제 라우팅 (M3-3 구현 완료)
- 환자 안내 메시지: "119 응급실로 가세요. 내원 후 OO과 진료가 필요할 수 있습니다."
- `secondary_specialties`는 "응급 처치 후 follow-up 진료과" 의미 (B-3 정책)

### 1.5 현재 작업 범위 (Option β, Care 핵심 모듈 완료, 2026-05-02 갱신)

**Option β — Care + Pro 병렬 진행** (기획서 v2 정합):

**Care 채팅 (본 문서)**:
- ✅ Care MVP 핵심 모듈 완료 (M3-1 ~ M3-5 + M4 + M5 + M6 종결)
- 🔄 Care 폐쇄 베타 출시 준비 (환자 1,000명, 기획서 X.1)
- 📋 Care 채팅은 베타 출시 준비 완료 시점에 종결, 이후 결과 분석은 별도 채팅

**Pro 채팅 (별도 신설)**:
- 📋 Pro 인계 문서 v1 신설 (Care 인계 v6 작성과 동시 진행)
- 📋 P1 (의사 인증 인프라) 진입 → P2 → P5 → P3·P4 → P6 → P7 순
- 외부 의존성 협상은 사용자 직접 영역 (의사협회 API, UpToDate 라이선스)

**Pro 분리 결정 사유 (K-5, 2026-05-02)**:
- Care와 Pro는 사용자 페르소나 완전 분리 (환자 vs 의사)
- 컨텍스트 분리, 코드베이스 진척 독립 관리
- 통합 결정사항만 1.5절에 한 줄로 참조

### 1.6 의도적으로 "하지 않는 것" (변경 없음)

| 제외 기능 | 사유 |
|----------|------|
| **위치 기반 병원 추천 알고리즘** | 닥터나우·굿닥과 차별화 |
| **영업시간·실시간 진료 가능 여부 추적** | medimentor는 안내자, 닥터나우 영역 회피 |
| 진단 단정 표현 | 의료법 제27조 무면허 의료행위 회피 |
| 처방 정보 환자 직접 제공 | 약사법·의약분업 위반 |
| 원격 진료 행위 | 의료법 제34조 회피 |
| 병원 후기·평점 알고리즘 | 의료광고법 시비 가능성 |

### 1.7 차별화 포지셔닝

- 기존 시장 플레이어: 닥터나우(병원 추천·예약), 굿닥(병원 검색)
- medimentor의 차별화: "증상 해석 + 진료과 안내 + 자가관리 + 임상 멘토"에 정체성을 좁힘
- 의사용 Pro는 "환자가 우리 의원에 더 잘 준비된 상태로 오게 도와주는 도구"로 포지셔닝

---

## 2. 작업 진척 현황

### 2.1 Care MVP 27개 모듈 진척 (Care 핵심 모듈 완료)

- **완료**: 약 17.6개 모듈 (**약 65%**)
  - M3-1 + M3-2 (50개 entries) + M3-3 + M3-4 + M3-5 + M4 + M5 + M6
- **부분 진행**: 2개 모듈 (7%)
- **미착수**: 약 7.4개 모듈 (28%)
  - 베타 출시 준비, M2.3 일상어 변환, 음성 입력 등
- **범위 외**: 5개 모듈 (의도적 제외)

### 2.2 마감된 산출물 (5개 핵심 문서)

| 파일명 | 내용 | 상태 |
|--------|------|------|
| `MediMentor_AI_기획서_v2.docx` | 사업 기획서 v2 | 완료 |
| `medimentor_Care_MVP_모듈지도_v1.docx` | 28개 모듈 분해 (v6 갱신 예정) | 완료 |
| `medimentor_단계B_임상자문_사후검토_v1.docx` | 황 교수님 자문 자료 | 완료, 차기 자문 종합 의제 묶음 |
| `medimentor_프로젝트_인계문서_v6.md/.docx` | 본 인계 문서 v6 (Care) | 완료 |
| `medimentor_Pro_프로젝트_인계문서_v1.md/.docx` | Pro 분리 채팅용 신규 인계 문서 | 본 v6와 함께 작성 |
| (작업 C 산출물) | 황 교수님 자료 표지·서문 수정 | 자문 시점까지 보류 (10절) |

### 2.3 마감된 코드 산출물 — 단계 A·B + M3-1 + M3-2

```
[단계 A·B 마감 코드]
lib/safety/red-flag-data.ts                — 6개 카테고리 패턴, A-2 변환표 28개
lib/safety/red-flag-classifier.ts          — classifyRedFlags(), detectRedFlags()
lib/types/medical.ts                        — DDxRedFlagEntry 인터페이스
app/api/triage/route.ts                     — A-4 인구학 이중 감지
app/api/ddx/route.ts                        — 복수 매칭, red_flags 필드
components/ui/red-flag-warning-card.tsx    — severity 3단계 UI
app/(care)/chat/page.tsx                    — capturedDemographics state, 디바운싱

[M3-1 + M3-1-fix 마감 코드]
lib/specialty/specialties.ts               — 26개 진료과
lib/specialty/symptom-mapping-schema.ts    — SymptomMappingEntry 인터페이스
lib/specialty/symptom-list-draft.ts        — 50개 핵심 증상 초안 구조

[M3-2 완성 코드 — 50개 entries 전체 (J-3 종결)]
lib/specialty/symptom-list-draft.ts        — 50개 entries 완성
  · [critical 5개] 7회 사이클 안정화
  · [urgent 10개] 64 시나리오 PASS
  · [outpatient 15개] 90 시나리오 PASS
  · [self_care 20개] 120 시나리오 PASS
  · [M3-2 종결 검증] 68 시나리오 PASS
```

### 2.4 M3-2-a critical 5개 entries 안정화 (변경 없음)

7회 사이클로 critical 5개 entries 절대 안정화 종결. v3·v4·v5와 동일.

### 2.5 한국어 패턴 학습 결과 7건 (가~바 + J-2, 변경 없음)

| ID | 학습 내용 | 발견 단계 |
|----|----------|---------|
| (가) | 역순 어순(SOV): 양방향 작성 | M3-2-b |
| (나) | 불특정 방향 수식어: optional 처리 | M3-2-b |
| (다) | 모음 어미 변형: 어간+어미 별도 명시 | M3-2-b |
| (라) | 종결어 의존 회피 | M3-2-c |
| (마) | 미래형/관형형 활용 추가 | M3-2-c |
| (바) | 역술어 후 주어 등장 시 후행 조건 제거 | M3-2-c |
| **(J-2)** | **존댓말 삽입어미 -시- (저리신, 부으세요, 아프세요)** | **M3-2-d** |

### 2.6 Pro MVP 모듈 지도 (Pro 채팅으로 이관)

본 Care 인계 문서의 Pro 모듈 지도 P1~P7는 **Pro 인계 문서 v1**로 이관됨. Pro 채팅 별도 운영.

### 2.7 마감된 코드 산출물 — M3-3 + M3-4 + M5 + M6 + M4

```
[M3-3 마감 코드 — 추천 우선순위 로직 (156/156 PASS, 자가 패치 0건)]
lib/specialty/family-demographics.ts        — E-1 가족 대리 입력 감지
lib/specialty/recommendation-engine.ts     — 5-분기 추천 우선순위 로직
lib/specialty/external-map-link.ts         — 카카오맵·네이버지도 URL 생성
lib/specialty/recommendation-message.ts    — 안내자형 메시지 조립

[M3-4-final 마감 코드 — LLM fallback + UI 통합 (72/72 PASS, 자가 패치 0건)]
lib/specialty/llm-fallback.ts               — Claude Sonnet (claude-sonnet-4-6) fallback
components/specialty/specialty-recommendation-card.tsx
                                            — M3-5-γ UI: 1차 카드 + 펼치기 + 카카오맵 링크
                                              · 진료과명 24px+ (노년층 친화)
                                              · critical 시 🚨 + tel:119 a 태그
                                              · LLM fallback 시 "🤖 AI 추천" 배지
                                              · seniorMode prop, WCAG aria-* 적용

[M5 마감 코드 — 방문 전 안내 (93/93 PASS, 자가 패치 0건)]
lib/care/symptom-journal.ts                 — JournalEntry CRUD + 의사 요약 (LLM 미운영)
lib/care/medication-list.ts                 — MedicationEntry CRUD + 사진 첨부 (OCR 미운영)
lib/care/visit-checklist.ts                 — 26개 진료과별 자동 매핑 + 사용자 커스터마이징
components/care/symptom-journal-card.tsx   — 5필드 + 자유 메모 + 의사 요약 + 클립보드 복사
components/care/medication-list-card.tsx   — 텍스트 입력 + 사진 첨부 (의사 참고용)
components/care/visit-checklist-card.tsx   — 카테고리별 그룹 + 진행률 + 커스텀 항목

[M6 마감 코드 — 공통 시스템 보강 (77/77 PASS, 자가 패치 0건)]
lib/shared/llm-client.ts                    — 표준 LLM 클라이언트 (인터페이스 정의)
                                              · LLMRequest/LLMResponse<T>/LLMError
                                              · callLLM<T>/callLLMJson 함수
                                              · LLM_MODEL='claude-sonnet-4-6'
                                              · 4가지 에러 타입 + JSON 모드 자동 파싱
lib/care/ui-tokens.ts                       — 4개 카드 공통 디자인 토큰
                                              · CareCardTokens: colors/typography/interactive
                                              · seniorMode 분기
                                              · getCareCardClasses/getCareTitleClasses

[M4 마감 코드 — 야간/주말 분기 안내 (97/97 PASS, 자가 패치 1회 — verify 정규식만)]
lib/specialty/night-weekend-mapping.ts      — 8개 매핑 (outpatient 6 + urgent 2)
                                              · NightWeekendEligibilityEntry 인터페이스
                                              · age_group_priority: 'minor' | 'all'
                                              · er_eligible 플래그 (urgent 매핑)
                                              · 시각 추적 미사용 (1.6 정책)
lib/specialty/night-weekend-message.ts      — 연령 분기 메시지 조립
                                              · 18세 미만 → 달빛어린이병원 우선
                                              · 18세 이상 → 야간진료 의원
                                              · er_eligible → 응급실 보조 안내
components/specialty/night-weekend-info-card.tsx
                                            — 별도 카드 컴포넌트 (recommendation-card 무변경)
                                              · M6 ui-tokens 활용
                                              · 카카오/네이버 지도 a 태그 (onClick 없음)
                                              · 노년층 친화 (seniorMode)
```

### 2.8 자가 패치 0건 연속 사이클

**구현 파일 자가 패치 0건 연속 5회**: M3-3, M3-4-final, M5, M6, M4 (M4는 verify 스크립트 정규식만 1회 수정, 구현 파일 무변경). 패턴 C 위임이 안정화 단계.

---

## 3. 단계 A·B 검증 매트릭스 + Care 핵심 모듈 (마감)

**누적 검증 시나리오 총계: 1,131건** (전 회 100% 통과)

| 구분 | 건수 |
|------|------|
| 단계 A·B | 127건 |
| M3-1 + M3-1-fix | 35건 |
| M3-2-a (7회 사이클) | 132건 |
| M3-2-b (urgent 10개) | 64건 |
| M3-2-c (outpatient 15개) | 90건 |
| M3-2-d (self_care 20개) | 120건 |
| M3-2 종결 검증 (cross-entry + 회귀) | 68건 |
| M3-3 (추천 우선순위 로직) | 156건 |
| M3-4-final (LLM fallback + UI) | 72건 |
| M5 (방문 전 안내) | 93건 |
| M6 (공통 시스템 보강) | 77건 |
| M4 (야간/주말 분기) | 97건 |
| **합계** | **1,131건** |

### 3.1 양방향 회귀 차단 달성 (변경 없음)

| 오류 유형 | 대표 사례 | 차단 방법 |
|----------|---------|---------|
| Type II (놓침) | SAH 환자 → 일반 안내 | 4개 SAH 패턴 추가, 형태론 7건 보강 |
| Type I (과경고) | "두통이 좀 있어요" → critical | 단독 키워드 제거, 복합 패턴만 유지 |

### 3.2 황 교수님 임상 자문 컨펌 4가지 UX 결정 (변경 없음)

---

## 4. 5단계 트리아지 시스템 — 모든 등급 정식 운영 (Care 핵심 모듈 완료)

| 기획서 등급 | TriageLevel | 의미 | 구현 상태 |
|-----------|------------------|------|----------|
| 🔴 즉시 응급 | `critical` | SAH, 흉통+호흡곤란 | ✅ M3-2-a 5개 + M3-3 EM 강제 라우팅 |
| 🟠 응급 | `urgent` | 심한 복통, 고열 | ✅ M3-2-b 10개 |
| 🟡 야간/주말 | `night_weekend` | 응급 아닌 심한 통증·발열 | ✅ M4 야간/주말 매핑 8개 (outpatient 6 + urgent 2) + 달빛어린이병원/야간진료 안내 |
| 🟢 일반 외래 | `outpatient` | 수일~수주 일반 증상 | ✅ M3-2-c 15개 |
| 🔵 자가 관리 | `self_care` | 경미한 증상 | ✅ M3-2-d 20개 |

**Care MVP 핵심 트리아지 시스템 완전 정식 운영**.

---

## 5. 다음 작업 예정 (우선순위 순)

### 우선순위 1: Care 폐쇄 베타 출시 준비 (Care 채팅, 본 채팅)

기획서 X.1 Phase 1 MVP: **환자 1,000명 폐쇄 베타**.

**준비 항목**:
- 베타 사용자 모집 채널 결정 (KDVA 회원 가족, 의료자문위 추천 등)
- 사용자 동의서 / 개인정보 처리 방침 (ISMS-P 사전 준비 일부)
- 피드백 수집 인프라 (설문 도구, 사용자 인터뷰 일정)
- 메트릭 정의 (사용자 만족도, 진료과 매칭 정확도, 응급 라우팅 적정성)
- /care/visit-prep 라우트 구현 (M5의 "방문 전 준비하기" 버튼 연결)
- night-weekend-info-card 통합 (M4의 별도 카드를 specialty-recommendation-card에 진입점 추가)

**예상 사이클**: 3~5회 (인프라 준비 + 라우트 구현 + 통합 테스트)

### 우선순위 2: Pro 분리 채팅 진입 (Pro 인계 v1 별도, 본 v6 작성과 동시)

- Pro 인계 문서 v1 작성 완료
- Pro 분리 채팅 신설
- P1 (의사 인증 인프라) 진입 시작
- Care 채팅과 독립 진행

### 우선순위 3: 잔여 Care 모듈 (Phase 2 또는 베타 후 결정)

- M2.3 일상어 → 전문어 변환 엔진 (의학용어 일상어 병기, 기획서 III.2.나)
- 음성 입력 (기획서 IV.2.가 음성 STT)
- 만성질환 일기 LLM 패턴 분석 (M5-A Phase 2)
- 의약품 OCR (M5-B Phase 2 — K-4 정책)
- ISMS-P 인증 본격 준비 (베타 후)

---

## 6. 9-G 이관 항목 (잔여 작업)

### 6.1 단계 A·B + M3-1 항목 (변경 없음)

### 6.2 M3-1 / M3-2-a 작업 결정사항 (변경 없음)

B-1, C-1, C-2, D-1, E-1, F-1~F-4, G-1.

### 6.3 M3-2-a 작업 중 신규 발견 결정사항 (변경 없음)

F-4-α/β/γ, F-5, G-1-α/β, H-1, H-2, I-1.

### 6.4 M3-2-d 작업 결정사항 (변경 없음)

J-1 한국어 형태론 7건 의무 적용, J-2 존댓말 삽입어미, J-3 M3-2 종결.

### 6.5 M5 + M4 작업 결정사항 (K-1 ~ K-5)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **K-1** | **Option β 채택** — Care + Pro 병렬 진행 | v5 명문화 |
| **K-2** | **출처 명시 의무** — 결정 ID + 사유 + 후보 옵션 + 출처 | v5부터 적용 |
| **K-3** | **단축 회신 형식** — Claude Code 보고서 압축 | M3-4-final부터 적용 |
| **K-4** | **M5-B OCR Phase 2 이관** — 사진 첨부는 의사 참고용 | M5 적용 |
| **K-5 (신규)** | **Pro 분리 채팅 진입 결정** — Care와 Pro는 사용자 페르소나 완전 분리. Pro 인계 문서 v1 신설 후 별도 채팅에서 진행. 통합 결정사항만 Care 인계 1.5절에 한 줄로 참조 | v6 명문화 |

### 6.6 M4 작업 결정사항 (신설, 2026-05-02)

| 이슈 ID | 결정 내용 | 처리 상태 |
|---|---|---|
| **L-1** | **night_weekend는 별도 매핑 테이블 운영** — M3-2 entries(symptom-list-draft.ts)를 변경하지 않고 별도 night-weekend-mapping.ts로 관리 (J-3 종결 정책 준수) | M4 적용 |
| **L-2** | **연령 분기 안내** — 18세 미만은 달빛어린이병원, 18세 이상은 야간진료 의원. urgent + er_eligible은 응급실 보조 안내 | M4 적용 |
| **L-3** | **시각 추적 미운영** — new Date()/Date.now() 등 시각 판정 코드 일체 미사용 (1.6 정책 강화) | M4 적용 |
| **L-4** | **night-weekend-info-card 별도 컴포넌트** — specialty-recommendation-card 무변경. 통합은 베타 출시 준비 단계로 분리 | M4 적용 |

---

## 7. 기획서 v1 → v2 변경 사항 (변경 없음)

---

## 8. 검증된 작업 패턴 (반드시 유지)

### 8.1 보고 형식 의무화 (변경 없음)

### 8.2 시나리오 기반 검증 (변경 없음)

### 8.3 절대 금지 사항 (모든 작업 공통, M4 결정사항 추가)

[코드 측면]

- A-2 변환표(28개) 변경 금지
- red-flag-data.ts 매칭 패턴 변경 금지
- red-flag-classifier.ts 분류 로직 변경 금지
- 디바운싱/capturedDemographics 로직 변경 금지
- red-flag-warning-card.tsx, app/(care)/chat/page.tsx, app/api/triage·ddx/route.ts 변경 금지
- **M3-2 50개 entries 변경 금지** (J-3 종결 정책)
- **M3-3 4파일 변경 금지**
- **M3-4-final 3파일 변경 금지**
- **M5 6파일 변경 금지**
- **M6 2파일 변경 금지** (lib/shared/llm-client.ts, lib/care/ui-tokens.ts)
- **M4 3파일 변경 금지** (night-weekend-mapping.ts, night-weekend-message.ts, night-weekend-info-card.tsx)
- 위치 기반 병원 추천 알고리즘 코드 추가 금지
- 영업시간 추적·시각 판정 코드 추가 금지 (L-3 강화)
- 진단 단정 표현 추가 금지
- LLM API 호출 코드 추가 금지 (M3-4 fallback 외)
- OCR 코드 추가 금지 (K-4)

[운영 측면 — F-3, F-4-α/β/γ, F-5, K-2, K-3, K-5]

- Claude Code 프롬프트 명시 사양 자체 변경 금지 (F-3)
- 검증 시나리오 ID-내용 1:1 매핑 의무 (F-4-α)
- F-4-γ 시나리오 ID 매핑 자체 점검표 첨부 의무
- "■■■ CRITICAL — 작업 시작 전 필독 ■■■" 박스 의무
- F-5 한국어 형태론 사전 점검 의무
- **K-2 결정사항 출처 명시 의무**
- **K-3 단축 회신 형식**
- **K-5 Care와 Pro 작업 분리** — Care 채팅에서 Pro 코드 작성 금지, Pro 채팅에서 Care 코드 작성 금지

### 8.4 작업 패턴 C — 임상 안전 등급별 차등 위임 (I-1)

**구현 파일 자가 패치 0건 연속 5회** (M3-3, M3-4-final, M5, M6, M4) — 패턴 C 안정화 단계.

---

## 9. 사용자(문형철)에 대한 컨텍스트 (변경 없음)

- 이름: 문형철
- 소속: KDVA Korea Region 사무총장
- 배경: 퇴역 ROK Army Colonel
- 다른 활동: KEDA 코디네이션
- vibe-coding 워크플로: Claude Code, Cursor 등 활용. GitHub→Vercel 배포
- 문서 작성 표준: Node.js docx 라이브러리, 맑은 고딕, 정부문서 스타일
- 한국어/영어 양언어 능통

---

## 10. 황 교수님 자문 컨텍스트 — 차기 자문 종합 의제 (11건 묶음)

기존 10건 의제(v5) + Care 베타 출시 검토 1건 추가.

| # | 의제 | 출처 |
|---|---|---|
| 1 | 단계 B 사후 검토 — 13개 질문 (Q1~Q13) | 기존 |
| 2 | PAIN 분류 적정성 (G-1) | 기존 |
| 3 | 외과(GS) 분류 (C-2) | 기존 |
| 4 | M3-1 50개 증상 초안 + M3-2 50개 entries 검증 | 기존 |
| 5 | 작업 C 표지·서문 수정 | 기존 |
| 6 | 단계 A·B 복통 패턴 결함 (H-1) | 기존 |
| 7 | 단계 A·B 호흡 패턴 자모 수축 결함 (H-2) | 기존 |
| 8 | Pro CDSS 규제 검토 | 신규 (K-1) |
| 9 | 의사면허 인증 인프라 | 신규 (K-1) |
| 10 | 임상 데이터 라이선스 협상 | 신규 (K-1) |
| 11 | **M4 night_weekend 매핑 8개 검증 + Care 베타 출시 임상 안전 검토** | **신규 (L-1, L-2)** |

자문 1회로 위 11건 동시 해결 가능.

---

## 11. 새 채팅창에서 첫 작업 시작 안내

### 11.1 새 채팅창 권장 첫 메시지

```
이 인계 문서를 읽어주세요. medimentor Care 프로젝트를 이어서 진행합니다.

[여기에 본 인계 문서 전체 붙여넣기]

다음 작업: [작업 명칭]

이 작업을 진행하기 전에 인계 문서의 핵심 결정사항을 위반하지 않는지 
확인해주시고, 진행 방안을 제안해 주십시오.
```

### 11.2 단일 진실 원천 운영 원칙 (F-1)

- 본 Care 인계 문서 v6는 docs/planning/에 마크다운(.md) + Word(.docx) 두 형식으로 커밋
- 매 채팅 마감 시 갱신 후 즉시 push
- Claude Code가 컨버세이션 요약 우회 없이 인계 문서를 직접 참조하도록 보장

### 11.3 Pro 분리 채팅 진입 안내 (K-5)

**Pro 인계 문서 v1**은 본 Care 인계 문서와 별도로 운영:
- 파일명: `medimentor_Pro_프로젝트_인계문서_v1.md/.docx`
- 위치: docs/planning/
- Pro 채팅 신설 시 위 문서를 새 채팅에 복사·붙여넣기

**Pro 채팅 신설 시점**: 사용자 결정 시점 (Care 베타 출시 준비 완료 후 또는 병렬 시작 가능).

---

## 12. 본 인계 문서 업데이트 정책

- 업데이트 시점: 매 채팅 세션 마감 시점
- 버전 관리: 파일명에 v6, v7... 추가하여 이력 보존
- F-1 원칙 준수: docs/planning/ 디렉토리에 .md + .docx 두 형식 동시 커밋
- K-2 출처 명시 의무: 모든 결정사항에 결정 ID + 사유 + 후보 옵션 + 출처 명시
- K-5 Care/Pro 분리: Care 인계는 Care 진척만, Pro 인계는 Pro 진척만 추적

---

**※ 본 Care 인계 문서 v6는 medimentor Care 채팅의 단일 진실 원천입니다. Pro 채팅은 별도 인계 문서 v1로 운영됩니다.**

**v5 → v6 변경 요약**:
- M4 야간/주말 분기 모듈 종결 (1.5/2.7/3/4 갱신)
- Care MVP 핵심 모듈 완료 선언 (Phase 1 MVP 기획서 정합 충족)
- 누적 검증 1,131건 (957 + 77 + 97)
- L-1 ~ L-4 결정사항 추가 (M4 작업 결정)
- K-5 결정사항 추가 (Pro 분리 채팅 진입)
- Pro MVP 모듈 지도 → Pro 인계 문서 v1로 이관
- 다음 작업: Care 폐쇄 베타 출시 준비 + Pro 인계 v1 신설
- 자문 의제 10건 → 11건 (Care 베타 출시 임상 안전 검토 추가)
- 자가 패치 0건 연속 5회 기록 (M3-3, M3-4-final, M5, M6, M4)
