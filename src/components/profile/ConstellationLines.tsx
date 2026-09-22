"use client";

/**
 * A2 별자리 선 — 관점별로 사람 사이를 잇는다.
 *
 * 사람은 별, 고른 관점의 관계는 선이다. 선의 모양은 그 관계의 harmonyIndex
 * (관점이 매긴 순서, 0~100)에서만 나온다 — 총점을 만들지 않고, 관점마다 따로다.
 *   잘 맞물리는 사이(≥ 70)  빛이 흐르는 선
 *   부딪히는 사이(≤ 46)     떨리는 점선
 *   그 사이                 옅은 선
 * 일간 관점에서는 빛이 **기운을 주는 쪽에서 받는 쪽으로** 흐른다(group-flow).
 * 목록에서 고른 쌍은 선이 굵어진다.
 */
import { useRef } from "react";

import type { SymbolicGroupEdge } from "@/lib/symbolic-tradition/group-snapshot";
import type { DayMasterLink } from "@/lib/symbolic-tradition/group-flow";

import { glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite } from "pixi.js";

export const HARMONY_HIGH = 70;
export const HARMONY_LOW = 46;

const WARM = 0xf2c46b;
const TENSE = 0xe0855f;

function starAt(index: number, n: number, seed: number) {
  const angle = -Math.PI / 2 + (index / n) * Math.PI * 2;
  // 완전한 정다각형은 딱딱해 보여서 사람마다 조금 비껴 둔다(늘 같은 자리).
  const r = 0.34 + (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.06;
  return { x: 0.5 + r * Math.cos(angle), y: 0.5 + r * Math.sin(angle) };
}

export default function ConstellationLines({
  people,
  edges,
  directions,
  picked,
  ariaLabel,
}: {
  people: Array<{ id: string; label: string }>;
  edges: SymbolicGroupEdge[];
  /** 일간 관점일 때만. 생·극의 출발점 */
  directions: DayMasterLink[] | null;
  picked: { from: string; to: string } | null;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const positions = people.map((p, i) => ({ id: p.id, ...starAt(i, people.length, i + 1) }));
  const key = JSON.stringify([people.map((p) => p.id), edges.map((e) => [e.from, e.to, e.harmonyIndex]), directions, picked]);

  usePixiStage(host, () => {
    let lines: Graphics;
    const sparks: Array<{ sprite: Sprite; from: { x: number; y: number }; to: { x: number; y: number }; f: number }> = [];
    const stars: Array<{ sprite: Sprite; x: number; y: number; seed: number }> = [];
    const at = (id: string) => positions.find((p) => p.id === id)!;
    const isPicked = (e: SymbolicGroupEdge) =>
      !!picked && ((picked.from === e.from && picked.to === e.to) || (picked.from === e.to && picked.to === e.from));
    return {
      setup(app, pixi) {
        lines = new pixi.Graphics();
        const sparkLayer = new pixi.Container();
        const starLayer = new pixi.Container();
        app.stage.addChild(lines, sparkLayer, starLayer);
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
            sparks.push({ sprite, from, to, f: k / 3 });
          }
        }
        positions.forEach((p, i) => {
          const sprite = new pixi.Sprite(texture);
          sprite.anchor.set(0.5);
          sprite.blendMode = "add";
          starLayer.addChild(sprite);
          stars.push({ sprite, x: p.x, y: p.y, seed: i });
        });
      },
      frame(t, { width }) {
        const s = width;
        lines.clear();
        for (const edge of edges) {
          const a = at(edge.from);
          const b = at(edge.to);
          const bold = isPicked(edge) ? 2 : 1;
          if (edge.harmonyIndex >= HARMONY_HIGH) {
            lines.moveTo(a.x * s, a.y * s).lineTo(b.x * s, b.y * s).stroke({ width: 1.4 * bold, color: WARM, alpha: 0.55 });
          } else if (edge.harmonyIndex <= HARMONY_LOW) {
            // 떨리는 점선
            const n = 18;
            const jitter = Math.sin(t * 9 + a.x * 10) * 0.004 * s;
            for (let i = 0; i < n; i += 2) {
              const f0 = i / n;
              const f1 = (i + 1) / n;
              lines.moveTo((a.x + (b.x - a.x) * f0) * s + jitter, (a.y + (b.y - a.y) * f0) * s)
                .lineTo((a.x + (b.x - a.x) * f1) * s + jitter, (a.y + (b.y - a.y) * f1) * s);
            }
            lines.stroke({ width: 1.1 * bold, color: TENSE, alpha: 0.75 });
          } else {
            lines.moveTo(a.x * s, a.y * s).lineTo(b.x * s, b.y * s).stroke({ width: 1 * bold, color: 0xffffff, alpha: isPicked(edge) ? 0.5 : 0.14 });
          }
        }
        for (const spark of sparks) {
          spark.f = (spark.f + 0.005) % 1;
          spark.sprite.position.set((spark.from.x + (spark.to.x - spark.from.x) * spark.f) * s, (spark.from.y + (spark.to.y - spark.from.y) * spark.f) * s);
          spark.sprite.width = spark.sprite.height = 0.035 * s;
        }
        for (const star of stars) {
          const twinkle = 1 + Math.sin(t * 2 + star.seed) * 0.12;
          star.sprite.position.set(star.x * s, star.y * s);
          star.sprite.width = star.sprite.height = 0.075 * s * twinkle;
        }
      },
    };
  }, [key]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#141c16]" role="img" aria-label={ariaLabel}>
      <div ref={host} className="absolute inset-0" />
      {positions.map((p, i) => (
        <span
          key={p.id}
          className="pointer-events-none absolute max-w-[5rem] -translate-x-1/2 truncate text-center text-[10px] font-bold text-white/85"
          style={{ left: `${p.x * 100}%`, top: `calc(${p.y * 100}% + 12px)` }}
          aria-hidden="true"
        >
          {people[i].label}
        </span>
      ))}
    </div>
  );
}
