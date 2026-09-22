"use client";

/**
 * A4 중력과 맥동 — 오늘의 우리.
 *
 * 사람마다 빛 덩어리 하나. 같은 일간끼리는 한자리에 모여 겹쳐 보이고(한
 * 덩어리), 오늘과의 관계(stance)에 따라 크기와 움직임이 달라진다.
 *   support  받는 날  — 숨 쉬듯 크게 부푼다
 *   peer     같은 날  — 조금 커지고 곁의 같은 기운과 맞붙는다
 *   output   내는 날  — 바깥으로 살짝 밀려난다
 *   wealth   쥐는 날  — 제자리에서 단단해진다
 *   pressure 눌리는 날 — 움츠러들고 잘게 떨린다
 * 관계 판정은 group-today 의 stanceOf 것을 그대로 받는다.
 */
import { useRef } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";
import type { TodayStance } from "@/lib/symbolic-tradition/group-today";
import { GROUP_ELEMENT_ORDER } from "@/lib/symbolic-tradition/group-synthesis";

import { ELEMENT_GLOW, glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Sprite, Text } from "pixi.js";

const SCALE: Record<TodayStance, number> = { support: 1.3, peer: 1.12, output: 1, wealth: 0.98, pressure: 0.74 };

export default function PulseField({
  people,
  ariaLabel,
}: {
  people: Array<{ id: string; label: string; dayMaster: FiveElement; stance: TodayStance; stanceLabel: string }>;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const key = people.map((p) => `${p.id}:${p.label}:${p.dayMaster}:${p.stance}:${p.stanceLabel}`).join("|");

  usePixiStage(host, () => {
    const blobs: Array<{ halo: Sprite; core: Sprite; label: Text; home: { x: number; y: number }; out: { x: number; y: number }; stance: TodayStance; seed: number }> = [];
    return {
      setup(app, pixi) {
        const texture = glowTexture(pixi, 48);
        const haloLayer = new pixi.Container();
        const coreLayer = new pixi.Container();
        app.stage.addChild(haloLayer, coreLayer);
        // 모인 기운끼리만 원 위에 고르게 나눠 앉힌다. 오행 다섯 자리를 고정하면
        // 두 기운뿐인 모임이 한쪽 구석에 몰려 보인다.
        const present = GROUP_ELEMENT_ORDER.filter((e) => people.some((p) => p.dayMaster === e));
        const byElement = new Map<FiveElement, number>();
        people.forEach((person, index) => {
          const group = present.indexOf(person.dayMaster);
          const size = people.filter((p) => p.dayMaster === person.dayMaster).length;
          const k = byElement.get(person.dayMaster) ?? 0;
          byElement.set(person.dayMaster, k + 1);
          const angle = -Math.PI / 2 + (group * Math.PI * 2) / present.length;
          const dist = present.length === 1 ? 0 : 0.18 + (person.stance === "output" ? 0.05 : 0);
          const center = { x: 0.5 + dist * Math.cos(angle), y: 0.5 + dist * Math.sin(angle) };
          // 같은 기운은 작은 원을 이루며 서로 겹친다 — 한 덩어리로 보이게.
          const inner = size === 1 ? 0 : 0.075;
          const home = {
            x: center.x + inner * Math.cos((k * Math.PI * 2) / size + angle),
            y: center.y + inner * Math.sin((k * Math.PI * 2) / size + angle),
          };
          const halo = new pixi.Sprite(texture);
          halo.anchor.set(0.5);
          halo.tint = ELEMENT_GLOW[person.dayMaster];
          halo.alpha = 0.5;
          const core = new pixi.Sprite(texture);
          core.anchor.set(0.5);
          core.tint = ELEMENT_GLOW[person.dayMaster];
          core.alpha = 1;
          const label = new pixi.Text({
            text: `${person.label}\n${person.stanceLabel}`,
            style: { fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: "700", fill: 0xffffff, align: "center", lineHeight: 14 },
          });
          label.anchor.set(0.5, 0);
          label.alpha = 0.85;
          haloLayer.addChild(halo);
          coreLayer.addChild(core, label);
          // 글자는 덩어리 바깥쪽으로 — 한 덩어리 안에서 이름이 겹치지 않게.
          const dx = home.x - center.x;
          const dy = home.y - center.y;
          const len = Math.hypot(dx, dy);
          const out = len > 0 ? { x: dx / len, y: dy / len } : { x: 0, y: 1 };
          blobs.push({ halo, core, label, home, out, stance: person.stance, seed: index * 1.7 });
        });
      },
      frame(t, { width }) {
        const s = width;
        for (const b of blobs) {
          const base = 0.36 * s * SCALE[b.stance];
          const breathe = b.stance === "support" ? 1 + 0.12 * Math.sin(t * 2.2 + b.seed) : b.stance === "peer" ? 1 + 0.04 * Math.sin(t * 1.6 + b.seed) : 1;
          const shiver = b.stance === "pressure" ? Math.sin(t * 23 + b.seed) * 0.004 : 0;
          const drift = 0.012;
          const x = (b.home.x + Math.sin(t * 0.35 + b.seed) * drift + shiver) * s;
          const y = (b.home.y + Math.cos(t * 0.3 + b.seed) * drift) * s;
          b.halo.position.set(x, y);
          b.halo.width = base * breathe;
          b.halo.height = base * breathe;
          b.core.position.set(x, y);
          b.core.width = base * 0.3;
          b.core.height = base * 0.3;
          // 무대 밖으로 나가지 않게 가둔다.
          const lx = Math.min(s - 36, Math.max(36, x + b.out.x * base * 0.3));
          const ly = Math.min(s - 34, Math.max(6, y + b.out.y * base * 0.3 - (b.out.y < 0 ? 28 : 0)));
          b.label.position.set(lx, ly);
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
