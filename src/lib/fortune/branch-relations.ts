// 12지지(띠) 사이의 전통 관계표. 0=子(쥐) … 11=亥(돼지).
// 삼합·육합·충·해·형만 쓴다(자형·파는 뺀다). 띠 관계 원과 신년 모음이 같이 쓴다.

export type BranchRelation = 'trine' | 'pair' | 'clash' | 'harm' | 'punish';
export const BRANCH_RELATIONS: BranchRelation[] = ['trine', 'pair', 'clash', 'harm', 'punish'];

const TRINES = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
const PAIRS: [number, number][] = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const HARMS: [number, number][] = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
// 寅巳申 무은지형, 丑戌未 지세지형, 子卯 무례지형
const PUNISH_GROUPS = [[2, 5, 8], [1, 10, 7], [0, 3]];

const mod = (n: number) => ((n % 12) + 12) % 12;
const partner = (pairs: [number, number][], a: number) =>
  pairs.flatMap(([x, y]) => (x === a ? [y] : y === a ? [x] : []));

/** 띠 a 와 각 관계로 묶이는 띠 번호들. */
export function relationsOf(a: number): Record<BranchRelation, number[]> {
  const b = mod(a);
  return {
    trine: TRINES.find((g) => g.includes(b))!.filter((x) => x !== b),
    pair: partner(PAIRS, b),
    clash: [mod(b + 6)],
    harm: partner(HARMS, b),
    punish: PUNISH_GROUPS.filter((g) => g.includes(b)).flatMap((g) => g.filter((x) => x !== b)),
  };
}

/** a 와 b 사이 관계 목록(없으면 빈 배열). */
export function relationBetween(a: number, b: number): BranchRelation[] {
  const r = relationsOf(a);
  return BRANCH_RELATIONS.filter((k) => r[k].includes(mod(b)));
}
