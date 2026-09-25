/**
 * 나의 지도 마인드맵의 "나에게 모이는 빛".
 *
 * 칩 하나를 고르면 그 카테고리 노드에서 가운데 "나"로 알갱이 `MOTES_PER_CHIP`개가
 * 날아와 궤도를 돈다. 알갱이 수는 고른 칩 수에서만 나온다 — 장식이 아니라
 * 선택의 양이다. 칩을 빼면 그 카테고리 알갱이가 노드로 돌아가며 사라진다.
 *
 * DOM·canvas 를 모르는 순수 함수라 테스트에서 그대로 돌린다.
 */

export const MOTES_PER_CHIP = 5;

export type MoteMode = "flying" | "orbit" | "leaving";

export interface Mote {
  id: number;
  cat: string;
  mode: MoteMode;
  /** 현재 위치(스테이지 px). */
  x: number;
  y: number;
  /** 출발점 — 날아오기 시작한 곳, 또는 떠날 때의 자리. */
  fromX: number;
  fromY: number;
  /** 궤도 파라미터. */
  orbitR: number;
  angle: number;
  speed: number;
  /** 모드 안에서 흐른 시간(초). */
  t: number;
  /** 날기 시작 전 지연(초). */
  delay: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface MoteStage {
  center: Point;
  /** 카테고리 id → 노드 위치. */
  nodes: Record<string, Point>;
  /** 가운데 원 바깥 궤도 반지름 범위. */
  orbitMin: number;
  orbitMax: number;
}

export const FLY_SECONDS = 0.9;
export const LEAVE_SECONDS = 0.7;

let nextId = 1;

function orbitPoint(stage: MoteStage, mote: Pick<Mote, "orbitR" | "angle">): Point {
  return {
    x: stage.center.x + Math.cos(mote.angle) * mote.orbitR,
    // 살짝 눌린 타원 — 평면 원보다 궤도처럼 읽힌다.
    y: stage.center.y + Math.sin(mote.angle) * mote.orbitR * 0.82,
  };
}

/** 카테고리별 목표 알갱이 수. */
export function moteTargets(selection: Record<string, string[]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [cat, chips] of Object.entries(selection)) out[cat] = (chips?.length ?? 0) * MOTES_PER_CHIP;
  return out;
}

/**
 * 목표에 맞춰 알갱이를 더하거나(노드에서 날아옴) 떠나보낸다. 떠나는 중인 알갱이는
 * 세지 않는다. `settled` 면 새 알갱이를 날리지 않고 바로 궤도에 둔다(처음 열 때·감축 선호).
 */
export function reconcileMotes(
  motes: Mote[],
  targets: Record<string, number>,
  stage: MoteStage,
  rand: () => number = Math.random,
  settled = false,
): Mote[] {
  const next = [...motes];
  const cats = new Set([...Object.keys(targets), ...motes.map((m) => m.cat)]);
  for (const cat of cats) {
    const want = Math.max(0, targets[cat] ?? 0);
    const live = next.filter((m) => m.cat === cat && m.mode !== "leaving");
    if (live.length < want) {
      const from = stage.nodes[cat] ?? stage.center;
      for (let i = live.length; i < want; i += 1) {
        const mote: Mote = {
          id: nextId++,
          cat,
          mode: settled ? "orbit" : "flying",
          x: from.x,
          y: from.y,
          fromX: from.x,
          fromY: from.y,
          orbitR: stage.orbitMin + rand() * (stage.orbitMax - stage.orbitMin),
          angle: rand() * Math.PI * 2,
          speed: (0.35 + rand() * 0.5) * (rand() < 0.5 ? -1 : 1),
          t: 0,
          delay: settled ? 0 : Math.min(1.2, (i - live.length) * 0.06),
        };
        if (settled) Object.assign(mote, orbitPoint(stage, mote));
        next.push(mote);
      }
    } else if (live.length > want) {
      // 가장 최근에 온 것부터 떠난다.
      for (const mote of live.slice(want)) {
        mote.mode = "leaving";
        mote.fromX = mote.x;
        mote.fromY = mote.y;
        mote.t = 0;
      }
    }
  }
  return next;
}

function ease(k: number): number {
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}

/** 한 스텝 진행하고, 다 떠난 알갱이는 뺀 배열을 돌려준다. */
export function stepMotes(motes: Mote[], dt: number, stage: MoteStage): Mote[] {
  const out: Mote[] = [];
  for (const mote of motes) {
    mote.angle += mote.speed * dt;
    if (mote.mode === "flying") {
      if (mote.delay > 0) {
        mote.delay -= dt;
        out.push(mote);
        continue;
      }
      mote.t += dt;
      const k = Math.min(1, mote.t / FLY_SECONDS);
      const target = orbitPoint(stage, mote);
      const e = ease(k);
      // 곧게 오지 않고 가운데를 향해 휘어 들어온다.
      const bend = Math.sin(k * Math.PI) * 18;
      const dx = target.x - mote.fromX;
      const dy = target.y - mote.fromY;
      const len = Math.hypot(dx, dy) || 1;
      mote.x = mote.fromX + dx * e + (-dy / len) * bend;
      mote.y = mote.fromY + dy * e + (dx / len) * bend;
      if (k >= 1) {
        mote.mode = "orbit";
        mote.t = 0;
      }
      out.push(mote);
    } else if (mote.mode === "orbit") {
      Object.assign(mote, orbitPoint(stage, mote));
      out.push(mote);
    } else {
      mote.t += dt;
      const k = Math.min(1, mote.t / LEAVE_SECONDS);
      const home = stage.nodes[mote.cat] ?? stage.center;
      const e = ease(k);
      mote.x = mote.fromX + (home.x - mote.fromX) * e;
      mote.y = mote.fromY + (home.y - mote.fromY) * e;
      if (k < 1) out.push(mote);
    }
  }
  return out;
}

/** 그릴 때의 불투명도 — 날아오며 밝아지고 떠나며 흐려진다. */
export function moteAlpha(mote: Mote): number {
  if (mote.mode === "flying") return mote.delay > 0 ? 0 : 0.35 + 0.65 * Math.min(1, mote.t / FLY_SECONDS);
  if (mote.mode === "leaving") return 1 - Math.min(1, mote.t / LEAVE_SECONDS);
  return 0.55 + 0.35 * Math.sin(mote.angle * 3);
}
