/**
 * Ontology relationship graph — node catalog (Phase 1 / Track A, step 2).
 *
 * Node ids are reused verbatim from existing catalogs (zero data duplication,
 * per the design doc):
 *  - hobby/career: `@/lib/ontology/lifestyle/data.ts` (`HOBBY_METADATA` /
 *    `CAREER_METADATA`), restricted to the ids that also have localized copy
 *    in `lifestyle/{hobbies,careers}.json` (some data.ts entries — e.g.
 *    `pottery`, `content-creator` — don't have i18n copy yet; they're left
 *    out of the graph rather than inventing new content. TODO: extend once
 *    those get proper i18n coverage, then add them here).
 *  - trait: Big Five dimensions (`i18n/messages/{locale}/big5.json`, dimensions key) +
 *    RIASEC codes (`i18n/messages/{locale}/career.json`, types key).
 *  - element: the five Saju elements (`i18n/messages/{locale}/elements.json`),
 *    matching `LifestyleMetadata.elementWeights` keys exactly.
 *  - zodiac: the twelve Western zodiac signs (`i18n/messages/{locale}/zodiac.json`),
 *    lowercase to match those i18n keys (`ProfileSignals.zodiac` — from
 *    `useUserStore().profile.zodiacSign` — is capitalized, e.g. "Aries";
 *    callers matching against these node ids must lowercase it first).
 */

import { CAREER_METADATA, HOBBY_METADATA } from "@/lib/ontology/lifestyle/data";

import type { NodeKind, OntologyNode } from "./types";

const HOBBY_IDS_WITH_COPY = new Set([
  "woodworking",
  "boxing-kickboxing",
  "tea-ceremony-meditation",
  "astrophotography",
  "gardening",
]);

const CAREER_IDS_WITH_COPY = new Set(["software-engineer", "architect", "physician"]);

const HOBBY_ICONS: Record<string, string> = {
  woodworking: "🪵",
  "boxing-kickboxing": "🥊",
  "tea-ceremony-meditation": "🍵",
  astrophotography: "🔭",
  gardening: "🌱",
};

const CAREER_ICONS: Record<string, string> = {
  "software-engineer": "💻",
  architect: "🏛️",
  physician: "🩺",
};

const hobbyNodes: OntologyNode[] = HOBBY_METADATA.filter((meta) =>
  HOBBY_IDS_WITH_COPY.has(meta.id),
).map((meta) => ({
  id: meta.id,
  kind: "hobby",
  i18nKey: `hobby.nodes.${meta.id}.name`,
  icon: HOBBY_ICONS[meta.id] ?? "✨",
  tags: meta.benefitTags,
}));

const careerNodes: OntologyNode[] = CAREER_METADATA.filter((meta) =>
  CAREER_IDS_WITH_COPY.has(meta.id),
).map((meta) => ({
  id: meta.id,
  kind: "career",
  i18nKey: `career.nodes.${meta.id}.name`,
  icon: CAREER_ICONS[meta.id] ?? "✨",
  tags: meta.benefitTags,
}));

const BIG5_TRAIT_ICONS: Record<string, string> = {
  openness: "🌈",
  conscientiousness: "📐",
  extraversion: "🎤",
  agreeableness: "🤝",
  neuroticism: "🌊",
};

const big5TraitNodes: OntologyNode[] = Object.entries(BIG5_TRAIT_ICONS).map(
  ([id, icon]) => ({
    id,
    kind: "trait" as NodeKind,
    i18nKey: `big5.dimensions.${id}`,
    icon,
    tags: ["big5"],
  }),
);

const RIASEC_TRAIT_ICONS: Record<string, string> = {
  realistic: "🔧",
  investigative: "🔬",
  artistic: "🎨",
  social: "👥",
  enterprising: "💼",
  conventional: "📊",
};

const riasecTraitNodes: OntologyNode[] = Object.entries(RIASEC_TRAIT_ICONS).map(
  ([id, icon]) => ({
    id,
    kind: "trait" as NodeKind,
    i18nKey: `career.types.${id}.name`,
    icon,
    tags: ["riasec"],
  }),
);

const ELEMENT_ICONS: Record<string, string> = {
  wood: "🌳",
  fire: "🔥",
  earth: "⛰️",
  metal: "⚙️",
  water: "💧",
};

const elementNodes: OntologyNode[] = Object.entries(ELEMENT_ICONS).map(
  ([id, icon]) => ({
    id,
    kind: "element" as NodeKind,
    i18nKey: `elements.${id}.name`,
    icon,
    tags: ["saju"],
  }),
);

const ZODIAC_ICONS: Record<string, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

const zodiacNodes: OntologyNode[] = Object.entries(ZODIAC_ICONS).map(
  ([id, icon]) => ({
    id,
    kind: "zodiac" as NodeKind,
    i18nKey: `zodiac.${id}`,
    icon,
    tags: ["western-astrology"],
  }),
);

export const NODES: OntologyNode[] = [
  ...hobbyNodes,
  ...careerNodes,
  ...big5TraitNodes,
  ...riasecTraitNodes,
  ...elementNodes,
  ...zodiacNodes,
];

const NODE_BY_ID = new Map(NODES.map((node) => [node.id, node]));

export function getNode(id: string): OntologyNode | undefined {
  return NODE_BY_ID.get(id);
}
