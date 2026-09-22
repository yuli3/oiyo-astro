"use client";

/**
 * A2 별자리 선 — 관점별로 사람 사이를 잇는다.
 *
 * 사람은 별, 고른 관점의 관계는 선이다. 선의 모양은 그 관계의 harmonyIndex
 * (관점이 매긴 순서, 0~100)에서만 나온다 — 총점을 만들지 않고, 관점마다 따로다.
 *   잘 맞물리는 사이(≥ 70)  빛이 흐르는 선
 *   부딪히는 사이(≤ 46)     숨 쉬듯 깜빡이는 점선
 *   그 사이                 옅은 선
 * 일간 관점에서는 빛이 **기운을 주는 쪽에서 받는 쪽으로** 흐른다(group-flow).
 *
 * **초점.** 별을 누르면 그 사람에게 닿는 선만 남는다. 열 명이면 선이 45개라
 * 한꺼번에 그리면 실타래가 됐다(2026-09-22 라이브 확인). 초점이 없을 때도
 * 여섯 명 이상이면 옅은 선(그 사이)은 숨기고, 남은 선도 밑그림처럼 가늘게
 * 두며 흐르는 빛을 끈다 — 누군가를 눌러야 그 사람의 선이 살아난다.
 * 초점과 고른 쌍은 무대를 다시 만들지 않고 선만 다시 그린다.
 */
import { useEffect, useRef, useState } from "react";

import type { SymbolicGroupEdge } from "@/lib/symbolic-tradition/group-snapshot";
import type { DayMasterLink } from "@/lib/symbolic-tradition/group-flow";

import { glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite } from "pixi.js";

export const HARMONY_HIGH = 70;
export const HARMONY_LOW = 46;
/** 이 인원부터는 초점이 없을 때 옅은 선을 숨긴다 */
const CROWD = 6;

const WARM = 0xf2c46b;
const TENSE = 0xe0855f;

function starAt(index: number, n: number, seed: number) {
  const angle = -Math.PI / 2 + (index / n) * Math.PI * 2;
  // 완전한 정다각형은 딱딱해 보여서 사람마다 조금 비껴 둔다(늘 같은 자리).
  const r = 0.34 + (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.06;
  return { x: 0.5 + r * Math.cos(angle), y: 0.5 + r * Math.sin(angle) };
}

const touches = (e: SymbolicGroupEdge, id: string) => e.from === id || e.to === id;
const samePair = (e: SymbolicGroupEdge, p: { from: string; to: string }) =>
  (p.from === e.from && p.to === e.to) || (p.from === e.to && p.to === e.from);

export default function ConstellationLines({
  people,
  edges,
  directions,
  picked,
  ariaLabel,
  focusHint,
}: {
  people: Array<{ id: string; label: string }>;
  edges: SymbolicGroupEdge[];
  /** 일간 관점일 때만. 생·극의 출발점 */
  directions: DayMasterLink[] | null;
  picked: { from: string; to: string } | null;
  ariaLabel: string;
  focusHint: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  // 무대가 읽는 현재 값. 바뀌어도 무대를 다시 만들지 않는다.
  const view = useRef({ focus: null as string | null, picked, version: 0 });
  useEffect(() => {
    view.current = { focus, picked, version: view.current.version + 1 };
  }, [focus, picked]);
  // 사람이 빠지면 초점도 푼다.
  useEffect(() => {
    if (focus && !people.some((p) => p.id === focus)) setFocus(null);
  }, [focus, people]);

  const positions = people.map((p, i) => ({ id: p.id, ...starAt(i, people.length, i + 1) }));
  const key = JSON.stringify([people.map((p) => p.id), edges.map((e) => [e.from, e.to, e.harmonyIndex]), directions]);

  usePixiStage(host, () => {
    let calm: Graphics;
    let tense: Graphics;
    const sparks: Array<{ sprite: Sprite; edge: SymbolicGroupEdge; from: { x: number; y: number }; to: { x: number; y: number }; f: number }> = [];
    const stars: Array<{ sprite: Sprite; id: string; x: number; y: number; seed: number }> = [];
    const at = (id: string) => positions.find((p) => p.id === id)!;
    let drawn = { width: 0, version: -1 };
    let lastT = 0;

    const shown = (e: SymbolicGroupEdge) => {
      const { focus: f, picked: p } = view.current;
      if (p && samePair(e, p)) return true;
      if (f) return touches(e, f);
      if (people.length >= CROWD) return e.harmonyIndex >= HARMONY_HIGH || e.harmonyIndex <= HARMONY_LOW;
      return true;
    };

    return {
      setup(app, pixi) {
        calm = new pixi.Graphics();
        tense = new pixi.Graphics();
        const sparkLayer = new pixi.Container();
        const starLayer = new pixi.Container();
        app.stage.addChild(calm, tense, sparkLayer, starLayer);
        const texture = glowTexture(pixi);
        for (const edge of edges) {
          if (edge.harmonyIndex < HARMONY_HIGH) continue;
          const dir = directions?.find((d) => (d.a === edge.from && d.b === edge.to) || (d.a === edge.to && d.b === edge.from));
          const reverse = dir?.from === edge.to;
          const from = at(reverse ? edge.to : edge.from);
          const to = at(reverse ? edge.from : edge.to);
          for (let k = 0; k < 3; k += 1) {
            const sprite = new pixi.Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.tint = WARM;
            sprite.blendMode = "add";
            sparkLayer.addChild(sprite);
            sparks.push({ sprite, edge, from, to, f: k / 3 });
          }
        }
        positions.forEach((p, i) => {
          const sprite = new pixi.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.blendMode = "add";
          starLayer.addChild(sprite);
          stars.push({ sprite, id: p.id, x: p.x, y: p.y, seed: i });
        });
      },
      frame(t, { width }) {
        const s = width;
        const dt = Math.min(0.1, Math.max(0, t - lastT));
        lastT = t;
        const { focus: f, picked: p, version } = view.current;
        // 사람이 많은데 아무도 고르지 않았으면 밑그림처럼 옅게 — 초점이 주인공이다.
        const sketch = !f && !p && people.length >= CROWD;
        // 선은 무대 크기·초점·고른 쌍이 바뀔 때만 다시 그린다.
        if (drawn.width !== s || drawn.version !== version) {
          drawn = { width: s, version };
          calm.clear();
          tense.clear();
          for (const edge of edges) {
            if (!shown(edge)) continue;
            const a = at(edge.from);
            const b = at(edge.to);
            const bold = p && samePair(edge, p) ? 2 : 1;
            if (edge.harmonyIndex >= HARMONY_HIGH) {
              calm.moveTo(a.x * s, a.y * s).lineTo(b.x * s, b.y * s).stroke({ width: sketch ? 0.8 : 1.4 * bold, color: WARM, alpha: sketch ? 0.22 : 0.55 });
            } else if (edge.harmonyIndex <= HARMONY_LOW) {
              const n = 18;
              for (let i = 0; i < n; i += 2) {
                const f0 = i / n;
                const f1 = (i + 1) / n;
                tense.moveTo((a.x + (b.x - a.x) * f0) * s, (a.y + (b.y - a.y) * f0) * s)
                  .lineTo((a.x + (b.x - a.x) * f1) * s, (a.y + (b.y - a.y) * f1) * s);
              }
              tense.stroke({ width: sketch ? 0.8 : 1.2 * bold, color: TENSE, alpha: sketch ? 0.45 : 1 });
            } else {
              calm.moveTo(a.x * s, a.y * s).lineTo(b.x * s, b.y * s).stroke({ width: bold, color: 0xffffff, alpha: bold > 1 ? 0.5 : 0.16 });
            }
          }
        }
        // 부딪히는 선은 다시 그리지 않고 투명도만 숨 쉬게 한다.
        tense.alpha = 0.55 + 0.25 * Math.sin(t * 3);
        for (const spark of sparks) {
          const visible = !sketch && shown(spark.edge);
          spark.sprite.visible = visible;
          if (!visible) continue;
          spark.f = (spark.f + dt * 0.3) % 1;
          spark.sprite.position.set((spark.from.x + (spark.to.x - spark.from.x) * spark.f) * s, (spark.from.y + (spark.to.y - spark.from.y) * spark.f) * s);
          spark.sprite.width = spark.sprite.height = 0.035 * s;
        }
        for (const star of stars) {
          const dim = f && f !== star.id && !edges.some((e) => touches(e, f) && touches(e, star.id) && shown(e));
          const twinkle = 1 + Math.sin(t * 2 + star.seed) * 0.12;
          star.sprite.position.set(star.x * s, star.y * s);
          star.sprite.alpha = dim ? 0.3 : 1;
          star.sprite.width = star.sprite.height = (f === star.id ? 0.11 : 0.075) * s * twinkle;
        }
      },
    };
  }, [key]);

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#141c16]">
        {/* 그림만 img 로 둔다. 바깥에 두면 안의 이름 단추가 화면 읽기에서 사라진다. */}
        <div ref={host} className="absolute inset-0" role="img" aria-label={ariaLabel} />
        {/* 별 위의 이름은 누를 수 있는 단추다 — 그 사람의 선만 남긴다. */}
        {positions.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFocus((current) => (current === p.id ? null : p.id))}
            aria-pressed={focus === p.id}
            className={`absolute flex min-h-8 min-w-8 max-w-[5.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-start rounded-full px-1 pt-5 text-[10px] font-bold ${focus === p.id ? "text-amber-200" : focus ? "text-white/40" : "text-white/85"}`}
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          >
            <span className="max-w-full truncate">{people[i].label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">{focusHint}</p>
    </div>
  );
}
