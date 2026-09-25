/**
 * 출생차트 3D 천구의 배치 계산. 그리기(three)와 떨어진 순수 함수.
 *
 * 황경 λ 를 황도 고리 위 각도로 옮긴다. 차트 바퀴 관례대로 상승점(ASC)을 왼쪽(9시)에
 * 두고 반시계 방향으로 황경이 커진다. 시각이 없어 ASC 가 없으면 양자리 0°를 왼쪽에 둔다.
 * 황경이 가까운 천체는 겹쳐 보이지 않게 위로 한 칸씩 쌓는다 — 황경 자체는 바꾸지 않는다.
 */

export interface SkyBodyInput {
  key: string;
  longitude: number;
}

export interface SkyBodyPlaced extends SkyBodyInput {
  /** 고리 위 각도(라디안). x = cos·R, z = -sin·R. */
  angle: number;
  /** 가까운 천체와 겹치지 않게 올린 칸 수(0부터). */
  stack: number;
}

/** 이보다 가까우면(도) 같은 무더기로 보고 쌓는다. */
export const STACK_DEGREES = 7;

function normalize(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function eclipticAngle(longitude: number, ascendant?: number | null): number {
  const offset = ascendant == null ? 0 : ascendant;
  return ((180 + normalize(longitude - offset)) * Math.PI) / 180;
}

export function placeSkyBodies<T extends SkyBodyInput>(bodies: T[], ascendant?: number | null): (T & SkyBodyPlaced)[] {
  const sorted = [...bodies].sort((a, b) => normalize(a.longitude) - normalize(b.longitude));
  const placed: (T & SkyBodyPlaced)[] = [];
  for (const body of sorted) {
    let stack = 0;
    for (const other of placed) {
      const gap = Math.abs(normalize(body.longitude) - normalize(other.longitude));
      const d = Math.min(gap, 360 - gap);
      if (d < STACK_DEGREES && other.stack >= stack) stack = other.stack + 1;
    }
    placed.push({ ...body, angle: eclipticAngle(body.longitude, ascendant), stack });
  }
  // 입력 순서로 돌려준다.
  return bodies.map((body) => placed.find((p) => p.key === body.key)!);
}
