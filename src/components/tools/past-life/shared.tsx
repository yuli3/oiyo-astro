import { useEffect, useState, type ReactNode } from "react";
import type { Locale } from "../../../i18n";
import type { Axis, Vector } from "../../../data/past-life-1426";
import { factionVector, mbtiVector, quickVector, type QuickAnswers } from "../../../lib/past-life-1426";
import { listStoredTestResults } from "../../../lib/user/test-results";
import { gaEvent } from "../../../lib/analytics/ga-event";
import { Button } from "../../ui/button";

export type L = "ko" | "en" | "ja" | "zh" | "fr" | "es";
export type Six = Record<L, string>;
export const toL = (locale: Locale): L => ((["ko", "en", "ja", "zh", "fr", "es"] as const).includes(locale as L) ? (locale as L) : "en");
export const pick = <T,>(table: Record<L, T>, l: L): T => table[l] ?? table.en;
export const numberFormat = (l: L) => new Intl.NumberFormat(l === "zh" ? "zh-CN" : l);

export function oneInText(n: number, l: L, fmt: Intl.NumberFormat): string {
  const v = fmt.format(n);
  return { ko: `${v}명 중 1명`, ja: `${v}人に1人`, zh: `${v}人中有1人`, en: `1 in ${v}`, fr: `1 sur ${v}`, es: `1 de cada ${v}` }[l];
}

const AXES: Axis[] = ["principle", "tradition", "action"];

const T = {
  random: { ko: "랜덤으로 뽑기", en: "Random draw", ja: "ランダム", zh: "随机抽取", fr: "Au hasard", es: "Al azar" },
  trait: { ko: "내 성향에 맞추기", en: "Match my traits", ja: "性格に合わせる", zh: "按性格匹配", fr: "Selon mon profil", es: "Según mi perfil" },
  quick: { ko: "세 가지 질문", en: "Three questions", ja: "3つの質問", zh: "三个问题", fr: "Trois questions", es: "Tres preguntas" },
  mbti: { ko: "저장된 MBTI", en: "Saved MBTI", ja: "保存したMBTI", zh: "已保存的MBTI", fr: "MBTI enregistré", es: "MBTI guardado" },
  faction: { ko: "저장된 붕당 결과", en: "Saved Joseon faction", ja: "保存した党派", zh: "已保存的朋党", fr: "Faction Joseon", es: "Facción Joseon" },
  noSaved: { ko: "이 브라우저에 저장된 MBTI·붕당 결과가 없어서 세 가지 질문으로 맞춰요.", en: "No saved MBTI or faction result in this browser, so three quick questions will do.", ja: "このブラウザにMBTI・党派の結果がないため、3つの質問で合わせます。", zh: "此浏览器没有保存的MBTI或朋党结果，用三个问题匹配。", fr: "Aucun résultat MBTI ou de faction enregistré ici : trois questions suffiront.", es: "No hay MBTI ni facción guardados aquí; bastan tres preguntas." },
  note: { ko: "성향 맞춤은 OIYO가 정한 놀이용 좌표로 가장 가까운 무리를 고른 뒤, 그 안에서 실제 자료의 비중으로 뽑아요. 같은 답이면 같은 결과예요. 검증된 성격 이론이 아니에요.", en: "Trait matching uses OIYO's playful coordinates to pick the nearest group, then draws inside it by the real data. Same answers, same result. Not a validated personality theory.", ja: "OIYOが決めた遊びの座標で最も近いグループを選び、その中で実データの比率で抽選します。同じ答えなら同じ結果。検証済みの性格理論ではありません。", zh: "用OIYO设定的游戏坐标找出最近的群组，再按真实数据比重抽取。同样的回答得到同样的结果。这不是经过验证的性格理论。", fr: "Des coordonnées ludiques d'OIYO choisissent le groupe le plus proche, puis le tirage suit les vraies données. Mêmes réponses, même résultat. Pas une théorie validée.", es: "Unas coordenadas lúdicas de OIYO eligen el grupo más cercano y luego se sortea con datos reales. Mismas respuestas, mismo resultado. No es una teoría validada." },
  go: { ko: "결과 보기", en: "See my match", ja: "結果を見る", zh: "查看结果", fr: "Voir le résultat", es: "Ver resultado" },
};

const Q: Record<Axis, { q: Six; yes: Six; no: Six }> = {
  principle: {
    q: { ko: "옳은 말이지만 손해 보는 상황이라면?", en: "It's right, but it will cost you. Then?", ja: "正しいけれど損をする場面では？", zh: "说得对但会吃亏时？", fr: "C'est juste, mais ça vous coûtera. Alors ?", es: "Es lo correcto, pero te costará. ¿Entonces?" },
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

type Source = "quick" | "mbti" | "faction";

function savedTraits(): { mbti: string | null; faction: string | null } {
  const results = listStoredTestResults();
  const read = (id: string, key: string) => {
    const hit = results.find((r) => r.testId === id && r.result && typeof r.result === "object" && key in (r.result as object));
    const value = hit ? (hit.result as Record<string, unknown>)[key] : null;
    return typeof value === "string" ? value : null;
  };
  return { mbti: read("mbti", "type"), faction: read("joseon-faction", "faction") };
}

export function ModeTabs({ mode, onMode, l }: { mode: "random" | "trait"; onMode: (m: "random" | "trait") => void; l: L }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="tablist">
      {(["random", "trait"] as const).map((m) => (
        <Button key={m} role="tab" aria-selected={mode === m} variant={mode === m ? "default" : "outline"} onClick={() => onMode(m)}>
          {pick(T[m], l)}
        </Button>
      ))}
    </div>
  );
}

export function TraitPicker({ l, onSubmit }: { l: L; onSubmit: (v: Vector, source: string) => void }) {
  const [answers, setAnswers] = useState<Partial<QuickAnswers>>({});
  const [saved, setSaved] = useState<{ mbti: string | null; faction: string | null }>({ mbti: null, faction: null });
  const [source, setSource] = useState<Source>("quick");

  useEffect(() => {
    const s = savedTraits();
    setSaved(s);
    if (s.mbti) setSource("mbti");
    else if (s.faction) setSource("faction");
  }, []);

  const vector =
    source === "mbti" && saved.mbti ? mbtiVector(saved.mbti)
    : source === "faction" && saved.faction ? factionVector(saved.faction)
    : AXES.every((a) => answers[a] !== undefined) ? quickVector(answers as QuickAnswers)
    : null;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {(["quick", "mbti", "faction"] as const)
          .filter((src) => src === "quick" || (src === "mbti" ? saved.mbti : saved.faction))
          .map((src) => (
            <Button key={src} size="sm" variant={source === src ? "default" : "outline"} onClick={() => setSource(src)}>
              {pick(T[src], l)}
              {src === "mbti" && saved.mbti ? ` · ${saved.mbti}` : ""}
            </Button>
          ))}
      </div>
      {!saved.mbti && !saved.faction && <p className="text-sm text-muted-foreground">{pick(T.noSaved, l)}</p>}
      {source === "quick" &&
        AXES.map((axis) => (
          <fieldset key={axis} className="space-y-2">
            <legend className="text-base font-bold text-foreground">{pick(Q[axis].q, l)}</legend>
            <div className="grid grid-cols-2 gap-2">
              {([1, -1] as const).map((v) => (
                <Button key={v} variant={answers[axis] === v ? "default" : "outline"} aria-pressed={answers[axis] === v} onClick={() => setAnswers((prev) => ({ ...prev, [axis]: v }))}>
                  {pick(v === 1 ? Q[axis].yes : Q[axis].no, l)}
                </Button>
              ))}
            </div>
          </fieldset>
        ))}
      <Button size="lg" className="w-full" disabled={!vector} onClick={() => vector && onSubmit(vector, source)}>
        {pick(T.go, l)}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">{pick(T.note, l)}</p>
    </div>
  );
}

/** GA funnel: first draw fires test_started once, every draw fires test_completed. */
export function useFunnel(testId: string) {
  const [started, setStarted] = useState(false);
  return (mode: string) => {
    if (!started) {
      setStarted(true);
      gaEvent("test_started", { test_id: testId, mode });
    }
    gaEvent("test_completed", { test_id: testId, mode });
  };
}

export function setShareQuery(query: string) {
  const url = new URL(window.location.href);
  url.search = query;
  window.history.replaceState(null, "", url);
}

export function CopyLink({ l, testId }: { l: L; testId: string }) {
  const [copied, setCopied] = useState(false);
  const label = copied
    ? { ko: "복사했어요", en: "Copied", ja: "コピーしました", zh: "已复制", fr: "Copié", es: "Copiado" }
    : { ko: "결과 링크 복사", en: "Copy result link", ja: "結果リンクをコピー", zh: "复制结果链接", fr: "Copier le lien", es: "Copiar enlace" };
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          gaEvent("share_click", { test_id: testId, share_surface: "copy" });
        } catch {
          setCopied(false);
        }
      }}
    >
      {pick(label, l)}
    </Button>
  );
}

export function Sources({ l, items }: { l: L; items: { label: string; url: string }[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      {pick({ ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" }, l)}:{" "}
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

export function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-bold text-muted-foreground">{label}</h2>
      <div className="mt-2 space-y-1 text-sm text-foreground">{children}</div>
    </section>
  );
}
