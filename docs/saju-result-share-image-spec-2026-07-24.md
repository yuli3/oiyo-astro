# 사주 결과 공유 이미지 실행 사양

- 상태: proposed → 구현 가능 사양
- 작성일: 2026-07-24
- Idea source: inbox
- Owner: oiyo.net
- 대상: 기존 `/[locale]/saju/calculator` 결과 화면
- 관련 목표: 자기이해 결과 자산화, 공유·재방문 루프 강화
- 공개 범위: 기존 URL의 클라이언트 기능; 새 경로·서버 저장소 없음

## 결정

사주 결과 화면에 `사주 이미지 저장·공유` CTA를 추가한다. 이미지는 사용자가
계산한 연주·월주·일주·시주를 네 카드로 보여 주고 하단에 `oiyo.net` 워터마크를
넣는다. 모바일에서는 Web Share API의 파일 공유를 우선하고, 지원하지 않는
브라우저에서는 PNG를 내려받는다.

첫 버전은 **1080×1080 PNG** 한 종류로 고정한다. 카카오의 기본 메시지 이미지는
정사각형이 권장되고 비정사각 이미지는 가운데 잘릴 수 있으므로, 카카오톡 대화방의
첨부 이미지 썸네일과 다른 공유 앱에서 핵심 정보가 잘리지 않는 정사각 안전 영역을
우선한다. 기존 `share-result-image.ts`의 1080×1350 일반 결과 카드를 그대로
캡처하지 않고, 파일 공유·다운로드 전송부만 재사용한다.

정적 `public/og-image.png` 또는 페이지의 `og:image`는 바꾸지 않는다. 현재 사주
결과는 브라우저에서 계산되고 개인별 상태는 URL hash에 있으므로 크롤러가 읽는
정적 OG 이미지로 개인 결과를 표현할 수 없다. 개인별 OG URL, 서버 렌더링,
이미지 업로드·보관은 개인정보와 운영 복잡도를 늘리므로 이번 범위에서 제외한다.

## 가설과 검증 기준

가설: 결과 바로 아래에서 시각적으로 완결된 사주 카드를 저장·공유할 수 있으면,
현재의 개인정보 포함 결과 링크만 제공할 때보다 공유 시도가 늘어난다.

기능 수용 기준과 출시 후 가설 판정은 분리한다.

| 구분 | 기준 |
| --- | --- |
| 기능 수용 | 아래의 P0 수용 기준과 자동·수동 QA를 모두 통과 |
| 1차 지표 | `share_click` 중 `test_id: "saju"`, `share_surface: "image"`인 세션 수 / `test_completed` 세션 수 |
| 보호 지표 | 이미지 생성 오류율 1% 미만, 결과 표시·계산 오류 증가 없음, 모바일 build 성능 회귀 없음 |
| 개인정보 보호 | 이미지와 파일명에 생년월일시, 성별, permalink hash, 사용자 식별자 없음 |
| 관찰 창 | 배포 후 28일 또는 `test_completed` 200세션 중 늦게 도달한 시점 |
| 성공 판정 | 이미지 공유 시도율 5% 이상이며 기존 링크 공유 시도율이 절대 1%p 이상 감소하지 않음 |
| 중단 판정 | 생성 오류율 1% 이상, 잘못된 기둥 표시 1건 이상, 개인정보 노출 1건 이상 |

`navigator.share()`가 성공을 반환해도 사용자가 어느 앱으로 보냈는지는 알 수
없으므로 “카카오 전송 완료”를 측정하거나 주장하지 않는다. `share_click`은 버튼
클릭 직전의 공유 의도만 측정하며, 이미지 내용·사주 값·출생 입력은 GA4로 보내지
않는다.

## P0 수용 기준

1. 실제 계산 완료 뒤 결과의 Four Pillars 블록 아래에 이미지 CTA가 보인다.
   계산 전, 로딩 중, 오류 상태에는 보이지 않는다.
2. PNG는 정확히 1080×1080이고 5MB 이하이며, 배경은 불투명하다.
3. 카드 순서는 항상 연주 → 월주 → 일주 → 시주다. 각 카드에는 지역화된 기둥명,
   천간 한자, 지지 한자, 지지 동물, 오행이 표시된다.
4. 화면의 `result.pillars`를 그대로 입력으로 사용한다. 이미지 렌더러가 사주를
   다시 계산하거나 날짜·시간을 전달받지 않는다.
5. 출생 시간이 있으면 화면의 시주와 이미지의 시주가 일치한다. 시간이 없으면
   네 번째 자리를 `시간 미입력` placeholder로 표시하며 정오나 임의 시주를
   추정하지 않는다.
6. 일주는 약한 강조 테두리와 `나의 중심` 보조 라벨로 구분하되, 다른 세 기둥을
   흐리거나 운세의 우열처럼 표현하지 않는다.
7. 이미지에는 `나의 사주팔자` 제목과 `oiyo.net` 워터마크만 추가한다. 이름,
   생년월일시, 성별, 결과 링크·hash, 직업·건강·재물·연애 해석은 넣지 않는다.
8. `ko`, `en`, `ja`, `zh`, `fr`, `es`에서 fallback key나 잘린 문구가 없고,
   CJK 글리프가 네모로 렌더되지 않는다. `cn`은 추가하지 않는다.
9. 파일 공유를 지원하는 모바일 브라우저에서는 PNG 파일이 OS 공유 시트에
   전달된다. 미지원 또는 실제 공유 오류에서는 같은 PNG가 다운로드된다.
   사용자가 공유 시트를 취소하면 추가 다운로드를 강제하지 않는다.
10. 중복 클릭은 한 번의 생성 작업만 실행한다. 생성 중 버튼은 disabled이고
    지역화된 진행 문구를 표시하며, 완료·오류 상태는 `aria-live="polite"`로
    전달된다.
11. 기존 `결과 링크 공유` 기능은 별도 CTA로 유지하고 개인정보 경고를 그대로
    표시한다. 이미지 CTA에는 “출생정보는 이미지에 포함되지 않아요”를 표시한다.
12. 이미지 클릭은 기존 `share_click` 이벤트에 `test_id: "saju"`와
    `share_surface: "image"`만 전송한다. 링크 클릭은 같은 이벤트에
    `share_surface: "link"`를 추가해 두 경로를 구분한다.

## 이미지 화면 계약

### 레이아웃

```text
┌────────────────────────────────────┐
│ OIYO                               │
│                                    │
│            나의 사주팔자            │
│                                    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ 연주  │ │ 월주  │ │ 일주  │ │ 시주  │ │
│ │ 甲    │ │ 丙    │ │ 戊    │ │ —     │ │
│ │ 子 🐭 │ │ 寅 🐯 │ │ 辰 🐉 │ │시간 미입력│ │
│ │ 목(木)│ │ 화(火)│ │ 토(土)│ │       │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ │
│                                    │
│          상징적 자기이해 도구        │
│               oiyo.net             │
└────────────────────────────────────┘
```

- 외곽 안전 여백은 최소 72px, 텍스트·기둥 핵심 영역은 중앙 936×936 안에 둔다.
- 네 기둥은 4열을 유지한다. 한 카드 폭은 최소 198px, 카드 사이 간격은 20px다.
- 천간·지지는 72px 이상, 라벨과 오행은 26px 이상으로 그린다.
- 기본 배경은 따뜻한 off-white, 텍스트는 near-black, 테두리는 muted indigo를
  사용한다. 오행은 현재 결과 화면의 Wood/Fire/Earth/Metal/Water 색상 의미를
  따르되 대비 4.5:1 미만의 색은 텍스트가 아니라 테두리·배경에만 쓴다.
- 그림자, 사진, 외부 폰트·이미지, 자동 애니메이션은 사용하지 않는다. 동물
  이모지는 OS별 모양 차이가 있어도 정보의 유일한 표현이 아니어야 한다.
- 하단의 `상징적 자기이해 도구`는 점술 결과를 사실·진단·예측으로 오해하지
  않게 하는 짧은 면책이다. 로케일별 승인 문구를 사용한다.

### 렌더 입력 계약

```ts
type SajuSharePillar = {
  key: 'year' | 'month' | 'day' | 'hour'
  label: string
  stem: {
    hanja: string
    localizedName: string
    element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water'
  } | null
  branch: {
    hanja: string
    animalName: string
    animalEmoji: string
    element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water'
  } | null
}

type SajuShareCardPayload = {
  locale: 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'
  title: string
  disclaimer: string
  pillars: [
    SajuSharePillar,
    SajuSharePillar,
    SajuSharePillar,
    SajuSharePillar,
  ]
}
```

`hour`의 `stem`과 `branch`만 `null`일 수 있다. 이 타입은 표시 값만 받으며
`Date`, 생년, 월, 일, 시, 성별을 허용하지 않는다. 런타임 validator는 기둥
순서, 허용 로케일, 한자 길이, 오행 enum, hour-only null을 확인하고 실패하면
이미지를 만들지 않는다.

## 구현 설계

### 파일과 책임

| 파일 | 변경 |
| --- | --- |
| `src/lib/share-result-image.ts` | 기존 일반 결과 카드 동작은 보존하고, 이미 생성된 Blob을 파일 공유/다운로드하는 `shareImageBlob` 전송 helper를 분리 |
| `src/lib/saju/share-card.ts` (신규) | payload 타입·validator, 1080×1080 Canvas renderer, 텍스트 측정과 시주 placeholder |
| `src/lib/saju/share-card.test.ts` (신규) | payload 경계, 기둥 순서, hour unknown, 개인정보 필드 거절, Canvas 호출 계약 |
| `src/components/tools/saju/SajuShareButton.tsx` (신규) | locale 문구, idle/generating/shared/downloaded/error 상태, 중복 클릭 방지, analytics callback |
| `src/components/tools/SajuCalculator.tsx` | 현재 `result.pillars`를 표시 payload로 변환하고 Four Pillars 아래에 CTA 연결; 기존 링크 공유 유지 |
| `src/components/tools/SajuCalculator.share.test.tsx` (신규) | 계산 전/후 노출, 4주 일치, unknown hour, analytics allowlist, 링크 공유 회귀 |

기존 `ShareResultButton`의 `ShareCardPayload`는 단일 결과 제목을 전제로 하므로
사주 4주를 description 문자열로 억지로 넣지 않는다. 대신
`share-result-image.ts`에서 파일 전송부만 추출해 일반 검사와 사주 렌더러가 함께
사용한다. 이 리팩터링 전후에 기존 `renderShareCard`의 크기, filename, 취소
동작은 바뀌지 않아야 한다.

### 생성 흐름

```text
calculated result
  → map visible pillar data
  → validate display-only payload
  → await document.fonts.ready (최대 1초)
  → render 1080×1080 PNG Blob
  → Web Share file
      ├─ shared / user cancelled: stop
      └─ unsupported / real error: download same Blob
```

- `document.fonts.ready`가 1초 안에 끝나지 않아도 시스템 font stack으로 계속한다.
- Canvas는 device pixel ratio와 무관하게 1080×1080로 고정한다.
- `toBlob("image/png")` 실패, 5MB 초과, validator 실패는 사용자에게 오류 상태를
  보이고 공유 시트를 열지 않는다.
- filename은 `oiyo-saju-card.png`로 고정해 개인정보와 결과값을 노출하지 않는다.
- object URL은 클릭 다음 animation frame 이후 revoke한다. 생성된 Blob이나
  payload를 localStorage, IndexedDB, KV, 서버 로그에 저장하지 않는다.

## 접근성·성능·프라이버시

- CTA는 44px 이상의 터치 높이와 명확한 focus-visible 스타일을 갖는다.
- 진행 중 `aria-busy`, 상태 문구 `aria-live="polite"`, disabled를 함께 사용한다.
- 결과 화면의 텍스트 Four Pillars가 정본이며, Canvas 이미지는 접근성 트리의
  대체물이 아니다.
- 이미지 관련 모듈은 결과 화면에서 CTA를 눌렀을 때 dynamic import한다. 계산기
  초기 JS에 `html2canvas`, 이미지 라이브러리, 외부 폰트를 추가하지 않는다.
- renderer는 DOM 캡처가 아니라 Canvas 명령만 사용해 결과 화면의 숨은 입력이나
  개인정보가 우연히 이미지에 포함되는 경로를 차단한다.
- 새 네트워크 요청, API key, 외부 CDN, 서버 저장소를 만들지 않는다.

## 자동 검증

가장 좁은 검사부터 실행한다.

```bash
npm run test -- --run src/lib/saju/share-card.test.ts src/components/tools/SajuCalculator.share.test.tsx
npm run audit:mystic-seo
npm run build
```

테스트 fixture는 실제 사용자 생년정보가 아닌 합성된 네 기둥 표시값만 사용한다.
Canvas pixel snapshot은 브라우저·OS font에 따라 불안정하므로 사용하지 않는다.
대신 canvas mock으로 크기, 그리기 순서, 안전 영역, placeholder, footer, `toBlob`
호출을 검사하고, 한 장의 golden PNG는 수동 QA 산출물로만 보관한다.

## 수동 QA

1. 390px iOS Safari와 Android Chrome에서 알려진 시간/미입력 시간 결과를 각각
   생성한다.
2. 화면의 연·월·일·시 천간·지지·오행과 PNG를 한 글자씩 대조한다.
3. 카카오톡 나와의 채팅에 PNG 파일을 첨부해 썸네일, 전체 보기, 저장 후 크기를
   확인한다. 카카오 공식 문서도 비율 설정은 실제 테스트 메시지로 확인하도록
   안내하므로 에뮬레이터 미리보기만으로 통과 처리하지 않는다.
4. iOS/Android 공유 시트 취소가 다운로드를 유발하지 않는지 확인한다.
5. Desktop Chrome/Firefox에서 PNG fallback 다운로드와 object URL 정리를 확인한다.
6. `ko/en/ja/zh/fr/es`에서 긴 label, 악센트, CJK glyph, RTL 미대상, overflow를
   확인한다.
7. PNG strings/metadata와 네트워크 패널에서 생년월일시, 성별, permalink hash,
   analytics 외 전송이 없는지 확인한다.
8. 4× CPU slowdown에서도 클릭 후 2초 내 공유 시트 또는 다운로드가 시작되는지
   확인한다. 2초 초과가 반복되면 renderer를 단순화하고 출시하지 않는다.

## 실행 순서와 롤백

1. 전송 helper 추출과 기존 일반 결과 카드 회귀 테스트를 먼저 고정한다.
2. 순수 사주 renderer와 validator를 합성 fixture로 구현한다.
3. `SajuShareButton`을 연결하고 이미지/링크 analytics surface를 분리한다.
4. 자동 검사 후 6 locale과 실제 카카오톡 수동 QA를 수행한다.
5. 2026-07-31 동결 종료 및 사용자 재확인 전에는 커밋·푸시·배포하지 않는다.
6. 배포 후 관찰 창에서 성공·보호 지표를 판정한다.

긴급 롤백은 `SajuCalculator.tsx`에서 이미지 CTA만 숨긴다. 기존 계산, Four
Pillars 표시, 결과 링크 공유는 독립적으로 유지되므로 renderer 오류가 사주 결과
전체를 막아서는 안 된다.

## 범위 밖과 남은 위험

- 개인별 URL OG 이미지와 카카오 SDK 메시지 템플릿
- 서버 이미지 생성, KV/R2 보관, 공유 이미지 영구 URL
- Instagram Story 9:16, feed 4:5, X 1.91:1 등 추가 비율
- 생년정보·이름을 넣는 사용자 선택 옵션
- 운세 해석, 용신, 재물·진로·연애·건강 내용을 이미지에 포함
- 다른 사주·심리 결과 화면으로 자동 확장

가장 큰 남은 위험은 Web Share API 구현과 카카오톡 버전별 첨부 썸네일 차이다.
따라서 1080×1080과 중앙 안전 영역을 기본값으로 두되, 실제 iOS·Android
카카오톡 수동 QA가 없으면 구현을 완료로 판정하지 않는다. 수동 QA에서 의미 있는
crop이 발견되면 새 저장소나 SDK를 도입하지 않고 내부 여백과 카드 크기만 조정한다.

## 참고 근거

- [카카오톡 공유 기본 템플릿](https://developers.kakao.com/docs/ko/message-template/default):
  정사각형이 아닌 기본 템플릿 이미지는 가운데 잘릴 수 있다.
- [카카오톡 공유 사용자 정의 템플릿](https://developers.kakao.com/docs/ko/message-template/custom):
  이미지 비율은 실제 테스트 메시지로 출력 확인이 필요하다.
