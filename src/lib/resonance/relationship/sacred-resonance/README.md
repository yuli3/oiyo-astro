# sacred-resonance — 보관 중인 데이터만 남음

2026-09-22 에 엔진을 걷어냈다. 현재 원칙(총점 없음 · 지어낸 값 없음 · LLM 문구 없음)과 충돌했다.

- 9차원을 가중 평균해 **총점**을 냈다
- 데이터가 없으면 `createSimulatedResult` 가 **지어낸 점수**(70·50·60…)를 넣었다
- 서술을 LLM(`oracle-voice`)이 만들었다
- 주역은 이름 글자 + **지금 시각**으로 뽑는 데모였고 64괘 중 3괘만 데이터가 있었다
- 어떤 화면에도 연결돼 있지 않았다

살린 것
- 주역 → `src/lib/symbolic-tradition/iching.ts` (매화역수 기괘법, 음력은 `ontology/calendar-systems/lunar-kernel`)
- 마야·켈트 이름 → `src/lib/symbolic-tradition/symbol-names.ts` 에 여섯 언어로 새로 정리(옛 i18n 은 기계 번역 오류가 있어 쓰지 않음)

남긴 것(`data/shards`) — 혈액형 궁합 표, 에니어그램 경로, 켈트·마야 설명문. 혈액형·에니어그램 입력이 생기면 근거 줄의 재료로 다시 검토한다. 쓰기 전에 문장 품질과 출처를 확인할 것.
