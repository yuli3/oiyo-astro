"use client";

/**
 * A5 궤적 서명 — 모임 카드.
 *
 * 각자의 좌표를 궤도 하나로 옮겨(signatureOrbit) 꼬리를 남기면 모임마다 다른
 * 무늬가 닫힌다. 화면에서는 천천히 그려지고, "이미지로 저장"은 같은 그리기
 * 함수로 큰 캔버스에 한 번에 그린다 — 화면과 저장본이 같은 무늬다.
 *
 * 공유 이미지에는 별칭과 모임 이름만 싣는다. 생년월일·시각은 싣지 않는다.
 */
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useMotion";
import type { FiveElement } from "@/lib/ontology/saju/types";
import type { SignatureOrbit } from "@/lib/symbolic-tradition/group-flow";

const GLOW: Record<string, string> = {
  wood: "#7fd39a", fire: "#ff8a66", earth: "#e0b872", metal: "#d5dde6", water: "#8cc0f0",
};
const STEPS = 1400;
const DRAW_SECONDS = 7;

interface Person { id: string; label: string; element: FiveElement; orbit: SignatureOrbit }

function pointAt(o: SignatureOrbit, tau: number, R: number): [number, number] {
  const a = o.phase + o.speed * tau;
  const e = o.epicycleSpeed * tau;
  return [
    R * o.radius * Math.cos(a) + R * o.epicycleRadius * Math.cos(e),
    R * o.radius * Math.sin(a) + R * o.epicycleRadius * Math.sin(e),
  ];
}

/** 무늬를 progress(0~1)만큼 그린다. 화면과 저장본이 같은 함수를 쓴다. */
function drawPattern(ctx: CanvasRenderingContext2D, people: Person[], cx: number, cy: number, R: number, progress: number, line: number) {
  const upto = Math.floor(STEPS * progress);
  ctx.globalCompositeOperation = "lighter";
  for (const person of people) {
    ctx.beginPath();
    for (let i = 0; i <= upto; i += 1) {
      const [x, y] = pointAt(person.orbit, (i / STEPS) * Math.PI * 2, R);
      if (i === 0) ctx.moveTo(cx + x, cy + y);
      else ctx.lineTo(cx + x, cy + y);
    }
    ctx.strokeStyle = GLOW[person.element];
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = line;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

export default function SignatureCard({
  people,
  title,
  copy,
}: {
  people: Person[];
  title: string;
  copy: { heading: string; lead: string; save: string; saved: string; brand: string };
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [saved, setSaved] = useState(false);
  const key = people.map((p) => `${p.id}:${p.element}:${JSON.stringify(p.orbit)}`).join("|");

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const start = performance.now();
    const render = () => {
      const size = el.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (el.width !== size * dpr) {
        el.width = size * dpr;
        el.height = size * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#141c16";
      ctx.fillRect(0, 0, size, size);
      const progress = reduce ? 1 : Math.min(1, (performance.now() - start) / 1000 / DRAW_SECONDS);
      drawPattern(ctx, people, size / 2, size / 2 - size * 0.03, size * 0.44, progress, 1);
      if (progress < 1) raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduce]);

  const save = async () => {
    const W = 1080;
    const H = 1350;
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#141c16";
    ctx.fillRect(0, 0, W, H);
    drawPattern(ctx, people, W / 2, 560, 470, 1, 2.2);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "800 60px system-ui, sans-serif";
    ctx.fillText(title, W / 2, 1140, W - 120);
    ctx.font = "600 30px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText(people.map((p) => p.label).join(" · "), W / 2, 1200, W - 120);
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(copy.brand, W / 2, 1290);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], "oiyo-our-map.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title });
        return;
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-border bg-card p-4 sm:p-7">
      <h2 className="text-lg font-black text-foreground">{copy.heading}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.lead}</p>
      <div className="relative mx-auto mt-4 aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-[#141c16]">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <p className="pointer-events-none absolute inset-x-0 bottom-3 px-4 text-center text-sm font-black text-white">{title}</p>
      </div>
      <button type="button" onClick={() => void save()} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary text-sm font-black text-primary">
        {saved ? copy.saved : copy.save}
      </button>
    </section>
  );
}
