// 2026-11-21: 루트(/)를 Accept-Language 로 보낸다.
// 그전에는 _redirects 의 "/ /ko/ 301" 이 모든 방문자를 한국어 홈으로 보냈다. 10/12~13 튀르키예 X 바이럴 때
// 브랜드 검색("oiyo.net")으로 들어온 1,539세션이 한국어 홈에 떨어졌다
// (company-brain projects/oiyo-ecosystem/oiyo-tr-traffic-drop-2026-11-21.md).
// - 지원 언어가 있으면 그 언어 홈
// - 헤더가 있는데 지원 언어가 없으면 영어 홈
// - 헤더가 없으면(대부분 크롤러) 예전처럼 한국어 홈
// 언어마다 목적지가 달라 302 + Vary 로 낸다(301 은 브라우저·CDN 이 한 목적지로 굳힌다).
const SUPPORTED = ["ko", "en", "ja", "zh", "fr", "es"] as const;
type Locale = (typeof SUPPORTED)[number];

export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage || !acceptLanguage.trim()) return "ko";
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((x) => x.tag && x.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if ((SUPPORTED as readonly string[]).includes(base)) return base as Locale;
  }
  return "en";
}

interface Context {
  request: Request;
}

export function onRequest({ request }: Context): Response {
  const url = new URL(request.url);
  const locale = pickLocale(request.headers.get("Accept-Language"));
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${locale}/${url.search}`,
      Vary: "Accept-Language",
      "Cache-Control": "private, max-age=0",
    },
  });
}
