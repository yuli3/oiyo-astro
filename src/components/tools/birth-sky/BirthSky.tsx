// 태어난 순간의 해·달 — 입력, 결과, 3D 장면(lazy), 출생지 지평선, 공유 카드.
// 처음 열면 "지금 이 순간"의 하늘을 보여 주고, 생일을 넣으면 그 순간으로 바뀐다.
import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Locale } from "../../../i18n";
import { gaEvent } from "../../../lib/analytics/ga-event";
import { compassIndex, computeBirthSky, computeBirthSkyAt, formatBirthSkyQuery, parseBirthSkyQuery, type BirthSky as Sky } from "../../../lib/birth-sky";
import { createBirthRecord, resolveBirthLocation, resolveBirthRecord } from "../../../lib/user/birth-record";
import { useProfilePrefill } from "../../../lib/user/useProfilePrefill";
import { Button } from "../../ui/button";
import { C, CARDINAL, DIRS, PHASES, PHASE_EMOJI, PLACES, SCENE, TERMS, defaultPlaceFor, fill, pick, placeById, signName, toL, type L } from "./data";
import { drawShareCard, moonPhasePath } from "./share-card";
import type { ViewMode } from "./BirthSkyScene";

const Scene = lazy(() => import("./BirthSkyScene"));
const TOOL_ID = "birth-sky";

const fmt1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function civilNow(zoneId: string): { date: string; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: zoneId, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function dateLabel(civilDate: string, l: L): string {
  const [y, m, d] = civilDate.split("-").map(Number);
  return new Intl.DateTimeFormat(l === "zh" ? "zh-CN" : l, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

export function describeBody(alt: number, az: number, l: L): string {
  const dir = DIRS[l][compassIndex(az)]!;
  return alt >= 0 ? fill(pick(C.above, l), { dir, alt: Math.round(alt) }) : fill(pick(C.below, l), { dir, alt: Math.round(-alt) });
}

/* ---------- horizon panorama ---------- */

const W = 720;
const H = 250;
const HORIZON_Y = 185;
const PX_PER_ALT = 1.9;
const xOf = (az: number) => (((az % 360) + 360) % 360) * (W / 360);
const yOf = (alt: number) => HORIZON_Y - Math.max(-30, alt) * PX_PER_ALT;

function Horizon({ sky, l, title }: { sky: Sky; l: L; title: string }) {
  const stops = sky.daylight === "day" ? SCENE.skyDay : sky.daylight === "twilight" ? SCENE.skyTwilight : SCENE.skyNight;
  const sx = xOf(sky.sun.az);
  const sy = yOf(sky.sun.alt);
  const mx = xOf(sky.moon.az);
  const my = yOf(sky.moon.alt);
  let dAz = sky.sun.az - sky.moon.az;
  dAz = ((dAz + 540) % 360) - 180;
  const angle = (Math.atan2(-(sky.sun.alt - sky.moon.alt) * PX_PER_ALT, dAz * (W / 360)) * 180) / Math.PI;
  const r = 15;
  const card = CARDINAL[l];
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border border-border" role="img" aria-label={title}>
        <defs>
          <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={stops[0]} />
            <stop offset="1" stopColor={stops[1]} />
          </linearGradient>
          <radialGradient id="bs-sun">
            <stop offset="0" stopColor={SCENE.sunCore} stopOpacity="1" />
            <stop offset="1" stopColor={SCENE.sunCore} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={W} height={HORIZON_Y} fill="url(#bs-sky)" />
        {[30, 60].map((a) => (
          <g key={a}>
            <line x1="0" x2={W} y1={yOf(a)} y2={yOf(a)} stroke={SCENE.moonOrbit} strokeOpacity="0.25" strokeDasharray="3 6" />
            <text x="6" y={yOf(a) - 4} fontSize="11" fill={SCENE.cardMuted}>{a}°</text>
          </g>
        ))}
        {sky.sun.alt > -30 && (
          <g opacity={sky.sun.alt < 0 ? 0.45 : 1}>
            <circle cx={sx} cy={sy} r="34" fill="url(#bs-sun)" />
            <circle cx={sx} cy={sy} r="13" fill={SCENE.sunCore} />
          </g>
        )}
        {sky.moon.alt > -30 && (
          <g transform={`translate(${mx} ${my}) rotate(${angle})`} opacity={sky.moon.alt < 0 ? 0.45 : 1}>
            <circle r={r} fill={SCENE.moonDark} stroke={SCENE.moonLit} strokeOpacity="0.35" />
            <path d={moonPhasePath(r, sky.moon.illumination)} fill={SCENE.moonLit} />
          </g>
        )}
        <rect x="0" y={HORIZON_Y} width={W} height={H - HORIZON_Y} fill={SCENE.ground} />
        <line x1="0" x2={W} y1={HORIZON_Y} y2={HORIZON_Y} stroke={SCENE.groundLine} strokeWidth="2" />
        {[0, 90, 180, 270].map((a, i) => (
          <text key={a} x={i === 0 ? 10 : xOf(a)} y={HORIZON_Y + 24} fontSize="15" fontWeight="700" fill={SCENE.cardText} textAnchor={i === 0 ? "start" : "middle"}>
            {card[i]}
          </text>
        ))}
        <text x={W - 10} y={HORIZON_Y + 24} fontSize="15" fontWeight="700" fill={SCENE.cardText} textAnchor="end">{card[0]}</text>
        <text x={W / 2} y={H - 12} fontSize="11" fill={SCENE.cardMuted} textAnchor="middle">{pick(C.sunTitle, l)} {Math.round(sky.sun.alt)}° · {pick(C.moonTitle, l)} {Math.round(sky.moon.alt)}°</text>
      </svg>
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
    </figure>
  );
}

/* ---------- main ---------- */

export default function BirthSky({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [unknownTime, setUnknownTime] = useState(false);
  const [placeId, setPlaceId] = useState(defaultPlaceFor(l));
  const [submitted, setSubmitted] = useState<{ date: string; time: string | null; placeId: string } | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState<ViewMode>("space");
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // The site-wide profile is the birth record every tool reads (saju, natal…).
  // Prefill from it; save to it only on the visitor's own submit, never from a shared ?d= link.
  const { profile, parsed, saveBirthRecord } = useProfilePrefill();
  const fromLink = useRef(false);
  const touched = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
    const q = parseBirthSkyQuery(window.location.search);
    if (q && placeById(q.place)) {
      fromLink.current = true;
      setDate(q.date);
      setTime(q.time ?? "12:00");
      setUnknownTime(q.time === null);
      setPlaceId(q.place);
      setSubmitted({ date: q.date, time: q.time, placeId: q.place });
    } else {
      setNow(new Date());
    }
  }, []);

  useEffect(() => {
    if (!parsed || fromLink.current || touched.current) return;
    setDate(`${String(parsed.year).padStart(4, "0")}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`);
    if (parsed.hour === null) setUnknownTime(true);
    else setTime(`${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute ?? 0).padStart(2, "0")}`);
    const record = resolveBirthRecord(profile);
    const match = record?.zoneId ? PLACES.find((p) => p.zoneId === record.zoneId && Math.abs(p.lon - (record.longitude ?? 999)) < 0.01) : undefined;
    if (match) setPlaceId(match.id);
  }, [parsed, profile]);

  const place = placeById(submitted?.placeId ?? placeId) ?? PLACES[0]!;
  const result = useMemo(() => {
    if (submitted) {
      const p = placeById(submitted.placeId) ?? PLACES[0]!;
      return computeBirthSky({ civilDate: submitted.date, civilTime: submitted.time, place: p });
    }
    if (now) return { status: "ok" as const, sky: { ...computeBirthSkyAt(now, place), offsetMinutes: 0, ambiguous: false } };
    return null;
  }, [submitted, now, place]);

  const sky = result?.status === "ok" ? result.sky : null;
  const civil = submitted ? { date: submitted.date, time: submitted.time } : now ? civilNow(place.zoneId) : null;
  const kicker = civil
    ? fill(pick(C.kicker, l), { date: dateLabel(civil.date, l), time: civil.time ?? "", place: place.label[l] })
    : "";

  const submit = () => {
    if (!date) return;
    setCard(null);
    setView("space");
    const civilTime = unknownTime ? null : time;
    setSubmitted({ date, time: civilTime, placeId });
    touched.current = true;
    const p = placeById(placeId);
    if (p) {
      const location = resolveBirthLocation({ civilDate: date, civilTime, longitude: p.lon, zoneId: p.zoneId });
      if (location.status === "resolved") saveBirthRecord(createBirthRecord({ civilDate: date, civilTime, ...location.location }));
    }
    gaEvent("tool_calculated", { tool_id: TOOL_ID, time_known: unknownTime ? "no" : "yes" });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const makeCard = async () => {
    if (!sky || !civil) return;
    const url = await drawShareCard({
      scene: canvasRef.current,
      sky,
      lat: place.lat,
      title: pick(C.cardTitle, l),
      kicker,
      sunLine: `${pick(C.sunTitle, l)} · ${describeBody(sky.sun.alt, sky.sun.az, l)}`,
      termLine: `${fill(pick(C.term, l), { t: TERMS[l][sky.termIndex]!, lon: fmt1(sky.sun.eclLon) })}`,
      moonLine: `${pick(C.moonTitle, l)} · ${fill(pick(C.moonPhase, l), { p: pick(PHASES[sky.moon.phase], l), i: Math.round(sky.moon.illumination * 100), age: fmt1(sky.moon.ageDays) })}`,
      moonPosLine: describeBody(sky.moon.alt, sky.moon.az, l),
      footer: "oiyo.net/birth-sky",
    });
    setCard(url);
    gaEvent("share_click", { test_id: TOOL_ID, share_surface: "card" });
  };

  const shareCard = async () => {
    if (!card) return;
    try {
      const blob = await (await fetch(card)).blob();
      const file = new File([blob], "oiyo-birth-sky.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: pick(C.cardTitle, l) });
        gaEvent("share_click", { test_id: TOOL_ID, share_surface: "native" });
      }
    } catch {
      /* user cancelled */
    }
  };

  const copyLink = async () => {
    if (!submitted) return;
    const url = new URL(window.location.href);
    url.search = formatBirthSkyQuery({ date: submitted.date, time: submitted.time, place: submitted.placeId });
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      gaEvent("share_click", { test_id: TOOL_ID, share_surface: "copy" });
    } catch {
      setCopied(false);
    }
  };

  const hidden = sky && ((view === "moon" && sky.moon.alt < -0.5) || (view === "sun" && sky.sun.alt < -0.833));
  const labels = { you: pick(C.you, l), moon: pick(C.moonTitle, l), sun: pick(C.toSun, l) };
  const inputClass = "min-h-11 w-full rounded-lg border border-border bg-card px-3 py-2 text-base text-foreground";

  return (
    <div className="space-y-6">
      <form
        className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="grid gap-1 text-sm font-semibold text-foreground">
          {pick(C.date, l)}
          <input className={inputClass} type="date" min="1800-01-01" max="2200-12-31" required value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="grid gap-1 text-sm font-semibold text-foreground">
          <label className="grid gap-1">
            {pick(C.time, l)}
            <input className={inputClass} type="time" disabled={unknownTime} value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-xs font-normal text-muted-foreground">
            <input type="checkbox" className="size-5" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} />
            {pick(C.unknown, l)}
          </label>
        </div>
        <label className="grid content-start gap-1 text-sm font-semibold text-foreground">
          {pick(C.place, l)}
          <select className={inputClass} value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
            {PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label[l]}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="lg" className="w-full sm:col-span-3" disabled={!date}>
          {pick(C.go, l)}
        </Button>
      </form>

      {result && result.status !== "ok" && (
        <p role="alert" className="rounded-2xl border border-destructive bg-card p-4 text-sm text-foreground">
          {pick(result.status === "nonexistent" ? C.nonexistent : C.invalid, l)}
        </p>
      )}

      {sky && (
        <div ref={resultRef} className="scroll-mt-4 space-y-5" aria-live="polite">
          <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-md">
            <div className="px-5 pt-4">
              <p className="text-sm font-bold text-muted-foreground">{kicker}</p>
              {sky.ambiguous && <p className="mt-1 text-xs text-muted-foreground">{pick(C.ambiguous, l)}</p>}
            </div>
            <div className="relative mt-3 aspect-square w-full sm:aspect-video" role="img" aria-label={pick(C.sceneLabel, l)}>
              {webgl === false ? (
                <p className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">{pick(C.noWebgl, l)}</p>
              ) : webgl ? (
                <SceneBoundary fallback={<p className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">{pick(C.noWebgl, l)}</p>}>
                  <Suspense fallback={<p className="flex h-full items-center justify-center text-sm text-muted-foreground">{pick(C.loading, l)}</p>}>
                    <Scene
                      sky={sky}
                      lat={place.lat}
                      lon={place.lon}
                      view={view}
                      labels={labels}
                      onCanvas={(c) => {
                        canvasRef.current = c;
                      }}
                    />
                  </Suspense>
                </SceneBoundary>
              ) : null}
              {hidden && (
                <p className="absolute inset-x-3 bottom-3 rounded-xl bg-background/85 p-3 text-xs leading-relaxed text-foreground">{pick(C.belowNote, l)}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 p-3" role="tablist">
              {(["space", "moon", "sun"] as const).map((v) => (
                <Button key={v} role="tab" aria-selected={view === v} variant={view === v ? "default" : "outline"} size="sm" className="w-full whitespace-normal" onClick={() => setView(v)}>
                  {pick(v === "space" ? C.viewSpace : v === "moon" ? C.viewMoon : C.viewSun, l)}
                </Button>
              ))}
            </div>
            <p className="px-5 pb-4 text-xs leading-relaxed text-muted-foreground">{pick(C.sceneHint, l)}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-bold text-muted-foreground">☀️ {pick(C.sunTitle, l)}</h2>
              <p className="mt-2 text-lg font-black text-foreground">{describeBody(sky.sun.alt, sky.sun.az, l)}</p>
              <p className="mt-1 text-sm text-foreground">{pick(C[sky.daylight], l)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{fill(pick(C.term, l), { t: TERMS[l][sky.termIndex]!, lon: fmt1(sky.sun.eclLon) })}</p>
              <p className="text-sm text-muted-foreground">{fill(pick(C.sign, l), { s: signName(sky.signIndex, l) })}</p>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-bold text-muted-foreground">{PHASE_EMOJI[sky.moon.phase]} {pick(C.moonTitle, l)}</h2>
              <p className="mt-2 text-lg font-black text-foreground">{pick(PHASES[sky.moon.phase], l)}</p>
              <p className="mt-1 text-sm text-foreground">{describeBody(sky.moon.alt, sky.moon.az, l)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {fill(pick(C.moonPhase, l), { p: pick(PHASES[sky.moon.phase], l), i: Math.round(sky.moon.illumination * 100), age: fmt1(sky.moon.ageDays) })}
              </p>
              <p className="text-sm text-muted-foreground">{fill(pick(C.moonDist, l), { km: Math.round(sky.moon.distanceKm).toLocaleString(l === "zh" ? "zh-CN" : l) })}</p>
              <p className="text-sm text-muted-foreground">{fill(pick(C.moonSign, l), { s: signName(Math.floor((((sky.moon.eclLon % 360) + 360) % 360) / 30), l) })}</p>
            </section>
          </div>

          <Horizon sky={sky} l={l} title={pick(C.horizonTitle, l)} />

          <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Button size="lg" className="w-full" onClick={makeCard}>
              {pick(C.share, l)}
            </Button>
            {card && (
              <div className="space-y-3">
                <img src={card} alt={pick(C.cardTitle, l)} className="mx-auto w-full max-w-sm rounded-2xl border border-border" />
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <a href={card} download="oiyo-birth-sky.png">
                      {pick(C.saveImage, l)}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={shareCard}>
                    {pick(C.shareImage, l)}
                  </Button>
                </div>
              </div>
            )}
            {submitted && (
              <>
                <Button variant="outline" className="w-full" onClick={copyLink}>
                  {pick(copied ? C.copied : C.copyLink, l)}
                </Button>
                <p className="text-xs text-muted-foreground">{pick(C.linkNote, l)}</p>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold text-foreground">☯️ {pick(C.sajuTitle, l)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{fill(pick(C.saju, l), { t: TERMS[l][sky.termIndex]! })}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button asChild className="w-full">
                <a href={`/${locale}/saju/calculator/`}>{pick(C.sajuCta, l)}</a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href={`/${locale}/natal/chart/`}>{pick(C.natalCta, l)}</a>
              </Button>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">{pick(C.credit, l)}</p>
        </div>
      )}
    </div>
  );
}
