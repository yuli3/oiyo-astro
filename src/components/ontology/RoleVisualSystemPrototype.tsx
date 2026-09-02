import { BookmarkCheck, Compass, Share2, Target, Users } from "lucide-react";
import { useMemo, useReducer, useState } from "react";
import type { CSSProperties } from "react";

import copy from "../../../config/role-visual-system-v1.copy.json";
import fixtures from "../../../config/role-visual-system-v1.fixtures.json";
import {
  classifyRoleVisual,
  resolveRoleVisualLiveMessage,
  ROLE_VISUAL_TOKENS,
  transitionRoleVisualInteraction,
  type RoleAidIcon,
  type RoleVisualInput,
  type RoleVisualStatus,
} from "../../lib/role-visual-system";

const ROLE_AID_ICON: Record<RoleAidIcon, typeof Compass> = { compass: Compass, target: Target, users: Users };

type Locale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type ScenarioId = "clear" | "mixed" | "tie" | "low-flat" | "uncertain";
export function RoleVisualSystemPrototype({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [scenarioId, setScenarioId] = useState<ScenarioId>("clear");
  const [interactionState, dispatchInteraction] = useReducer(transitionRoleVisualInteraction, "idle");
  const scenario = fixtures.scenarios.find(({ id }) => id === scenarioId) ?? fixtures.scenarios[0];
  const result = useMemo(
    () => classifyRoleVisual(scenario.input as RoleVisualInput),
    [scenario],
  );
  const status = text.statuses[result.status as RoleVisualStatus];

  return (
    <section
      className="role-visual mt-8 rounded-3xl border bg-card p-4 text-slate-950 shadow-sm sm:p-6"
      style={{
        "--role-primary": ROLE_VISUAL_TOKENS.primary,
        "--role-soft": ROLE_VISUAL_TOKENS.primarySoft,
        "--role-focus": ROLE_VISUAL_TOKENS.focusRing,
      } as CSSProperties}
      aria-labelledby="role-visual-title"
      aria-describedby="role-visual-note"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--role-soft)] text-[var(--role-primary)]" aria-hidden="true">
          <Compass size={24} strokeWidth={2} />
        </span>
        <div>
          <h2 id="role-visual-title" className="text-lg font-black text-slate-950">{text.title}</h2>
          <p id="role-visual-note" className="mt-1 text-sm leading-6 text-slate-600">{text.note}</p>
        </div>
      </div>

      <label className="mt-5 block text-sm font-bold text-slate-900">
        {text.scenarioLabel}
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-400 bg-card px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-focus)]"
          value={scenarioId}
          onChange={(event) => {
            setScenarioId(event.target.value as ScenarioId);
            dispatchInteraction({ type: "reset", trigger: "scenario-change" });
          }}
        >
          {(Object.keys(text.scenarios) as ScenarioId[]).map((id) => <option key={id} value={id}>{text.scenarios[id]}</option>)}
        </select>
      </label>

      <div className="mt-5 rounded-2xl border-2 border-[var(--role-primary)] bg-[var(--role-soft)] p-4" role="status" aria-live="polite">
        <p className="text-base font-black text-slate-950">{status.label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{status.body}</p>
        <p className="mt-2 text-xs font-bold text-slate-700">
          {text.coverage}: {Math.round(result.dataCoverage * 100)}% · {text.confidence}: {Math.round(result.averageConfidence * 100)}%
        </p>
      </div>

      <div className="mt-5 space-y-4" aria-label={text.score}>
        {result.ranked.map((dimension) => (
          <div key={dimension.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-bold text-slate-900">{text.dimensions[dimension.id as keyof typeof text.dimensions]}</span>
              <span className="tabular-nums text-slate-700">{text.score} {dimension.score}/100 · {text.confidence} {Math.round(dimension.confidence * 100)}%</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label={`${text.dimensions[dimension.id as keyof typeof text.dimensions]} ${text.score}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={dimension.score}
              aria-valuetext={`${dimension.score}/100`}
            >
              <div className="role-score-bar h-full rounded-full bg-[var(--role-primary)]" style={{ width: `${dimension.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {result.roleAid && (() => {
        const RoleIcon = ROLE_AID_ICON[result.roleAid.icon];
        const name = text.roleAidNames[result.roleAid.dimensionId as keyof typeof text.roleAidNames];
        return (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-3">
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--role-soft)] text-[var(--role-primary)]">
              <RoleIcon size={18} strokeWidth={2} />
            </span>
            <p className="text-sm text-slate-800">
              <span aria-hidden="true" className="mr-1">{result.roleAid.emoji}</span>
              <strong>{text.roleAid}:</strong> {name}
            </p>
          </div>
        );
      })()}

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3"><dt className="font-black text-slate-950">{text.strengthTitle}</dt><dd className="mt-1 text-sm leading-6 text-slate-700">{text.strength}</dd></div>
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3"><dt className="font-black text-slate-950">{text.cautionTitle}</dt><dd className="mt-1 text-sm leading-6 text-slate-700">{text.caution}</dd></div>
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-3"><dt className="font-black text-slate-950">{text.actionTitle}</dt><dd className="mt-1 text-sm leading-6 text-slate-700">{text.action}</dd></div>
      </dl>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--role-primary)] px-4 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-focus)]"
          aria-pressed={interactionState === "saved"}
          onClick={() => dispatchInteraction({ type: "activate", target: "saved", trigger: "click" })}
        ><BookmarkCheck size={18} aria-hidden="true" />{text.save}</button>
        <button
          type="button"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--role-primary)] bg-card px-4 font-bold text-[var(--role-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--role-focus)]"
          aria-pressed={interactionState === "shared"}
          onClick={() => dispatchInteraction({ type: "activate", target: "shared", trigger: "click" })}
        ><Share2 size={18} aria-hidden="true" />{text.share}</button>
      </div>
      <p className="mt-3 text-sm text-slate-700" aria-live="polite">
        {resolveRoleVisualLiveMessage(interactionState, { idle: text.idle, saved: text.saved, shared: text.shared })}
      </p>

      <style>{`
        .role-score-bar { transition: width 240ms ease-out; }
        /* The reduced-motion block that used to live here is now global —
           see the motion contract in src/styles/global.css. */
      `}</style>
    </section>
  );
}
