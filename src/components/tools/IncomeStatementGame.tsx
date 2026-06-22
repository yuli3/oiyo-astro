import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  ACCOUNT_ITEMS,
  LINES,
  SUBTOTAL_LABELS,
  computeSubtotals,
  sumLine,
  type AccountItem,
  type LineId,
  type LStr,
} from "../../lib/finance/income-statement";

function t(s: LStr, locale: Locale): string {
  return s[locale] ?? s.en ?? s.ko ?? "";
}
function won(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n) + "원";
}

const UI: Record<string, LStr> = {
  intro: { ko: "각 계정과목을 올바른 손익계산서 줄로 분류하세요.", en: "Classify each account into the right income-statement line.", ja: "各勘定科目を正しい損益計算書の行に分類しましょう。", zh: "把每个会计科目分到正确的损益表行。", fr: "Classez chaque compte sur la bonne ligne du compte de résultat.", es: "Clasifica cada cuenta en la línea correcta del estado de resultados." },
  classify: { ko: "어느 줄에 들어갈까요?", en: "Which line?", ja: "どの行に入る？", zh: "属于哪一行？", fr: "Sur quelle ligne ?", es: "¿En qué línea?" },
  correct: { ko: "정답!", en: "Correct!", ja: "正解！", zh: "正确！", fr: "Correct !", es: "¡Correcto!" },
  wrong: { ko: "다시 생각해보세요.", en: "Try again.", ja: "もう一度考えてみましょう。", zh: "再想想。", fr: "Réessayez.", es: "Inténtalo de nuevo." },
  score: { ko: "점수", en: "Score", ja: "スコア", zh: "分数", fr: "Score", es: "Puntuación" },
  done: { ko: "완성! 손익계산서가 만들어졌어요.", en: "Done! The income statement is complete.", ja: "完成！損益計算書ができました。", zh: "完成！损益表已生成。", fr: "Terminé ! Le compte de résultat est complet.", es: "¡Listo! El estado de resultados está completo." },
  reset: { ko: "다시 하기", en: "Play again", ja: "もう一度", zh: "再玩一次", fr: "Rejouer", es: "Jugar de nuevo" },
  statement: { ko: "손익계산서", en: "Income statement", ja: "損益計算書", zh: "损益表", fr: "Compte de résultat", es: "Estado de resultados" },
  firstTry: { ko: "한 번에 맞힌 개수", en: "First-try correct", ja: "一発正解", zh: "一次答对", fr: "Réussites du 1er coup", es: "Aciertos al primer intento" },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function IncomeStatementGame({ locale }: { locale: Locale }) {
  const [order] = useState(() => shuffle(ACCOUNT_ITEMS).map((i) => i.id));
  const [placed, setPlaced] = useState<Set<string>>(new Set());
  const [firstTry, setFirstTry] = useState(0);
  const [tried, setTried] = useState<Set<string>>(new Set()); // items with a wrong attempt
  const [feedback, setFeedback] = useState("");

  const placedItems = useMemo(() => ACCOUNT_ITEMS.filter((i) => placed.has(i.id)), [placed]);
  const sub = computeSubtotals(placedItems);
  const lineDone = (line: LineId) => ACCOUNT_ITEMS.filter((i) => i.line === line).every((i) => placed.has(i.id));
  const allDone = placed.size === ACCOUNT_ITEMS.length;

  const remaining = order.map((id) => ACCOUNT_ITEMS.find((i) => i.id === id)!).filter((i) => !placed.has(i.id));
  const current = remaining[0]; // classify one at a time

  function pick(item: AccountItem, line: LineId) {
    if (line === item.line) {
      setPlaced((p) => new Set(p).add(item.id));
      if (!tried.has(item.id)) setFirstTry((n) => n + 1);
      setFeedback(t(UI.correct, locale));
    } else {
      setTried((s) => new Set(s).add(item.id));
      setFeedback(t(UI.wrong, locale));
    }
  }
  function reset() {
    setPlaced(new Set()); setFirstTry(0); setTried(new Set()); setFeedback("");
  }

  // progressive subtotal visibility
  const showGross = lineDone("revenue") && lineDone("cogs");
  const showOp = showGross && lineDone("sga");
  const showPretax = showOp && lineDone("nonop_income") && lineDone("nonop_expense");
  const showNet = showPretax && lineDone("tax");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Game panel */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{placed.size} / {ACCOUNT_ITEMS.length}</span>
          <span className="text-sm font-semibold">{t(UI.firstTry, locale)}: {firstTry}/{ACCOUNT_ITEMS.length}</span>
        </div>
        <p aria-live="polite" className="mb-3 min-h-5 text-sm font-medium text-primary">{feedback}</p>

        {current ? (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{t(UI.classify, locale)}</p>
            <p className="mb-4 mt-1 text-lg font-extrabold">
              {t(current.name, locale)} <span className="text-base font-bold text-muted-foreground">{won(current.amount)}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {LINES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => pick(current, l.id)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t(l.label, locale)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center">
            <p className="text-lg font-extrabold text-primary">🎉 {t(UI.done, locale)}</p>
            <p className="mt-1 text-sm text-foreground">{t(UI.firstTry, locale)}: {firstTry}/{ACCOUNT_ITEMS.length}</p>
            <button onClick={reset} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              {t(UI.reset, locale)}
            </button>
          </div>
        )}
      </div>

      {/* Live statement */}
      <div className="rounded-2xl border border-border bg-card p-5" aria-label={t(UI.statement, locale)}>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">{t(UI.statement, locale)}</h3>
        <dl className="space-y-1.5 text-sm">
          <Row label={t(LINES[0].label, locale)} value={lineDone("revenue") ? won(sumLine(placedItems, "revenue")) : "—"} />
          <Row label={"(−) " + t(LINES[1].label, locale)} value={lineDone("cogs") ? won(sumLine(placedItems, "cogs")) : "—"} muted />
          <Sub label={t(SUBTOTAL_LABELS[0].label, locale)} value={won(sub.grossProfit)} show={showGross} />
          <Row label={"(−) " + t(LINES[2].label, locale)} value={lineDone("sga") ? won(sumLine(placedItems, "sga")) : "—"} muted />
          <Sub label={t(SUBTOTAL_LABELS[1].label, locale)} value={won(sub.operatingProfit)} show={showOp} />
          <Row label={"(+) " + t(LINES[3].label, locale)} value={lineDone("nonop_income") ? won(sumLine(placedItems, "nonop_income")) : "—"} muted />
          <Row label={"(−) " + t(LINES[4].label, locale)} value={lineDone("nonop_expense") ? won(sumLine(placedItems, "nonop_expense")) : "—"} muted />
          <Sub label={t(SUBTOTAL_LABELS[2].label, locale)} value={won(sub.pretaxProfit)} show={showPretax} />
          <Row label={"(−) " + t(LINES[5].label, locale)} value={lineDone("tax") ? won(sumLine(placedItems, "tax")) : "—"} muted />
          <Sub label={t(SUBTOTAL_LABELS[3].label, locale)} value={won(sub.netProfit)} show={showNet} emphasize />
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
function Sub({ label, value, show, emphasize }: { label: string; value: string; show: boolean; emphasize?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md px-2 py-1.5 transition-colors ${
        show ? (emphasize ? "bg-accent/20" : "bg-primary/10") : "opacity-40"
      }`}
    >
      <dt className={`font-bold ${emphasize ? "text-accent-foreground" : "text-primary"}`}>= {label}</dt>
      <dd className={`font-extrabold tabular-nums ${emphasize ? "text-accent-foreground" : "text-primary"}`}>{show ? value : "—"}</dd>
    </div>
  );
}
