"use client";

/**
 * A1 오행 고리 — 우리 기운.
 *
 * 기운마다 고리 하나(안쪽부터 목·화·토·금·수). 고리 굵기는 모임이 가진 그
 * 기운의 양, 진하기는 기대값에서 벗어난 정도(우리 기운 막대와 같은 자),
 * 아무도 없는 기운은 끊긴 고리다. 사람은 자기 일간의 고리를 돈다 — 같은
 * 고리에 여럿이면 그 기운이 사람으로도 몰린 것이다.
 *
 * 우리 기운은 고정 좌표라 "오늘"을 섞지 않는다(오늘은 오늘의 우리 몫).
 */
import { useRef } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";
import { GROUP_ELEMENT_ORDER, type GroupSynthesis } from "@/lib/symbolic-tradition/group-synthesis";

import { ELEMENT_GLOW, ELEMENT_HEX, glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite, Text } from "pixi.js";

const ringRadius = (index: number) => 0.13 + index * 0.078;

export default function ElementRings({
  elements,
  people,
  elementName,
  ariaLabel,
}: {
  elements: GroupSynthesis["elements"];
  people: Array<{ id: string; label: string; dayMaster: FiveElement }>;
  elementName: (element: FiveElement) => string;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const key = JSON.stringify([elements.counts, people.map((p) => [p.id, p.label, p.dayMaster])]);

  usePixiStage(host, () => {
    let rings: Graphics;
    const planets: Array<{ glow: Sprite; core: Sprite; label: Text; ring: number; phase: number; speed: number }> = [];
    const ringLabels: Array<{ text: Text; ring: number }> = [];
    const peak = Math.max(1, ...GROUP_ELEMENT_ORDER.map((e) => elements.counts[e]));
    let drawnAt = 0; // 고리는 움직이지 않는다 — 무대 크기가 바뀔 때만 다시 그린다
    return {
      setup(app, pixi) {
        rings = new pixi.Graphics();
        const glowLayer = new pixi.Container();
        const top = new pixi.Container();
        app.stage.addChild(rings, glowLayer, top);
        const texture = glowTexture(pixi);
        GROUP_ELEMENT_ORDER.forEach((element, index) => {
          const text = new pixi.Text({
            text: elementName(element),
            style: { fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: "800", fill: ELEMENT_GLOW[element] },
          });
          text.anchor.set(0.5, 1);
          text.alpha = elements.counts[element] === 0 ? 0.55 : 0.9;
          top.addChild(text);
          ringLabels.push({ text, ring: index });
          const here = people.filter((p) => p.dayMaster === element);
          here.forEach((person, k) => {
            const glow = new pixi.Sprite(texture);
            glow.anchor.set(0.5);
            glow.tint = ELEMENT_GLOW[element];
            glow.blendMode = "add";
            const core = new pixi.Sprite(texture);
            core.anchor.set(0.5);
            core.tint = 0xffffff;
            const label = new pixi.Text({
              text: person.label,
              style: { fontFamily: "system-ui, sans-serif", fontSize: 10, fontWeight: "700", fill: 0xffffff },
            });
            label.anchor.set(0.5, 0);
            label.alpha = 0.85;
            glowLayer.addChild(glow);
            top.addChild(core, label);
            // 안쪽 고리일수록 빠르게 — 케플러를 흉내 낸 것일 뿐 뜻은 없다.
            planets.push({ glow, core, label, ring: index, phase: (k / here.length) * Math.PI * 2 + index * 1.1, speed: 0.42 - index * 0.05 });
          });
        });
      },
      frame(t, { width }) {
        const s = width;
        const c = s / 2;
        if (drawnAt !== s) {
          drawnAt = s;
          rings.clear();
          GROUP_ELEMENT_ORDER.forEach((element, index) => {
            const r = ringRadius(index) * s;
            const count = elements.counts[element];
            if (count === 0) {
              // 끊긴 고리 — 채울 사람이 없는 기운
              const n = 28;
              for (let i = 0; i < n; i += 2) {
                const a0 = (i / n) * Math.PI * 2;
                const a1 = ((i + 1) / n) * Math.PI * 2;
                rings.moveTo(c + r * Math.cos(a0), c + r * Math.sin(a0)).arc(c, c, r, a0, a1);
              }
              rings.stroke({ width: 1, color: ELEMENT_GLOW[element], alpha: 0.45 });
            } else {
              const strong = Math.abs(elements.deviation[element]) >= 1.5;
              rings.circle(c, c, r).stroke({ width: 1.5 + (count / peak) * 7, color: ELEMENT_HEX[element], alpha: strong ? 0.95 : 0.5 });
            }
          });
        }
        for (const { text, ring } of ringLabels) text.position.set(c, c - ringRadius(ring) * s - 3);
        for (const p of planets) {
          const r = ringRadius(p.ring) * s;
          const a = p.phase + t * p.speed;
          const x = c + r * Math.cos(a);
          const y = c + r * Math.sin(a);
          p.glow.position.set(x, y);
          p.glow.width = p.glow.height = 0.1 * s;
          p.core.position.set(x, y);
          p.core.width = p.core.height = 0.028 * s;
          p.label.position.set(x, y + 0.02 * s);
        }
      },
    };
  }, [key]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#141c16]" role="img" aria-label={ariaLabel}>
      <div ref={host} className="absolute inset-0" />
    </div>
  );
}
