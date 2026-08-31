# OIYO 작업 규칙

시작·안전·승인 계약은 `/Users/seuncho/coding/AGENTS.md`, 현재 작업은 `/Users/seuncho/coding/company-brain/NOW.md`를 따른다.

## 실행면

- 심리·자기이해·명리/상징 해석과 Life Coordinator 실행면을 다룬다. 행동 우선 화면에 결과 이해를 돕는 읽을거리를 결합할 수 있다. 형식만으로 설명을 다른 도메인으로 옮기지 않는다.
- visible prose, 적절한 FAQ, 실제 본문과 맞는 JSON-LD, 관련 도구/읽기 링크를 제공한다. RelatedTools와 교차 사이트 링크는 실제 살아 있는 정본에만 연결한다.
- 활성 로케일 ko/en/ja/zh/fr/es를 유지한다. YMYL·상징 해석은 적절한 한계·비진단 안내를 포함하고 canonical/로케일 가정을 검증한다.
- 테스트 질문 UI를 생성·이관·검토·출시하기 전 `/Users/seuncho/coding/company-brain/AI-Sessions/wiki/design/questionnaire-family-contract.md`를 읽는다. step/matrix/screening/dedicated tool을 분류하고 승인된 engine cohort 하나씩 출시한다.

## 검증

- `npm run type-check:active`, `npm run audit:questionnaire`, `npm run audit:mystic-seo`, `npm run test -- --run`, `npm run build` 후 `npm run audit:content-depth-baseline`.
- 검사 컴포넌트를 만들거나 고치면 `npm run audit:test-funnel-events`를 함께 돌린다. `test_completed`를 발화하는 문항형 검사에 `test_started`가 없으면 실패한다 — 2026-08-31 GA4 실측에서 완료 204건 대비 시작 14건이 나와 완주율의 분모가 없던 것이 원인이다. 계산기(`src/components/tools`)는 대상이 아니다: 계약상 `test_started`는 "첫 문항 응답"이라 입력→계산 화면엔 대응하는 순간이 없다.
- depth baseline은 bare 페이지와 외국어 경로의 한국어 누출 재증가를 막는다. 기존 수치를 일괄 수정할 의무가 아니라 ratchet이다. 위반을 통과시키기 위해 ceiling을 올리지 않고 개선 때 낮춘다.
- route/topic 변경은 company-brain의 route-ownership.json·contracts/knowledge/topics.json을 갱신하고 루트에서 `python3 company-brain/scripts/oiyo-ecosystem/audit-route-ownership.py`를 실행한다.
- 구조·로케일·YMYL 안내·관련 링크와 실제 검증 결과를 확인한 뒤 완료를 기록한다. 실행 명령은 package.json을 기준으로 한다.
