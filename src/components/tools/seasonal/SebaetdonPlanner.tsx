import { useMemo, useState } from 'react';

import ShareResultButton from '../../shared/ShareResultButton';
import { gaEvent } from '@/lib/analytics/ga-event';
import {
  AMOUNT_CHOICES,
  BILLS,
  BLESSINGS,
  planSebaetdon,
  RECIPIENT_GROUPS,
  SEBAETDON_LIMIT,
  SEOL_YEAR,
  won,
  type Blessing,
  type PlanRow,
} from '@/lib/sebaetdon';

// 2027 설날 세뱃돈 봉투 계획 (ko 전용). 고른 금액만 계산하고 이 브라우저 밖으로 보내지 않는다.

const stepBtn = 'flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-lg font-bold text-foreground';

const BLESSING_KIND: Record<string, Blessing['forGroup']> = {
  preschool: 'child',
  elementary: 'child',
  teen: 'teen',
  adult: 'adult',
  parents: 'elder',
};

export default function SebaetdonPlanner() {
  const [rows, setRows] = useState<PlanRow[]>(() =>
    RECIPIENT_GROUPS.map((g) => ({ groupId: g.id, count: 0, amount: g.id === 'parents' ? 100000 : 30000 })),
  );
  const [use50k, setUse50k] = useState(true);
  const [tracked, setTracked] = useState(false);

  const result = useMemo(() => planSebaetdon(rows, use50k), [rows, use50k]);

  function update(groupId: string, patch: Partial<PlanRow>) {
    setRows((prev) => prev.map((r) => (r.groupId === groupId ? { ...r, ...patch } : r)));
    if (!tracked) {
      setTracked(true);
      gaEvent('sebaetdon_plan_start', {});
    }
  }

  const blessingsShown = result.byGroup.map((g) => {
    const kind = BLESSING_KIND[g.groupId];
    return { groupId: g.groupId, lines: BLESSINGS.filter((b) => b.forGroup === kind) };
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5" aria-label="세뱃돈 봉투 고르기">
        <h2 className="text-lg font-black text-foreground">누구에게, 얼마씩</h2>
        <p className="mt-1 text-sm text-muted-foreground">인원은 −/+ 로, 봉투 한 장 금액은 목록에서 골라요.</p>
        <ul className="mt-4 space-y-3">
          {RECIPIENT_GROUPS.map((g) => {
            const row = rows.find((r) => r.groupId === g.id)!;
            return (
              <li key={g.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-bold text-foreground">
                  <span aria-hidden="true">{g.emoji}</span> {g.label}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" className={stepBtn} aria-label={`${g.label} 한 명 빼기`} onClick={() => update(g.id, { count: Math.max(0, row.count - 1) })}>
                    −
                  </button>
                  <span className="min-w-12 text-center text-base font-black text-foreground" aria-live="polite">
                    {row.count}명
                  </span>
                  <button type="button" className={stepBtn} aria-label={`${g.label} 한 명 더하기`} onClick={() => update(g.id, { count: Math.min(30, row.count + 1) })}>
                    +
                  </button>
                  <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    한 장
                    <select
                      className="min-h-11 rounded-xl border border-border bg-background px-3 text-base text-foreground"
                      value={row.amount}
                      onChange={(e) => update(g.id, { amount: Number(e.target.value) })}
                    >
                      {AMOUNT_CHOICES.map((a) => (
                        <option key={a} value={a}>
                          {won(a)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm text-foreground">
          <input type="checkbox" className="size-5" checked={use50k} onChange={(e) => setUse50k(e.target.checked)} />
          5만 원권 쓰기 (끄면 1만 원권으로만 나눠요)
        </label>
      </section>

      <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5" aria-live="polite" aria-label="계산 결과">
        <p className="text-xs font-bold tracking-widest text-primary">{SEOL_YEAR} 설날 세뱃돈 봉투</p>
        {result.envelopes === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">인원을 한 명 이상 넣으면 합계와 바꿀 신권 장수가 나와요.</p>
        ) : (
          <>
            <p className="mt-3 text-3xl font-black text-foreground">{won(result.total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">봉투 {result.envelopes}장</p>
            <h3 className="mt-5 text-sm font-black text-foreground">은행에서 바꿀 신권</h3>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {BILLS.filter((b) => result.bills[b] > 0).map((b) => (
                <li key={b} className="rounded-xl bg-card p-3 text-foreground">
                  <strong>{won(b)}권</strong> {result.bills[b]}장
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-black text-foreground">봉투별</h3>
            <ul className="mt-2 space-y-1 text-sm text-foreground">
              {result.byGroup.map((g) => {
                const meta = RECIPIENT_GROUPS.find((x) => x.id === g.groupId)!;
                return (
                  <li key={g.groupId}>
                    {meta.emoji} {meta.label}: {won(g.amount)} × {g.count} = <strong>{won(g.subtotal)}</strong>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {blessingsShown.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-label="봉투에 쓸 덕담">
          <h2 className="text-lg font-black text-foreground">봉투에 쓸 덕담</h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground">
            {blessingsShown.map((b) => {
              const meta = RECIPIENT_GROUPS.find((x) => x.id === b.groupId)!;
              return (
                <li key={b.groupId}>
                  <strong>
                    {meta.emoji} {meta.label}
                  </strong>
                  {b.lines.map((l) => (
                    <p key={l.id} className="mt-1 text-muted-foreground">
                      “{l.line}”
                    </p>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {result.envelopes > 0 && (
        <ShareResultButton
          locale="ko"
          heading={`${SEOL_YEAR} 설날 세뱃돈 봉투 계획`}
          resultTitle={`봉투 ${result.envelopes}장`}
          emoji="🧧"
          description="누구에게 얼마씩, 신권 몇 장 바꿀지 한 번에"
          analyticsId="sebaetdon-2027"
        />
      )}

      <p className="rounded-xl border border-border p-4 text-xs leading-5 text-muted-foreground">{SEBAETDON_LIMIT}</p>
    </div>
  );
}
