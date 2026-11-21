// 수능 끝, 흥미 코드 두 개로 어울리는 계열 보기 (2026-11-21). 계산: lib/riasec-majors.ts
import { useState } from "react";
import { gaEventOnce } from "@/lib/analytics/ga-event";
import { RIASEC, RIASEC_KO, rankMajors, type Riasec } from "@/lib/riasec-majors";

export default function SuneungMajorPicker({ fullTestHref }: { fullTestHref: string }) {
  const [first, setFirst] = useState<Riasec | null>(null);
  const [second, setSecond] = useState<Riasec | null>(null);
  const choose = (c: Riasec) => {
    gaEventOnce("tool_used", { tool_id: "suneung-major-picker" });
    if (!first || (first && second)) { setFirst(c); setSecond(null); return; }
    if (c === first) return;
    setSecond(c);
  };
  const ranked = first ? rankMajors(first, second) : [];
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-black text-foreground">가장 끌리는 것 두 개를 순서대로 고르세요</h2>
      <p className="text-sm text-muted-foreground">먼저 고른 것이 1순위예요. 다시 고르면 처음부터 시작해요.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {RIASEC.map((c) => {
          const rank = c === first ? 1 : c === second ? 2 : 0;
          return (
            <button key={c} type="button" aria-pressed={rank > 0} onClick={() => choose(c)}
              className={"min-h-11 rounded-xl border p-3 text-left transition-colors " + (rank ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-muted")}>
              <span className="text-sm font-black text-foreground">{rank ? `${rank}순위 · ` : ""}{RIASEC_KO[c].name} ({c})</span>
              <span className="mt-1 block text-xs text-muted-foreground">{RIASEC_KO[c].like}</span>
            </button>
          );
        })}
      </div>
      {first && (
        <div aria-live="polite" className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            {RIASEC_KO[first].name}{second ? ` + ${RIASEC_KO[second].name}` : ""}에 어울리는 계열이에요.
          </p>
          <ol className="space-y-2">
            {ranked.map((g, i) => (
              <li key={g.field} className="rounded-xl border border-border bg-background p-3">
                <p className="text-sm font-black text-foreground">{i + 1}. {g.field}</p>
                <p className="mt-1 text-xs text-muted-foreground">{g.majors.join(" · ")}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-muted-foreground">짧게 고른 결과라 참고용이에요. 정확한 흥미 코드는 <a className="font-semibold text-primary underline" href={fullTestHref}>RIASEC 직업 흥미 검사</a>로 확인해 보세요.</p>
        </div>
      )}
    </div>
  );
}
