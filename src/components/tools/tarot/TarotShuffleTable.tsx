import { useEffect, useRef } from "react";
import type MatterNS from "matter-js";

/**
 * 뽑기 직전의 셔플 테이블(Matter.js). 위에서 내려다본 탁자라 중력이 없다.
 * 22장 뒷면이 소용돌이치며 섞이다가, 이미 뽑힌 카드(`chosen`, 덱 안의 자리)만
 * 금빛으로 빛나며 떠오르고 `onDone` 을 부른다.
 *
 * 어느 카드가 나올지는 이 장면이 정하지 않는다 — `shuffleDeck` 이 먼저 정하고,
 * 물리는 그 결과를 보여 줄 뿐이다. 감축 선호면 부모가 이 장면을 건너뛴다.
 */

interface Props {
  deckSize: number;
  chosen: number[];
  onDone: () => void;
  label: string;
}

type Card = MatterNS.Body & { plugin: { index: number; chosenAt?: number } };

const HEIGHT = 230;
const SWIRL_MS = 1300;
const RISE_MS = 750;

export default function TarotShuffleTable({ deckSize, chosen, onDone, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      doneRef.current();
    };
    // matter 를 못 받아 오면 연출 없이 바로 넘어간다.
    const fallback = window.setTimeout(finish, SWIRL_MS + RISE_MS + 1500);

    void import("matter-js")
      .then((mod) => {
        if (disposed || !canvasRef.current || !wrapRef.current) return;
        const Matter = ((mod as unknown as { default?: typeof MatterNS }).default ?? mod) as typeof MatterNS;
        const { Engine, Bodies, Body, Composite } = Matter;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const width = wrapRef.current.clientWidth || 320;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(HEIGHT * dpr);
        canvas.style.width = `${width}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
        const wall = { isStatic: true };
        Composite.add(engine.world, [
          Bodies.rectangle(width / 2, -10, width, 20, wall),
          Bodies.rectangle(width / 2, HEIGHT + 10, width, 20, wall),
          Bodies.rectangle(-10, HEIGHT / 2, 20, HEIGHT, wall),
          Bodies.rectangle(width + 10, HEIGHT / 2, 20, HEIGHT, wall),
        ]);

        const cw = Math.max(26, Math.min(40, width / 11));
        const ch = cw * 1.5;
        const cards: Card[] = [];
        for (let i = 0; i < deckSize; i += 1) {
          // 가운데 한 무더기에서 시작한다.
          const card = Bodies.rectangle(width / 2 + (Math.random() - 0.5) * 8, HEIGHT / 2 + (Math.random() - 0.5) * 8, cw, ch, {
            frictionAir: 0.06,
            restitution: 0.3,
            chamfer: { radius: 4 },
            angle: (Math.random() - 0.5) * 0.3,
          }) as Card;
          card.plugin = { index: i };
          cards.push(card);
        }
        Composite.add(engine.world, cards);
        const chosenSet = new Map(chosen.map((index, order) => [index, order]));

        const start = performance.now();
        let last = start;

        const draw = (now: number) => {
          ctx.clearRect(0, 0, width, HEIGHT);
          const felt = ctx.createRadialGradient(width / 2, HEIGHT / 2, 20, width / 2, HEIGHT / 2, width * 0.7);
          felt.addColorStop(0, "#14532d");
          felt.addColorStop(1, "#052e16");
          ctx.fillStyle = felt;
          ctx.fillRect(0, 0, width, HEIGHT);
          // 떠오르는 카드를 맨 위에 그린다.
          const order = [...cards].sort((a, b) => (a.plugin.chosenAt != null ? 1 : 0) - (b.plugin.chosenAt != null ? 1 : 0));
          for (const card of order) {
            const rising = card.plugin.chosenAt != null;
            const k = rising ? Math.min(1, (now - (card.plugin.chosenAt as number)) / RISE_MS) : 0;
            ctx.save();
            ctx.translate(card.position.x, card.position.y);
            ctx.rotate(card.angle);
            const scale = 1 + k * 0.35;
            ctx.scale(scale, scale);
            if (rising) {
              ctx.shadowColor = "#fde68a";
              ctx.shadowBlur = 18 * k + 4;
            }
            const grad = ctx.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2);
            grad.addColorStop(0, "#16a34a");
            grad.addColorStop(1, "#052e16");
            ctx.fillStyle = grad;
            ctx.strokeStyle = rising ? "#fbbf24" : "#86efac";
            ctx.lineWidth = rising ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 4);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = rising ? "#fde68a" : "rgba(187,247,208,0.75)";
            ctx.font = `${Math.round(cw * 0.45)}px system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("✦", 0, 0);
            ctx.restore();
          }
        };

        const loop = (now: number) => {
          const elapsed = now - start;
          const delta = Math.min(32, now - last);
          last = now;
          if (elapsed < SWIRL_MS) {
            // 소용돌이: 가운데를 도는 접선 힘 + 살짝 안쪽으로.
            const strength = Math.sin((elapsed / SWIRL_MS) * Math.PI);
            for (const card of cards) {
              const dx = card.position.x - width / 2;
              const dy = card.position.y - HEIGHT / 2;
              const dist = Math.hypot(dx, dy) || 1;
              const f = 0.0011 * card.mass * strength;
              Body.applyForce(card, card.position, {
                x: (-dy / dist) * f - (dx / dist) * f * 0.25 + (Math.random() - 0.5) * f * 0.6,
                y: (dx / dist) * f - (dy / dist) * f * 0.25 + (Math.random() - 0.5) * f * 0.6,
              });
            }
          } else {
            // 뽑힌 카드가 차례로 떠올라 위쪽 자리로 모인다.
            for (const card of cards) {
              const slot = chosenSet.get(card.plugin.index);
              if (slot == null) continue;
              const at = start + SWIRL_MS + slot * 120;
              if (now < at) continue;
              if (card.plugin.chosenAt == null) {
                card.plugin.chosenAt = now;
                Body.setStatic(card, true);
              }
              const tx = (width / (chosen.length + 1)) * (slot + 1);
              const ty = HEIGHT * 0.3;
              Body.setPosition(card, {
                x: card.position.x + (tx - card.position.x) * 0.18,
                y: card.position.y + (ty - card.position.y) * 0.18,
              });
              Body.setAngle(card, card.angle * 0.82);
            }
          }
          Engine.update(engine, delta);
          draw(now);
          const lastRise = start + SWIRL_MS + (chosen.length - 1) * 120 + RISE_MS;
          if (now > lastRise + 250) {
            finish();
            return;
          }
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      })
      .catch(finish);

    return () => {
      disposed = true;
      window.clearTimeout(fallback);
      cancelAnimationFrame(frame);
    };
    // 한 번 섞을 때마다 새로 마운트된다(부모가 key 로 갈아 끼운다).
  }, []);

  return (
    <div ref={wrapRef} className="overflow-hidden rounded-2xl">
      <canvas ref={canvasRef} role="img" aria-label={label} className="block w-full" style={{ height: HEIGHT }} />
    </div>
  );
}
