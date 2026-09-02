"use client";

import { Check, Network, Plus, Share2, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { readSymbolicShareFragment } from "@/lib/symbolic-tradition/share-artifact";
import { readEncryptedShortShare } from "@/lib/symbolic-tradition/short-share";
import {
  allPairEdges,
  createSymbolicGroupSnapshot,
  starEdges,
  symbolicGroupFragment,
  type SymbolicGroupParticipant,
  type SymbolicGroupSnapshot,
} from "@/lib/symbolic-tradition/group-snapshot";
import type { CompatibilityLensId, SymbolicComparisonProfile } from "@/lib/symbolic-tradition";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const TEXT = {
  ko: { title: "우리의 관계 지도", sub: "친구 링크를 모아 3–10명의 연결을 이 브라우저에서만 계산합니다.", add: "친구 추가", alias: "친구 별칭", link: "친구의 공유 링크", consent: "별칭과 파생 프로필이 그룹 링크에 포함되는 것에 모두 동의했습니다.", share: "그룹 지도 공유", copied: "그룹 링크를 복사했어요", invalid: "유효한 친구 공유 링크인지 확인해 주세요.", star: "나 중심", all: "전체 연결", remove: "삭제", privacy: "원본 생년월일시는 포함하지 않습니다. 점수·순위·최고/최악 친구를 만들지 않습니다.", need: "그룹 지도는 3명부터 만들 수 있습니다." },
  en: { title: "Our relationship map", sub: "Collect friend links and calculate a 3–10 person map only in this browser.", add: "Add friend", alias: "Friend nickname", link: "Friend share link", consent: "Everyone agreed that nicknames and derived profiles may appear in this group link.", share: "Share group map", copied: "Group link copied", invalid: "Check that this is a valid friend share link.", star: "Centered on me", all: "All connections", remove: "Remove", privacy: "No original birth date or time. No scores, ranking, best, or worst friend.", need: "A group map starts with 3 people." },
  ja: { title: "みんなの関係マップ", sub: "友だちのリンクを集め、3〜10人のつながりをこのブラウザだけで計算します。", add: "友だちを追加", alias: "友だちの呼び名", link: "友だちの共有リンク", consent: "呼び名と派生プロフィールがグループリンクに含まれることに全員が同意しました。", share: "グループ地図を共有", copied: "リンクをコピーしました", invalid: "有効な共有リンクを確認してください。", star: "自分中心", all: "全体", remove: "削除", privacy: "元の生年月日時は含みません。点数・順位・最高/最低の友だちは作りません。", need: "3人から作成できます。" },
  zh: { title: "我们的关系地图", sub: "收集朋友链接，仅在浏览器中计算3–10人的连接。", add: "添加朋友", alias: "朋友昵称", link: "朋友分享链接", consent: "所有人都同意昵称和派生资料出现在群组链接中。", share: "分享群组地图", copied: "群组链接已复制", invalid: "请检查朋友分享链接是否有效。", star: "以我为中心", all: "全部连接", remove: "删除", privacy: "不含原始出生日期时间；不提供分数、排名或最好/最差朋友。", need: "至少需要3人。" },
  fr: { title: "Notre carte relationnelle", sub: "Rassemblez les liens de 3 à 10 amis; le calcul reste dans ce navigateur.", add: "Ajouter", alias: "Surnom", link: "Lien partagé", consent: "Tout le monde accepte que surnoms et profils dérivés figurent dans ce lien.", share: "Partager la carte", copied: "Lien copié", invalid: "Vérifiez le lien partagé.", star: "Centré sur moi", all: "Tous les liens", remove: "Retirer", privacy: "Aucune date ou heure de naissance originale. Aucun score ni classement.", need: "La carte commence à 3 personnes." },
  es: { title: "Nuestro mapa de relaciones", sub: "Reúne enlaces de 3–10 personas; el cálculo queda en este navegador.", add: "Añadir amistad", alias: "Apodo", link: "Enlace compartido", consent: "Todas las personas aceptan incluir apodos y perfiles derivados en el enlace grupal.", share: "Compartir mapa", copied: "Enlace grupal copiado", invalid: "Comprueba el enlace compartido.", star: "Centrado en mí", all: "Todas las conexiones", remove: "Eliminar", privacy: "Sin fecha ni hora de nacimiento original. Sin puntuación, ranking, mejor o peor amistad.", need: "El mapa empieza con 3 personas." },
} as const;
const LENS: Record<Lang, Record<CompatibilityLensId, string>> = {
  ko: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁" },
  en: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiac", "sun-sign": "Sun sign" },
  ja: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座" },
  zh: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座" },
  fr: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque chinois", "sun-sign": "Signe solaire" },
  es: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco chino", "sun-sign": "Signo solar" },
};

function profileParticipant(label: string, profile: SymbolicComparisonProfile, index: number): SymbolicGroupParticipant {
  return { id: `person-${index}-${Math.random().toString(36).slice(2, 8)}`, label: label.trim().slice(0, 24), profile };
}

export default function SymbolicGroupSnapshotPanel({ initial, initialSnapshot, locale }: { initial?: Array<{ label: string; profile: SymbolicComparisonProfile }>; initialSnapshot?: SymbolicGroupSnapshot; locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const copy = TEXT[lang];
  const [participants, setParticipants] = useState<SymbolicGroupParticipant[]>(initialSnapshot?.participants ?? initial?.map((item, index) => profileParticipant(item.label, item.profile, index)) ?? []);
  const [centerId, setCenterId] = useState(initialSnapshot?.centerId ?? participants[0]?.id ?? "");
  const [lens, setLens] = useState<CompatibilityLensId>("five-elements");
  const [view, setView] = useState<"all" | "star">("star");
  const [alias, setAlias] = useState("");
  const [link, setLink] = useState("");
  const [consent, setConsent] = useState(Boolean(initialSnapshot));
  const [status, setStatus] = useState<"copied" | "error" | "idle">("idle");
  const snapshot = useMemo(() => participants.length >= 3 ? createSymbolicGroupSnapshot(participants, { centerId }) : null, [centerId, participants]);
  const edges = snapshot ? (view === "star" ? starEdges(snapshot, lens) : allPairEdges(snapshot, lens)) : [];

  const addFriend = async () => {
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
      if (!profile || !alias.trim() || participants.length >= 10) throw new Error("invalid");
      setParticipants((current) => [...current, profileParticipant(alias, profile!, current.length)]);
      setAlias(""); setLink(""); setStatus("idle");
    } catch { setStatus("error"); }
  };

  const share = async () => {
    if (!snapshot || !consent) return;
    const url = `${window.location.origin}${window.location.pathname}${symbolicGroupFragment(snapshot)}`;
    if (navigator.share) {
      try { await navigator.share({ title: copy.title, url }); return; } catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    await navigator.clipboard.writeText(url); setStatus("copied");
  };

  const removeParticipant = (id: string) => {
    setParticipants((current) => {
      const next = current.filter((item) => item.id !== id);
      if (id === centerId) setCenterId(next[0]?.id ?? "");
      return next;
    });
  };

  const positions = participants.map((person, index) => {
    if (person.id === centerId) return { id: person.id, x: 50, y: 50 };
    const others = participants.filter((item) => item.id !== centerId);
    const angle = (Math.PI * 2 * others.findIndex((item) => item.id === person.id)) / others.length - Math.PI / 2;
    return { id: person.id, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 38 };
  });
  const position = (id: string) => positions.find((item) => item.id === id)!;

  return <section className="mt-8 rounded-[2rem] border border-lime-200 bg-[#f7f8ed] p-4 sm:p-7" aria-labelledby="group-title">
    <div className="text-center"><Network className="mx-auto h-7 w-7 text-green-800" /><h2 id="group-title" className="mt-2 text-2xl font-black text-foreground">{copy.title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{copy.sub}</p></div>
    {snapshot && <>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{(Object.keys(LENS[lang]) as CompatibilityLensId[]).map((id) => <button key={id} onClick={() => setLens(id)} type="button" className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-black ${lens === id ? "bg-green-800 text-white" : "border border-lime-200 bg-card text-green-900"}`}>{LENS[lang][id]}</button>)}</div>
      <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setView("star")} className={`min-h-11 rounded-xl text-xs font-black ${view === "star" ? "bg-lime-200 text-foreground" : "bg-card text-stone-600"}`}><Star className="mr-1 inline h-4 w-4" />{copy.star}</button><button type="button" onClick={() => setView("all")} className={`min-h-11 rounded-xl text-xs font-black ${view === "all" ? "bg-lime-200 text-foreground" : "bg-card text-stone-600"}`}><Network className="mr-1 inline h-4 w-4" />{copy.all}</button></div>
      <div className="mt-4 aspect-square max-h-[32rem] w-full overflow-hidden rounded-3xl border border-lime-100 bg-card" role="img" aria-label={`${copy.title}: ${LENS[lang][lens]}`}><svg viewBox="0 0 100 100" className="h-full w-full">
        {edges.map((edge) => { const from = position(edge.from); const to = position(edge.to); return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#84a844" strokeOpacity={0.45 + (edge.harmonyIndex / 100) * 0.55} strokeWidth={0.35 + (edge.harmonyIndex / 100) * 1.15}><title>{`${edge.relation} · ${edge.harmonyIndex}`}</title></line>; })}
        {positions.map((point) => { const person = participants.find((item) => item.id === point.id)!; return <g key={point.id} onClick={() => setCenterId(point.id)} className="cursor-pointer"><circle cx={point.x} cy={point.y} r={point.id === centerId ? 7 : 5.5} fill={point.id === centerId ? "#166534" : "#ecfccb"} stroke="#3f6212" strokeWidth="0.6" /><text x={point.x} y={point.y + 0.8} textAnchor="middle" fontSize="3" fontWeight="800" fill={point.id === centerId ? "white" : "#14532d"}>{person.label.slice(0, 8)}</text></g>; })}
      </svg></div>
    </>}
    {!snapshot && <p className="mt-5 rounded-2xl bg-card px-4 py-3 text-center text-sm font-bold text-green-900">{copy.need}</p>}
    <div className="mt-5 space-y-2">{participants.map((person) => <div key={person.id} className="flex min-h-12 items-center gap-3 rounded-2xl bg-card px-4"><button type="button" onClick={() => setCenterId(person.id)} className="min-w-0 flex-1 truncate text-left text-sm font-black text-foreground">{person.id === centerId ? "◎ " : "○ "}{person.label}</button>{participants.length > 2 && !initialSnapshot && <button aria-label={`${person.label} ${copy.remove}`} type="button" onClick={() => removeParticipant(person.id)} className="h-11 w-11 text-stone-400"><Trash2 className="mx-auto h-4 w-4" /></button>}</div>)}</div>
    {!initialSnapshot && participants.length < 10 && <div className="mt-5 grid gap-3 rounded-3xl border border-lime-200 bg-card p-4 sm:grid-cols-[1fr_2fr_auto]"><input aria-label={copy.alias} placeholder={copy.alias} value={alias} maxLength={24} onChange={(event) => setAlias(event.target.value)} className="h-12 rounded-2xl border border-stone-200 px-4 text-base" /><input aria-label={copy.link} placeholder={copy.link} value={link} onChange={(event) => setLink(event.target.value)} className="h-12 min-w-0 rounded-2xl border border-stone-200 px-4 text-base" /><button type="button" onClick={() => void addFriend()} className="min-h-12 rounded-2xl bg-green-800 px-5 text-sm font-black text-white"><Plus className="mr-1 inline h-4 w-4" />{copy.add}</button></div>}
    {status === "error" && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{copy.invalid}</p>}
    {snapshot && !initialSnapshot && <><label className="mt-5 flex items-start gap-3 text-xs leading-5 text-stone-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-green-800" />{copy.consent}</label><button disabled={!consent} type="button" onClick={() => void share()} className="mt-4 min-h-12 w-full rounded-2xl bg-green-800 px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><Share2 className="mr-2 inline h-4 w-4" />{copy.share}</button></>}
    {status === "copied" && <p role="status" className="mt-3 text-center text-xs font-black text-green-800"><Check className="mr-1 inline h-4 w-4" />{copy.copied}</p>}
    <p className="mt-5 text-center text-xs leading-5 text-stone-500">{copy.privacy}</p>
  </section>;
}
