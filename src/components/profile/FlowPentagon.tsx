"use client";

/**
 * A3 상생 흐름 오각형 — 오늘의 우리.
 *
 * 목→화→토→금→수 고리를 따라 빛 알갱이가 흐른다. 알갱이 수는 낳는 쪽의
 * 양(generationFlow 의 strength), 받을 기운이 비면 그 앞에서 쌓이고, 오늘의
 * 일진이 그 빈 기운이면 이어져 흐른다. 꼭짓점 크기는 모임의 몫이다.
 *
 * 흐름의 판정은 전부 엔진(group-flow)에서 받는다. 여기서는 그리기만 한다.
 * 글자(기운 이름·사람)는 캔버스가 아니라 HTML 로 얹는다 — 화면 읽기 도구가
 * 읽을 수 있고, 글꼴이 사이트와 같다.
 */
import { useMemo, useRef } from "react";

import type { FiveElement } from "@/lib/ontology/saju/types";
import { generationFlow, type FlowEdge } from "@/lib/symbolic-tradition/group-flow";
import { GROUP_ELEMENT_ORDER } from "@/lib/symbolic-tradition/group-synthesis";

import { ELEMENT_GLOW, ELEMENT_HEX, glowTexture } from "./pixi/textures";
import { usePixiStage } from "./pixi/usePixiStage";

import type { Graphics, Sprite } from "pixi.js";

const R = 0.34; // 꼭짓점 반지름(무대 한 변 대비)

/** 꼭짓점 좌표(0~1). 목이 맨 위, 시계 방향으로 상생 순서. */
export function vertexOf(index: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
  return { x: 0.5 + R * Math.cos(angle), y: 0.5 + R * Math.sin(angle) };
}

interface Particle {
  sprite: Sprite;
  edge: number;
  f: number;
  speed: number;
}

export default function FlowPentagon({
  counts,
  today,
  people,
  elementName,
  ariaLabel,
}: {
  counts: Record<FiveElement, number>;
  today: FiveElement;
  people: Array<{ id: string; label: string; dayMaster: FiveElement }>;
  elementName: (element: FiveElement) => string;
  ariaLabel: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const flow = useMemo(() => generationFlow(counts, today), [counts, today]);
  const total = GROUP_ELEMENT_ORDER.reduce((n, e) => n + counts[e], 0) || 1;

  usePixiStage(host, () => {
    let lines: Graphics;
    let nodes: Graphics;
    const particles: Particle[] = [];
    let edges: FlowEdge[] = flow;
    let lastT = 0;
    let drawnAt = 0; // 고리 선은 무대 크기가 바뀔 때만 다시 그린다
    return {
      setup(app, pixi) {
        edges = flow;
        lines = new pixi.Graphics();
        nodes = new pixi.Graphics();
        const glow = new pixi.Container();
        app.stage.addChild(lines, glow, nodes);
        const texture = glowTexture(pixi);
        // 알갱이 수를 고리마다 흐름의 세기에 비례해 나눈다. 비어 있는 고리는 0.
        const budget = 84;
        const weight = edges.reduce((n, e) => n + e.strength, 0) || 1;
        edges.forEach((edge, index) => {
          const n = Math.round((edge.strength / weight) * budget);
          for (let k = 0; k < n; k += 1) {
            const sprite = new pixi.Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.tint = ELEMENT_GLOW[edge.from];
            sprite.blendMode = "add";
            glow.addChild(sprite);
            particles.push({ sprite, edge: index, f: (k / n + Math.random() * 0.05) % 1, speed: 0.1 + Math.random() * 0.06 });
          }
        });
      },
      frame(t, { width }) {
        const s = width;
        // 실제 흐른 시간으로 움직인다(프레임 수를 30으로 묶어도 속도가 같다).
        const dt = Math.min(0.1, Math.max(0, t - lastT));
        lastT = t;
        if (drawnAt !== s) {
          drawnAt = s;
          lines.clear();
          edges.forEach((edge, index) => {
            const a = vertexOf(index);
            const b = vertexOf((index + 1) % 5);
            lines.moveTo(a.x * s, a.y * s).lineTo(b.x * s, b.y * s)
              .stroke({ width: edge.mended ? 2 : 1, color: ELEMENT_GLOW[edge.from], alpha: edge.mended ? 0.55 : edge.blocked ? 0.12 : 0.22 });
          });
        }
        for (const p of particles) {
          const edge = edges[p.edge];
          p.f += p.speed * dt;
          if (edge.blocked && p.f > 0.84) p.f = 0.8 + Math.random() * 0.04; // 막힌 자리 앞에서 쌓인다
          if (p.f >= 1) p.f -= 1;
          const a = vertexOf(p.edge);
          const b = vertexOf((p.edge + 1) % 5);
          const wobble = edge.blocked && p.f > 0.78 ? Math.sin(t * 7 + p.f * 40) * 0.008 : 0;
          p.sprite.x = (a.x + (b.x - a.x) * p.f + wobble) * s;
          p.sprite.y = (a.y + (b.y - a.y) * p.f - wobble) * s;
          const size = (0.018 + 0.02 * edge.strength) * s;
          p.sprite.width = size;
          p.sprite.height = size;
          p.sprite.alpha = edge.blocked && p.f > 0.78 ? 0.55 : 0.9;
        }
        nodes.clear();
        GROUP_ELEMENT_ORDER.forEach((element, index) => {
          const v = vertexOf(index);
          const share = counts[element] / total;
          const radius = (0.035 + share * 0.09) * s;
          if (counts[element] === 0) {
            // 빈 기운 — 테두리만. 오늘 들어오면 숨 쉬듯 밝아진다.
            const lit = element === today;
            nodes.circle(v.x * s, v.y * s, 0.045 * s)
              .fill({ color: ELEMENT_HEX[element], alpha: lit ? 0.35 + 0.25 * Math.sin(t * 3.2) : 0.04 })
              .stroke({ width: 1.5, color: ELEMENT_GLOW[element], alpha: lit ? 0.95 : 0.5 });
          } else {
            nodes.circle(v.x * s, v.y * s, radius).fill({ color: ELEMENT_HEX[element], alpha: 0.9 });
          }
          if (element === today) {
            const ring = (0.06 + 0.012 * Math.sin(t * 2.4)) * s + radius * 0.4;
            nodes.circle(v.x * s, v.y * s, ring).stroke({ width: 1.5, color: 0xffffff, alpha: 0.6 });
          }
        });
      },
    };
  }, [flow, counts, today, total]);

  // 사람 점: 자기 일간 꼭짓점 바깥쪽에 나란히.
  const dots = GROUP_ELEMENT_ORDER.flatMap((element, index) => {
    const here = people.filter((p) => p.dayMaster === element);
    const v = vertexOf(index);
    const out = { x: v.x - 0.5, y: v.y - 0.5 };
    const len = Math.hypot(out.x, out.y);
    const nx = out.x / len;
    const ny = out.y / len;
    // 한 꼭짓점에 여럿이면 바깥쪽으로 세 명씩 줄을 지어 앉힌다. 한 줄로 늘이면
    // 열 명 모임에서 무대 밖으로 나갔다.
    return here.map((person, k) => {
      const row = Math.floor(k / 3);
      const inRow = Math.min(3, here.length - row * 3);
      const spread = ((k % 3) - (inRow - 1) / 2) * 0.12;
      const out = 0.1 + row * 0.07;
      return { person, x: v.x + nx * out - ny * spread, y: v.y + ny * out + nx * spread, element };
    });
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#141c16]" role="img" aria-label={ariaLabel}>
      <div ref={host} className="absolute inset-0" />
      {GROUP_ELEMENT_ORDER.map((element, index) => {
        const v = vertexOf(index);
        return (
          <span
            key={element}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-black leading-tight text-white"
            style={{ left: `${v.x * 100}%`, top: `${v.y * 100}%` }}
            aria-hidden="true"
          >
            {elementName(element)}
            <span className="block text-[9px] font-bold opacity-70">{counts[element]}</span>
          </span>
        );
      })}
      {dots.map(({ person, x, y, element }) => (
        <span
          key={person.id}
          className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          aria-hidden="true"
        >
          <span className="h-2 w-2 rounded-full ring-1 ring-white/70" style={{ backgroundColor: `#${ELEMENT_HEX[element].toString(16).padStart(6, "0")}` }} />
          <span className="mt-0.5 max-w-[4.5rem] truncate text-[9px] font-bold text-white/85">{person.label}</span>
        </span>
      ))}
    </div>
  );
}
