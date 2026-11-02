import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { EUROPE_SOURCES, REALMS_1426, REALM_KIND_VECTORS, type Realm, type Vector } from "../../../data/past-life-1426";
import generated from "../../../data/past-life-1426-generated.json";
import { nearest, oneIn, realmShare, seededRandom, weightedPick } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, ModeTabs, Panel, Sources, TraitPicker, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";

interface Portrait {
  page: string;
  license: string;
  artist: string | null;
  year: number | null;
  kind: "image" | "coin" | "seal";
}
const PORTRAITS = generated.rulers as unknown as Record<string, Portrait>;

interface Person {
  qid: string;
  l: Partial<Six> & { en: string };
  b: number;
  d: number;
  o: string | null;
  s: number;
}

const C = {
  draw: { ko: "왕좌에 앉기", en: "Take a throne", ja: "玉座に座る", zh: "登上王座", fr: "Monter sur le trône", es: "Ocupar el trono" },
  again: { ko: "다른 왕좌로", en: "Another throne", ja: "別の玉座へ", zh: "换一个王座", fr: "Un autre trône", es: "Otro trono" },
  you: { ko: "1426년, 당신은", en: "In 1426 you are", ja: "1426年、あなたは", zh: "1426年，你是", fr: "En 1426, vous êtes", es: "En 1426 eres" },
  real: { ko: "실제로 이 자리에 있던 사람", en: "Who really sat here", ja: "実際にこの座にいた人", zh: "实际在位者", fr: "Titulaire réel", es: "Titular real" },
  odds: { ko: "왕좌는 나라마다 하나라 모두 같은 확률이에요.", en: "One throne per realm, so every realm has the same odds.", ja: "玉座は国ごとに一つなので、どの国も同じ確率です。", zh: "每国只有一个王座，所以概率相同。", fr: "Un trône par royaume : mêmes chances pour tous.", es: "Un trono por reino: todos con la misma probabilidad." },
  painted: { ko: "그림", en: "Image", ja: "画像", zh: "图像", fr: "Image", es: "Imagen" },
  contemporary: { ko: "생전에 만든 모습", en: "made in their lifetime", ja: "存命中に作られた姿", zh: "生前所作", fr: "réalisé de son vivant", es: "hecho en vida" },
  later: { ko: "후대에 그린 모습", en: "a later depiction", ja: "後世に描かれた姿", zh: "后世所绘", fr: "représentation postérieure", es: "representación posterior" },
  coin: { ko: "주화", en: "coin", ja: "硬貨", zh: "钱币", fr: "pièce", es: "moneda" },
  seal: { ko: "인장", en: "seal", ja: "印章", zh: "印章", fr: "sceau", es: "sello" },
  peers: { ko: "1426년, 당신과 동갑인 유명인", en: "Famous people your age in 1426", ja: "1426年、あなたと同い年の有名人", zh: "1426年与你同龄的名人", fr: "Célébrités de votre âge en 1426", es: "Famosos de tu edad en 1426" },
  age: { ko: "지금 내 나이", en: "My age now", ja: "いまの年齢", zh: "我现在的年龄", fr: "Mon âge", es: "Mi edad" },
  ageWas: { ko: "세", en: "years old", ja: "歳", zh: "岁", fr: "ans", es: "años" },
  none: { ko: "이 나이의 유명인 기록이 없어 가장 가까운 나이로 보여줘요.", en: "No one recorded at exactly this age, so the nearest age is shown.", ja: "ちょうどこの年齢の記録がないため、最も近い年齢を表示します。", zh: "没有恰好这个年龄的记录，显示最接近的年龄。", fr: "Personne à cet âge exact : âge le plus proche affiché.", es: "Nadie con esa edad exacta: se muestra la más cercana." },
  peersNote: { ko: "위키데이터에서 1426년에 살아 있던 사람 중 여러 언어 위키백과에 실린 482명이에요. 유럽 인물이 많고, 생년은 추정인 경우가 있어요.", en: "482 people alive in 1426 with articles in many Wikipedias (Wikidata). Mostly European; some birth years are estimates.", ja: "1426年に生きていて多言語のウィキペディアに載る482人（ウィキデータ）。欧州の人物が多く、生年は推定の場合があります。", zh: "维基数据中1426年在世、在多种语言维基百科有条目的482人。欧洲人物居多，部分生年为推测。", fr: "482 personnes vivantes en 1426 présentes dans de nombreuses Wikipédias (Wikidata). Surtout européennes ; dates parfois estimées.", es: "482 personas vivas en 1426 con artículos en muchas Wikipedias (Wikidata). Sobre todo europeas; algunos años son estimados." },
} as const;

const OCC: Record<string, Six> = {
  politician: { ko: "정치인", en: "politician", ja: "政治家", zh: "政治家", fr: "homme politique", es: "político" },
  painter: { ko: "화가", en: "painter", ja: "画家", zh: "画家", fr: "peintre", es: "pintor" },
  aristocrat: { ko: "귀족", en: "aristocrat", ja: "貴族", zh: "贵族", fr: "aristocrate", es: "aristócrata" },
  "military personnel": { ko: "군인", en: "soldier", ja: "軍人", zh: "军人", fr: "militaire", es: "militar" },
  writer: { ko: "작가", en: "writer", ja: "作家", zh: "作家", fr: "écrivain", es: "escritor" },
  sovereign: { ko: "군주", en: "sovereign", ja: "君主", zh: "君主", fr: "souverain", es: "soberano" },
  monarch: { ko: "군주", en: "monarch", ja: "君主", zh: "君主", fr: "monarque", es: "monarca" },
  ruler: { ko: "통치자", en: "ruler", ja: "統治者", zh: "统治者", fr: "dirigeant", es: "gobernante" },
  poet: { ko: "시인", en: "poet", ja: "詩人", zh: "诗人", fr: "poète", es: "poeta" },
  condottiero: { ko: "용병대장", en: "condottiero", ja: "傭兵隊長", zh: "雇佣兵队长", fr: "condottiere", es: "condotiero" },
  philosopher: { ko: "철학자", en: "philosopher", ja: "哲学者", zh: "哲学家", fr: "philosophe", es: "filósofo" },
  diplomat: { ko: "외교관", en: "diplomat", ja: "外交官", zh: "外交官", fr: "diplomate", es: "diplomático" },
  "Catholic priest": { ko: "가톨릭 사제", en: "Catholic priest", ja: "カトリック司祭", zh: "天主教神父", fr: "prêtre catholique", es: "sacerdote católico" },
  explorer: { ko: "탐험가", en: "explorer", ja: "探検家", zh: "探险家", fr: "explorateur", es: "explorador" },
  sculptor: { ko: "조각가", en: "sculptor", ja: "彫刻家", zh: "雕塑家", fr: "sculpteur", es: "escultor" },
  historian: { ko: "역사가", en: "historian", ja: "歴史家", zh: "历史学家", fr: "historien", es: "historiador" },
  architect: { ko: "건축가", en: "architect", ja: "建築家", zh: "建筑师", fr: "architecte", es: "arquitecto" },
  mathematician: { ko: "수학자", en: "mathematician", ja: "数学者", zh: "数学家", fr: "mathématicien", es: "matemático" },
  astronomer: { ko: "천문학자", en: "astronomer", ja: "天文学者", zh: "天文学家", fr: "astronome", es: "astrónomo" },
  composer: { ko: "작곡가", en: "composer", ja: "作曲家", zh: "作曲家", fr: "compositeur", es: "compositor" },
  theologian: { ko: "신학자", en: "theologian", ja: "神学者", zh: "神学家", fr: "théologien", es: "teólogo" },
  typographer: { ko: "인쇄업자", en: "printer", ja: "印刷者", zh: "印刷家", fr: "imprimeur", es: "impresor" },
  knight: { ko: "기사", en: "knight", ja: "騎士", zh: "骑士", fr: "chevalier", es: "caballero" },
  banker: { ko: "은행가", en: "banker", ja: "銀行家", zh: "银行家", fr: "banquier", es: "banquero" },
  merchant: { ko: "상인", en: "merchant", ja: "商人", zh: "商人", fr: "marchand", es: "mercader" },
  "Buddhist monk": { ko: "승려", en: "Buddhist monk", ja: "僧侶", zh: "僧人", fr: "moine bouddhiste", es: "monje budista" },
};

function format(realm: Realm, age: number) {
  return `e=${realm.id}&a=${age}`;
}

function Peers({ l, age, onAge }: { l: L; age: number; onAge: (a: number) => void }) {
  const [people, setPeople] = useState<Person[] | null>(null);
  useEffect(() => {
    import("../../../data/past-life-1426-people.json").then((m) => setPeople(m.default as unknown as Person[]));
  }, []);
  if (!people) return null;
  const ageOf = (p: Person) => 1426 - p.b;
  let shownAge = age;
  let list = people.filter((p) => ageOf(p) === age);
  if (list.length === 0) {
    const ages = [...new Set(people.map(ageOf))].filter((a) => a >= 0);
    shownAge = ages.reduce((best, a) => (Math.abs(a - age) < Math.abs(best - age) ? a : best), ages[0]);
    list = people.filter((p) => ageOf(p) === shownAge);
  }
  return (
    <Panel label={pick(C.peers, l)}>
      <label className="flex items-center gap-3">
        <span className="text-sm font-bold">{pick(C.age, l)}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={59}
          value={age}
          onChange={(e) => onAge(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
          className="h-11 w-24 rounded-lg border border-border bg-background px-3 text-base"
        />
        <span className="text-sm text-muted-foreground">→ 1426: {shownAge} {pick(C.ageWas, l)}</span>
      </label>
      {shownAge !== age && <p className="text-xs text-muted-foreground">{pick(C.none, l)}</p>}
      <ul className="space-y-2 pt-2">
        {list.slice(0, 6).map((p) => (
          <li key={p.qid}>
            <a className="font-bold underline" href={`https://www.wikidata.org/wiki/${p.qid}`} rel="noopener" target="_blank">
              {p.l[l] ?? p.l.en}
            </a>{" "}
            <span className="text-muted-foreground">
              ({p.b}–{p.d}
              {p.o && OCC[p.o] ? ` · ${OCC[p.o][l]}` : ""})
            </span>
          </li>
        ))}
      </ul>
      <p className="pt-2 text-xs text-muted-foreground">{pick(C.peersNote, l)}</p>
      <Sources l={l} items={[{ label: "Wikidata (CC0)", url: "https://www.wikidata.org/" }]} />
    </Panel>
  );
}

export default function EuropePastLife({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<"random" | "trait">("random");
  const [realm, setRealm] = useState<Realm | null>(null);
  const [age, setAge] = useState(30);
  const [round, setRound] = useState(0);
  const funnel = useFunnel("europe-1426");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const shared = REALMS_1426.find((r) => r.id === q.get("e"));
    if (shared) setRealm(shared);
    const a = Number(q.get("a"));
    if (q.has("a") && Number.isInteger(a) && a >= 0 && a < 60) setAge(a);
  }, []);

  function show(next: Realm, how: string) {
    funnel(how);
    setRealm(next);
    setRound((r) => r + 1);
    setShareQuery(format(next, age));
  }
  function updateAge(a: number) {
    setAge(a);
    if (realm) setShareQuery(format(realm, a));
  }
  function drawMatched(v: Vector, source: string): Realm {
    const random = seededRandom(`europe|${source}|${v.principle},${v.tradition},${v.action}`);
    const kind = nearest(v, REALM_KIND_VECTORS);
    return weightedPick(REALMS_1426.filter((r) => r.kind === kind), () => 1, random);
  }

  const portrait = realm ? PORTRAITS[realm.id] : null;
  const reignStart = realm ? Number(realm.reign.slice(0, 4)) : 0;
  const reignEnd = realm ? Number(realm.reign.slice(-4)) : 0;
  const lifetime = portrait?.year != null && portrait.year >= reignStart - 30 && portrait.year <= reignEnd + 5;

  return (
    <div className="space-y-6">
      <ModeTabs mode={mode} onMode={setMode} l={l} />
      {mode === "random" ? (
        <Button size="lg" className="w-full" onClick={() => show(weightedPick(REALMS_1426, () => 1), "random")}>
          {realm ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      ) : (
        <TraitPicker l={l} onSubmit={(v, source) => show(drawMatched(v, source), `trait-${source}`)} />
      )}

      {realm && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
            <div className="flex flex-col items-center gap-4 bg-muted p-6 sm:flex-row sm:items-end">
              {portrait ? (
                <figure className="shrink-0">
                  <img
                    src={`/images/past-life-1426/rulers/${realm.id}.webp`}
                    alt={realm.ruler}
                    width={160}
                    height={200}
                    className="h-52 w-auto rounded-xl border-4 border-double border-border object-cover shadow-lg"
                  />
                </figure>
              ) : (
                <div className="flex h-52 w-40 items-center justify-center rounded-xl border-4 border-double border-border text-6xl" aria-hidden="true">
                  👑
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-muted-foreground">{pick(C.you, l)}</p>
                <p className="mt-1 font-serif text-3xl font-black text-foreground">{realm.title[l]}</p>
                <p className="text-xl font-bold text-foreground">{realm.name[l]}</p>
              </div>
            </div>
            <div className="space-y-1 p-5 text-sm">
              {realm.ruler !== "—" && (
                <p>
                  <span className="text-muted-foreground">{pick(C.real, l)}:</span> <span className="font-bold">{realm.ruler}</span> ({realm.reign})
                </p>
              )}
              {realm.note?.[l] && <p>{realm.note[l]}</p>}
              <p className="text-muted-foreground">
                {oneInText(oneIn(realmShare()), l, fmt)} · {pick(C.odds, l)}
              </p>
              {portrait && (
                <p className="text-xs text-muted-foreground">
                  {pick(C.painted, l)}: {portrait.kind === "coin" ? pick(C.coin, l) : portrait.kind === "seal" ? pick(C.seal, l) : pick(lifetime ? C.contemporary : C.later, l)}
                  {portrait.year ? ` (${portrait.year})` : ""} ·{" "}
                  <a className="underline" href={portrait.page} rel="noopener" target="_blank">
                    Wikimedia Commons, {portrait.license}
                    {portrait.artist && portrait.license !== "Public domain" ? `, ${portrait.artist}` : ""}
                  </a>
                </p>
              )}
              <Sources l={l} items={EUROPE_SOURCES} />
            </div>
          </section>
          <Peers l={l} age={age} onAge={updateAge} />
          <CopyLink l={l} testId="europe-1426" />
        </div>
      )}
    </div>
  );
}
