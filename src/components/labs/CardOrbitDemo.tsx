"use client";

/**
 * Labs preview for the reusable CardOrbit asset — sample cards spanning
 * the domains it's meant for (astrology/saju/palja/celtic/maya/numerology).
 * Not wired into any real page yet; this is just so the visual can be
 * eyeballed and reused as a reference for future integration.
 */

import CardOrbit from "@/components/visual/CardOrbit";
import type { CardOrbitItem } from "@/components/visual/CardOrbitScene";

const SAMPLE_CARDS: CardOrbitItem[] = [
  { id: "astrology", glyph: "♓", color: "#60a5fa" },
  { id: "saju", glyph: "干", color: "#f59e0b" },
  { id: "palja", glyph: "命", color: "#f87171" },
  { id: "celtic", glyph: "☘", color: "#34d399" },
  { id: "maya", glyph: "▲", color: "#a78bfa" },
  { id: "numerology", glyph: "名", color: "#facc15" },
];

const LEGEND: Record<string, string> = {
  astrology: "점성술",
  saju: "사주",
  palja: "팔자",
  celtic: "켈트",
  maya: "마야",
  numerology: "성명학",
};

export function CardOrbitDemo() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ color: "#e6e8dc", fontSize: 18, fontWeight: 900, marginBottom: 12 }}>Card Orbit — labs preview</h1>
      <CardOrbit cards={SAMPLE_CARDS} legend={LEGEND} />
    </div>
  );
}
