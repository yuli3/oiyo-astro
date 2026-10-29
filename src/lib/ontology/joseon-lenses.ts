export type JoseonFaction = 'dongin' | 'seoin' | 'namin' | 'bukin' | 'noron' | 'soron';
export type LensAxis = 'principle' | 'tradition' | 'action';
export type LensVector = Record<LensAxis, number>;
export const JOSEON_LENS_VERSION = 'editorial-v1';
export const LENS_AXES: readonly LensAxis[] = ['principle','tradition','action'];
// 2026-10-29: authored game coordinates, NOT historical measurements, an
// empirical personality scale or a claim that birth predicts political beliefs.
const factionVectors: Record<JoseonFaction,LensVector> = {
  dongin:{principle:1,tradition:0,action:-1}, seoin:{principle:-1,tradition:0.5,action:0.5},
  namin:{principle:0.25,tradition:-0.25,action:-0.75}, bukin:{principle:0.25,tradition:-1,action:1},
  noron:{principle:0.75,tradition:1,action:0.25}, soron:{principle:-0.5,tradition:-0.75,action:0.25},
};
const elementVectors: Record<string,LensVector> = {
  wood:{principle:-0.25,tradition:-1,action:0.5}, fire:{principle:0,tradition:-0.25,action:1},
  earth:{principle:-0.5,tradition:0.5,action:-0.25}, metal:{principle:1,tradition:1,action:0},
  water:{principle:0.25,tradition:-0.5,action:-1},
};
function weightedVector(weights: Readonly<Record<string,number>>, basis: Readonly<Record<string,LensVector>>, requireAll: boolean): LensVector | null {
  const entries=Object.entries(weights);
  if (requireAll && Object.keys(basis).some(key=>!Object.hasOwn(weights,key))) return null;
  if (entries.some(([key,value])=>!Object.hasOwn(basis,key)||!Number.isSafeInteger(value)||value<0)) return null;
  const total=entries.reduce((sum,[,value])=>sum+value,0);
  if (!Number.isSafeInteger(total)||total===0) return null;
  const vector:LensVector={principle:0,tradition:0,action:0};
  for (const axis of LENS_AXES) vector[axis]=entries.reduce((sum,[key,value])=>sum+(value/total)*basis[key][axis],0);
  return vector;
}
export function responseLens(scores: Readonly<Record<string,number>>) { return weightedVector(scores,factionVectors,true); }
export function birthSymbolLens(counts: Readonly<Record<string,number>>) {
  // A complete eight-character tally is required; omitted pillars are unknown,
  // never filled as zero to manufacture a birth-derived comparison.
  if (Object.values(counts).reduce((sum,value)=>sum+value,0)!==8) return null;
  return weightedVector(counts,elementVectors,true);
}
export function closestSymbolicFactions(vector: LensVector): JoseonFaction[] {
  if (LENS_AXES.some(axis=>!Number.isFinite(vector[axis])||Math.abs(vector[axis])>1)) return [];
  const keys=Object.keys(factionVectors) as JoseonFaction[];
  const distances=keys.map(key=>LENS_AXES.reduce((sum,axis)=>sum+(vector[axis]-factionVectors[key][axis])**2,0));
  const min=Math.min(...distances);
  return keys.filter((_,index)=>Math.abs(distances[index]-min)<1e-10);
}
export function compareLenses(birth: LensVector, response: LensVector) {
  const differences=LENS_AXES.map(axis=>({axis,difference:Math.abs(birth[axis]-response[axis])}));
  const largest=Math.max(...differences.map(item=>item.difference));
  return {largestDifferenceAxes:differences.filter(item=>Math.abs(item.difference-largest)<1e-10).map(item=>item.axis), identical:largest<1e-10};
}
