import { prefersReducedMotion } from "../../hooks/useMotion";
import type { RevealPreset } from "./policy";

/**
 * OIYO 공용 2D 파티클 엔진. 의존성 없이 canvas 2D 로 그린다.
 *
 * 무거운 장면(Three.js·Matter.js)은 그 장면이 필요한 도구가 직접 쓰고, 사이트
 * 전반에 깔리는 연출은 여기서 가볍게 처리한다 — 모든 페이지가 WebGL 이나 React
 * 런타임을 받아야 하는 이유가 되면 안 되기 때문이다.
 *
 * 모든 진입점은 감축 선호를 먼저 읽는다: 결과 공개 연출은 아예 건너뛰고,
 * 배경 입자는 한 프레임만 그리고 멈춘다.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
  phase: number;
}

const PALETTE: Record<RevealPreset, string[]> = {
  bloom: ["#34d399", "#10b981", "#a7f3d0", "#c4b5fd", "#fde68a"],
  stardust: ["#fde68a", "#fef3c7", "#ffffff", "#c4b5fd", "#f9a8d4"],
};

export function spawnReveal(
  preset: RevealPreset,
  width: number,
  height: number,
  rand: () => number = Math.random,
): Particle[] {
  const colors = PALETTE[preset];
  const count = Math.round(Math.min(180, Math.max(70, (width * height) / 7000)));
  const out: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const color = colors[Math.floor(rand() * colors.length)];
    if (preset === "bloom") {
      const angle = rand() * Math.PI * 2;
      const speed = 160 + rand() * 420;
      out.push({
        x: width / 2,
        y: height * 0.38,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: 1.1 + rand() * 0.9,
        size: 1.4 + rand() * 2.8,
        color,
        phase: rand() * Math.PI * 2,
      });
    } else {
      out.push({
        x: rand() * width,
        y: height + rand() * height * 0.25,
        vx: (rand() - 0.5) * 30,
        vy: -(140 + rand() * 260),
        age: -rand() * 0.5,
        life: 1.6 + rand() * 1.1,
        size: 1.2 + rand() * 2.4,
        color,
        phase: rand() * Math.PI * 2,
      });
    }
  }
  return out;
}

/** 한 스텝 진행. 살아 있는 입자가 남았는지 돌려준다. */
export function stepParticles(particles: Particle[], dt: number, preset: RevealPreset): boolean {
  let alive = false;
  const drag = preset === "bloom" ? Math.exp(-2.4 * dt) : Math.exp(-0.6 * dt);
  for (const p of particles) {
    p.age += dt;
    if (p.age < 0) {
      alive = true;
      continue;
    }
    if (p.age >= p.life) continue;
    alive = true;
    p.vx *= drag;
    p.vy *= drag;
    if (preset === "bloom") p.vy += 70 * dt;
    else p.vx += Math.sin(p.age * 3 + p.phase) * 40 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  return alive;
}

export function particleAlpha(p: Particle): number {
  if (p.age < 0 || p.age >= p.life) return 0;
  const k = p.age / p.life;
  const fadeIn = Math.min(1, k * 8);
  const twinkle = 0.75 + 0.25 * Math.sin(p.age * 14 + p.phase);
  return fadeIn * (1 - k) * twinkle;
}

function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

let revealRunning = false;

/** 화면 전체에 결과 공개 연출을 한 번 띄운다. 끝나면 canvas 를 지운다. */
export function playReveal(preset: RevealPreset): void {
  if (typeof window === "undefined" || prefersReducedMotion() || revealRunning) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.oiyoParticles = "reveal";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: "none",
    zIndex: "60",
  } satisfies Partial<CSSStyleDeclaration>);
  const ctx = fitCanvas(canvas, width, height);
  if (!ctx) return;
  document.body.appendChild(canvas);
  revealRunning = true;

  const particles = spawnReveal(preset, width, height);
  let last = performance.now();
  let ringAge = 0;
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ringAge += dt;
    const alive = stepParticles(particles, dt, preset);
    ctx.clearRect(0, 0, width, height);
    if (preset === "bloom" && ringAge < 0.9) {
      // 첫 순간의 고리 — 결과가 "열린다"는 신호.
      const k = ringAge / 0.9;
      ctx.globalAlpha = (1 - k) * 0.5;
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.38, 20 + k * Math.min(width, height) * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const p of particles) {
      const alpha = particleAlpha(p);
      if (alpha > 0.01) drawGlow(ctx, p.x, p.y, p.size, p.color, alpha);
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(tick);
    else {
      canvas.remove();
      revealRunning = false;
    }
  };
  requestAnimationFrame(tick);
}

export interface AmbientOptions {
  /** 입자 색. 첫 색이 가장 많이 쓰인다. */
  colors?: string[];
  /** 1만 px² 당 입자 수. */
  density?: number;
  /** 가까운 입자끼리 선을 잇는다(별자리). */
  links?: boolean;
}

/**
 * 요소 뒤에 깔리는 배경 입자. 화면 밖이거나 탭이 숨으면 멈춘다.
 * 돌려준 함수를 부르면 정리된다.
 */
export function mountAmbient(host: HTMLElement, options: AmbientOptions = {}): () => void {
  const colors = options.colors ?? ["#34d399", "#a7f3d0", "#c4b5fd", "#fde68a"];
  const density = options.density ?? 0.9;
  const links = options.links ?? true;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.oiyoParticles = "ambient";
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);
  host.prepend(canvas);

  let width = 0;
  let height = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let dots: Particle[] = [];
  let frame = 0;
  let visible = true;
  let pointer: { x: number; y: number } | null = null;
  const still = prefersReducedMotion();

  const seed = () => {
    const count = Math.round(Math.min(90, ((width * height) / 10000) * density));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.3) * 10,
      vy: -(4 + Math.random() * 12),
      age: Math.random() * 10,
      life: Infinity,
      size: 0.8 + Math.random() * 1.9,
      color: colors[Math.random() < 0.5 ? 0 : Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const resize = () => {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    ctx = fitCanvas(canvas, width, height);
    seed();
    draw();
  };

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (links) {
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = colors[0];
      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 110 * 110) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / 110) * 0.18;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.stroke();
        }
      }
    }
    for (const p of dots) {
      const alpha = 0.35 + 0.35 * Math.sin(p.age * 1.3 + p.phase);
      drawGlow(ctx, p.x, p.y, p.size, p.color, Math.max(0.08, alpha));
    }
    ctx.globalAlpha = 1;
  };

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    for (const p of dots) {
      p.age += dt;
      if (pointer) {
        // 포인터 가까이의 입자는 살짝 비켜난다.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 1) {
          const push = (1 - Math.sqrt(d2) / 120) * 60 * dt;
          p.x += (dx / Math.sqrt(d2)) * push;
          p.y += (dy / Math.sqrt(d2)) * push;
        }
      }
      p.x += (p.vx + Math.sin(p.age * 0.7 + p.phase) * 6) * dt;
      p.y += p.vy * dt;
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    }
    draw();
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (still || frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const onPointer = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const onLeave = () => {
    pointer = null;
  };
  const onVisibility = () => (document.hidden ? stop() : start());
  // host 는 클릭을 막지 않으려고 pointer-events 가 꺼져 있으므로 부모에서 듣는다.
  const pointerTarget = host.parentElement ?? host;

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(host);
  pointerTarget.addEventListener("pointermove", onPointer);
  pointerTarget.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  start();

  return () => {
    stop();
    resizeObserver.disconnect();
    io.disconnect();
    pointerTarget.removeEventListener("pointermove", onPointer);
    pointerTarget.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.remove();
  };
}
