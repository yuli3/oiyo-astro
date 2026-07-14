# 성인 애착 초안 검토 패킷

## 현재 판정

- 제품 상태: `educational/draft`
- 검색 상태: 6 locale 모두 `noindex`, sitemap 제외
- 용도: 일반 성인의 관계 자기성찰
- 비용도: 임상 진단, 치료, 학대·관계 안전 판정, 어린 시절 원인 추론, 궁합·관계 성공 예측, 채용
- draft lineage의 working canonical source language: **English**. 2026-07-14 도구 정합성 검사를 위해 Codex가 제안한 작업 기준이며, 사람 책임자의 승인 전에는 근거 또는 제품 승격 결정으로 간주하지 않는다. ECR 계열과의 표현 비교 및 현재 행동 장면 문항 재작성은 영어판을 기준으로 수행했다. 한국어·일본어·중국어·프랑스어·스페인어는 독립적인 번역·문화적 적합성 검토가 필요한 adaptation이다.

이 패킷은 검토 절차를 준비할 뿐, OIYO 문항의 타당성을 주장하지 않는다.

## 1. 전문가 내용타당도 검토표

검토자는 각 문항과 지시문·응답척도·결과 설명을 다음 세 관점으로 평가한다.

| 관점 | 질문 | 기록할 것 |
|---|---|---|
| 관련성 | 문항이 의도한 불안 또는 회피 개념을 실제로 다루는가? | 대응 개념, 다른 개념과의 혼입, 수정안 |
| 포괄성 | 두 축에서 중요한 경험이 빠졌거나 과대표현되었는가? | 누락 영역, 중복 문항, 문화 편향 |
| 예상 명료성·언어 위험(참고) | 전문가가 예상하는 모호성이나 응답 과정 위험은 무엇인가? | 모호한 단어, 이중 질문, 회상 범위, 응답척도 문제 후보 |

문항별 검토 기록:

| item ID | 의도한 행동 장면 | 관련성 | 혼입 위험 | 안전·낙인 위험 | 유지/수정/제외 | 근거와 수정안 |
|---|---|---|---|---|---|---|
| anxiety-1~6 | 계획 변화·갈등 후 침묵·관계 불확실성에 대한 주의와 일상 영향 |  |  |  |  |  |
| avoidance-1~6 | 감정 대화에서 실용 영역으로 이동·대화 연기·조율 분리·영향 피드백 수용 |  |  |  |  |  |

필수 질문:

- 불안과 회피가 하나의 건강 점수나 좋고 나쁜 축으로 읽히지 않는가?
- 우울·불안장애·트라우마·갈등회피·내향성·독립성 같은 인접 개념을 잘못 대신 측정하지 않는가?
- 폭력·통제·위협을 개인의 애착 문제로 환원할 여지가 없는가?
- ECR/ECR-R/ECR-RS 문항을 번역·개작한 것으로 보일 만큼 표현·구조가 가깝지 않은가?
- 역채점 문항이 단순한 부정문 혼란이나 방법효과를 만들지 않는가?

전문가 서명만으로 승격하지 않는다. `comprehensibility`의 직접 근거는 대상 이용자의 인지면담으로 별도 확인한다.

## 2. 인지면담 프로토콜

CDC CCQDER는 인지면담을 응답자가 문항을 어떻게 이해하고, 경험을 떠올리고, 판단하고, 응답을 선택하는지 살피는 질적 방법으로 설명한다. 목적표집을 사용하며 문제 발견이 목적이므로 대표성 추정용 무작위 표본과 구분한다. CDC가 소개하는 20–50명은 전형적인 범위이지 OIYO의 자동 합격선이 아니다.

### 모집과 안전

- 다양한 연령, 관계 상태, 문해 수준, 관계 경험을 목적표집한다.
- 검사 점수로 사람을 사전 분류하거나 “불안형/회피형”으로 모집하지 않는다.
- 파트너 이름, 연락처, 폭력 경험의 상세 서술을 요구하지 않는다.
- 불편하면 문항·질문을 건너뛰거나 즉시 중단할 수 있음을 먼저 알린다.
- 위기 지원 정보는 응답이나 점수와 무관하게 제공한다.
- 원문 녹취·메모는 제품 localStorage, git, company-brain에 저장하지 않는다. 동의된 연구 저장소와 보관기간을 별도로 정한다.

### 문항별 probe

1. 이 문항이 무엇을 묻는다고 이해했나요?
2. 핵심 표현을 자신의 말로 바꾸면 어떻게 말하겠나요?
3. 어떤 상황이나 기간을 떠올렸나요?
4. 왜 그 응답 옵션을 골랐나요? 인접 옵션과 무엇이 달랐나요?
5. 답하기 어렵거나 불편하거나 판단할 수 없었던 부분이 있었나요?
6. 이 문항이 불안·회피가 아닌 다른 경험을 묻는 것처럼 느껴졌나요?

### 검사 전체 probe

- 중요한 관계를 한 사람으로 고정했는지, 문항마다 다른 사람을 떠올렸는지
- “최근”과 “가까운 관계”의 범위를 어떻게 이해했는지
- 같은 의미를 반복한다고 느낀 문항과 빠진 경험
- 결과의 `1.0–5.0 평균 응답 위치`를 백분위·정확도·등급으로 오해하는지
- 안전 문구와 지원 정보가 충분히 명확하고 강압적이지 않은지

### 분석과 반복

문항별로 `comprehension`, `recall/context`, `judgment`, `response mapping`, `emotional safety`, `social desirability`, `construct contamination`을 코딩한다. 인터뷰→요약→응답자 비교→하위집단 비교→결론의 audit trail을 남긴다. 중요한 수정이 있으면 수정 문항을 다음 라운드에서 다시 검사한다. 한 명의 동의나 단일 CVI 숫자로 통과시키지 않는다.

## 3. 번역·문화 적합성 검토

언어별 독립 기록을 유지한다.

| locale | 순번역 A/B | 합의본 | 역번역 | 전문가 검토 | 일반인 검토 | 인지면담 | 상태 |
|---|---|---|---|---|---|---|---|
| ko |  |  |  |  |  |  | draft |
| ja |  |  |  |  |  |  | draft |
| zh |  |  |  |  |  |  | draft |
| fr |  |  |  |  |  |  | draft |
| es |  |  |  |  |  |  | draft |

원칙:

- 직역보다 개념과 응답 과정의 등가성을 우선한다.
- 목표 언어 원어민의 독립 순번역안, 합의, 독립 역번역, adjudication 근거를 기록한다.
- 관계·거리·감정 대화·불확실성 표현의 문화적 의미가 달라지는지 확인한다.
- 각 언어에서 별도 인지면담을 한다.
- 측정동일성/DIF 근거 전에는 언어·국가 간 평균 비교, 통합 규준, 백분위를 제공하지 않는다.
- locale은 근거 묶음별로 독립 승격한다. 하나의 번역 완료가 다른 locale의 `reviewed`를 의미하지 않는다.

## 4. 동의 기반 비식별화·최소화 파일럿 데이터 계약

프로덕션 사용자의 원응답을 수집하지 않는다. 별도 동의를 받은 파일럿에서 필요한 값만 남긴 비식별화·최소화 JSONL을 보안 로컬 분석 도구에 입력한다. 이 파일을 완전한 익명 자료라고 주장하지 않는다.

```json
{"locale":"ko","responses":{"anxiety-1":3,"anxiety-2":4,"anxiety-3":3,"anxiety-4":2,"anxiety-5":4,"anxiety-6":3,"avoidance-1":2,"avoidance-2":3,"avoidance-3":2,"avoidance-4":3,"avoidance-5":4,"avoidance-6":3}}
```

응답 행의 허용 필드는 `locale`, `responses`뿐이며 locale은 명시된 6개 코드만 허용한다. 한 파일에는 하나의 locale만 넣고 언어별로 따로 검사한다. 이름, 이메일, 사용자 ID, 관계 대상, 자유서술, IP 등 식별·민감 필드를 넣으면 도구가 거부한다.

각 파일은 별도의 불변 batch manifest와 함께 보관한다. manifest에는 assessment/instrument version, locale, prompt revision, 문항·지시문·응답척도·안전문구를 묶은 시행본 SHA-256, 동의 프로토콜 version, 수집 시작·종료일을 기록한다. 도구는 현재 동결된 시행본과 일치하지 않으면 거부한다.

수집 전에 동의문, 연구 책임자, 허용된 접근자, 암호화 저장 위치, 보관기간과 삭제일을 정한다. 실제 응답 파일과 출력은 git·동기화 폴더·company-brain에 넣지 않는다. 공유 보고서에는 사람 단위 행을 포함하지 않고, 작은 셀을 외부로 내보낼 때는 사전에 정한 억제 기준을 적용한다. 동의 철회와 삭제 요청을 처리할 담당 절차도 먼저 둔다.

```bash
node scripts/assessment-pilot-report.mjs \
  --input /secure/local/deidentified-ko-pilot.jsonl \
  --batch-manifest /secure/local/immutable-ko-batch.json \
  --output /secure/local/ko-qc-report.json
```

CLI 동작 확인에는 실제 자료 대신 `scripts/fixtures/adult-attachment-pilot.synthetic.jsonl`만 사용한다.

`--output`은 필수이며 파일 권한을 `0600`으로 설정한다. 실제 응답의 QC 결과를 stdout/CI 로그로 출력하지 않는다. 출력은 단일 locale, 시행본 hash, 문항 revision, 축별 complete cases, 결측, 응답 선택지 빈도의 입력 품질 정보뿐이다. 평균, 신뢰도, 문항상관, 타당도, 언어 비교를 계산하지 않으며 출시 준비를 증명하지 않는다.

## 5. 사전 분석계획

데이터를 보기 전에 다음을 동결한다.

- 기본 모형: 상관된 불안·회피 2요인. 12문항 단일 총점은 만들지 않는다.
- Likert 순서형 자료에 맞는 추정법과 결측 처리 방식
- 표본 계획: 문항 수의 임의 배수가 아니라 모형·범주 분포·결측·언어 비교·원하는 정밀도를 반영한 시뮬레이션 또는 파워 계획
- 구조타당도 확인 후 축별 omega/alpha와 불확실성 보고
- 문항 분포, 응답시간, 직선응답, 바닥·천장, 역문항 방법효과, 국소 의존성 점검
- 허가된 비교도구가 있을 때만 사전 방향·크기 가설에 따른 수렴·변별 타당도 평가
- 재검사는 기억 효과와 실제 관계 변화 가능성을 함께 고려하고 상태 안정성을 별도 확인
- ICC 모형·정의를 명시하고 SEM/SDC 또는 LoA 등 측정오차를 함께 보고
- 집단 비교 전 측정동일성/DIF 확인

현재 CLI는 위 분석을 대신하지 않는 QC 전용 도구다. CFA, omega/alpha, 문항상관, 측정동일성, 재검사 신뢰도, 구성타당도는 사람 검토로 승인된 분석계획과 적절한 연구 설계가 준비된 뒤 별도 통계 환경에서 수행한다.

## 6. 승격 결정 기록

| 단계 | 필요한 증거 묶음 | 자동 승격 여부 |
|---|---|---|
| draft → reviewed | content map, 전문가 검토, 대상자 인지면담, 수정·재검사 기록 | 금지 |
| reviewed → pilot | canonical language와 번역 계보, 문화 적합성, 사전 분석계획 | 금지 |
| pilot → 다음 단계 | 2요인 구조, 축별 일관성, 사전 가설 타당도, 측정오차, 독립 재현 | 금지 |
| locale indexable | 해당 locale 인간 검토·인지면담·심리측정 근거와 별도 승인 | 금지 |

승격은 `config/assessment-release-gates.js`, plugin manifest, locale status, Astro robots, sitemap, root route ownership을 한 번에 변경하고 build artifact audit를 통과해야 한다. 자동 통계 임계값만으로 승격하지 않는다.

## Sources

- [CDC CCQDER cognitive interviewing](https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html)
- [CDC/OMB cognitive interviewing standards](https://wwwn.cdc.gov/qbank/learn/CI-standards.aspx)
- [CDC Q-Notes analysis and audit trail](https://wwwn.cdc.gov/QNotes/Analysis)
- [COSMIN content validity methodology](https://www.cosmin.nl/wp-content/uploads/COSMIN-methodology-for-content-validity-user-manual-v1.pdf)
- [COSMIN study design checklist](https://www.cosmin.nl/wp-content/uploads/COSMIN-study-designing-checklist_final.pdf)
- [WHO cross-cultural cognitive interviewing study](https://cdn.who.int/media/docs/default-source/bulletin/online-first/blt.24.291162.pdf?sfvrsn=cdd6b975_3)
- [Fraley ECR-R FAQ and commercial-use note](https://labs.psychology.illinois.edu/~rcfraley/measures/ecrr.htm)

## Related files

- `docs/attachment-item-development-2026-07-14.md`
- `config/assessment-release-gates.js`
- `config/pilot-instruments/adult-attachment.json`
- `scripts/assessment-pilot-report.mjs`
- `scripts/audit-assessment-release-gates.mjs`
