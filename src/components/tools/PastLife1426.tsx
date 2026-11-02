import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "../../i18n";
import type { Axis, JoseonPost, Vector } from "../../data/past-life-1426";
import { JOSEON_SOURCES, EUROPE_SOURCES, US_SOURCES } from "../../data/past-life-1426";
import {
  drawPastLife,
  factionVector,
  formatShare,
  matchPastLife,
  mbtiVector,
  oneIn,
  parseShare,
  postShare,
  quickVector,
  realmShare,
  stateShare,
  type PastLife,
  type QuickAnswers,
} from "../../lib/past-life-1426";
import { listStoredTestResults } from "../../lib/user/test-results";
import { gaEvent } from "../../lib/analytics/ga-event";
import { Button } from "../ui/button";

type L = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type Mode = "random" | "trait";
type Source = "quick" | "mbti" | "faction";

const C = {
  random: { ko: "랜덤으로 뽑기", en: "Random draw", ja: "ランダム", zh: "随机抽取", fr: "Tirage au sort", es: "Sorteo" },
  trait: { ko: "내 성향에 맞추기", en: "Match my traits", ja: "性格に合わせる", zh: "按性格匹配", fr: "Selon mon profil", es: "Según mi perfil" },
  draw: { ko: "600년 전으로", en: "Go back 600 years", ja: "600年前へ", zh: "回到600年前", fr: "Remonter 600 ans", es: "Volver 600 años" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Encore", es: "Otra vez" },
  match: { ko: "결과 보기", en: "See my match", ja: "結果を見る", zh: "查看结果", fr: "Voir le résultat", es: "Ver resultado" },
  joseon: { ko: "1426년 조선, 당신의 관직", en: "Joseon, 1426: your office", ja: "1426年の朝鮮、あなたの官職", zh: "1426年朝鲜：你的官职", fr: "Joseon, 1426 : votre charge", es: "Joseon, 1426: tu cargo" },
  europe: { ko: "1426년 유럽, 당신의 왕좌", en: "Europe, 1426: your throne", ja: "1426年のヨーロッパ、あなたの玉座", zh: "1426年欧洲：你的王座", fr: "Europe, 1426 : votre trône", es: "Europa, 1426: tu trono" },
  us: { ko: "지금 미국에서 태어난다면, 이 주", en: "Born in the US today: this state", ja: "いま米国で生まれるなら、この州", zh: "如果今天在美国出生：这个州", fr: "Né aux États-Unis aujourd'hui : cet État", es: "Si nacieras hoy en EE. UU.: este estado" },
  seats: { ko: "정원", en: "seats", ja: "定員", zh: "编制", fr: "postes", es: "plazas" },
  oneIn: { ko: "명 중 1명", en: "1 in", ja: "人に1人", zh: "人中有1人", fr: "1 sur", es: "1 de cada" },
  realReign: { ko: "실제로 이 자리에 있던 사람", en: "Who actually sat here", ja: "実際にこの座にいた人", zh: "实际在位者", fr: "Titulaire réel", es: "Titular real" },
  births: { ko: "2024년 출생", en: "births in 2024", ja: "2024年の出生", zh: "2024年出生", fr: "naissances en 2024", es: "nacimientos en 2024" },
  share: { ko: "결과 링크 복사", en: "Copy result link", ja: "結果リンクをコピー", zh: "复制结果链接", fr: "Copier le lien", es: "Copiar enlace" },
  copied: { ko: "복사했어요", en: "Copied", ja: "コピーしました", zh: "已复制", fr: "Copié", es: "Copiado" },
  source: { ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" },
  quick: { ko: "세 가지 질문", en: "Three questions", ja: "3つの質問", zh: "三个问题", fr: "Trois questions", es: "Tres preguntas" },
  mbti: { ko: "저장된 MBTI 결과", en: "Saved MBTI result", ja: "保存したMBTI結果", zh: "已保存的MBTI结果", fr: "Résultat MBTI enregistré", es: "Resultado MBTI guardado" },
  faction: { ko: "저장된 조선 붕당 결과", en: "Saved Joseon faction result", ja: "保存した朝鮮党派の結果", zh: "已保存的朝鲜朋党结果", fr: "Résultat de faction Joseon", es: "Resultado de facción Joseon" },
  noSaved: { ko: "이 브라우저에 저장된 MBTI·붕당 결과가 없어서 세 가지 질문으로 맞춰요.", en: "No saved MBTI or faction result in this browser, so we use three quick questions.", ja: "このブラウザにMBTI・党派の結果がないため、3つの質問で合わせます。", zh: "此浏览器没有保存的MBTI或朋党结果，因此用三个问题匹配。", fr: "Aucun résultat MBTI ou de faction enregistré ici : trois questions suffiront.", es: "No hay resultados MBTI ni de facción guardados aquí; usamos tres preguntas." },
  traitNote: { ko: "성향 맞춤은 OIYO가 정한 놀이용 좌표로 가장 가까운 무리를 고른 뒤, 그 안에서 실제 정원·출생 비중으로 뽑아요. 같은 답이면 같은 결과가 나와요.", en: "Trait matching uses OIYO's playful coordinates to pick the nearest group, then draws inside it by real seats or births. Same answers, same result.", ja: "性格マッチはOIYOが決めた遊びの座標で最も近いグループを選び、その中で実際の定員・出生比で抽選します。同じ答えなら同じ結果です。", zh: "性格匹配先用OIYO设定的游戏坐标找出最近的群组，再按真实编制或出生比重抽取。同样的回答得到同样的结果。", fr: "Le profil choisit le groupe le plus proche sur des coordonnées ludiques d'OIYO, puis tire selon les vrais effectifs ou naissances. Mêmes réponses, même résultat.", es: "El perfil elige el grupo más cercano con coordenadas lúdicas de OIYO y luego sortea según plazas o nacimientos reales. Mismas respuestas, mismo resultado." },
} as const;

const QUESTIONS: Record<Axis, { q: Record<L, string>; yes: Record<L, string>; no: Record<L, string> }> = {
  principle: {
    q: { ko: "옳은 말이지만 손해 보는 상황이라면?", en: "Right, but it will cost you. Then?", ja: "正しいけれど損をする場面では？", zh: "说得对但会吃亏时？", fr: "C'est juste, mais ça vous coûtera. Alors ?", es: "Es lo correcto, pero te costará. ¿Entonces?" },
    yes: { ko: "그래도 말한다", en: "Say it anyway", ja: "それでも言う", zh: "照样说", fr: "Je le dis quand même", es: "Lo digo igual" },
    no: { ko: "실리를 챙긴다", en: "Take the practical route", ja: "実利を取る", zh: "讲求实际", fr: "Je reste pragmatique", es: "Voy a lo práctico" },
  },
  tradition: {
    q: { ko: "오래된 방식과 새 방식 중 하나만 고르면?", en: "Old way or new way?", ja: "昔のやり方と新しいやり方、どちら？", zh: "老办法还是新办法？", fr: "L'ancienne méthode ou la nouvelle ?", es: "¿La forma antigua o la nueva?" },
    yes: { ko: "검증된 옛 방식", en: "The proven old way", ja: "実績ある昔の方法", zh: "久经考验的老办法", fr: "L'ancienne, éprouvée", es: "La antigua, probada" },
    no: { ko: "새로 바꿔 본다", en: "Try something new", ja: "新しく変えてみる", zh: "试试新的", fr: "Essayer du neuf", es: "Probar algo nuevo" },
  },
  action: {
    q: { ko: "일이 터졌을 때 나는?", en: "When something breaks, you…", ja: "問題が起きたとき、わたしは？", zh: "出事时我会？", fr: "Quand un problème surgit, vous…", es: "Cuando algo se rompe, tú…" },
    yes: { ko: "먼저 움직인다", en: "Move first", ja: "まず動く", zh: "先行动", fr: "Agissez d'abord", es: "Actúas primero" },
    no: { ko: "먼저 살핀다", en: "Look first", ja: "まず観察する", zh: "先观察", fr: "Observez d'abord", es: "Observas primero" },
  },
};

const pick = <T,>(table: Record<L, T>, l: L) => table[l] ?? table.en;
const AXES: Axis[] = ["principle", "tradition", "action"];

function postTitle(post: JoseonPost, l: L) {
  if (l === "ko") return { main: post.ko, sub: `${post.hanja} · ${post.rank}` };
  if (l === "ja" || l === "zh") return { main: post.hanja, sub: `${post.en} · ${post.rankEn}` };
  return { main: post.en, sub: `${post.hanja} · ${post.rankEn}` };
}

function savedTraits(): { mbti: string | null; faction: string | null } {
  const results = listStoredTestResults();
  const read = (id: string, key: string) => {
    const hit = results.find((r) => r.testId === id && r.result && typeof r.result === "object" && key in (r.result as object));
    const value = hit ? (hit.result as Record<string, unknown>)[key] : null;
    return typeof value === "string" ? value : null;
  };
  return { mbti: read("mbti", "type"), faction: read("joseon-faction", "faction") };
}

export default function PastLife1426({ locale }: { locale: Locale }) {
  const l: L = (["ko", "en", "ja", "zh", "fr", "es"] as const).includes(locale as L) ? (locale as L) : "en";
  const fmt = new Intl.NumberFormat(l === "zh" ? "zh-CN" : l);
  const [mode, setMode] = useState<Mode>("random");
  const [life, setLife] = useState<PastLife | null>(null);
  const [answers, setAnswers] = useState<Partial<QuickAnswers>>({});
  const [saved, setSaved] = useState<{ mbti: string | null; faction: string | null }>({ mbti: null, faction: null });
  const [source, setSource] = useState<Source>("quick");
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const shared = parseShare(window.location.search);
    if (shared) setLife(shared);
    const s = savedTraits();
    setSaved(s);
    if (s.mbti) setSource("mbti");
    else if (s.faction) setSource("faction");
  }, []);

  function finish(next: PastLife, how: string) {
    if (!started.current) {
      started.current = true;
      gaEvent("test_started", { test_id: "past-life-1426", mode: how });
    }
    gaEvent("test_completed", { test_id: "past-life-1426", mode: how });
    setLife(next);
    setCopied(false);
    const url = new URL(window.location.href);
    url.search = formatShare(next);
    window.history.replaceState(null, "", url);
  }

  function traitVector(): Vector | null {
    if (source === "mbti" && saved.mbti) return mbtiVector(saved.mbti);
    if (source === "faction" && saved.faction) return factionVector(saved.faction);
    if (AXES.every((a) => answers[a] !== undefined)) return quickVector(answers as QuickAnswers);
    return null;
  }
  const vector = traitVector();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      gaEvent("share_click", { test_id: "past-life-1426", share_surface: "copy" });
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["random", "trait"] as const).map((m) => (
          <Button key={m} role="tab" aria-selected={mode === m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {pick(C[m], l)}
          </Button>
        ))}
      </div>

      {mode === "random" ? (
        <Button size="lg" className="w-full" onClick={() => finish(drawPastLife(), "random")}>
          {life ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      ) : (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            {(["quick", "mbti", "faction"] as const)
              .filter((src) => src === "quick" || (src === "mbti" ? saved.mbti : saved.faction))
              .map((src) => (
                <Button key={src} size="sm" variant={source === src ? "default" : "outline"} onClick={() => setSource(src)}>
                  {pick(C[src], l)}
                  {src === "mbti" && saved.mbti ? ` · ${saved.mbti}` : ""}
                </Button>
              ))}
          </div>
          {!saved.mbti && !saved.faction && <p className="text-sm text-muted-foreground">{pick(C.noSaved, l)}</p>}
          {source === "quick" &&
            AXES.map((axis) => (
              <fieldset key={axis} className="space-y-2">
                <legend className="text-base font-bold text-foreground">{pick(QUESTIONS[axis].q, l)}</legend>
                <div className="grid grid-cols-2 gap-2">
                  {([1, -1] as const).map((v) => (
                    <Button
                      key={v}
                      variant={answers[axis] === v ? "default" : "outline"}
                      aria-pressed={answers[axis] === v}
                      onClick={() => setAnswers((prev) => ({ ...prev, [axis]: v }))}
                    >
                      {pick(v === 1 ? QUESTIONS[axis].yes : QUESTIONS[axis].no, l)}
                    </Button>
                  ))}
                </div>
              </fieldset>
            ))}
          <Button size="lg" className="w-full" disabled={!vector} onClick={() => vector && finish(matchPastLife(vector, source), `trait-${source}`)}>
            {pick(C.match, l)}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.traitNote, l)}</p>
        </div>
      )}

      {life && <Result life={life} l={l} fmt={fmt} />}

      {life && (
        <Button variant="outline" className="w-full" onClick={copyLink}>
          {copied ? pick(C.copied, l) : pick(C.share, l)}
        </Button>
      )}
    </div>
  );
}

function Result({ life, l, fmt }: { life: PastLife; l: L; fmt: Intl.NumberFormat }) {
  const { post, realm, state } = life;
  const title = postTitle(post, l);
  const odds = (share: number) => (l === "ko" || l === "ja" || l === "zh" ? `${fmt.format(oneIn(share))}${pick(C.oneIn, l)}` : `${pick(C.oneIn, l)} ${fmt.format(oneIn(share))}`);
  return (
    <div className="grid gap-4" aria-live="polite">
      <Card label={pick(C.joseon, l)} main={title.main} sub={title.sub}>
        <p>
          {pick(C.seats, l)} {fmt.format(post.seats)} · {odds(postShare(post))}
        </p>
        <Sources l={l} items={JOSEON_SOURCES} />
      </Card>
      <Card label={pick(C.europe, l)} main={`${realm.name[l]} · ${realm.title[l]}`} sub={realm.ruler === "—" ? realm.reign : `${pick(C.realReign, l)}: ${realm.ruler} (${realm.reign})`}>
        {realm.note?.[l] && <p>{realm.note[l]}</p>}
        <p>{odds(realmShare())}</p>
        <Sources l={l} items={EUROPE_SOURCES} />
      </Card>
      <Card label={pick(C.us, l)} main={state.name[l]} sub={l === "ko" ? `2024년 출생 ${fmt.format(state.births)}명` : l === "ja" ? `2024年の出生 ${fmt.format(state.births)}人` : l === "zh" ? `2024年出生 ${fmt.format(state.births)}人` : `${fmt.format(state.births)} ${pick(C.births, l)}`}>
        <p>{odds(stateShare(state))}</p>
        <Sources l={l} items={US_SOURCES} />
      </Card>
    </div>
  );
}

function Card({ label, main, sub, children }: { label: string; main: string; sub: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-bold text-muted-foreground">{label}</h2>
      <p className="mt-2 text-2xl font-black text-foreground">{main}</p>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      <div className="mt-3 space-y-1 text-sm text-foreground">{children}</div>
    </section>
  );
}

function Sources({ l, items }: { l: L; items: { label: string; url: string }[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      {pick(C.source, l)}:{" "}
      {items.map((item, i) => (
        <span key={item.url}>
          {i > 0 && " · "}
          <a className="underline" href={item.url} rel="noopener" target="_blank">
            {item.label}
          </a>
        </span>
      ))}
    </p>
  );
}

