import type { ProfileSignals } from './signals';

export type SymbolicSystemId = 'saju' | 'zodiac' | 'mbti' | 'big5' | 'riasec' | 'enneagram';
export type SymbolicMotifId =
  | 'inward' | 'outward'
  | 'possibility' | 'grounded'
  | 'analysis' | 'relation'
  | 'structure' | 'exploration'
  | 'sensitivity' | 'steadiness';

export interface SymbolicBranch {
  id: SymbolicSystemId;
  value: string;
  motifs: SymbolicMotifId[];
}
export interface SymbolicResonance {
  motif: SymbolicMotifId;
  sources: SymbolicSystemId[];
}

export interface SymbolicTension {
  left: SymbolicMotifId;
  right: SymbolicMotifId;
  leftSources: SymbolicSystemId[];
  rightSources: SymbolicSystemId[];
}

export interface SymbolicProfile {
  branches: SymbolicBranch[];
  resonances: SymbolicResonance[];
  tensions: SymbolicTension[];
  sourceCount: number;
}

const zodiacElements: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const elementalMotifs: Record<string, SymbolicMotifId[]> = {
  fire: ['outward', 'exploration'], wood: ['possibility', 'exploration'],
  earth: ['grounded', 'steadiness'], metal: ['structure', 'analysis'],
  water: ['inward', 'sensitivity'], air: ['possibility', 'relation'],
};

const riasecMotifs: Record<string, SymbolicMotifId> = {
  R: 'grounded', I: 'analysis', A: 'possibility', S: 'relation', E: 'outward', C: 'structure',
};

const oppositePairs: Array<[SymbolicMotifId, SymbolicMotifId]> = [
  ['inward', 'outward'], ['possibility', 'grounded'], ['analysis', 'relation'],
  ['structure', 'exploration'], ['sensitivity', 'steadiness'],
];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function mbtiMotifs(type: string): SymbolicMotifId[] {
  const map: Record<string, SymbolicMotifId> = {
    I: 'inward', E: 'outward', N: 'possibility', S: 'grounded',
    T: 'analysis', F: 'relation', J: 'structure', P: 'exploration',
  };
  return unique(type.toUpperCase().split('').map((letter) => map[letter]).filter(Boolean));
}

function big5Motifs(scores: NonNullable<ProfileSignals['big5']>): SymbolicMotifId[] {
  const motifs: SymbolicMotifId[] = [];
  if (scores.O >= 60) motifs.push('possibility'); else if (scores.O <= 40) motifs.push('grounded');
  if (scores.C >= 60) motifs.push('structure'); else if (scores.C <= 40) motifs.push('exploration');
  if (scores.E >= 60) motifs.push('outward'); else if (scores.E <= 40) motifs.push('inward');
  if (scores.A >= 60) motifs.push('relation'); else if (scores.A <= 40) motifs.push('analysis');
  if (scores.N >= 60) motifs.push('sensitivity'); else if (scores.N <= 40) motifs.push('steadiness');
  return motifs;
}

function formatBig5(scores: NonNullable<ProfileSignals['big5']>): string {
  return `O${scores.O} · C${scores.C} · E${scores.E} · A${scores.A} · N${scores.N}`;
}

export function buildSymbolicProfile(signals: ProfileSignals): SymbolicProfile {
  const branches: SymbolicBranch[] = [];
  if (signals.saju) branches.push({ id: 'saju', value: signals.saju.element, motifs: elementalMotifs[signals.saju.element.toLowerCase()] ?? [] });
  if (signals.zodiac) {
    const element = zodiacElements[signals.zodiac.toLowerCase()];
    branches.push({ id: 'zodiac', value: signals.zodiac, motifs: element ? elementalMotifs[element] : [] });
  }
  if (signals.mbti) branches.push({ id: 'mbti', value: signals.mbti.type, motifs: mbtiMotifs(signals.mbti.type) });
  if (signals.big5) branches.push({ id: 'big5', value: formatBig5(signals.big5), motifs: big5Motifs(signals.big5) });
  if (signals.riasec) branches.push({ id: 'riasec', value: signals.riasec.code, motifs: unique(signals.riasec.code.split('').map((code) => riasecMotifs[code]).filter(Boolean)) });
  // Enneagram is displayed with provenance, but deliberately has no crosswalk:
  // the stored signal has only a type number and no validated dimension scores.
  if (signals.enneagram) branches.push({ id: 'enneagram', value: signals.enneagram, motifs: [] });

  const sourcesByMotif = new Map<SymbolicMotifId, SymbolicSystemId[]>();
  for (const branch of branches) {
    for (const motif of branch.motifs) {
      sourcesByMotif.set(motif, [...(sourcesByMotif.get(motif) ?? []), branch.id]);
    }
  }

  const resonances = [...sourcesByMotif.entries()]
    .filter(([, sources]) => sources.length >= 2)
    .map(([motif, sources]) => ({ motif, sources: unique(sources) }));
  const tensions = oppositePairs.flatMap(([left, right]) => {
    const leftSources = unique(sourcesByMotif.get(left) ?? []);
    const rightSources = unique(sourcesByMotif.get(right) ?? []);
    return leftSources.length && rightSources.length ? [{ left, right, leftSources, rightSources }] : [];
  });

  return { branches, resonances, tensions, sourceCount: branches.length };
}
