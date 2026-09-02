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
import type { CompatibilityLensId, SymbolicComparisonProfile } from "@/lib/symbolic-tradition";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY = {
  ko: {
    title: "우리 원",
    sub: "3명부터 10명까지. 생년월일을 적거나 친구 링크를 넣으면 이 브라우저에서만 원이 그려집니다.",
    me: "나",
    friend: "친구",
    alias: "별칭",
    date: "생년월일",
    time: "시각 · 모르면 비움",
    city: "도시 · 모르면 비움",
    add: "원에 넣기",
    link: "또는 친구 공유 링크",
    need: "원이 그려지려면 3명이 필요합니다. 2명은 친구 궁합에서 보세요.",
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
    two: "둘이서만 →",
    error: "날짜를 확인해 주세요.",
  },
  en: {
    title: "Our circle",
    sub: "Three to ten people. Add a birth date or a friend link. The circle stays in this browser.",
    me: "You",
    friend: "Friend",
    alias: "Nickname",
    date: "Birth date",
    time: "Time · leave blank if unknown",
    city: "City · leave blank if unknown",
    add: "Add to the circle",
    link: "Or a friend share link",
    need: "The circle starts at 3 people. For two, use friend match.",
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
    two: "Just two →",
    error: "Check the date.",
  },
} as const;

const FALLBACK = COPY.en;

const LENS: Record<Lang, Record<CompatibilityLensId, string>> = {
  ko: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁" },
  en: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiac", "sun-sign": "Sun sign" },
  ja: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座" },
  zh: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座" },
  fr: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque", "sun-sign": "Signe" },
  es: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco", "sun-sign": "Signo" },
};

const PAIR: Record<string, { ask: string; care: string; help: string; label: string }> = {
  "generating-cycle": { label: "이어지는 생성", help: "한쪽이 피우면 다른 쪽이 키웁니다.", care: "속도가 다르면 답답해질 수 있습니다.", ask: "요즘 내가 너에게 넘기는 일은 뭐야?" },
  "controlling-cycle": { label: "서로 조절", help: "한쪽이 과하면 다른 쪽이 줄을 잡습니다.", care: "잔소리로 들릴 수 있습니다.", ask: "내가 너무 말리는 순간이 있어?" },
  same: { label: "같은 기운", help: "같은 리듬이라 말이 잘 통합니다.", care: "같은 약점도 겹칩니다.", ask: "우리 둘 다 미루는 일은?" },
  "same-trine": { label: "같은 삼합", help: "방향이 비슷해 함께 가기 쉽습니다.", care: "밖으로만 향하면 서로를 놓칩니다.", ask: "이번 달에 같이 하고 싶은 건?" },
  opposite: { label: "마주 보는 축", help: "빈 칸을 서로 채웁니다.", care: "부딪히면 오래갑니다.", ask: "의견이 갈릴 때 우리는 어떻게 쉬어?" },
  "same-balance": { label: "비슷한 음양", help: "속도가 비슷합니다.", care: "둘 다 같은 쪽으로 기울면 치우칩니다.", ask: "요즘 기운이 비슷한가?" },
  "near-balance": { label: "가까운 리듬", help: "조금 다른 박자가 대화를 엽니다.", care: "타이밍을 맞추려다 지칠 수 있습니다.", ask: "누가 먼저 말 거는 편이야?" },
  "contrasting-balance": { label: "대비되는 리듬", help: "한쪽이 밀면 다른 쪽이 받습니다.", care: "서로를 이해하지 못하면 거리로 남습니다.", ask: "내가 너무 빠른가, 느린가?" },
  "same-sign": { label: "같은 별자리", help: "계절이 같습니다.", care: "같은 함정에 같이 빠집니다.", ask: "올해 우리 테마는 뭐로 둘까?" },
  "same-element": { label: "같은 원소", help: "감정의 결이 비슷합니다.", care: "과하면 같이 과합니다.", ask: "요즘 기분을 한 색으로 말하면?" },
  "same-modality": { label: "같은 행동 양식", help: "일을 시작하는 방식이 닮았습니다.", care: "멈추는 타이밍도 겹칩니다.", ask: "우리 둘 다 끝을 못 내는 일은?" },
  distinct: { label: "다른 결", help: "겹치지 않는 시야가 있습니다.", care: "번역이 필요합니다.", ask: "내가 모르는 네 세계는 뭐야?" },
};

function person(label: string, profile: SymbolicComparisonProfile): SymbolicGroupParticipant {
  return { id: `p-${Math.random().toString(36).slice(2, 8)}`, label: label.trim().slice(0, 24) || "?", profile };
}

export default function CircleGathering({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const copy = lang === "ko" ? COPY.ko : FALLBACK;
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
    () => (people.length >= 3 ? createSymbolicGroupSnapshot(people, { centerId: centerId || people[0]?.id }) : null),
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
  const pairCopy = pickedEdge ? PAIR[pickedEdge.relation] ?? PAIR.distinct : null;

  const field = "h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-base font-semibold text-stone-900";

  return <main>
    <header className="text-center">
      <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">{copy.sub}</p>
      <a href={`/${locale}/profile/symbolic-compatibility/`} className="mt-3 inline-block text-sm font-black text-green-800 underline underline-offset-4">{copy.two}</a>
    </header>

    {snapshot && <section className="mt-8 rounded-[2rem] border border-lime-200 bg-[#f7f8ed] p-4 sm:p-7">
      <div className="flex gap-2 overflow-x-auto pb-1">{(Object.keys(LENS[lang]) as CompatibilityLensId[]).map((id) => (
        <button key={id} type="button" onClick={() => setLens(id)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black ${lens === id ? "bg-primary-strong text-white" : "border border-lime-200 bg-card text-green-900"}`}>{LENS[lang][id]}</button>
      ))}</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setView("star")} className={`min-h-11 rounded-xl text-xs font-black ${view === "star" ? "bg-lime-200 text-foreground" : "bg-card text-stone-600"}`}><Star className="mr-1 inline h-4 w-4" />{copy.star}</button>
        <button type="button" onClick={() => setView("all")} className={`min-h-11 rounded-xl text-xs font-black ${view === "all" ? "bg-lime-200 text-foreground" : "bg-card text-stone-600"}`}><Network className="mr-1 inline h-4 w-4" />{copy.all}</button>
      </div>
      <div className="mt-4 aspect-square max-h-[32rem] w-full overflow-hidden rounded-3xl border border-lime-100 bg-card">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {edges.map((edge) => {
            const from = at(edge.from);
            const to = at(edge.to);
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#84a844" strokeOpacity={0.45 + (edge.harmonyIndex / 100) * 0.55} strokeWidth={0.35 + (edge.harmonyIndex / 100) * 1.15} className="cursor-pointer" onClick={() => setPicked({ from: edge.from, to: edge.to })} />;
          })}
          {positions.map((point) => {
            const who = people.find((item) => item.id === point.id)!;
            const isCenter = point.id === (centerId || people[0]?.id);
            return <g key={point.id} onClick={() => setCenterId(point.id)} className="cursor-pointer">
              <circle cx={point.x} cy={point.y} r={isCenter ? 7 : 5.5} fill={isCenter ? "#166534" : "#ecfccb"} stroke="#3f6212" strokeWidth="0.6" />
              <text x={point.x} y={point.y + 0.8} textAnchor="middle" fontSize="3" fontWeight="800" fill={isCenter ? "white" : "#14532d"}>{who.label.slice(0, 8)}</text>
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
        <p className="text-xs font-black uppercase tracking-wider text-lime-700">{copy.pair} · {pickedEdge.harmonyIndex}</p>
        <h2 className="mt-1 text-lg font-black text-foreground">{pairCopy.label}</h2>
        <p className="mt-2 text-sm"><span className="font-black">{copy.help}.</span> {pairCopy.help}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.care}.</span> {pairCopy.care}</p>
        <p className="mt-1 text-sm"><span className="font-black">{copy.ask}.</span> {pairCopy.ask}</p>
      </article>}
      <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-wider text-stone-400">{copy.noTotal}</p>
      <button type="button" onClick={() => void share()} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Share2 className="h-4 w-4" />{copy.share}</button>
      {copied && <p className="mt-2 text-center text-xs font-black text-green-800">{copy.copied}</p>}
    </section>}

    {!snapshot && <p className="mt-8 rounded-2xl bg-lime-50 px-4 py-3 text-center text-sm font-bold text-green-900">{copy.need}</p>}

    <ul className="mt-5 space-y-2">{people.map((item) => (
      <li key={item.id} className="flex min-h-12 items-center gap-3 rounded-2xl bg-card px-4">
        <button type="button" onClick={() => setCenterId(item.id)} className="min-w-0 flex-1 truncate text-left text-sm font-black text-foreground">{item.id === centerId ? "◎ " : "○ "}{item.label}</button>
        <button type="button" aria-label="remove" onClick={() => setPeople((current) => current.filter((row) => row.id !== item.id))} className="h-11 w-11 text-stone-400"><Trash2 className="mx-auto h-4 w-4" /></button>
      </li>
    ))}</ul>

    {people.length < 10 && <div className="mt-5 space-y-3 rounded-3xl border border-lime-200 bg-card p-4">
      <input aria-label={copy.alias} placeholder={copy.alias} value={alias} maxLength={24} onChange={(event) => setAlias(event.target.value)} className={field} />
      <input aria-label={copy.date} type="date" value={date} onChange={(event) => setDate(event.target.value)} className={field} />
      <input aria-label={copy.time} type="time" value={time} onChange={(event) => setTime(event.target.value)} className={field} />
      <select aria-label={copy.city} value={cityId} onChange={(event) => setCityId(event.target.value)} className={field}>
        <option value="">{copy.city}</option>
        {CITIES.map((city) => <option key={city.id} value={city.id}>{city.label[lang]}</option>)}
      </select>
      <button type="button" onClick={addByDate} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-strong text-sm font-black text-white"><Plus className="h-4 w-4" />{copy.add}</button>
      <input aria-label={copy.link} placeholder={copy.link} value={link} onChange={(event) => setLink(event.target.value)} className={field} />
      <button type="button" onClick={() => void addByLink()} className="min-h-11 w-full rounded-2xl border border-green-700 text-sm font-black text-green-800">{copy.link}</button>
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    </div>}

    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-stone-500">{copy.disclaimer}</p>
  </main>;
}
