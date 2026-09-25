import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useMotion";
import { moteAlpha, moteTargets, reconcileMotes, stepMotes, type Mote, type MoteStage } from "@/lib/particles/motes";

/**
 * 마인드맵 무대 뒤에 깔리는 canvas. 고른 칩마다 알갱이가 카테고리 노드에서
 * "나"로 날아와 궤도를 돈다(`@/lib/particles/motes`). 버튼 뒤에 있고 클릭을
 * 막지 않는다. 감축 선호면 알갱이를 궤도에 둔 한 장면만 그린다.
 */
export function MindmapMotes({
  size,
  stage,
  selection,
  colors,
}: {
  size: number;
  stage: MoteStage;
  selection: Record<string, string[]>;
  colors: Record<string, string>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<Mote[]>([]);
  const reducedMotion = useReducedMotion();
  const drawRef = useRef<() => void>(() => {});
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    motesRef.current = reconcileMotes(motesRef.current, moteTargets(selection), stage, Math.random, reducedMotion);
    if (reducedMotion) drawRef.current();
    else wakeRef.current();
  }, [selection, stage, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      for (const mote of motesRef.current) {
        const alpha = moteAlpha(mote);
        if (alpha <= 0.01) continue;
        const color = colors[mote.cat] ?? "#16a34a";
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    drawRef.current = draw;

    let frame = 0;
    let last = 0;
    let visible = true;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      motesRef.current = stepMotes(motesRef.current, dt, stage);
      draw();
      frame = motesRef.current.length && visible ? requestAnimationFrame(tick) : 0;
      if (!frame) last = 0;
    };
    const wake = () => {
      if (reducedMotion || frame || !visible || !motesRef.current.length) return;
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);
    if (reducedMotion) draw();
    else wake();
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      wakeRef.current = () => {};
    };
  }, [size, stage, colors, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ width: size, height: size }}
    />
  );
}
