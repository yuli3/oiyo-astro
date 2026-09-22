"use client";

/**
 * A6 모이는 순간 — 우리의 지도 맨 위.
 *
 * 사람이 원에 들어올 때마다 바깥에서 날아와 궤도에 안착하고 물결이 퍼진다.
 * 처음 열면 이미 있는 사람들이 차례로 들어오고, 그 뒤로는 **새로 들어온
 * 사람만** 날아온다(이미 자리 잡은 사람은 다시 날지 않는다). 정보를 싣지
 * 않는 연출이라 감축 선호면 모두 자리에 앉은 장면만 그린다.
 */
import { useRef } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";

import { ELEMENT_GLOW, glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite, Text } from "pixi.js";

const FLY = 1.3; // 날아오는 시간(초)
const STAGGER = 0.45;

export default function GatheringScene({
  people,
  caption,
}: {
  people: Array<{ id: string; label: string; element: FiveElement }>;
  caption: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  // 이미 자리 잡은 사람. 장면이 다시 만들어져도(사람이 늘 때) 기억한다.
  const settled = useRef(new Set<string>());
  const key = people.map((p) => `${p.id}:${p.label}:${p.element}`).join("|");

  usePixiStage(host, () => {
    let orbits: Graphics;
    let ripples: Graphics;
    let sun: Sprite;
    const bodies: Array<{ glow: Sprite; core: Sprite; label: Text; ring: number; phase: number; speed: number; joinAt: number; color: number }> = [];
    return {
      setup(app, pixi) {
        orbits = new pixi.Graphics();
        ripples = new pixi.Graphics();
        const layer = new pixi.Container();
        app.stage.addChild(orbits, ripples, layer);
        const texture = glowTexture(pixi, 48);
        sun = new pixi.Sprite(texture);
        sun.anchor.set(0.5);
        sun.tint = 0xf6efd8;
        layer.addChild(sun);
        let wave = 0;
        people.forEach((person, index) => {
          const glow = new pixi.Sprite(texture);
          glow.anchor.set(0.5);
          glow.tint = ELEMENT_GLOW[person.element];
          glow.blendMode = "add";
          const core = new pixi.Sprite(texture);
          core.anchor.set(0.5);
          const label = new pixi.Text({
            text: person.label,
            style: { fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: "700", fill: 0xffffff },
          });
          label.anchor.set(0.5, 0);
          label.alpha = 0.85;
          layer.addChild(glow, core, label);
          const fresh = !settled.current.has(person.id);
          const joinAt = fresh ? 0.3 + wave * STAGGER : -Infinity;
          if (fresh) wave += 1;
          settled.current.add(person.id);
          bodies.push({
            glow, core, label,
            ring: index,
            phase: index * 2.4,
            speed: 0.34 - Math.min(index, 9) * 0.022,
            joinAt,
            color: ELEMENT_GLOW[person.element],
          });
        });
      },
      frame(t, { width, height }) {
        const cx = width / 2;
        const cy = height / 2;
        const unit = Math.min(width, height);
        // 가로로 넓은 무대라 궤도를 가로 폭에 맞춰 편다. 좁은 쪽에 맞추면
        // 열 명일 때 궤도 간격이 3%도 안 돼 이름이 겹쳤다.
        const rx = (i: number) => width * (0.12 + (i / Math.max(1, people.length - 1 || 1)) * 0.3);
        const ry = (i: number) => height * (0.14 + (i / Math.max(1, people.length - 1 || 1)) * 0.2);
        orbits.clear();
        ripples.clear();
        sun.position.set(cx, cy);
        sun.width = sun.height = unit * (0.2 + 0.015 * Math.sin(t * 1.6));
        for (const b of bodies) {
          const ex = rx(b.ring);
          const ey = ry(b.ring);
          orbits.ellipse(cx, cy, ex, ey).stroke({ width: 1, color: 0xffffff, alpha: 0.08 });
          const angle = b.phase + t * b.speed;
          const tx = cx + ex * Math.cos(angle);
          const ty = cy + ey * Math.sin(angle); // 기울인 궤도(타원)
          const since = t - b.joinAt;
          const k = Math.min(1, Math.max(0, since / FLY));
          const ease = 1 - (1 - k) ** 3;
          // 화면 밖 먼 곳에서 궤도 위 자기 자리로
          const sx = cx + Math.cos(angle + 1.2) * unit;
          const sy = cy + Math.sin(angle + 1.2) * unit;
          const x = sx + (tx - sx) * ease;
          const y = sy + (ty - sy) * ease;
          const visible = since >= 0;
          b.glow.visible = b.core.visible = b.label.visible = visible;
          if (!visible) continue;
          if (k < 1) {
            const back = Math.max(0, ease - 0.2);
            orbits.moveTo(sx + (tx - sx) * back, sy + (ty - sy) * back).lineTo(x, y).stroke({ width: 2, color: b.color, alpha: 0.6 });
          } else if (since < FLY + 1.4) {
            const w = (since - FLY) / 1.4;
            ripples.circle(tx, ty, 6 + w * unit * 0.12).stroke({ width: 1.5, color: b.color, alpha: 1 - w });
          }
          b.glow.position.set(x, y);
          b.glow.width = b.glow.height = unit * 0.11;
          b.core.position.set(x, y);
          b.core.width = b.core.height = unit * 0.03;
          b.label.position.set(x, y + unit * 0.025);
        }
      },
    };
  }, [key]);

  return (
    <div className="relative mx-auto mt-6 h-56 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-[#141c16] sm:h-64">
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
      <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-bold text-white/80">{caption}</p>
    </div>
  );
}
