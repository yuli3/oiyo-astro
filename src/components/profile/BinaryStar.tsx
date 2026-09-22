"use client";

/**
 * C5 쌍성 — 두 사람 보기의 첫 그림.
 *
 * 두 일간의 관계(pair-reading 의 relation)가 궤도의 모양을 정한다.
 *   combining   끈으로 이어진 채 가까이 서로를 돈다(천간합)
 *   generating  주는 쪽에서 받는 쪽으로 빛 알갱이가 흐른다
 *   controlling 가까워질 때마다 튕겨 나가며 작은 파문이 인다
 *   same        나란한 두 길을 같은 박자로 달린다
 * 별의 색은 각자의 일간 오행이다. 감축 선호면 정지 장면(t=6)만 그린다.
 */
import { useRef } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";

import { ELEMENT_GLOW, glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite, Text } from "pixi.js";

type Relation = "combining" | "same" | "generating" | "controlling";

export default function BinaryStar({
  relation,
  a,
  b,
  giverIsA,
  caption,
}: {
  relation: Relation;
  a: { label: string; element: FiveElement };
  b: { label: string; element: FiveElement };
  /** generating·controlling 일 때 출발점이 A 인가 */
  giverIsA: boolean;
  caption: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const key = [relation, a.label, a.element, b.label, b.element, giverIsA].join("|");

  usePixiStage(host, () => {
    let lines: Graphics;
    let stars: Array<{ glow: Sprite; core: Sprite; label: Text }> = [];
    const sparks: Sprite[] = [];
    const dust: Array<{ s: Sprite; x: number; y: number; p: number }> = [];
    return {
      setup(app, pixi) {
        const texture = glowTexture(pixi, 48);
        const dustLayer = new pixi.Container();
        lines = new pixi.Graphics();
        const sparkLayer = new pixi.Container();
        const starLayer = new pixi.Container();
        app.stage.addChild(dustLayer, lines, sparkLayer, starLayer);
        // 배경 별가루 — 늘 같은 자리(시드 고정)
        let seed = 7;
        const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        for (let i = 0; i < 60; i += 1) {
          const s = new pixi.Sprite(texture);
          s.anchor.set(0.5);
          s.alpha = 0.35;
          dustLayer.addChild(s);
          dust.push({ s, x: rnd(), y: rnd(), p: rnd() * 6 });
        }
        stars = [a, b].map((person) => {
          const glow = new pixi.Sprite(texture);
          glow.anchor.set(0.5);
          glow.tint = ELEMENT_GLOW[person.element];
          glow.blendMode = "add";
          const core = new pixi.Sprite(texture);
          core.anchor.set(0.5);
          const label = new pixi.Text({
            text: person.label,
            style: { fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: "800", fill: 0xffffff },
          });
          label.anchor.set(0.5, 1);
          starLayer.addChild(glow, core, label);
          return { glow, core, label };
        });
        if (relation === "generating") {
          for (let k = 0; k < 7; k += 1) {
            const s = new pixi.Sprite(texture);
            s.anchor.set(0.5);
            s.tint = 0xffe2b0;
            s.blendMode = "add";
            sparkLayer.addChild(s);
            sparks.push(s);
          }
        }
      },
      frame(t, { width, height }) {
        const cx = width / 2;
        const cy = height / 2;
        const u = Math.min(width, height);
        for (const d of dust) {
          d.s.position.set(d.x * width, d.y * height);
          d.s.width = d.s.height = u * 0.012 * (1 + 0.4 * Math.sin(t * 1.3 + d.p));
        }
        lines.clear();
        let ax: number; let ay: number; let bx: number; let by: number;
        if (relation === "combining") {
          const r = u * 0.16;
          const ang = t * 0.8;
          ax = cx + r * Math.cos(ang); ay = cy + r * Math.sin(ang) * 0.8;
          bx = cx - r * Math.cos(ang); by = cy - r * Math.sin(ang) * 0.8;
          // 두 별을 잇는 끈 — 가운데가 살짝 출렁인다
          lines.moveTo(ax, ay).quadraticCurveTo(cx + Math.sin(t * 2) * u * 0.03, cy + Math.cos(t * 2) * u * 0.03, bx, by)
            .stroke({ width: 2, color: 0xffecc8, alpha: 0.6 });
          lines.ellipse(cx, cy, r, r * 0.8).stroke({ width: 1, color: 0xffffff, alpha: 0.08 });
        } else if (relation === "generating") {
          const sway = Math.sin(t * 0.7) * u * 0.05;
          const gx = cx - u * 0.24; const gy = cy + sway;
          const rx = cx + u * 0.24; const ry = cy - sway;
          [ax, ay, bx, by] = giverIsA ? [gx, gy, rx, ry] : [rx, ry, gx, gy];
          const [fx, fy, tx, ty] = giverIsA ? [ax, ay, bx, by] : [bx, by, ax, ay];
          sparks.forEach((s, k) => {
            const f = (t * 0.3 + k / sparks.length) % 1;
            s.position.set(fx + (tx - fx) * f, fy + (ty - fy) * f + Math.sin(f * Math.PI) * -u * 0.06);
            s.width = s.height = u * 0.035 * (1 - Math.abs(f - 0.5));
          });
          lines.moveTo(fx, fy).quadraticCurveTo(cx, cy - u * 0.12, tx, ty).stroke({ width: 1, color: 0xffe2b0, alpha: 0.25 });
        } else if (relation === "controlling") {
          const phase = Math.abs(Math.sin(t * 1.1));
          const d = u * (0.13 + 0.14 * phase);
          const ang = t * 0.35;
          ax = cx + d * Math.cos(ang); ay = cy + d * Math.sin(ang) * 0.7;
          bx = cx - d * Math.cos(ang); by = cy - d * Math.sin(ang) * 0.7;
          if (phase < 0.2) {
            const w = (0.2 - phase) / 0.2;
            lines.circle(cx, cy, u * (0.05 + 0.12 * (1 - w))).stroke({ width: 1.5, color: 0xe0855f, alpha: w });
          }
        } else {
          const y1 = cy - u * 0.09; const y2 = cy + u * 0.09;
          const x = cx + Math.sin(t * 0.6) * width * 0.28;
          ax = x; ay = y1; bx = x; by = y2;
          lines.moveTo(width * 0.1, y1).lineTo(width * 0.9, y1).moveTo(width * 0.1, y2).lineTo(width * 0.9, y2)
            .stroke({ width: 1, color: 0xffffff, alpha: 0.1 });
        }
        const place = (i: number, x: number, y: number) => {
          const s = stars[i];
          s.glow.position.set(x, y);
          s.glow.width = s.glow.height = u * 0.2;
          s.core.position.set(x, y);
          s.core.width = s.core.height = u * 0.05;
          s.label.position.set(x, y - u * 0.05);
        };
        place(0, ax, ay);
        place(1, bx, by);
      },
    };
  }, [key]);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2rem] bg-[#141c16]">
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
      <p className="pointer-events-none absolute inset-x-0 bottom-3 px-4 text-center text-xs font-bold text-white/80">{caption}</p>
    </div>
  );
}
