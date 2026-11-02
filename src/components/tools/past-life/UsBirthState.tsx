import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { US_REGION_VECTORS, US_SOURCES, US_STATES, type UsState, type Vector } from "../../../data/past-life-1426";
import generated from "../../../data/past-life-1426-generated.json";
import { nearest, oneIn, seededRandom, stateShare, weightedPick } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, ModeTabs, Panel, Sources, TraitPicker, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L } from "./shared";

type Sex = "female" | "male";
interface StateInfo {
  nickname: string | null;
  capital: { en: string; ko: string | null } | null;
  bird: { common: string; scientific: string } | null;
  flag: { page: string; artist: string | null; license: string };
  namesYear: number;
  female: [string, number][];
  male: [string, number][];
}
const INFO = generated.us as unknown as Record<string, StateInfo>;

interface Birth {
  state: UsState;
  sex: Sex;
  name: string;
}

const C = {
  draw: { ko: "출생 신고하기", en: "Register my birth", ja: "出生届を出す", zh: "去报出生", fr: "Déclarer ma naissance", es: "Registrar mi nacimiento" },
  again: { ko: "다시 태어나기", en: "Be born again", ja: "もう一度生まれる", zh: "再出生一次", fr: "Renaître", es: "Renacer" },
  baby: { ko: "아기", en: "Baby", ja: "赤ちゃん", zh: "宝宝", fr: "Bébé", es: "Bebé" },
  any: { ko: "아무나", en: "Either", ja: "どちらでも", zh: "都可以", fr: "Peu importe", es: "Cualquiera" },
  girl: { ko: "여자 아기", en: "Girl", ja: "女の子", zh: "女孩", fr: "Fille", es: "Niña" },
  boy: { ko: "남자 아기", en: "Boy", ja: "男の子", zh: "男孩", fr: "Garçon", es: "Niño" },
  cert: { ko: "출생증명서", en: "Certificate of Live Birth", ja: "出生証明書", zh: "出生证明", fr: "Acte de naissance", es: "Acta de nacimiento" },
  bornIn: { ko: "태어난 곳", en: "Place of birth", ja: "出生地", zh: "出生地", fr: "Lieu de naissance", es: "Lugar de nacimiento" },
  name: { ko: "이름", en: "Name", ja: "名前", zh: "名字", fr: "Prénom", es: "Nombre" },
  capital: { ko: "주도", en: "Capital", ja: "州都", zh: "首府", fr: "Capitale", es: "Capital" },
  nickname: { ko: "별명", en: "Nickname", ja: "愛称", zh: "别称", fr: "Surnom", es: "Apodo" },
  bird: { ko: "주를 상징하는 새", en: "State bird", ja: "州の鳥", zh: "州鸟", fr: "Oiseau de l'État", es: "Ave del estado" },
  births: { ko: "2024년 이 주에서 태어난 아기", en: "Babies born here in 2024", ja: "2024年にこの州で生まれた赤ちゃん", zh: "2024年在此州出生的婴儿", fr: "Bébés nés ici en 2024", es: "Bebés nacidos aquí en 2024" },
  topNames: { ko: "이 주에서 가장 많이 지은 이름", en: "Most common names in this state", ja: "この州で多い名前", zh: "此州最常见的名字", fr: "Prénoms les plus donnés ici", es: "Nombres más comunes aquí" },
  nameNote: { ko: "이름은 이 주의 상위 10개 이름 안에서 실제 사용 횟수만큼 확률을 줘서 뽑았어요.", en: "Your name is drawn from this state's top 10, weighted by how many babies got each.", ja: "名前はこの州の上位10名から、実際の件数の比率で引きました。", zh: "名字从此州前10名中按实际人数比例抽取。", fr: "Le prénom est tiré parmi le top 10 de l'État, selon le nombre de bébés.", es: "El nombre sale del top 10 del estado, según cuántos bebés lo recibieron." },
  flagCredit: { ko: "깃발", en: "Flag", ja: "旗", zh: "州旗", fr: "Drapeau", es: "Bandera" },
} as const;

function pickName(state: UsState, sex: Sex, random: () => number = Math.random): string {
  const list = INFO[state.code][sex];
  return weightedPick(list, ([, count]) => count, random)[0];
}
function pickSex(choice: Sex | "any", random: () => number = Math.random): Sex {
  return choice === "any" ? (random() < 0.5 ? "female" : "male") : choice;
}

function format(b: Birth) {
  return `u=${b.state.code}&s=${b.sex === "female" ? "f" : "m"}&n=${encodeURIComponent(b.name)}`;
}
function parse(search: string): Birth | null {
  const q = new URLSearchParams(search);
  const state = US_STATES.find((st) => st.code === (q.get("u") ?? "").toUpperCase());
  const sex: Sex = q.get("s") === "m" ? "male" : "female";
  const name = q.get("n") ?? "";
  if (!state || !INFO[state.code][sex].some(([n]) => n === name)) return null;
  return { state, sex, name };
}

export default function UsBirthState({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<"random" | "trait">("random");
  const [sexChoice, setSexChoice] = useState<Sex | "any">("any");
  const [birth, setBirth] = useState<Birth | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel("us-birth-state");

  useEffect(() => {
    const shared = parse(window.location.search);
    if (shared) setBirth(shared);
  }, []);

  function show(next: Birth, how: string) {
    funnel(how);
    setBirth(next);
    setRound((r) => r + 1);
    setShareQuery(format(next));
  }

  function drawRandom(): Birth {
    const state = weightedPick(US_STATES, (st) => st.births);
    const sex = pickSex(sexChoice);
    return { state, sex, name: pickName(state, sex) };
  }
  function drawMatched(v: Vector, source: string): Birth {
    const random = seededRandom(`us|${source}|${sexChoice}|${v.principle},${v.tradition},${v.action}`);
    const region = nearest(v, US_REGION_VECTORS);
    const state = weightedPick(US_STATES.filter((st) => st.region === region), (st) => st.births, random);
    const sex = pickSex(sexChoice, random);
    return { state, sex, name: pickName(state, sex, random) };
  }

  const info = birth ? INFO[birth.state.code] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-bold text-muted-foreground">{pick(C.baby, l)}</p>
        <div className="grid grid-cols-3 gap-2">
          {(["any", "female", "male"] as const).map((s) => (
            <Button key={s} size="sm" variant={sexChoice === s ? "default" : "outline"} aria-pressed={sexChoice === s} onClick={() => setSexChoice(s)}>
              {pick(s === "any" ? C.any : s === "female" ? C.girl : C.boy, l)}
            </Button>
          ))}
        </div>
      </div>
      <ModeTabs mode={mode} onMode={setMode} l={l} />
      {mode === "random" ? (
        <Button size="lg" className="w-full" onClick={() => show(drawRandom(), "random")}>
          {birth ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      ) : (
        <TraitPicker l={l} onSubmit={(v, source) => show(drawMatched(v, source), `trait-${source}`)} />
      )}

      {birth && info && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border-4 border-double border-border bg-card p-5 shadow-md">
            <p className="text-center font-serif text-xs uppercase tracking-widest text-muted-foreground">{pick(C.cert, l)}</p>
            <div className="mt-4 flex items-center gap-4">
              <img src={`/images/past-life-1426/flags/${birth.state.code}.webp`} alt={`${birth.state.name.en} flag`} width={120} height={80} className="h-20 w-auto rounded-md border border-border shadow-sm" loading="lazy" />
              <div>
                <p className="text-xs text-muted-foreground">{pick(C.name, l)}</p>
                <p className="font-serif text-3xl font-black text-foreground">{birth.name}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">{pick(C.bornIn, l)}</dt>
                <dd className="text-lg font-bold">{birth.state.name[l]}</dd>
              </div>
              {info.capital && (
                <div>
                  <dt className="text-xs text-muted-foreground">{pick(C.capital, l)}</dt>
                  <dd className="text-lg font-bold">{l === "ko" && info.capital.ko ? info.capital.ko : info.capital.en}</dd>
                </div>
              )}
              {info.nickname && (
                <div>
                  <dt className="text-xs text-muted-foreground">{pick(C.nickname, l)}</dt>
                  <dd className="font-bold">{info.nickname}</dd>
                </div>
              )}
              {info.bird && (
                <div>
                  <dt className="text-xs text-muted-foreground">{pick(C.bird, l)}</dt>
                  <dd className="font-bold">
                    {info.bird.common} <span className="text-xs font-normal italic text-muted-foreground">{info.bird.scientific}</span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <Panel label={pick(C.births, l)}>
            <p className="text-2xl font-black">{fmt.format(birth.state.births)}</p>
            <p>{oneInText(oneIn(stateShare(birth.state)), l, fmt)}</p>
            <Sources l={l} items={US_SOURCES} />
          </Panel>

          <Panel label={`${pick(C.topNames, l)} (${info.namesYear})`}>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1">
              {info[birth.sex].map(([n, count], i) => (
                <li key={n} className={n === birth.name ? "font-black text-primary" : ""}>
                  {i + 1}. {n} <span className="text-xs text-muted-foreground">{fmt.format(count)}</span>
                </li>
              ))}
            </ol>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.nameNote, l)}</p>
            <Sources
              l={l}
              items={[
                { label: "SSA baby names by state (public domain)", url: "https://www.ssa.gov/oact/babynames/limits.html" },
                { label: `${pick(C.flagCredit, l)}: Wikimedia Commons (${info.flag.license})`, url: info.flag.page },
              ]}
            />
          </Panel>

          <CopyLink l={l} testId="us-birth-state" />
        </div>
      )}
    </div>
  );
}
