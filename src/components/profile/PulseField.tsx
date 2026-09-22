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
 *
 * **이름표는 덩어리마다 하나.** stance 는 일간 오행과 그날 기운만으로 정해져
 * 같은 기운끼리는 늘 같다. 그래서 "나 · 친구 2 · 친구 6 / 받는 날"처럼 한
 * 번만 적는다. 사람마다 달았더니 열 명 모임에서 이름이 서로 덮이거나, 밀어
 * 내면 덩어리에서 멀어졌다(2026-09-22 라이브 확인).
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
    const blobs: Array<{ halo: Sprite; core: Sprite; home: { x: number; y: number }; stance: TodayStance; seed: number }> = [];
    const tags: Array<{ text: Text; center: { x: number; y: number }; out: { x: number; y: number }; reach: number }> = [];
    // 사람이 많으면 덩어리를 줄인다. 네 명 기준 크기에서 인원의 제곱근만큼.
    const crowd = Math.sqrt(Math.max(1, people.length / 4));
    return {
      setup(app, pixi) {
        const texture = glowTexture(pixi, 48);
        const haloLayer = new pixi.Container();
        const coreLayer = new pixi.Container();
        const tagLayer = new pixi.Container();
        app.stage.addChild(haloLayer, coreLayer, tagLayer);
        // 모인 기운끼리만 원 위에 고르게 나눠 앉힌다. 오행 다섯 자리를 고정하면
        // 두 기운뿐인 모임이 한쪽 구석에 몰려 보인다.
        const present = GROUP_ELEMENT_ORDER.filter((e) => people.some((p) => p.dayMaster === e));
        present.forEach((element, group) => {
          const members = people.filter((p) => p.dayMaster === element);
          const stance = members[0].stance;
          const angle = -Math.PI / 2 + (group * Math.PI * 2) / present.length;
          const dist = present.length === 1 ? 0 : 0.2 + (stance === "output" ? 0.04 : 0);
          const center = { x: 0.5 + dist * Math.cos(angle), y: 0.5 + dist * Math.sin(angle) };
          // 같은 기운은 작은 원을 이루며 서로 겹친다 — 한 덩어리로 보이게.
          const inner = members.length === 1 ? 0 : Math.min(0.1, 0.05 + members.length * 0.01);
          members.forEach((person, k) => {
            const a = (k * Math.PI * 2) / members.length + angle;
            const halo = new pixi.Sprite(texture);
            halo.anchor.set(0.5);
            halo.tint = ELEMENT_GLOW[element];
            halo.alpha = 0.5;
            const core = new pixi.Sprite(texture);
            core.anchor.set(0.5);
            core.tint = ELEMENT_GLOW[element];
            haloLayer.addChild(halo);
            coreLayer.addChild(core);
            blobs.push({
              halo, core, stance,
              home: { x: center.x + inner * Math.cos(a), y: center.y + inner * Math.sin(a) },
              seed: people.indexOf(person) * 1.7,
            });
          });
          const text = new pixi.Text({
            text: `${members.map((m) => m.label).join(" · ")}\n${members[0].stanceLabel}`,
            style: {
              fontFamily: "system-ui, sans-serif", fontSize: 11, fontWeight: "700", fill: 0xffffff,
              align: "center", lineHeight: 14, wordWrap: true, wordWrapWidth: 130,
            },
          });
          text.anchor.set(0.5);
          text.alpha = 0.9;
          tagLayer.addChild(text);
          // 이름표는 무대 가운데에서 덩어리 쪽으로 더 나간 자리에. 기운이 하나뿐이면 아래.
          const len = Math.hypot(center.x - 0.5, center.y - 0.5);
          const out = len > 0 ? { x: (center.x - 0.5) / len, y: (center.y - 0.5) / len } : { x: 0, y: 1 };
          tags.push({ text, center, out, reach: inner + 0.13 });
        });
      },
      frame(t, { width }) {
        const s = width;
        for (const b of blobs) {
          const base = (0.36 * s * SCALE[b.stance]) / crowd;
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
        }
        for (const tag of tags) {
          const hw = tag.text.width / 2 + 6;
          const hh = tag.text.height / 2 + 6;
          // 무대 밖으로 나가지 않게 가둔다.
          const x = Math.min(s - hw, Math.max(hw, (tag.center.x + tag.out.x * tag.reach) * s));
          const y = Math.min(s - hh, Math.max(hh, (tag.center.y + tag.out.y * tag.reach) * s));
          tag.text.position.set(x, y);
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
