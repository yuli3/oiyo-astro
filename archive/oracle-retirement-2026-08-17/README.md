# 오라클 카드 퇴장 — 2026-08-17

세운 지시: "오라클 뽑기는 제거하고싶음. 일단 타로카드가 훨씬 더 유용한 컨텐츠이고, 오라클 카드 뽑기는
타로카드와 유사한 느낌이라 사용자들이 헷갈릴 가능성이 있음."

이건 성과 판정이 아니라 **제품 판정**이다. GSC(90일)로도 `/oracle/draw`·`/oracle/sages` 모두 노출 0·클릭 0이었지만,
oiyo.net apex 자체가 같은 기간 클릭 6·노출 535라 그 숫자만으로는 이 도구가 나쁘다는 증거가 되지 못한다.
접는 근거는 **타로와 역할이 겹쳐 둘 다 흐려진다**는 쪽이다.

## 아카이브한 것 (oiyo)

| 파일 | 원래 위치 | 설명 |
|---|---|---|
| `draw.astro` | `src/pages/[locale]/oracle/draw.astro` | 오라클 카드 뽑기(그라시안 22장) |
| `sages.astro` | `src/pages/[locale]/oracle/sages.astro` | 오늘의 현인의 카드 |
| `OracleCardDraw.tsx` | `src/components/tools/` | 뽑기 인터랙션 1,041줄 |
| `SagesCardDaily.tsx` | `src/components/tools/` | 일일 카드 |
| `sages-cards.ts` | `src/data/` | 현인 카드 매니페스트(451 → 318장으로 줄었다가 전량 퇴장) |

wiki 쪽 원문(그라시안 300 · 노자 18 · 허브)은 `wiki/archive/oracle-retirement-2026-08-17/`에 있다.

## 링크를 비우지 않고 타로로 돌린 자리

세운의 근거가 "타로가 더 유용한데 오라클이 헷갈리게 한다"이므로, 슬롯을 빈칸으로 두는 대신
더 나은 제품으로 채웠다. 전부 `/tarot/daily`로 향한다.

- `src/pages/[locale]/index.astro` — 상단 퀵링크(제거) + 히어로 티저 섹션(**타로 데일리로 전환**, 6로케일 카피 재작성, "신규" 배지 → "매일 한 장")
- `src/pages/[locale]/numerology/calculator.astro` — 관련 도구 6로케일
- `src/lib/ontology/journey/luck.ts` — 온톨로지 luck 여정 6로케일

## 계약·동기화 파일

- `route-ownership.json` — `oiyo.oracle.draw`·`oiyo.oracle.sages` 엔트리와 다른 route의 `related.oiyo` 참조 제거. 감사 결과 **231 routes · 50 topics · 0 errors**(전 233·51).
- `knowledge/topics.json` — `oracle` 토픽과 이를 가리키던 `relatedTopicIds` 참조 2건 제거.
- `mystic-trinity.json` — **3 repo 사본 전부**(oiyo `src/data/`, wiki·blog `src/config/`)에서 `oracle` 토픽 제거(14 → 13). 각 repo의 `MysticTrinity.astro`에서 `if (/oracle/.test(s)) return "oracle";` 추론도 함께 제거했다. 셋 중 하나만 고치면 나머지 두 사이트가 죽은 토픽을 계속 가리킨다.

## 검증

oiyo: 테스트 2,176 통과 · mystic-seo 18/0 · 빌드 1,300 pages(전 1,312 — 오라클 2 route × 6로케일 = 12 감소).
빌드 산출물에서 `dist/ko/oracle` 부재, `dist/ko/index.html`에 `tarot/daily` 링크 존재를 확인했다.

## 남은 위험

- `/oracle/draw`·`/oracle/sages`는 배포 후 404가 된다. 노출·클릭이 0이라 사용자 손실은 없다고 본다. `_redirects` 규칙은 추가하지 않았다 — 이 repo 계열에서 append한 신규 규칙이 하단에서 드롭돼 라이브 404가 난 전례가 있다.
- **`grand-oracle` 엔진과 `oracle.json` i18n 네임스페이스는 건드리지 않았다.** 이름만 같을 뿐 아키타입 해석 엔진이라 카드 제품과 무관하다. 오라클을 더 지우려는 다음 사람이 여기서 헷갈리기 쉽다.
