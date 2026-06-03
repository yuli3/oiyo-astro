# OIYO 4프로젝트 콘텐츠 아키텍처

작성일: 2026-06-03  
수정일: 2026-06-03 (4프로젝트 전수 분석 후 확정)  
범위: `oiyo` (Next.js), `oiyo-astro`, `blog-oiyo`, `wiki-oiyo`

---

## 현재 상태 (2026-06-03 기준)

| 프로젝트 | 도메인 | 스택 | 상태 | 규모 |
|---|---|---|---|---|
| `oiyo` | oiyo.net | Next.js + Vercel | Dormant (Astro 이전 후) | 270K LOC |
| `oiyo-astro` | oiyo.net | Astro + Cloudflare Pages | 운영 중 (이전 진행) | 248K LOC |
| `blog-oiyo` | blog.oiyo.net | Astro + Cloudflare Pages | 운영 중 (빌드 느림) | 845K LOC + 5,966 MDX |
| `wiki-oiyo` | wiki.oiyo.net | Astro + Cloudflare Pages | 미개시 | 170K LOC + 496 MDX |

---

## 1. 4프로젝트 역할 확정

### oiyo (Next.js + Vercel) — Dormant, 수익화 준비용

> **Daily Fortune + 결제/회원/AI가 필요할 때 다시 켜는 풀버전**

- `/daily` Daily Oracle은 여기에만 있다. AI 실시간 호출이 필요하므로 정적 Astro에서 구현하지 않는다.
- Clerk 인증, Supabase, LemonSqueezy/TossPayments, Google AI 전부 탑재.
- 사용자가 충분히 늘어 수익화 시점이 되면 DNS를 다시 Vercel로 전환하고 결제·회원·Daily Fortune을 활성화한다.
- 지금은 건드리지 않는다.

### oiyo-astro (Astro + Cloudflare Pages) — 현재 oiyo.net

> **성격·운세·자기이해 전문 테스트 허브. 순수 정적.**

포함:
- 성격 테스트: MBTI, 에니어그램, Big Five, RIASEC, 애착유형, DISC, 번아웃 등
- 운세·상징 도구: 사주, 수비학, 별자리 성격/궁합, 혈액형 성격, 띠
- 온톨로지 허브 (기존)
- 유형별 결과 해설 페이지 (`/mbti/intj` 등)
- 테스트 허브 인덱스 (`/tests`)

제외 (절대):
- Daily Fortune / Daily Oracle → oiyo(Next.js) 전용. AI 호출 필요.
- 세금/연봉/부동산/건강 계산기 → blog-oiyo에 이미 있고 브랜드와 안 맞음.
- 인증/결제/프리미엄 → 수익화 시점에 oiyo(Next.js)로 전환.

### blog-oiyo (Astro + Cloudflare Pages) — 콘텐츠 자산

> **5,966 MDX 자산. 빌드 느림. 최대한 내보내고 유지.**

- 신규 콘텐츠 추가 최소화 (빌드 타임 문제).
- 기존 글이 자연 검색으로 oiyo.net 유입을 생성.
- `psychology-*` 인터랙티브 테스트들: 컴포넌트를 oiyo-astro에서 재사용, blog 원본 유지.
- `meaning-of-*` (38편): wiki-oiyo로 사전형 문서 소재 제공. blog 원본 유지.
- `tool-*` 중 성격/운세 도구: oiyo-astro에서 컴포넌트 재사용. blog 원본 유지.
- 생활/세금/연봉/부동산 계산기: blog에 계속 유지.

### wiki-oiyo (Astro + Cloudflare Pages) — 사전 허브

> **성격·운세 개념 사전 + 기존 교육 시리즈 공존.**

- 현재 490개 한국어 포스트 (AI 리더십, 카네기 시리즈): 유지. blog-oiyo와 성격이 겹치지만 SEO 자산으로 활용.
- 신규 추가: 성격 유형 사전 (MBTI 16유형, 에니어그램 9유형, 날개), 운세 용어 사전.
- blog의 `meaning-of-*` 요약본으로 사전 문서 초기 구성.
- 모든 사전 문서에 oiyo.net 테스트 CTA 필수.

---

## 2. 콘텐츠 이동 계획

### 2.1 blog-oiyo → oiyo-astro (컴포넌트 재사용)

blog-oiyo의 React 컴포넌트를 oiyo-astro Astro 페이지에서 재사용. blog 원본은 유지.

| blog 컴포넌트 | oiyo-astro 목표 URL | 우선순위 |
|---|---|---|
| `BigFivePersonalityTest` | `/ko/big5/test` | 🔜 높음 |
| `SajuCalculator` | `/ko/saju/calculator` | 🔜 높음 |
| `NumerologyCalculator` | `/ko/numerology/calculator` | 🔜 높음 |
| `ZodiacPersonality` | `/ko/zodiac/personality` | 🔜 높음 |
| `ZodiacCompatibilityCalculator` | `/ko/zodiac/compatibility` | 중간 |
| `BloodTypePersonality` | `/ko/blood-type` | 중간 |
| `ChineseZodiac` | `/ko/chinese-zodiac` | 중간 |
| `AttachmentStyleTest` | `/ko/attachment/test` | 중간 |
| `DiscPersonalityTest` | `/ko/disc/test` | 낮음 |
| `CareerValuesTest` | `/ko/career-values/test` | 낮음 |

### 2.2 blog-oiyo → wiki-oiyo (사전 문서 소재)

blog의 `meaning-of-*` 원문을 요약해 wiki 사전 문서로 새로 작성. blog 원본 유지.

**성격 이론:**

| blog 원문 | wiki 문서 |
|---|---|
| `meaning-of-mbti` | `wiki/MBTI` |
| `meaning-of-enneagram` | `wiki/enneagram` |
| `meaning-of-big5` | `wiki/big-five` |
| `meaning-of-riasec` | `wiki/RIASEC` |
| `meaning-of-tci` | `wiki/TCI` |
| `meaning-of-hexaco` | `wiki/HEXACO` |
| `meaning-of-hsp` | `wiki/HSP` |
| `meaning-of-attachment-theory` | `wiki/attachment-theory` |
| `meaning-of-cognitive-biases` | `wiki/cognitive-bias` |

**운세·상징:**

| blog 원문 | wiki 문서 |
|---|---|
| `meaning-of-biorhythms` | `wiki/biorhythm` |
| `meaning-of-numerology` | `wiki/numerology` |
| `meaning-of-astrology` | `wiki/astrology` |
| `meaning-of-akashic-records` | `wiki/akashic-records` |
| `meaning-of-yin-yang` | `wiki/yin-yang` |
| `meaning-of-palja` | `wiki/palja` |
| `meaning-of-eastern-philosophy` | `wiki/eastern-philosophy` |

**MBTI 유형 사전 (blog `mbti-{type}` 요약):**

```
wiki/INTJ, wiki/INTP, wiki/ENTJ, wiki/ENTP
wiki/INFJ, wiki/INFP, wiki/ENFJ, wiki/ENFP
wiki/ISTJ, wiki/ISFJ, wiki/ESTJ, wiki/ESFJ
wiki/ISTP, wiki/ISFP, wiki/ESTP, wiki/ESFP
```

**에니어그램 유형 사전 (blog `enneagram-type*` 요약):**

```
wiki/enneagram-type-1 ~ wiki/enneagram-type-9
wiki/1w9, wiki/1w2, wiki/2w1, wiki/2w3, ... (날개 조합)
```

---

## 3. oiyo-astro 완성 로드맵

### Phase 1: 테스트 허브 완성 (우선)

```
/ko/mbti/test                ✅ 완료
/ko/enneagram/test           ✅ 완료
/ko/ontology                 ✅ 완료

/ko/tests                    🔜 테스트 허브 인덱스
/ko/big5/test                🔜 BigFivePersonalityTest (blog 재사용)
/ko/saju/calculator          🔜 SajuCalculator (blog 재사용)
/ko/numerology/calculator    🔜 NumerologyCalculator (blog 재사용)
/ko/zodiac/personality       🔜 ZodiacPersonality (blog 재사용)
/ko/zodiac/compatibility     🔜 ZodiacCompatibility (blog 재사용)
/ko/blood-type               🔜 BloodTypePersonality (blog 재사용)
/ko/chinese-zodiac           🔜 ChineseZodiac (blog 재사용)
```

### Phase 2: 유형별 결과 페이지

```
/ko/mbti                     (MBTI 허브)
/ko/mbti/{type}              (INTJ, INFP 등 16유형 — 현재 4개 프로젝트 모두 없음)
/ko/enneagram                (에니어그램 허브)
/ko/enneagram/type-{n}       (1~9번 유형)
```

### Phase 3: wiki-oiyo 사전 초기 구축

- MBTI 16유형 사전 문서 (blog 요약)
- 에니어그램 9유형 + 날개 사전 문서
- 주요 성격이론 용어 사전 (big-five, RIASEC, TCI 등)
- 운세 용어 사전 (사주, 수비학, 별자리 등)

### Phase 4: Next.js 재이전 (조건부)

조건: 일일 활성 사용자 목표 달성, 수익화 가능성 확인.  
전환 내용: DNS → Vercel 재연결, 결제/회원/Daily Fortune/프리미엄 리포트 활성화.

---

## 4. 도메인별 URL 구조

### oiyo.net (oiyo-astro)

```
/ko/tests                    테스트 허브
/ko/mbti/test
/ko/mbti                     MBTI 허브
/ko/mbti/{type}              유형 결과 (16개)
/ko/enneagram/test
/ko/enneagram/type-{n}       유형 결과 (9개)
/ko/big5/test
/ko/saju/calculator
/ko/numerology/calculator
/ko/zodiac/personality
/ko/zodiac/compatibility
/ko/blood-type
/ko/chinese-zodiac
/ko/ontology                 온톨로지 허브
```

### wiki.oiyo.net

```
/MBTI, /big-five, /RIASEC, /TCI, /HEXACO, /DISC, /HSP
/INTJ, /INTP, ... (MBTI 16유형)
/enneagram, /enneagram-type-1 ~ /enneagram-type-9
/1w9, /4w3, ... (날개 조합)
/saju, /오행, /천간, /지지
/numerology, /biorhythm, /astrology
/akashic-records, /attachment-theory, /cognitive-bias
```

---

## 5. 유지 규칙

### blog-oiyo에 건드리지 않는 것

- `psychology-*` 인터랙티브 테스트 MDX: 원본 유지. 컴포넌트만 oiyo-astro에서 재사용.
- `meaning-of-*` 해설 글: 원본 유지. wiki용 사전 문서는 새로 작성.
- `tool-*` 성격/운세 도구: 원본 유지. 컴포넌트만 oiyo-astro에서 재사용.
- 생활 계산기 전체: blog에 계속 유지. oiyo.net에 가져오지 않음.
- `academy-*`, `education-*`, `magazine-*`: 그대로 유지.

### wiki-oiyo 기존 콘텐츠

- 490개 AI 리더십/카네기 시리즈: 삭제 없이 유지.
- 신규 성격·운세 사전 문서는 별도 슬러그로 추가.

### Daily Fortune

- oiyo(Next.js)에만 존재. Astro 버전에는 구현하지 않는다.
- AI 실시간 호출이 필요한 기능이므로 정적 빌드와 맞지 않음.

---

## 6. 중복 방지

| 도메인 | 역할 | 예 |
|---|---|---|
| `oiyo.net` | 실행 | `/mbti/test`, `/big5/test`, `/saju/calculator` |
| `blog.oiyo.net` | 해설·설득 | "MBTI 직업 추천 해설", "사주 입문 가이드" |
| `wiki.oiyo.net` | 정의·참조 | "INTJ 뜻", "에니어그램 4번이란" |

같은 주제라도 역할이 다르면 공존 가능. 같은 목적의 문서를 세 곳에 만들지 않는다.

---

## 7. 한 문장 요약

> `blog.oiyo.net`의 자연 유입이 사용자를 끌고, `wiki.oiyo.net`이 개념을 잡아주며, `oiyo.net`(Astro)이 성격·운세 테스트를 실행하고, `oiyo.net`(Next.js)은 수익화 시점에 Daily Fortune·결제·회원을 들고 돌아온다.

---

*다음 세션 작업 목록: oiyo-astro에 Big Five, 사주, 수비학, 별자리 추가 + /tests 허브 + /mbti/{type} 유형 페이지*
