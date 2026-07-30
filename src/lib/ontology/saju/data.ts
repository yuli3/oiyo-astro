/**
 * Saju Data Registry
 * The Grand Archive - Shard-S (Four Pillars)
 *
 * Refactored for pure i18n support.
 */

import { EarthlyBranch, FiveElement, HeavenlyStem, YinYang } from "./types";
import type { EarthlyBranchRegistryEntry, HeavenlyStemRegistryEntry } from "./types";

/**
 * Heavenly Stems Registry (Cheongan)
 */
export const heavenlyStems: Record<HeavenlyStem, HeavenlyStemRegistryEntry> = {
  [HeavenlyStem.BYEONG]: {
    element: FiveElement.FIRE,
    id: HeavenlyStem.BYEONG,
    key: "saju.stems.byeong",
    yinYang: YinYang.YANG,
  },
  [HeavenlyStem.EUL]: {
    element: FiveElement.WOOD,
    id: HeavenlyStem.EUL,
    key: "saju.stems.eul",
    yinYang: YinYang.YIN,
  },
  [HeavenlyStem.GAP]: {
    element: FiveElement.WOOD,
    id: HeavenlyStem.GAP,
    key: "saju.stems.gap",
    yinYang: YinYang.YANG,
  },
  [HeavenlyStem.GI]: {
    element: FiveElement.EARTH,
    id: HeavenlyStem.GI,
    key: "saju.stems.gi",
    yinYang: YinYang.YIN,
  },
  [HeavenlyStem.GYE]: {
    element: FiveElement.WATER,
    id: HeavenlyStem.GYE,
    key: "saju.stems.gye",
    yinYang: YinYang.YIN,
  },
  [HeavenlyStem.GYEONG]: {
    element: FiveElement.METAL,
    id: HeavenlyStem.GYEONG,
    key: "saju.stems.gyeong",
    yinYang: YinYang.YANG,
  },
  [HeavenlyStem.IM]: {
    element: FiveElement.WATER,
    id: HeavenlyStem.IM,
    key: "saju.stems.im",
    yinYang: YinYang.YANG,
  },
  [HeavenlyStem.JEONG]: {
    element: FiveElement.FIRE,
    id: HeavenlyStem.JEONG,
    key: "saju.stems.jeong",
    yinYang: YinYang.YIN,
  },
  [HeavenlyStem.MU]: {
    element: FiveElement.EARTH,
    id: HeavenlyStem.MU,
    key: "saju.stems.mu",
    yinYang: YinYang.YANG,
  },
  [HeavenlyStem.SIN]: {
    element: FiveElement.METAL,
    id: HeavenlyStem.SIN,
    key: "saju.stems.sin",
    yinYang: YinYang.YIN,
  },
};

/**
 * Earthly Branches Registry (Jiji)
 */
export const earthlyBranches: Record<
  EarthlyBranch,
  EarthlyBranchRegistryEntry
> = {
  [EarthlyBranch.CHUK]: {
    element: FiveElement.EARTH,
    hiddenStems: [HeavenlyStem.GYE, HeavenlyStem.SIN, HeavenlyStem.GI],
    id: EarthlyBranch.CHUK,
    key: "saju.branches.chou",
    seasonKey: "saju.season.lateWinter",
    yinYang: YinYang.YIN,
  },
  [EarthlyBranch.HAE]: {
    element: FiveElement.WATER,
    hiddenStems: [HeavenlyStem.MU, HeavenlyStem.GAP, HeavenlyStem.IM],
    id: EarthlyBranch.HAE,
    key: "saju.branches.hai",
    seasonKey: "saju.season.winter",
    yinYang: YinYang.YIN,
  },
  [EarthlyBranch.IN]: {
    element: FiveElement.WOOD,
    hiddenStems: [HeavenlyStem.MU, HeavenlyStem.BYEONG, HeavenlyStem.GAP],
    id: EarthlyBranch.IN,
    key: "saju.branches.yin",
    seasonKey: "saju.season.spring",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.JA]: {
    element: FiveElement.WATER,
    hiddenStems: [HeavenlyStem.IM, HeavenlyStem.GYE],
    id: EarthlyBranch.JA,
    key: "saju.branches.zi",
    seasonKey: "saju.season.winter",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.JIN]: {
    element: FiveElement.EARTH,
    hiddenStems: [HeavenlyStem.EUL, HeavenlyStem.GYE, HeavenlyStem.MU],
    id: EarthlyBranch.JIN,
    key: "saju.branches.chen",
    seasonKey: "saju.season.lateSpring",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.MI]: {
    element: FiveElement.EARTH,
    hiddenStems: [HeavenlyStem.JEONG, HeavenlyStem.EUL, HeavenlyStem.GI],
    id: EarthlyBranch.MI,
    key: "saju.branches.wei",
    seasonKey: "saju.season.lateSummer",
    yinYang: YinYang.YIN,
  },
  [EarthlyBranch.MYO]: {
    element: FiveElement.WOOD,
    hiddenStems: [HeavenlyStem.GAP, HeavenlyStem.EUL],
    id: EarthlyBranch.MYO,
    key: "saju.branches.mao",
    seasonKey: "saju.season.spring",
    yinYang: YinYang.YIN,
  },
  [EarthlyBranch.O]: {
    element: FiveElement.FIRE,
    hiddenStems: [HeavenlyStem.BYEONG, HeavenlyStem.GI, HeavenlyStem.JEONG],
    id: EarthlyBranch.O,
    key: "saju.branches.wu",
    seasonKey: "saju.season.summer",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.SA]: {
    element: FiveElement.FIRE,
    hiddenStems: [HeavenlyStem.MU, HeavenlyStem.GYEONG, HeavenlyStem.BYEONG],
    id: EarthlyBranch.SA,
    key: "saju.branches.si",
    seasonKey: "saju.season.summer",
    yinYang: YinYang.YIN,
  },
  [EarthlyBranch.SIN]: {
    element: FiveElement.METAL,
    hiddenStems: [HeavenlyStem.MU, HeavenlyStem.IM, HeavenlyStem.GYEONG],
    id: EarthlyBranch.SIN,
    key: "saju.branches.shen",
    seasonKey: "saju.season.autumn",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.SUL]: {
    element: FiveElement.EARTH,
    hiddenStems: [HeavenlyStem.SIN, HeavenlyStem.JEONG, HeavenlyStem.MU],
    id: EarthlyBranch.SUL,
    key: "saju.branches.xu",
    seasonKey: "saju.season.lateAutumn",
    yinYang: YinYang.YANG,
  },
  [EarthlyBranch.YU]: {
    element: FiveElement.METAL,
    hiddenStems: [HeavenlyStem.GYEONG, HeavenlyStem.SIN],
    id: EarthlyBranch.YU,
    key: "saju.branches.you",
    seasonKey: "saju.season.autumn",
    yinYang: YinYang.YIN,
  },
};

export const STEM_ORDER = [
  HeavenlyStem.GAP,
  HeavenlyStem.EUL,
  HeavenlyStem.BYEONG,
  HeavenlyStem.JEONG,
  HeavenlyStem.MU,
  HeavenlyStem.GI,
  HeavenlyStem.GYEONG,
  HeavenlyStem.SIN,
  HeavenlyStem.IM,
  HeavenlyStem.GYE,
];

export const BRANCH_ORDER = [
  EarthlyBranch.JA,
  EarthlyBranch.CHUK,
  EarthlyBranch.IN,
  EarthlyBranch.MYO,
  EarthlyBranch.JIN,
  EarthlyBranch.SA,
  EarthlyBranch.O,
  EarthlyBranch.MI,
  EarthlyBranch.SIN,
  EarthlyBranch.YU,
  EarthlyBranch.SUL,
  EarthlyBranch.HAE,
];

export const SIXTY_GANZHI: {
  branch: EarthlyBranch;
  id: string;
  key: string;
  stem: HeavenlyStem;
}[] = [];

for (let i = 0; i < 60; i++) {
  const stem = STEM_ORDER[i % 10];
  const branch = BRANCH_ORDER[i % 12];
  SIXTY_GANZHI.push({
    branch,
    id: `${stem}_${branch}`,
    key: `saju.ganzhi.${stem}_${branch}`,
    stem,
  });
}
