"use client";

import { Network, Plus, Share2, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CITIES } from "@/lib/ontology/natal/signs";
import { comparisonFromCivil } from "@/lib/symbolic-tradition/circle-input";
import {
  allPairEdges,
  createSymbolicGroupSnapshot,
  decodeSymbolicGroupSnapshot,
  starEdges,
  symbolicGroupFragment,
  type SymbolicGroupParticipant,
} from "@/lib/symbolic-tradition/group-snapshot";
import { readSymbolicShareFragment } from "@/lib/symbolic-tradition/share-artifact";
import { readEncryptedShortShare } from "@/lib/symbolic-tradition/short-share";
import CompatibilityOrbit from "@/components/profile/CompatibilityOrbit";
import { scoreAgainstCenter } from "@/lib/symbolic-tradition/orbit-layout";
import { gaEvent } from "@/lib/analytics/ga-event";
import { PAIR_COPY } from "@/lib/symbolic-tradition/pair-copy";
import type { CompatibilityLensId, SymbolicComparisonProfile } from "@/lib/symbolic-tradition";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY = {
  ko: {
    title: "우리 원",
    sub: "2명부터 10명까지. 생년월일을 적거나 친구 링크를 넣으면 이 브라우저에서만 원이 그려집니다.",
    me: "나",
    friend: "친구",
    alias: "별칭",
    date: "생년월일",
    time: "시각 · 모르면 비움",
    city: "도시 · 모르면 비움",
    add: "원에 넣기",
    link: "또는 친구 공유 링크",
    need: "원이 그려지려면 2명이 필요합니다.",
    star: "나 중심",
    all: "전체 연결",
    share: "이 원 공유",
    copied: "원 링크를 복사했어요",
    pair: "이 둘",
    help: "서로 돕는 점",
    care: "조심할 점",
    ask: "오늘 물어볼 것",
    noTotal: "모임 총점·순위 없음",
    disclaimer: "전통 상징을 대화 소재로 보는 놀이입니다. 관계의 성공을 예측하지 않습니다.",
    error: "날짜를 확인해 주세요.",
  },
  en: {
    title: "Our circle",
    sub: "Two to ten people. Add a birth date or a friend link. The circle stays in this browser.",
    me: "You",
    friend: "Friend",
    alias: "Nickname",
    date: "Birth date",
    time: "Time · leave blank if unknown",
    city: "City · leave blank if unknown",
    add: "Add to the circle",
    link: "Or a friend share link",
    need: "The circle needs 2 people to draw.",
    star: "Centered on you",
    all: "All links",
    share: "Share this circle",
    copied: "Circle link copied",
    pair: "These two",
    help: "How they help",
    care: "Watch for",
    ask: "Ask today",
    noTotal: "No group total or ranking",
    disclaimer: "A playful reading of traditional symbols. It does not predict a relationship.",
    error: "Check the date.",
  },
  ja: {
    title: "みんなの円",
    sub: "2人から10人まで。生年月日を入れるか友だちのリンクを貼ると、このブラウザの中だけで円が描かれます。",
    me: "わたし",
    friend: "友だち",
    alias: "ニックネーム",
    date: "生年月日",
    time: "時刻 · わからなければ空欄",
    city: "都市 · わからなければ空欄",
    add: "円に入れる",
    link: "または友だちの共有リンク",
    need: "円を描くには2人が必要です。",
    star: "わたし中心",
    all: "すべてのつながり",
    share: "この円を共有",
    copied: "円のリンクをコピーしました",
    pair: "この二人",
    help: "支え合えるところ",
    care: "気をつけるところ",
    ask: "今日たずねてみること",
    noTotal: "総合点・順位はありません",
    disclaimer: "伝統的な象徴を話のきっかけとして楽しむものです。関係の成否を予測するものではありません。",
    error: "日付を確認してください。",
  },
  zh: {
    title: "我们的圆",
    sub: "两人到十人。填写出生日期或粘贴朋友的链接，圆只会画在这个浏览器里。",
    me: "我",
    friend: "朋友",
    alias: "昵称",
    date: "出生日期",
    time: "时间 · 不清楚可留空",
    city: "城市 · 不清楚可留空",
    add: "加入圆中",
    link: "或朋友的分享链接",
    need: "要画出圆需要两个人。",
    star: "以我为中心",
    all: "全部连线",
    share: "分享这个圆",
    copied: "已复制圆的链接",
    pair: "这两位",
    help: "彼此帮得上的地方",
    care: "需要留意的地方",
    ask: "今天可以问问看",
    noTotal: "没有总分与排名",
    disclaimer: "这是把传统象征当作聊天话题的玩法，并不预测关系的成败。",
    error: "请检查日期。",
  },
  fr: {
    title: "Notre cercle",
    sub: "De deux à dix personnes. Saisissez une date de naissance ou collez le lien d'un ami : le cercle reste dans ce navigateur.",
    me: "Moi",
    friend: "Ami",
    alias: "Surnom",
    date: "Date de naissance",
    time: "Heure · laissez vide si inconnue",
    city: "Ville · laissez vide si inconnue",
    add: "Ajouter au cercle",
    link: "Ou le lien partagé d'un ami",
    need: "Il faut deux personnes pour tracer le cercle.",
    star: "Centré sur moi",
    all: "Tous les liens",
    share: "Partager ce cercle",
    copied: "Lien du cercle copié",
    pair: "Ces deux-là",
    help: "Ce qu'ils s'apportent",
    care: "À surveiller",
    ask: "À demander aujourd'hui",
    noTotal: "Ni total ni classement",
    disclaimer: "Une lecture ludique de symboles traditionnels. Elle ne prédit pas une relation.",
    error: "Vérifiez la date.",
  },
  es: {
    title: "Nuestro círculo",
    sub: "De dos a diez personas. Escribe una fecha de nacimiento o pega el enlace de una amistad: el círculo se queda en este navegador.",
    me: "Yo",
    friend: "Amistad",
    alias: "Apodo",
    date: "Fecha de nacimiento",
    time: "Hora · déjalo vacío si no la sabes",
    city: "Ciudad · déjalo vacío si no la sabes",
    add: "Añadir al círculo",
    link: "O el enlace compartido de una amistad",
    need: "Hacen falta dos personas para dibujar el círculo.",
    star: "Centrado en mí",
    all: "Todas las conexiones",
    share: "Compartir este círculo",
    copied: "Enlace del círculo copiado",
    pair: "Estas dos",
    help: "En qué se apoyan",
    care: "Qué vigilar",
    ask: "Qué preguntar hoy",
    noTotal: "Sin total ni clasificación",
    disclaimer: "Una lectura lúdica de símbolos tradicionales. No predice una relación.",
    error: "Revisa la fecha.",
  },
} as const;

const FALLBACK = COPY.en;

const LENS: Record<Lang, Record<CompatibilityLensId, string>> = {
  ko: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁", "element-complement": "채움" },
  en: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiac", "sun-sign": "Sun sign", "element-complement": "Filling in" },
  ja: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座", "element-complement": "補い" },
  zh: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座", "element-complement": "互补" },
  fr: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque", "sun-sign": "Signe", "element-complement": "Complément" },
  es: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco", "sun-sign": "Signo", "element-complement": "Complemento" },
};


function person(label: string, profile: SymbolicComparisonProfile): SymbolicGroupParticipant {
  return { id: `p-${Math.random().toString(36).slice(2, 8)}`, label: label.trim().slice(0, 24) || "?", profile };
}

export default function CircleGathering({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  // 2026-09-04: `lang === "ko" ? COPY.ko : FALLBACK` 이었다. COPY 에 ko·en 만
  // 있던 시절의 분기라, ja·zh·fr·es 를 채워도 영어가 나갔다. 이제 로케일을
  // 그대로 찾고, 없는 것만 영어로 떨군다.
  const copy = COPY[lang] ?? FALLBACK;
  const [people, setPeople] = useState<SymbolicGroupParticipant[]>([]);
  const [centerId, setCenterId] = useState("");
  const [lens, setLens] = useState<CompatibilityLensId>("five-elements");
  const [view, setView] = useState<"all" | "star">("star");
  const [alias, setAlias] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityId, setCityId] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<null | { from: string; to: string }>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const hash = window.location.hash;
      const group = new URLSearchParams(hash.replace(/^#/, "")).get("group");
      if (group) {
        const snapshot = decodeSymbolicGroupSnapshot(group);
        if (snapshot) {
          setPeople(snapshot.participants);
          setCenterId(snapshot.centerId);
          return;
        }
      }
      const direct = readSymbolicShareFragment(hash);
      let profile: SymbolicComparisonProfile | null = direct?.ok ? direct.artifact.profile : null;
      if (!profile) {
        const share = new URL(window.location.href).searchParams.get("share");
        if (share) {
          const encrypted = await readEncryptedShortShare(share, hash);
          if (encrypted.ok) profile = encrypted.artifact.profile;
        }
      }
      if (profile) setPeople([person(copy.friend, profile)]);
    };
    void boot();
  }, [copy.friend]);

  const snapshot = useMemo(
    () => (people.length >= 2 ? createSymbolicGroupSnapshot(people, { centerId: centerId || people[0]?.id }) : null),
    [centerId, people],
  );
  const edges = snapshot ? (view === "star" ? starEdges(snapshot, lens) : allPairEdges(snapshot, lens)) : [];

  const addByDate = () => {
    try {
      const profile = comparisonFromCivil({ cityId: cityId || undefined, date, time: time || undefined });
      const next = person(alias || copy.friend, profile);
      setPeople((current) => {
        if (current.length >= 10) return current;
        const list = [...current, next];
        if (!centerId) setCenterId(next.id);
        return list;
      });
      setAlias("");
      setDate("");
      setTime("");
      setError("");
    } catch {
      setError(copy.error);
    }
  };

  const addByLink = async () => {
    try {
      const url = new URL(link);
      const direct = readSymbolicShareFragment(url.hash);
      let profile: SymbolicComparisonProfile | null = direct?.ok ? direct.artifact.profile : null;
      if (!profile) {
        const id = url.searchParams.get("share") ?? url.pathname.match(/\/c\/([A-Za-z0-9_-]{22})/)?.[1];
        if (id) {
          const encrypted = await readEncryptedShortShare(id, url.hash);
          if (encrypted.ok) profile = encrypted.artifact.profile;
        }
      }
      if (!profile) throw new Error("bad");
      const next = person(alias || copy.friend, profile);
      setPeople((current) => (current.length >= 10 ? current : [...current, next]));
      setAlias("");
      setLink("");
      setError("");
    } catch {
      setError(copy.error);
    }
  };

  const share = async () => {
    gaEvent("circle_share", { people: String(people.length) });
    if (!snapshot) return;
    const url = `${window.location.origin}/${locale}/profile/circle/${symbolicGroupFragment(snapshot)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: copy.title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const positions = people.map((item) => {
    if (item.id === (centerId || people[0]?.id)) return { id: item.id, x: 50, y: 50 };
    const others = people.filter((row) => row.id !== (centerId || people[0]?.id));
    const angle = (Math.PI * 2 * others.findIndex((row) => row.id === item.id)) / Math.max(others.length, 1) - Math.PI / 2;
    return { id: item.id, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
  });
  const at = (id: string) => positions.find((item) => item.id === id) ?? { id, x: 50, y: 50 };
  const pickedEdge = picked && snapshot
    ? snapshot.edges.find((edge) => edge.lens === lens && ((edge.from === picked.from && edge.to === picked.to) || (edge.from === picked.to && edge.to === picked.from)))
    : null;
  const pairCopy = pickedEdge
    ? PAIR_COPY[lang][`${pickedEdge.lens}:${pickedEdge.relation}`] ?? PAIR_COPY[lang]["sun-sign:distinct"]
    : null;

  const field = "h-12 w-full rounded-2xl border border-border bg-surface-subtle px-4 text-base font-semibold text-foreground";

  return <main>
    <header className="text-center">
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.sub}</p>
    </header>

    {snapshot && <section className="mt-8 rounded-[2rem] border border-border bg-[var(--surface-subtle)] p-4 sm:p-7">
      <div className="flex gap-2 overflow-x-auto pb-1">{(Object.keys(LENS[lang]) as CompatibilityLensId[]).map((id) => (
        <button key={id} type="button" onClick={() => { setLens(id); gaEvent("circle_lens_select", { lens: id }); }} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black ${lens === id ? "bg-primary-strong text-white" : "border border-border bg-card text-foreground"}`}>{LENS[lang][id]}</button>
      ))}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setView("star")} className={`min-h-11 rounded-xl text-xs font-black ${view === "star" ? "bg-accent text-foreground" : "bg-card text-muted-foreground"}`}><Star className="mr-1 inline h-4 w-4" />{copy.star}</button>
        <button type="button" onClick={() => setView("all")} className={`min-h-11 rounded-xl text-xs font-black ${view === "all" ? "bg-accent text-foreground" : "bg-card text-muted-foreground"}`}><Network className="mr-1 inline h-4 w-4" />{copy.all}</button>
      </div>
      <div className="mt-4 aspect-square max-h-[32rem] w-full overflow-hidden rounded-3xl border border-border bg-card">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {edges.map((edge) => {
            const from = at(edge.from);
            const to = at(edge.to);
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--primary)" strokeOpacity={0.45 + (edge.harmonyIndex / 100) * 0.55} strokeWidth={0.35 + (edge.harmonyIndex / 100) * 1.15} className="cursor-pointer" onClick={() => { setPicked({ from: edge.from, to: edge.to }); gaEvent("circle_pair_open", { lens: edge.lens, relation: edge.relation }); }} />;
          })}
          {positions.map((point) => {
            const who = people.find((item) => item.id === point.id)!;
            const isCenter = point.id === (centerId || people[0]?.id);
            return <g key={point.id} onClick={() => setCenterId(point.id)} className="cursor-pointer">
              <circle cx={point.x} cy={point.y} r={isCenter ? 7 : 5.5} fill={isCenter ? "var(--primary-strong)" : "var(--accent)"} stroke="var(--primary-strong)" strokeWidth="0.6" />
              <text x={point.x} y={point.y + 0.8} textAnchor="middle" fontSize="3" fontWeight="800" fill={isCenter ? "white" : "var(--foreground)"}>{who.label.slice(0, 8)}</text>
            </g>;
          })}
        </svg>
      </div>
      <CompatibilityOrbit
        locale={locale}
        mode="system"
        centerId={centerId || people[0]?.id}
        people={people.map((item) => ({
          id: item.id,
          label: item.label,
          score: scoreAgainstCenter(snapshot.edges, centerId || people[0]?.id, item.id, lens),
        }))}
      />
      {pairCopy && pickedEdge && <article className="mt-4 rounded-3xl bg-card p-4">
        <p className="text-xs font-black uppercase tracking-wider text-primary">{copy.pair} · {pickedEdge.harmonyIndex}</p>
        <h2 className="mt-1 text-lg font-black text-foreground">{pairCopy.label}</h2>
        <p className="mt-2 text-sm"><span className="font-black">{copy.help}.</span> {pairCopy.help}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.care}.</span> {pairCopy.care}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.ask}.</span> {pairCopy.ask}</p>
      </article>}
      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{copy.noTotal}</p>
      <button type="button" onClick={() => void share()} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Share2 className="h-4 w-4" />{copy.share}</button>
      {copied && <p className="mt-2 text-center text-xs font-black text-primary">{copy.copied}</p>}
    </section>}

    {!snapshot && <p className="mt-8 rounded-2xl bg-surface-subtle px-4 py-3 text-center text-sm font-bold text-foreground">{copy.need}</p>}

    <ul className="mt-5 space-y-2">{people.map((item) => (
      <li key={item.id} className="flex min-h-12 items-center gap-3 rounded-2xl bg-card px-4">
        <button type="button" onClick={() => setCenterId(item.id)} className="min-w-0 flex-1 truncate text-left text-sm font-black text-foreground">{item.id === centerId ? "◎ " : "○ "}{item.label}</button>
        <button type="button" aria-label="remove" onClick={() => setPeople((current) => current.filter((row) => row.id !== item.id))} className="h-11 w-11 text-muted-foreground"><Trash2 className="mx-auto h-4 w-4" /></button>
      </li>
    ))}</ul>

    {people.length < 10 && <div className="mt-5 space-y-3 rounded-3xl border border-border bg-card p-4">
      <input aria-label={copy.alias} placeholder={copy.alias} value={alias} maxLength={24} onChange={(event) => setAlias(event.target.value)} className={field} />
      <input aria-label={copy.date} type="date" value={date} onChange={(event) => setDate(event.target.value)} className={field} />
      <input aria-label={copy.time} type="time" value={time} onChange={(event) => setTime(event.target.value)} className={field} />
      <select aria-label={copy.city} value={cityId} onChange={(event) => setCityId(event.target.value)} className={field}>
        <option value="">{copy.city}</option>
        {CITIES.map((city) => <option key={city.id} value={city.id}>{city.label[lang]}</option>)}
      </select>
      <button type="button" onClick={addByDate} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Plus className="h-4 w-4" />{copy.add}</button>
      <input aria-label={copy.link} placeholder={copy.link} value={link} onChange={(event) => setLink(event.target.value)} className={field} />
      <button type="button" onClick={() => void addByLink()} className="min-h-11 w-full rounded-2xl border border-primary text-sm font-black text-primary">{copy.link}</button>
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    </div>}

    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-muted-foreground">{copy.disclaimer}</p>
  </main>;
}
