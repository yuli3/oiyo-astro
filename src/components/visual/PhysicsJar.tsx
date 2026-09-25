import { useEffect, useRef } from "react";
import type MatterNS from "matter-js";

/**
 * 항목 하나가 공 하나가 되어 항아리로 떨어진다(Matter.js). 환생(삶)·업적(연 검사)이 쓴다.
 * 물리는 보여주기만 한다 — 무엇이 떨어질지는 부르는 쪽이 이미 정해 두었다.
 * `dropKey` 가 바뀌면 바닥이 열려 이전 공이 빠져나가고 새 공이 떨어진다.
 * 공을 끌어 던질 수 있고, 톡 누르면 `onSelect(id)`. 화면 밖이면 멈춘다.
 * 감축 선호면 부르는 쪽이 이 항아리 대신 목록을 보인다.
 */

export interface JarItem {
  id: string;
  /** 공 가운데 큰 글자(2~3자). */
  text: string;
  /** 공 아래쪽 작은 글자. */
  sub?: string;
  color: string;
  /** 속이 빈 공 — 아직 덜 된 것(예: 열기만 한 검사). */
  hollow?: boolean;
}

interface Props {
  items: JarItem[];
  dropKey: number;
  onSelect?: (id: string) => void;
  shakeLabel: string;
  ariaLabel: string;
  height?: number;
}

type Ball = MatterNS.Body & { plugin: { item?: JarItem; leaving?: boolean } };

export default function PhysicsJar({ items, dropKey, onSelect, shakeLabel, ariaLabel, height = 240 }: Props) {
  const HEIGHT = height;
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{
    drop: (items: JarItem[]) => void;
    shake: () => void;
  } | null>(null);
  const pending = useRef<JarItem[] | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let cleanup = () => {};

    void import("matter-js").then((mod) => {
      if (disposed || !canvasRef.current || !wrapRef.current) return;
      const Matter = ((mod as unknown as { default?: typeof MatterNS }).default ?? mod) as typeof MatterNS;
      const { Engine, Bodies, Body, Composite, Constraint, Query, Vector } = Matter;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.0012 } });
      let width = wrapRef.current.clientWidth || 320;
      let walls: MatterNS.Body[] = [];
      let floor: MatterNS.Body | null = null;
      let timers: number[] = [];

      const radiusFor = (count: number) => Math.max(14, Math.min(30, Math.sqrt((width * HEIGHT * 0.33) / Math.max(1, count) / Math.PI)));

      function buildWalls() {
        Composite.remove(engine.world, walls);
        if (floor) Composite.remove(engine.world, floor);
        const opts = { isStatic: true, restitution: 0.2, friction: 0.4 };
        const inset = Math.max(18, width * 0.08);
        walls = [
          // 항아리 옆면은 살짝 기울여 공이 가운데로 모이게 한다.
          Bodies.rectangle(inset - 10, HEIGHT / 2 + 20, 20, HEIGHT, { ...opts, angle: 0.08 }),
          Bodies.rectangle(width - inset + 10, HEIGHT / 2 + 20, 20, HEIGHT, { ...opts, angle: -0.08 }),
        ];
        floor = Bodies.rectangle(width / 2, HEIGHT + 10, width, 20, opts);
        Composite.add(engine.world, [...walls, floor]);
      }

      function resize() {
        if (!wrapRef.current) return;
        width = wrapRef.current.clientWidth || width;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(HEIGHT * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${HEIGHT}px`;
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildWalls();
      }

      function balls(): Ball[] {
        return Composite.allBodies(engine.world).filter((body) => !body.isStatic) as Ball[];
      }

      function drop(next: JarItem[]) {
        timers.forEach((id) => window.clearTimeout(id));
        timers = [];
        const old = balls();
        if (old.length && floor) {
          // 바닥을 열어 이전 삶을 흘려보낸다.
          old.forEach((ball) => (ball.plugin.leaving = true));
          Composite.remove(engine.world, floor);
          floor = null;
          timers.push(
            window.setTimeout(() => {
              floor = Bodies.rectangle(width / 2, HEIGHT + 10, width, 20, { isStatic: true, restitution: 0.2 });
              Composite.add(engine.world, floor);
            }, 450),
          );
        }
        const r = radiusFor(next.length);
        // 많을수록 간격을 줄여 한꺼번에 쏟아지듯 떨어진다.
        const gap = Math.max(35, Math.min(110, 2200 / Math.max(1, next.length)));
        next.forEach((item, order) => {
          timers.push(
            window.setTimeout(() => {
              const x = width / 2 + (Math.random() - 0.5) * width * 0.4;
              const ball = Bodies.circle(x, -r * 2, r, {
                restitution: 0.45,
                friction: 0.05,
                density: 0.002,
              }) as Ball;
              ball.plugin = { item };
              Body.setVelocity(ball, { x: (Math.random() - 0.5) * 3, y: 2 });
              Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.2);
              Composite.add(engine.world, ball);
            }, 550 + order * gap),
          );
        });
      }

      function shake() {
        for (const ball of balls()) {
          Body.applyForce(ball, ball.position, {
            x: (Math.random() - 0.5) * 0.04 * ball.mass,
            y: -0.06 * ball.mass,
          });
        }
      }

      // 끌기·톡 누르기: Matter.Mouse 대신 포인터 이벤트로 직접 잡아 DPR·터치 차이를 피한다.
      let grab: { constraint: MatterNS.Constraint; ball: Ball; x: number; y: number; moved: boolean } | null = null;
      const point = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };
      const onDown = (event: PointerEvent) => {
        const p = point(event);
        const hit = Query.point(balls(), p)[0] as Ball | undefined;
        if (!hit) return;
        const constraint = Constraint.create({
          pointA: p,
          bodyB: hit,
          pointB: Vector.sub(p, hit.position),
          stiffness: 0.12,
          damping: 0.1,
        });
        Composite.add(engine.world, constraint);
        grab = { constraint, ball: hit, x: p.x, y: p.y, moved: false };
        canvas.setPointerCapture(event.pointerId);
      };
      const onMove = (event: PointerEvent) => {
        const p = point(event);
        if (grab) {
          grab.constraint.pointA = p;
          if (Math.hypot(p.x - grab.x, p.y - grab.y) > 6) grab.moved = true;
        }
        const over = Query.point(balls(), p).length > 0;
        canvas.style.cursor = grab ? "grabbing" : over ? "grab" : "default";
      };
      const onUp = () => {
        if (!grab) return;
        Composite.remove(engine.world, grab.constraint);
        const item = grab.ball.plugin.item;
        if (!grab.moved && item) selectRef.current?.(item.id);
        grab = null;
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);

      function draw() {
        ctx!.clearRect(0, 0, width, HEIGHT);
        const glow = ctx!.createLinearGradient(0, 0, 0, HEIGHT);
        glow.addColorStop(0, "rgba(196,181,253,0)");
        glow.addColorStop(1, "rgba(196,181,253,0.12)");
        ctx!.fillStyle = glow;
        ctx!.fillRect(0, 0, width, HEIGHT);
        ctx!.strokeStyle = "rgba(148,163,184,0.35)";
        ctx!.lineWidth = 2;
        for (const wall of walls) {
          ctx!.beginPath();
          ctx!.moveTo(wall.vertices[0].x, wall.vertices[0].y);
          wall.vertices.forEach((v) => ctx!.lineTo(v.x, v.y));
          ctx!.closePath();
          ctx!.stroke();
        }
        for (const ball of balls()) {
          const item = ball.plugin.item;
          if (!item) continue;
          const r = ball.circleRadius ?? 16;
          const { x, y } = ball.position;
          ctx!.save();
          ctx!.globalAlpha = ball.plugin.leaving ? 0.45 : 1;
          ctx!.shadowColor = item.color;
          ctx!.shadowBlur = 14;
          ctx!.beginPath();
          ctx!.arc(x, y, item.hollow ? r - 1.5 : r, 0, Math.PI * 2);
          if (item.hollow) {
            ctx!.fillStyle = "rgba(15,23,42,0.85)";
            ctx!.fill();
            ctx!.strokeStyle = item.color;
            ctx!.lineWidth = 3;
            ctx!.stroke();
          } else {
            ctx!.fillStyle = item.color;
            ctx!.fill();
          }
          ctx!.shadowBlur = 0;
          ctx!.translate(x, y);
          ctx!.rotate(ball.angle);
          ctx!.fillStyle = item.hollow ? item.color : "#0f172a";
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";
          ctx!.font = `800 ${Math.round(r * (item.text.length > 3 ? 0.46 : item.text.length > 2 ? 0.55 : 0.72))}px system-ui, sans-serif`;
          ctx!.fillText(item.text, 0, item.sub ? -r * 0.08 : 0);
          if (item.sub) {
            ctx!.font = `700 ${Math.max(9, Math.round(r * 0.34))}px system-ui, sans-serif`;
            ctx!.fillText(item.sub, 0, r * 0.52);
          }
          ctx!.restore();
        }
      }

      let last = performance.now();
      let visible = true;
      const loop = (now: number) => {
        const delta = Math.min(32, now - last);
        last = now;
        Engine.update(engine, delta);
        for (const ball of balls()) {
          if (ball.position.y > HEIGHT + 120) Composite.remove(engine.world, ball);
        }
        draw();
        frame = visible ? requestAnimationFrame(loop) : 0;
      };

      resize();
      const observer = new ResizeObserver(() => resize());
      observer.observe(wrapRef.current);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) {
          last = performance.now();
          frame = requestAnimationFrame(loop);
        }
      });
      io.observe(canvas);
      frame = requestAnimationFrame(loop);
      api.current = { drop, shake };
      if (pending.current) {
        drop(pending.current);
        pending.current = null;
      }

      cleanup = () => {
        observer.disconnect();
        io.disconnect();
        timers.forEach((id) => window.clearTimeout(id));
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        api.current = null;
      };
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;
    if (api.current) api.current.drop(items);
    else pending.current = items;
    // items 내용이 아니라 dropKey 가 바뀔 때마다 떨어뜨린다.
  }, [dropKey]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950">
      <div ref={wrapRef} className="w-full">
        <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className="block touch-pan-y" style={{ height: HEIGHT }} />
      </div>
      <button
        type="button"
        onClick={() => api.current?.shake()}
        className="absolute right-3 top-3 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-white/20"
      >
        {shakeLabel}
      </button>
    </div>
  );
}
