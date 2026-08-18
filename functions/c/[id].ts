const LOCALES = new Set(["en", "es", "fr", "ja", "ko", "zh"]);
const ID_PATTERN = /^[A-Za-z0-9_-]{22}$/;

interface Context {
  params: { id?: string };
  request: Request;
}

export function onRequest({ params, request }: Context): Response {
  const id = params.id;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return new Response("Not found", { status: 404 });
  const requested = new URL(request.url).searchParams;
  const requestedLocale = requested.get("l") ?? "ko";
  const locale = LOCALES.has(requestedLocale) ? requestedLocale : "ko";
  const join = requested.get("join") === "1" ? "&join=1" : "";
  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      Location: `/${locale}/profile/symbolic-compatibility/?share=${id}${join}`,
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
