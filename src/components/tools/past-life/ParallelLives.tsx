import { useEffect, useState } from "react";
import { localePath, type Locale } from "../../../i18n";
import { gaEvent } from "../../../lib/analytics/ga-event";
import { EPISODES } from "../../../lib/past-life-1426";
import { EPISODE_YEAR, LIVES_KEY, span, timeline, type Life } from "../../../lib/timeslip-lives";
import { Button } from "../../ui/button";
import { numberFormat, pick, toL, type L, type Six } from "./shared";
import { EPISODE_LABELS, readLives } from "./timeslip";

const C = {
  title: { ko: "나의 평행 인생 연표", en: "My parallel lives", ja: "わたしの並行人生年表", zh: "我的平行人生年表", fr: "Mes vies parallèles", es: "Mis vidas paralelas" },
  summary: { ko: "{years}년에 걸친 {n}번의 삶", en: "{n} lives across {years} years", ja: "{years}年にわたる{n}つの人生", zh: "跨越{years}年的{n}段人生", fr: "{n} vies sur {years} ans", es: "{n} vidas en {years} años" },
  summaryOne: { ko: "아직 한 번의 삶. 다른 시대도 다녀와 보세요.", en: "One life so far. Visit another era.", ja: "まだ一つの人生。別の時代へも。", zh: "目前只有一段人生，去别的时代看看吧。", fr: "Une seule vie pour l'instant. Visitez une autre époque.", es: "Una vida por ahora. Visita otra época." },
  empty: { ko: "아직 연표가 비어 있어요. 회차 하나를 해 보면 여기에 그 시대의 내가 쌓여요.", en: "Your timeline is empty. Play any episode and that era's you appears here.", ja: "年表はまだ空です。どれか一話を遊ぶと、その時代のわたしがここに積み上がります。", zh: "年表还是空的。玩任意一集，那个时代的你就会出现在这里。", fr: "Votre frise est vide. Jouez un épisode et votre vie de cette époque apparaîtra ici.", es: "Tu línea está vacía. Juega un episodio y tu yo de esa época aparecerá aquí." },
  start: { ko: "첫 회차 고르기", en: "Pick an episode", ja: "最初の話を選ぶ", zh: "选一集开始", fr: "Choisir un épisode", es: "Elegir un episodio" },
  open: { ko: "다시 보기", en: "Open", ja: "見る", zh: "查看", fr: "Ouvrir", es: "Abrir" },
  missing: { ko: "아직 안 가 본 시대", en: "Eras not yet visited", ja: "まだ行っていない時代", zh: "还没去过的时代", fr: "Époques à visiter", es: "Épocas por visitar" },
  save: { ko: "연표 이미지로 저장", en: "Save timeline image", ja: "年表を画像で保存", zh: "保存年表图片", fr: "Enregistrer la frise", es: "Guardar la línea" },
  saved: { ko: "저장했어요", en: "Saved", ja: "保存しました", zh: "已保存", fr: "Enregistré", es: "Guardado" },
  clear: { ko: "연표 지우기", en: "Clear timeline", ja: "年表を消す", zh: "清空年表", fr: "Effacer la frise", es: "Borrar la línea" },
  note: { ko: "연표는 이 브라우저에만 저장돼요. 친구가 보낸 링크로 본 결과는 들어가지 않아요. 회차마다 가장 최근 결과 하나만 남아요.", en: "Stored in this browser only. Results you only viewed from a friend's link are not added. Each episode keeps your latest result.", ja: "年表はこのブラウザにだけ保存されます。友だちのリンクで見た結果は入りません。各話は最新の結果だけが残ります。", zh: "年表只保存在此浏览器。通过朋友链接看到的结果不会加入。每集只保留最新结果。", fr: "Stockée dans ce navigateur uniquement. Les résultats vus via le lien d'un ami ne sont pas ajoutés. Chaque épisode garde votre dernier résultat.", es: "Se guarda solo en este navegador. Los resultados vistos desde el enlace de un amigo no se añaden. Cada episodio guarda tu último resultado." },
  today: { ko: "오늘", en: "Today", ja: "今日", zh: "今天", fr: "Aujourd'hui", es: "Hoy" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const yearLabel = (life: Life, l: L) => (life.ep === "us-birth-state" ? pick(C.today, l) : String(EPISODE_YEAR[life.ep]));

function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

export function renderTimeline(list: Life[], l: L, heading: string, sub: string): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily || "serif";
  ctx.fillStyle = "#f3ead6";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#2b1708";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.fillStyle = "#2b1708";
  ctx.font = `900 64px ${font}`;
  ctx.fillText(fit(ctx, heading, W - 160), 80, 150);
  ctx.font = `700 34px ${font}`;
  ctx.fillStyle = "#6b4a2b";
  ctx.fillText(fit(ctx, sub, W - 160), 80, 205);

  const rows = list.slice(0, 12);
  const top = 280;
  const bottom = H - 130;
  const step = Math.min(150, (bottom - top) / Math.max(rows.length, 1));
  const lineX = 260;
  ctx.strokeStyle = "rgba(43,23,8,.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lineX, top - 10);
  ctx.lineTo(lineX, top + step * (rows.length - 1) + 30);
  ctx.stroke();
  rows.forEach((life, i) => {
    const y = top + i * step + 20;
    ctx.fillStyle = life.accent;
    ctx.beginPath();
    ctx.arc(lineX, y - 12, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "right";
    ctx.fillStyle = "#2b1708";
    ctx.font = `900 40px ${font}`;
    ctx.fillText(yearLabel(life, l), lineX - 34, y);
    ctx.textAlign = "left";
    ctx.font = `900 ${step < 100 ? 34 : 42}px ${font}`;
    ctx.fillStyle = life.accent;
    ctx.fillText(fit(ctx, life.title, W - lineX - 120), lineX + 40, y);
    if (step >= 90) {
      ctx.font = `700 26px ${font}`;
      ctx.fillStyle = "#6b4a2b";
      ctx.fillText(fit(ctx, pick(EPISODE_LABELS[life.ep].label, l), W - lineX - 120), lineX + 40, y + 40);
    }
  });
  ctx.font = `700 28px ${font}`;
  ctx.fillStyle = "#6b4a2b";
  ctx.textAlign = "center";
  ctx.fillText("oiyo.net", W / 2, H - 72);
  return canvas;
}

export default function ParallelLives({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [list, setList] = useState<Life[] | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setList(timeline(readLives()));
  }, []);

  if (!list) return null;
  const years = span(list);
  const sub = list.length > 1 ? fill(pick(C.summary, l), { n: list.length, years: fmt.format(years) }) : pick(C.summaryOne, l);
  const missing = EPISODES.filter((e) => !list.some((x) => x.ep === e));

  if (list.length === 0) {
    return (
      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 text-center shadow-md">
        <p className="text-base leading-relaxed text-foreground">{pick(C.empty, l)}</p>
        <Button asChild size="lg" className="w-full">
          <a href={localePath(locale, "/past-life-1426")}>{pick(C.start, l)}</a>
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-md">
        <p className="text-center text-lg font-black text-foreground">{sub}</p>
        <ol className="mt-5 space-y-0">
          {list.map((life) => (
            <li key={life.ep} className="timeslip-lives-row">
              <span className="timeslip-lives-year">{yearLabel(life, l)}</span>
              <div className="min-w-0 flex-1 pb-5">
                <a href={`${localePath(locale, `/${life.ep}`)}${life.query}`} className="block rounded-xl px-2 py-1 hover:bg-muted">
                  <span className="block text-base font-black text-foreground">{life.title}</span>
                  {life.subtitle && <span className="block text-sm text-muted-foreground">{life.subtitle}</span>}
                  <span className="block text-xs font-bold text-muted-foreground">
                    <span aria-hidden="true">{EPISODE_LABELS[life.ep].icon}</span> {pick(EPISODE_LABELS[life.ep].label, l)} · {pick(C.open, l)} →
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Button
        variant="outline"
        className="w-full"
        onClick={async () => {
          if (document.fonts?.ready) await document.fonts.ready;
          const canvas = renderTimeline(list, l, pick(C.title, l), sub);
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
          if (!blob) return;
          const file = new File([blob], "oiyo-parallel-lives.png", { type: "image/png" });
          let surface = "download";
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: pick(C.title, l) });
              surface = "share";
            } else throw new Error("no share");
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
          setSaved(true);
          gaEvent("card_saved", { test_id: "parallel-lives", share_surface: surface });
        }}
      >
        {pick(saved ? C.saved : C.save, l)}
      </Button>

      {missing.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-bold text-muted-foreground">{pick(C.missing, l)}</h2>
          <ul className="mt-3 grid gap-2">
            {missing.map((e) => (
              <li key={e}>
                <a href={localePath(locale, `/${e}`)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 font-bold text-foreground hover:bg-muted">
                  <span aria-hidden="true">{EPISODE_LABELS[e].icon}</span> {pick(EPISODE_LABELS[e].label, l)}
                  <span className="ml-auto text-xs text-muted-foreground">{EPISODE_YEAR[e] === 2026 ? pick(C.today, l) : EPISODE_YEAR[e]}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.note, l)}</p>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          try {
            localStorage.removeItem(LIVES_KEY);
          } catch {
            /* best effort */
          }
          setList([]);
        }}
      >
        {pick(C.clear, l)}
      </Button>
    </div>
  );
}
