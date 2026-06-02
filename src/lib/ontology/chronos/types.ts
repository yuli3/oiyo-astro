/**
 * Universal Chronos Coordinates
 * The Grand Archive - mapping any moment in time to ALL wisdom traditions.
 *
 * "We are not oracles. We are observers recording the probabilistic trajectory
 * of existence using the wisdom of all humanity."
 */

import type { CelticTreeSign } from "../celtic/types";
import type { EgyptianCoordinates } from "../egyptian/types";
import type { HellenisticCoordinates } from "../hellenistic/types";
import type { KabbalahCoordinates } from "../kabbalah/types";
import type { MayanKin } from "../mayan/types";
import type { Rune } from "../nordic/types";
import type { NumerologyReading } from "../numerology/types";
import type { SajuResult } from "../saju/types";
import type { VedicCoordinates } from "../vedic/types";
import type { ZiWeiCoordinates } from "../ziwei/types";
import type { Prophecy } from "./resonance";

// ============================================================================
// FACTORY INPUT
// ============================================================================
export interface ChronosInput {
  birthDate: Date;
  birthTime?: { hour: number; minute: number };
  fullName?: string;
  gender?: "female" | "male";
  isLunarCalendar?: boolean;
  longitude?: number;
}

// ============================================================================
// UNIVERSAL CHRONOS COORDINATES
// ============================================================================
export interface UniversalChronosCoordinates {
  celtic: CelticTreeSign;
  // === ANCIENT SYSTEMS ===
  egyptian: EgyptianCoordinates;

  // Core Time Reference
  gregorian: Date;

  hellenistic: HellenisticCoordinates;
  julianDay: number;

  kabbalah: KabbalahCoordinates; // Tree of Life Mapping
  // === EXISTING SYSTEMS (Active) ===
  mayan: MayanKin | null;

  // === NORDIC ===
  nordic: Rune;

  // === ESOTERIC SYSTEMS ===
  numerology?: NumerologyReading; // Requires full name

  // === META ===
  prophecy: Prophecy; // Structured narrative

  // === EASTERN SYSTEMS ===
  saju?: SajuResult; // Four Pillars (requires birth time)

  vedic: VedicCoordinates; // Nakshatras

  ziwei: ZiWeiCoordinates;

  zodiac: WesternZodiac;
}

export interface WesternZodiac {
  decan: 1 | 2 | 3;
  element: "Air" | "Earth" | "Fire" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  sign: string;
}
