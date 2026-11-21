// 2027 お正月(ja) / 春节(zh) 나이·띠 카드 (2026-11-21). 계산: lib/new-year-zodiac.ts
import { useState } from "react";
import { gaEventOnce } from "@/lib/analytics/ga-event";
import { ANIMAL_JA, BRANCH_JA, branchIndex, ganzhi, shengxiao, yakudoshi, type Sex } from "@/lib/new-year-zodiac";

const field = "min-h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground";

function Ja() {
  const [year, setYear] = useState(1990);
  const [sex, setSex] = useState<Sex>("f");
  const y = Math.min(2026, Math.max(1927, year || 1990));
  const yk = yakudoshi(y, sex);
  const toshi = branchIndex(y) === branchIndex(2027);
  const kind = yk.kind === "hon" ? "本厄" : yk.kind === "mae" ? "前厄" : yk.kind === "ato" ? "後厄" : null;
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-black text-foreground">2027年のあなた（生まれ年で確認）</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-muted-foreground">生まれ年
          <input type="number" inputMode="numeric" min={1927} max={2026} value={year} onChange={(e) => { setYear(Number(e.target.value)); gaEventOnce("tool_used", { tool_id: "oshogatsu-2027" }); }} className={field} />
        </label>
        <fieldset className="text-sm text-muted-foreground">
          <legend>厄年の基準</legend>
          <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
            {(["f", "m"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={sex === s} onClick={() => setSex(s)} className={"min-h-11 rounded-md text-sm " + (sex === s ? "bg-background font-bold text-foreground" : "text-muted-foreground")}>{s === "f" ? "女性" : "男性"}</button>
            ))}
          </div>
        </fieldset>
      </div>
      <dl aria-live="polite" className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[["干支", `${ganzhi(y)}（${ANIMAL_JA[branchIndex(y)]}）`], ["2027年の満年齢", `${2027 - y - 1}〜${2027 - y}歳`], ["数え年", `${yk.kazoe}歳`], ["厄年", kind ? `${kind}${yk.taiyaku ? "（大厄）" : ""}` : "なし"]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-background p-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 text-sm font-bold text-foreground">{v}</dd></div>
        ))}
      </dl>
      <p className="text-sm text-foreground">{toshi ? "2027年は年男・年女です。年賀状にひとこと添えてみては。" : `2027年の干支は丁未（ひつじ）。あなたの${BRANCH_JA[branchIndex(y)]}年は次に${2027 + ((branchIndex(y) - branchIndex(2027) + 12) % 12)}年に巡ってきます。`}</p>
      <p className="text-xs text-muted-foreground">厄年は数え年で数え、地域や寺社によって年齢が少し違うことがあります。参拝先の案内も確認してください。</p>
    </div>
  );
}

function Zh() {
  const [birth, setBirth] = useState("1991-02-10");
  const r = shengxiao(birth);
  const benming = r ? branchIndex(r.lunarYear) === branchIndex(2027) : false;
  const xusui = r ? 2027 - r.lunarYear + 1 : null;
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-black text-foreground">输入生日，看看 2027 羊年的你</h2>
      <label className="block text-sm text-muted-foreground">出生日期（公历）
        <input type="date" min="1940-01-01" max="2030-12-31" value={birth} onChange={(e) => { setBirth(e.target.value); gaEventOnce("tool_used", { tool_id: "chunjie-2027" }); }} className={field} />
      </label>
      {r ? (
        <dl aria-live="polite" className="grid grid-cols-3 gap-2 text-center">
          {[["生肖", r.animal], ["春节后的虚岁", `${xusui}岁`], ["2027 本命年", benming ? "是" : "否"]].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-background p-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 text-base font-bold text-foreground">{v}</dd></div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">请输入 1940–2030 年之间的日期。</p>
      )}
      <p className="text-xs text-muted-foreground">生肖以春节（农历正月初一）为界：春节前出生的人属上一年的生肖。也有以立春为界的说法。</p>
    </div>
  );
}

export default function NewYear2027Card({ lang }: { lang: "ja" | "zh" }) {
  return lang === "ja" ? <Ja /> : <Zh />;
}
