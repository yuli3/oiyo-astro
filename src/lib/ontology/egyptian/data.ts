/* eslint-disable no-restricted-syntax */
/**
 * Egyptian Astrology Data - Patron Deities
 * The Grand Archive - Shard-M (Mythology)
 *
 * Ancient Egyptian astrology assigned patron deities based on
 * specific date ranges throughout the year.
 */

import type { EgyptianDecan, EgyptianDeity } from "./types";

export const EGYPTIAN_DEITIES: EgyptianDeity[] = [
  {
    attributesKey: "deities.thoth.traits.0",
    auraColor: "#4A90D9",
    challenges: [
      "thoth.challenges.0",
      "thoth.challenges.1",
      "thoth.challenges.2",
    ],
    compatibleWith: ["isis", "bastet", "sekhmet"],
    descriptionKey: "deities.thoth.domain.0",
    domain: [
      "thoth.domain.0",
      "thoth.domain.1",
      "thoth.domain.2",
      "thoth.domain.3",
    ],
    element: "Air",
    greekEquivalent: "Hermes",
    id: "thoth",
    name: "Thoth",
    nameKey: "deities.thoth.name",
    strengths: [
      "thoth.strengths.0",
      "thoth.strengths.1",
      "thoth.strengths.2",
      "thoth.strengths.3",
    ],
    symbol: "deities.thoth.symbol",
    traits: [
      "thoth.traits.0",
      "thoth.traits.1",
      "thoth.traits.2",
      "thoth.traits.3",
    ],
  },
  {
    attributesKey: "deities.horus.traits.0",
    auraColor: "#C4A000",
    challenges: [
      "horus.challenges.0",
      "horus.challenges.1",
      "horus.challenges.2",
    ],
    compatibleWith: ["isis", "hathor", "osiris"],
    descriptionKey: "deities.horus.domain.0",
    domain: [
      "horus.domain.0",
      "horus.domain.1",
      "horus.domain.2",
      "horus.domain.3",
    ],
    element: "Fire",
    greekEquivalent: "Apollo",
    id: "horus",
    name: "Horus",
    nameKey: "deities.horus.name",
    strengths: [
      "horus.strengths.0",
      "horus.strengths.1",
      "horus.strengths.2",
      "horus.strengths.3",
    ],
    symbol: "deities.horus.symbol",
    traits: [
      "horus.traits.0",
      "horus.traits.1",
      "horus.traits.2",
      "horus.traits.3",
    ],
  },
  {
    attributesKey: "deities.wadjet.traits.0",
    auraColor: "#228B22",
    challenges: [
      "wadjet.challenges.0",
      "wadjet.challenges.1",
      "wadjet.challenges.2",
    ],
    compatibleWith: ["horus", "nekhbet", "ra"],
    descriptionKey: "deities.wadjet.domain.0",
    domain: [
      "wadjet.domain.0",
      "wadjet.domain.1",
      "wadjet.domain.2",
      "wadjet.domain.3",
    ],
    element: "Fire",
    greekEquivalent: "Buto",
    id: "wadjet",
    name: "Wadjet",
    nameKey: "deities.wadjet.name",
    strengths: [
      "wadjet.strengths.0",
      "wadjet.strengths.1",
      "wadjet.strengths.2",
    ],
    symbol: "deities.wadjet.symbol",
    traits: [
      "wadjet.traits.0",
      "wadjet.traits.1",
      "wadjet.traits.2",
      "wadjet.traits.3",
    ],
  },
  {
    attributesKey: "deities.sekhmet.traits.0",
    auraColor: "#DC143C",
    challenges: [
      "sekhmet.challenges.0",
      "sekhmet.challenges.1",
      "sekhmet.challenges.2",
    ],
    compatibleWith: ["ptah", "bastet", "ra"],
    descriptionKey: "deities.sekhmet.domain.0",
    domain: [
      "sekhmet.domain.0",
      "sekhmet.domain.1",
      "sekhmet.domain.2",
      "sekhmet.domain.3",
    ],
    element: "Fire",
    greekEquivalent: "Athena",
    id: "sekhmet",
    name: "Sekhmet",
    nameKey: "deities.sekhmet.name",
    strengths: [
      "sekhmet.strengths.0",
      "sekhmet.strengths.1",
      "sekhmet.strengths.2",
      "sekhmet.strengths.3",
    ],
    symbol: "deities.sekhmet.symbol",
    traits: [
      "sekhmet.traits.0",
      "sekhmet.traits.1",
      "sekhmet.traits.2",
      "sekhmet.traits.3",
    ],
  },
  {
    attributesKey: "deities.bastet.traits.0",
    auraColor: "#9370DB",
    challenges: [
      "bastet.challenges.0",
      "bastet.challenges.1",
      "bastet.challenges.2",
    ],
    compatibleWith: ["thoth", "isis", "hathor"],
    descriptionKey: "deities.bastet.domain.0",
    domain: [
      "bastet.domain.0",
      "bastet.domain.1",
      "bastet.domain.2",
      "bastet.domain.3",
    ],
    element: "Water",
    greekEquivalent: "Artemis",
    id: "bastet",
    name: "Bastet",
    nameKey: "deities.bastet.name",
    strengths: [
      "bastet.strengths.0",
      "bastet.strengths.1",
      "bastet.strengths.2",
      "bastet.strengths.3",
    ],
    symbol: "deities.bastet.symbol",
    traits: [
      "bastet.traits.0",
      "bastet.traits.1",
      "bastet.traits.2",
      "bastet.traits.3",
    ],
  },
  {
    attributesKey: "deities.isis.traits.0",
    auraColor: "#00CED1",
    challenges: ["isis.challenges.0", "isis.challenges.1", "isis.challenges.2"],
    compatibleWith: ["osiris", "horus", "thoth"],
    descriptionKey: "deities.isis.domain.0",
    domain: [
      "isis.domain.0",
      "isis.domain.1",
      "isis.domain.2",
      "isis.domain.3",
    ],
    element: "Water",
    greekEquivalent: "Demeter",
    id: "isis",
    name: "Isis",
    nameKey: "deities.isis.name",
    strengths: [
      "isis.strengths.0",
      "isis.strengths.1",
      "isis.strengths.2",
      "isis.strengths.3",
    ],
    symbol: "deities.isis.symbol",
    traits: [
      "isis.traits.0",
      "isis.traits.1",
      "isis.traits.2",
      "isis.traits.3",
    ],
  },
  {
    attributesKey: "deities.osiris.traits.0",
    auraColor: "#2E8B57",
    challenges: [
      "osiris.challenges.0",
      "osiris.challenges.1",
      "osiris.challenges.2",
    ],
    compatibleWith: ["isis", "horus", "anubis"],
    descriptionKey: "deities.osiris.domain.0",
    domain: [
      "osiris.domain.0",
      "osiris.domain.1",
      "osiris.domain.2",
      "osiris.domain.3",
    ],
    element: "Earth",
    greekEquivalent: "Hades/Dionysus",
    id: "osiris",
    name: "Osiris",
    nameKey: "deities.osiris.name",
    strengths: [
      "osiris.strengths.0",
      "osiris.strengths.1",
      "osiris.strengths.2",
      "osiris.strengths.3",
    ],
    symbol: "deities.osiris.symbol",
    traits: [
      "osiris.traits.0",
      "osiris.traits.1",
      "osiris.traits.2",
      "osiris.traits.3",
    ],
  },
  {
    attributesKey: "deities.hathor.traits.0",
    auraColor: "#FFD700",
    challenges: [
      "hathor.challenges.0",
      "hathor.challenges.1",
      "hathor.challenges.2",
    ],
    compatibleWith: ["horus", "bastet", "ra"],
    descriptionKey: "deities.hathor.domain.0",
    domain: [
      "hathor.domain.0",
      "hathor.domain.1",
      "hathor.domain.2",
      "hathor.domain.3",
    ],
    element: "Earth",
    greekEquivalent: "Aphrodite",
    id: "hathor",
    name: "Hathor",
    nameKey: "deities.hathor.name",
    strengths: [
      "hathor.strengths.0",
      "hathor.strengths.1",
      "hathor.strengths.2",
      "hathor.strengths.3",
    ],
    symbol: "deities.hathor.symbol",
    traits: [
      "hathor.traits.0",
      "hathor.traits.1",
      "hathor.traits.2",
      "hathor.traits.3",
    ],
  },
  {
    attributesKey: "deities.anubis.traits.0",
    auraColor: "#1C1C1C",
    challenges: [
      "anubis.challenges.0",
      "anubis.challenges.1",
      "anubis.challenges.2",
    ],
    compatibleWith: ["osiris", "isis", "thoth"],
    descriptionKey: "deities.anubis.domain.0",
    domain: [
      "anubis.domain.0",
      "anubis.domain.1",
      "anubis.domain.2",
      "anubis.domain.3",
    ],
    element: "Earth",
    greekEquivalent: "Hermes Chthonios",
    id: "anubis",
    name: "Anubis",
    nameKey: "deities.anubis.name",
    strengths: [
      "anubis.strengths.0",
      "anubis.strengths.1",
      "anubis.strengths.2",
      "anubis.strengths.3",
    ],
    symbol: "deities.anubis.symbol",
    traits: [
      "anubis.traits.0",
      "anubis.traits.1",
      "anubis.traits.2",
      "anubis.traits.3",
    ],
  },
  {
    attributesKey: "deities.seth.traits.0",
    auraColor: "#8B0000",
    challenges: [
      "seth.challenges.0",
      "seth.challenges.1",
      "seth.challenges.2",
      "seth.challenges.3",
    ],
    compatibleWith: ["nephthys", "horus"],
    descriptionKey: "deities.seth.domain.0",
    domain: [
      "seth.domain.0",
      "seth.domain.1",
      "seth.domain.2",
      "seth.domain.3",
    ],
    element: "Fire",
    greekEquivalent: "Typhon",
    id: "seth",
    name: "Seth",
    nameKey: "deities.seth.name",
    strengths: [
      "seth.strengths.0",
      "seth.strengths.1",
      "seth.strengths.2",
      "seth.strengths.3",
    ],
    symbol: "deities.seth.symbol",
    traits: [
      "seth.traits.0",
      "seth.traits.1",
      "seth.traits.2",
      "seth.traits.3",
    ],
  },
  {
    attributesKey: "deities.geb.traits.0",
    auraColor: "#8B4513",
    challenges: ["geb.challenges.0", "geb.challenges.1", "geb.challenges.2"],
    compatibleWith: ["nut", "osiris", "isis"],
    descriptionKey: "deities.geb.domain.0",
    domain: ["geb.domain.0", "geb.domain.1", "geb.domain.2", "geb.domain.3"],
    element: "Earth",
    greekEquivalent: "Cronus",
    id: "geb",
    name: "Geb",
    nameKey: "deities.geb.name",
    strengths: [
      "geb.strengths.0",
      "geb.strengths.1",
      "geb.strengths.2",
      "geb.strengths.3",
    ],
    symbol: "deities.geb.symbol",
    traits: ["geb.traits.0", "geb.traits.1", "geb.traits.2", "geb.traits.3"],
  },
  {
    attributesKey: "deities.nut.traits.0",
    auraColor: "#191970",
    challenges: ["nut.challenges.0", "nut.challenges.1", "nut.challenges.2"],
    compatibleWith: ["geb", "ra", "thoth"],
    descriptionKey: "deities.nut.domain.0",
    domain: ["nut.domain.0", "nut.domain.1", "nut.domain.2", "nut.domain.3"],
    element: "Air",
    greekEquivalent: "Rhea",
    id: "nut",
    name: "Nut",
    nameKey: "deities.nut.name",
    strengths: [
      "nut.strengths.0",
      "nut.strengths.1",
      "nut.strengths.2",
      "nut.strengths.3",
    ],
    symbol: "deities.nut.symbol",
    traits: ["nut.traits.0", "nut.traits.1", "nut.traits.2", "nut.traits.3"],
  },
];

// Date ranges for Egyptian deity assignment
export const EGYPTIAN_DEITY_DATES: Array<{
  deityId: string;
  ranges: Array<{
    endDay: number;
    endMonth: number;
    startDay: number;
    startMonth: number;
  }>;
}> = [
  {
    deityId: "thoth",
    ranges: [
      { endDay: 19, endMonth: 4, startDay: 1, startMonth: 4 }, // Apr 1-19
      { endDay: 17, endMonth: 11, startDay: 8, startMonth: 11 }, // Nov 8-17
    ],
  },
  {
    deityId: "horus",
    ranges: [
      { endDay: 7, endMonth: 5, startDay: 20, startMonth: 4 }, // Apr 20 - May 7
      { endDay: 19, endMonth: 8, startDay: 12, startMonth: 8 }, // Aug 12-19
    ],
  },
  {
    deityId: "wadjet",
    ranges: [
      { endDay: 27, endMonth: 5, startDay: 8, startMonth: 5 }, // May 8-27
      { endDay: 13, endMonth: 7, startDay: 29, startMonth: 6 }, // Jun 29 - Jul 13
    ],
  },
  {
    deityId: "sekhmet",
    ranges: [
      { endDay: 11, endMonth: 8, startDay: 29, startMonth: 7 }, // Jul 29 - Aug 11
      { endDay: 7, endMonth: 11, startDay: 30, startMonth: 10 }, // Oct 30 - Nov 7
    ],
  },
  {
    deityId: "bastet",
    ranges: [
      { endDay: 28, endMonth: 7, startDay: 14, startMonth: 7 }, // Jul 14-28
      { endDay: 27, endMonth: 9, startDay: 23, startMonth: 9 }, // Sep 23-27
      { endDay: 17, endMonth: 10, startDay: 3, startMonth: 10 }, // Oct 3-17
    ],
  },
  {
    deityId: "isis",
    ranges: [
      { endDay: 31, endMonth: 3, startDay: 11, startMonth: 3 }, // Mar 11-31
      { endDay: 29, endMonth: 10, startDay: 18, startMonth: 10 }, // Oct 18-29
      { endDay: 31, endMonth: 12, startDay: 19, startMonth: 12 }, // Dec 19-31
    ],
  },
  {
    deityId: "osiris",
    ranges: [
      { endDay: 10, endMonth: 3, startDay: 1, startMonth: 3 }, // Mar 1-10
      { endDay: 18, endMonth: 12, startDay: 27, startMonth: 11 }, // Nov 27 - Dec 18
    ],
  },
  {
    deityId: "hathor",
    ranges: [
      { endDay: 18, endMonth: 6, startDay: 28, startMonth: 5 }, // May 28 - Jun 18
      { endDay: 22, endMonth: 9, startDay: 8, startMonth: 9 }, // Sep 8-22
    ],
  },
  {
    deityId: "anubis",
    ranges: [
      { endDay: 27, endMonth: 5, startDay: 8, startMonth: 5 }, // May 8-27 (shared with Wadjet)
      { endDay: 13, endMonth: 7, startDay: 29, startMonth: 6 }, // Jun 29 - Jul 13 (shared with Wadjet)
    ],
  },
  {
    deityId: "seth",
    ranges: [
      { endDay: 18, endMonth: 6, startDay: 28, startMonth: 5 }, // May 28 - Jun 18 (shared)
      { endDay: 2, endMonth: 10, startDay: 28, startMonth: 9 }, // Sep 28 - Oct 2
    ],
  },
  {
    deityId: "geb",
    ranges: [
      { endDay: 29, endMonth: 2, startDay: 12, startMonth: 2 }, // Feb 12-29
      { endDay: 31, endMonth: 8, startDay: 20, startMonth: 8 }, // Aug 20-31
    ],
  },
  {
    deityId: "nut",
    ranges: [
      { endDay: 31, endMonth: 1, startDay: 22, startMonth: 1 }, // Jan 22-31
      { endDay: 7, endMonth: 9, startDay: 1, startMonth: 9 }, // Sep 1-7
    ],
  },
];

// Fallback deity for dates not covered
export const DEFAULT_DEITY_ID = "ra";

export const RA_DEITY: EgyptianDeity = {
  attributesKey: "deities.ra.traits.0",
  auraColor: "#FF8C00",
  challenges: ["ra.challenges.0", "ra.challenges.1", "ra.challenges.2"],
  compatibleWith: ["hathor", "sekhmet", "horus"],
  descriptionKey: "deities.ra.domain.0",
  domain: ["ra.domain.0", "ra.domain.1", "ra.domain.2", "ra.domain.3"],
  element: "Fire",
  greekEquivalent: "Helios",
  id: "ra",
  name: "Ra",
  nameKey: "deities.ra.name",
  strengths: [
    "ra.strengths.0",
    "ra.strengths.1",
    "ra.strengths.2",
    "ra.strengths.3",
  ],
  symbol: "deities.ra.symbol",
  traits: ["ra.traits.0", "ra.traits.1", "ra.traits.2", "ra.traits.3"],
};
