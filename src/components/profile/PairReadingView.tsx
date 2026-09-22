"use client";

/**
 * 두 사람 보기 — 우리의 지도에서 고른 두 사람을 한 장에서 깊이 읽는다.
 *
 * 왜 따로 한 장인가: 우리의 지도에는 이미 그림 무대가 다섯이다. 쌍성·무늬·
 * 달력·아홉 관점 전문을 더 얹으면 휴대폰에서 스크롤이 무거워지고 읽을
 * 것이 묻힌다. 두 사람을 고르면 이 장으로 넘어오고, 돌아가는 길은 늘 위에
 * 있다. 사람 정보는 주소창에 싣지 않는다 — 주소에는 이 브라우저 원 안의
 * 번호(id)만 있고, 좌표는 이 브라우저 저장소에서 읽는다.
 *
 * 순서는 PRD 의 층을 따른다: 이름(C1)과 쌍성(C5) → 세 장면(C2) → 둘의
 * 달력(C4) → 아홉 관점 → 근거 줄(C3) → 둘의 무늬(C6) → 한계(L4).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";
import { SIGN_INFO } from "@/lib/ontology/natal/signs";
import { ELEMENT_SYMBOLS } from "@/lib/talisman/symbols";
import { BRANCHES } from "@/manifest/data/saju/branches";
import { STEMS } from "@/manifest/data/saju/stems";
import { loadCircleDraft } from "@/lib/symbolic-tradition/circle-draft";
import type { SymbolicGroupParticipant } from "@/lib/symbolic-tradition/group-snapshot";
import { signatureOrbit } from "@/lib/symbolic-tradition/group-flow";
import { LENS_NAME } from "@/lib/symbolic-tradition/lens-names";
import { PAIR_COPY } from "@/lib/symbolic-tradition/pair-copy";
import { fill, PAIR_COPY_FULL, PAIR_NAME, type PairLang } from "@/lib/symbolic-tradition/pair-reading-copy";
import { readPair, type Evidence, type PairReading } from "@/lib/symbolic-tradition/pair-reading";
import { celticTreeName, egyptianDeityName, hexagramHan, hexagramMeaningKo, hexagramName, mayanSealName, mayanToneName } from "@/lib/symbolic-tradition/symbol-names";

import BinaryStar from "./BinaryStar";
import SignatureCard from "./SignatureCard";

const EL_COLOR: Record<string, string> = {
  wood: "#3f7a53", fire: "#b4452f", earth: "#8a6c3d", metal: "#6f7780", water: "#2f4f6f",
};

function localCivilDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function weekdayHeads(lang: PairLang): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    try {
      return new Intl.DateTimeFormat(lang, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i)));
    } catch {
      return "";
    }
  });
}

export default function PairReadingView({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as PairLang;
  const t = PAIR_COPY_FULL[lang];
  const [people, setPeople] = useState<SymbolicGroupParticipant[] | null>(null);
  const [ids, setIds] = useState<{ a: string; b: string } | null>(null);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    let list: SymbolicGroupParticipant[] = [];
    try {
      list = loadCircleDraft(window.localStorage)?.participants ?? [];
    } catch {
      list = [];
    }
    setPeople(list);
    setToday(localCivilDate());
    const params = new URL(window.location.href).searchParams;
    const a = params.get("a");
    const b = params.get("b");
    if (a && b && a !== b && list.some((p) => p.id === a) && list.some((p) => p.id === b)) setIds({ a, b });
    else if (list.length === 2) setIds({ a: list[0].id, b: list[1].id });
  }, []);

  const choose = (next: { a: string; b: string }) => {
    setIds(next);
    const url = new URL(window.location.href);
    url.searchParams.set("a", next.a);
    url.searchParams.set("b", next.b);
    window.history.replaceState(null, "", url);
  };

  const reading = useMemo<PairReading | null>(() => {
    if (!people || !ids || !today) return null;
    const A = people.find((p) => p.id === ids.a);
    const B = people.find((p) => p.id === ids.b);
    return A && B ? readPair(A, B, today) : null;
  }, [people, ids, today]);

  const back = <a href={`/${locale}/circle/`} className="text-sm font-bold text-primary-strong underline-offset-4 hover:underline">← {t.back}</a>;

  if (!people) return <div className="min-h-[60vh]" />;

  if (people.length < 2) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">{t.notFound}</p>
        <p className="mt-6">{back}</p>
      </div>
    );
  }

  const picker = (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm">
      <span className="font-bold text-muted-foreground">{t.pick}</span>
      {(["a", "b"] as const).map((slot) => (
        <select
          key={slot}
          id={`pair-${slot}`}
          aria-label={slot.toUpperCase()}
          value={ids?.[slot] ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const other = slot === "a" ? ids?.b : ids?.a;
            const fallback = people.find((p) => p.id !== value)?.id ?? "";
            choose(slot === "a" ? { a: value, b: other && other !== value ? other : fallback } : { a: other && other !== value ? other : fallback, b: value });
          }}
          className="min-h-10 rounded-xl border border-border bg-surface-subtle px-3 font-bold text-foreground"
        >
          <option value="" disabled>—</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      ))}
    </div>
  );

  if (!reading) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        {back}
        <h1 className="mt-4 text-3xl font-black text-foreground">{t.pageTitle}</h1>
        {picker}
      </div>
    );
  }

  const name = (id: string) => (id === reading.a.id ? reading.a.label : reading.b.label);
  const el = (e: FiveElement) => ELEMENT_SYMBOLS[e].name[lang] ?? ELEMENT_SYMBOLS[e].name.en;
  const hanja = (id: string, kind: "stem" | "branch") =>
    kind === "stem" ? STEMS[id as keyof typeof STEMS]?.short.zh ?? id : BRANCHES[id as keyof typeof BRANCHES]?.short.zh ?? id;
  const sign = (s: string) => SIGN_INFO[s as keyof typeof SIGN_INFO]?.name[lang] ?? s;
  const { talk, decide, recover } = reading.scenes;
  const giverIsA = decide.key === "generating" ? decide.giver === reading.a.id : decide.key === "controlling" ? decide.checker === reading.a.id : true;
  const orbitCaption = fill(t.orbitCaption[reading.relation], {
    giver: decide.key === "generating" ? name(decide.giver) : "",
    receiver: decide.key === "generating" ? name(decide.receiver) : "",
  });

  const talkText = talk.key === "contrast"
    ? fill(t.talk.contrast, { fast: name(talk.fast), slow: name(talk.slow) })
    : t.talk[talk.key];
  const decideText = decide.key === "generating"
    ? fill(t.decide.generating, { giver: name(decide.giver), receiver: name(decide.receiver) })
    : decide.key === "controlling"
      ? fill(t.decide.controlling, { checker: name(decide.checker), checked: name(decide.checked) })
      : t.decide[decide.key];
  const recoverText = recover.key === "full"
    ? t.recover.full
    : fill(t.recover[recover.key], {
      element: el(recover.element),
      job: t.elementJob[recover.element],
      holder: recover.key === "only" ? name(recover.holder) : "",
    });

  const cal = reading.calendar;
  const leading = (new Date(`${cal.days[0].date}T00:00:00Z`).getUTCDay() || 7) - 1;
  const calLine = cal.alternating ? t.alternating : cal.both.length ? fill(t.both, { n: String(cal.both.length) }) : t.mixed;

  const evRow = (e: Evidence, i: number) => {
    let label = "";
    let value: ReactNode = "";
    let tone: "bond" | "friction" | "mixed" | null = null;
    if (e.kind === "stem") {
      label = t.ev.dayStem;
      value = <><span className="font-black">{hanja(e.a, "stem")} – {hanja(e.b, "stem")}</span> {t.ev.stemRelation[e.relation]}</>;
      tone = e.relation === "combining" || e.relation === "generating" ? "bond" : e.relation === "controlling" ? "friction" : null;
    } else if (e.kind === "branch") {
      label = t.ev.pillarBranch[e.pillar];
      const rel = e.relations.length ? e.relations.map((r) => t.ev.branchRelation[r]).join(" · ") : t.ev.noBranchRelation;
      value = <><span className="font-black">{hanja(e.a, "branch")} – {hanja(e.b, "branch")}</span> {rel}</>;
      const bond = e.relations.includes("six-harmony");
      const friction = e.relations.some((r) => r !== "six-harmony");
      tone = bond && friction ? "mixed" : bond ? "bond" : friction ? "friction" : null;
    } else if (e.kind === "yinyang") {
      label = t.ev.yinyang;
      value = `${reading.a.label}: ${fill(t.ev.yinyangValue, { yang: String(e.a.yang), yin: String(e.a.yin) })}  /  ${reading.b.label}: ${fill(t.ev.yinyangValue, { yang: String(e.b.yang), yin: String(e.b.yin) })}`;
    } else if (e.kind === "elements-only") {
      label = fill(t.ev.only, { name: name(e.holder) });
      value = e.elements.map(el).join(" · ");
    } else if (e.kind === "elements-neither") {
      label = t.ev.neither;
      value = e.elements.map(el).join(" · ");
    } else if (e.kind === "moon") {
      label = t.ev.moon;
      value = e.a.length === 1 && e.b.length === 1 && e.shared.length === 1
        ? fill(t.ev.moonShared, { sign: sign(e.shared[0]) })
        : `${reading.a.label}: ${e.a.map(sign).join(t.ev.moonOr)} · ${reading.b.label}: ${e.b.map(sign).join(t.ev.moonOr)}`;
      if (e.shared.length && e.a.length === 1 && e.b.length === 1) tone = "bond";
    } else if (e.kind === "sun") {
      label = t.ev.sun;
      value = e.aspect ? fill(t.ev.sunAspect, { deg: String(e.separation), aspect: t.ev.aspect[e.aspect] }) : fill(t.ev.sunNone, { deg: String(e.separation) });
      tone = e.aspect === "trine" || e.aspect === "sextile" ? "bond" : e.aspect === "square" || e.aspect === "opposition" ? "friction" : null;
    } else if (e.kind === "mayan") {
      label = t.ev.mayan;
      // 드림스펠 인장 이름으로 — 예전에는 색 계열과 음조 숫자만 보였다.
      const kin = (seal: number, toneNo: number) => `${mayanSealName(seal, lang)} · ${mayanToneName(toneNo, lang)}`;
      const rel = e.sameColor && e.sameTone
        ? fill(t.ev.mayanSame, { tone: String(e.aTone) })
        : fill(e.sameColor ? t.ev.mayanColor : t.ev.mayanOther, { a: String(e.aTone), b: String(e.bTone) });
      value = <>{reading.a.label}: {kin(e.aSeal, e.aTone)}<br />{reading.b.label}: {kin(e.bSeal, e.bTone)}<br /><span className="text-muted-foreground">{rel}</span></>;
      if (e.sameColor && e.sameTone) tone = "bond";
    } else if (e.kind === "celtic") {
      label = t.ev.celtic;
      value = <>{celticTreeName(e.a, lang)} · {celticTreeName(e.b, lang)} <span className="text-muted-foreground">— {t.ev.celticRelation[e.relation as keyof typeof t.ev.celticRelation] ?? e.relation}</span></>;
      if (e.relation === "same-tree") tone = "bond";
    } else if (e.kind === "hexagram") {
      label = t.ev.hexagram;
      // 중국어 괘 이름은 이미 한자(简体)라 번체 약칭을 앞에 붙이지 않는다 — 復 地雷复 처럼 섞였다.
      const han = (n: number) => (lang === "zh" ? "" : `${hexagramHan(n)} `);
      const one = (h: typeof e.a) => h
        ? <>{han(h.number)}{hexagramName(h.number, lang)}{lang === "ko" ? ` · ${hexagramMeaningKo(h.number)}` : ""} <span className="text-muted-foreground">({t.ev.hexChanged} {han(h.changed)}{hexagramName(h.changed, lang)})</span></>
        : <span className="text-muted-foreground">{t.ev.hexNone}</span>;
      value = <>{reading.a.label}: {one(e.a)}<br />{reading.b.label}: {one(e.b)}</>;
      if (e.a && e.b && e.a.number === e.b.number) tone = "bond";
    } else if (e.kind === "egyptian") {
      label = t.ev.egyptian;
      value = e.a === e.b
        ? <>{egyptianDeityName(e.a, lang)} <span className="text-muted-foreground">— {t.ev.egyptianSame}</span></>
        : <>{reading.a.label}: {egyptianDeityName(e.a, lang)} · {reading.b.label}: {egyptianDeityName(e.b, lang)}</>;
      if (e.a === e.b) tone = "bond";
    }
    const dot = tone === "bond" ? "bg-emerald-600" : tone === "friction" ? "bg-orange-600" : tone === "mixed" ? "bg-amber-500" : "bg-border";
    return (
      <li key={`${e.kind}-${i}`} className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-border py-2.5 text-sm last:border-b-0 sm:grid-cols-[9rem_1fr]">
        <span className="font-bold text-muted-foreground">{label}</span>
        <span className="flex items-start gap-2 text-foreground">
          <span aria-hidden="true" className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${dot}`} />
          <span>{value}</span>
        </span>
      </li>
    );
  };

  const limitLines = [
    t.limitBase,
    ...(reading.limits.noHour.length || reading.limits.moonAmbiguous.length || reading.limits.noAstro.length ? [] : [t.limitFull]),
    ...(reading.limits.noHour.length ? [fill(t.limitNoHour, { names: reading.limits.noHour.map(name).join(t.listJoin) })] : []),
    ...(reading.limits.moonAmbiguous.length ? [fill(t.limitMoon, { names: reading.limits.moonAmbiguous.map(name).join(t.listJoin) })] : []),
    ...(reading.limits.noAstro.length ? [fill(t.limitNoAstro, { names: reading.limits.noAstro.map(name).join(t.listJoin) })] : []),
  ];

  const section = "mt-8 rounded-[2rem] border border-border bg-card p-4 sm:p-7";
  const A = people.find((p) => p.id === reading.a.id)!;
  const B = people.find((p) => p.id === reading.b.id)!;

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {back}
      <p className="mt-6 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t.pageTitle}</p>
      {people.length > 2 && picker}

      {/* C1 이름 + C5 쌍성 */}
      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {[reading.a, reading.b].map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-black text-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EL_COLOR[p.element] }} />
              {p.label} · {hanja(p.stem, "stem")} {el(p.element)}
            </span>
          ))}
        </div>
        <h1 className="mt-3 text-balance text-3xl font-black leading-tight text-foreground sm:text-4xl">{PAIR_NAME[lang][reading.nameKey]}</h1>
        <p className="mt-3 text-base leading-relaxed text-foreground">{t.relation[reading.relation]}</p>
        {reading.nameSignal !== "none" && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.signal[reading.nameSignal]}</p>}
      </header>
      <div className="mt-6">
        <BinaryStar
          relation={reading.relation}
          a={{ label: reading.a.label, element: reading.a.element }}
          b={{ label: reading.b.label, element: reading.b.element }}
          giverIsA={giverIsA}
          caption={orbitCaption}
        />
      </div>

      {/* C2 장면 */}
      <section className={section}>
        <h2 className="text-lg font-black text-foreground">{t.scenesTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {([["talk", talkText], ["decide", decideText], ["recover", recoverText]] as const).map(([k, text]) => (
            <article key={k} className="rounded-2xl bg-muted/40 p-4">
              <p className="text-[11px] font-bold text-muted-foreground">{t.sceneTitle[k]}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* C4 둘의 달력 */}
      <section className={section}>
        <h2 className="text-lg font-black text-foreground">{t.calendarTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.calendarLead}</p>
        <div className="mt-4 grid max-w-md grid-cols-7 gap-1">
          {weekdayHeads(lang).map((h, i) => <span key={`h${i}`} className="text-center text-[10px] font-bold text-muted-foreground">{h}</span>)}
          {Array.from({ length: leading }, (_, i) => <span key={`b${i}`} />)}
          {cal.days.map((d) => {
            const aOn = d.a === "support";
            const bOn = d.b === "support";
            const bg = aOn && bOn ? "linear-gradient(135deg, var(--a) 50%, var(--b) 50%)" : aOn ? "var(--a)" : bOn ? "var(--b)" : undefined;
            return (
              <span
                key={d.date}
                title={d.date}
                className={`flex aspect-square items-center justify-center rounded-lg text-[11px] font-black tabular-nums ${aOn || bOn ? "text-white" : "border border-border text-muted-foreground"} ${d.date === today ? "ring-2 ring-foreground" : ""}`}
                style={{ background: bg, ["--a" as string]: EL_COLOR[reading.a.element], ["--b" as string]: EL_COLOR[reading.b.element] }}
              >
                {Number(d.date.slice(8))}
              </span>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {[reading.a, reading.b].map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: EL_COLOR[p.element] }} />{fill(t.calA, { name: p.label })}</span>
          ))}
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: `linear-gradient(135deg, ${EL_COLOR[reading.a.element]} 50%, ${EL_COLOR[reading.b.element]} 50%)` }} />{t.calBoth}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{calLine}</p>
      </section>

      {/* 아홉 관점 전부 */}
      <section className={section}>
        <h2 className="text-lg font-black text-foreground">{t.lensesTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.lensesLead}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {reading.lenses.map((l) => {
            const copy = PAIR_COPY[lang][`${l.id}:${l.relation}`];
            if (!copy) return null;
            return (
              <article key={l.id} className="rounded-2xl border border-border p-4">
                <p className="text-[11px] font-bold text-muted-foreground">{LENS_NAME[lang][l.id]}</p>
                <h3 className="mt-1 font-black text-foreground">{copy.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground"><span className="font-bold">{t.help}.</span> {copy.help}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground"><span className="font-bold">{t.care}.</span> {copy.care}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground"><span className="font-bold">{t.ask}.</span> {copy.ask}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* C3 근거 줄 */}
      <section className={section}>
        <h2 className="text-lg font-black text-foreground">{t.evidenceTitle}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{t.evidenceLead}</p>
        <ul className="mt-3">{reading.evidence.map(evRow)}</ul>
      </section>

      {/* C6 둘의 무늬 */}
      <SignatureCard
        people={[A, B].map((p) => ({ id: p.id, label: p.label, element: (STEMS[p.profile.saju.day.heavenlyStem].element as FiveElement), orbit: signatureOrbit(p.profile) }))}
        title={PAIR_NAME[lang][reading.nameKey]}
        copy={{ heading: t.patternTitle, lead: t.patternLead, save: saveLabel(lang), saved: savedLabel(lang), brand: `OIYO · ${t.pageTitle}` }}
      />

      {/* L4 한계 */}
      <section className="mt-8 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-amber-950">
        <h2 className="text-sm font-black">{t.limitsTitle}</h2>
        <ul className="mt-2 space-y-1 text-sm leading-relaxed">
          {limitLines.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      <p className="mt-8 text-center">{back}</p>
    </div>
  );
}

const SAVE: Record<PairLang, [string, string]> = {
  ko: ["이미지로 저장", "이미지를 저장했어요"],
  en: ["Save as image", "Image saved"],
  ja: ["画像で保存", "画像を保存しました"],
  zh: ["保存为图片", "图片已保存"],
  fr: ["Enregistrer l’image", "Image enregistrée"],
  es: ["Guardar imagen", "Imagen guardada"],
};
const saveLabel = (lang: PairLang) => SAVE[lang][0];
const savedLabel = (lang: PairLang) => SAVE[lang][1];
