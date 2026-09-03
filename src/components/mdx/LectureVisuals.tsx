import { inlineMd } from '../../lib/utils';

/**
 * 강의형 본문의 표·단계·막대그래프.
 *
 * blog 에서 옮겨 오면서 세 가지를 고쳤다(2026-09-03 주제 정렬 4단계).
 *
 *  1) LectureBarChart 와 LecturePieChart 가 자리표시자였다. MDX 가 labels·values 를
 *     넘기는데도 버리고 "(Please use <BarChart /> for actual rendering)" 이라는
 *     작성용 메모를 독자에게 그대로 보여 주고 있었다. blog 라이브에서도 그랬다.
 *     받은 데이터로 실제 막대를 그린다.
 *  2) 표 셀의 **강조** 가 문자 그대로 나왔다. 셀은 마크다운 파서를 거치지 않으므로
 *     inlineMd 를 통과시킨다 — CompareTable·StatCards 가 쓰는 것과 같은 방식이다.
 *  3) 색을 하드코딩(#e2e8f0·#3b82f6·#eff6ff)에서 oiyo 토큰으로 바꿨다.
 */

interface TableProps {
  title?: string;
  headers?: string[];
  rows?: string[][];
  highlightColumns?: number[];
}

const md = (s: unknown) => ({ __html: inlineMd(String(s ?? '')) });

export function LectureTable({ title, headers, rows, highlightColumns = [] }: TableProps) {
  return (
    <div className="my-10 overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full border-collapse text-left text-[0.95rem]">
        {title && (
          <caption className="border-b-2 border-border bg-surface-subtle px-6 py-5 text-left text-lg font-bold text-foreground">
            {title}
          </caption>
        )}
        {headers?.length ? (
          <thead className="bg-muted">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="whitespace-nowrap border-b-2 border-border px-6 py-4 font-semibold text-muted-foreground" dangerouslySetInnerHTML={md(h)} />
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows?.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-6 py-4 leading-relaxed text-foreground ${
                    highlightColumns.includes(j) ? 'bg-surface-subtle font-medium' : ''
                  }`}
                  dangerouslySetInnerHTML={md(c)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProcessProps {
  title?: string;
  steps?: { label: string; description?: string }[];
}

export function LectureProcess({ title, steps }: ProcessProps) {
  return (
    <div className="my-10 rounded-2xl border border-border bg-card p-8 shadow-sm">
      {title && <h4 className="mb-8 mt-0 text-center text-xl font-bold text-foreground">{title}</h4>}
      <div className="flex flex-col gap-6">
        {steps?.map((step, i) => (
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="my-2 w-0.5 grow bg-primary/25" />}
            </div>
            <div className={i < steps.length - 1 ? 'pb-6' : ''}>
              <strong className="mb-1.5 block text-[1.05rem] text-foreground" dangerouslySetInnerHTML={md(step.label)} />
              {step.description && (
                <p className="m-0 text-[0.95rem] leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={md(step.description)} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChartProps {
  title?: string;
  labels?: string[];
  values?: number[];
  unit?: string;
}

/** 가로 막대. 값의 최대치를 100%로 잡는다. 축 눈금 대신 값을 막대 끝에 적는다. */
export function LectureBarChart({ title, labels, values, unit = '' }: ChartProps) {
  const rows = (labels ?? []).map((label, i) => ({ label, value: values?.[i] ?? 0 }));
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <figure className="my-10 rounded-2xl border border-border bg-card p-6">
      {title && <figcaption className="mb-5 font-bold text-foreground">{title}</figcaption>}
      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground" dangerouslySetInnerHTML={md(r.label)} />
              <span className="shrink-0 font-semibold tabular-nums text-foreground">{r.value}{unit}</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** 원 그래프 대신 비율 목록으로 그린다 — 값의 합을 분모로 쓴다. */
export function LecturePieChart({ title, labels, values, unit = '%' }: ChartProps) {
  const rows = (labels ?? []).map((label, i) => ({ label, value: values?.[i] ?? 0 }));
  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <figure className="my-10 rounded-2xl border border-border bg-card p-6">
      {title && <figcaption className="mb-5 font-bold text-foreground">{title}</figcaption>}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {rows.map((r, i) => (
          <div key={i} className="h-full" style={{ width: `${(r.value / total) * 100}%`, backgroundColor: `color-mix(in oklab, var(--primary) ${100 - i * 14}%, var(--card))` }} />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {rows.map((r, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-muted-foreground" dangerouslySetInnerHTML={md(r.label)} />
            <span className="shrink-0 font-semibold tabular-nums text-foreground">{Math.round((r.value / total) * 100)}{unit}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
