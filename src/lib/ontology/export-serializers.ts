/**
 * Ontology export serializers (Phase 1 / Track D, step 5).
 *
 * Five formats, per the design doc:
 *  - `serializeExportJson`  — straight `OntologyExport` serialization.
 *  - `serializeExportCsv`   — flat `section,key,value` table (heterogeneous
 *    data, so a single 3-column shape is the only one that stays valid for
 *    every section without inventing per-section schemas).
 *  - `serializeExportMarkdown` — human-readable report.
 *  - `serializeExportSoul`  — AI-persona file (`## Identity signals` /
 *    `## Preferences` / `## How to treat me`), meant to be pasted into an
 *    LLM's context as a self-definition file.
 *  - `captureExportPng`    — DOM→PNG via html2canvas (client-only).
 *
 * `serializeExportMarkdown`/`serializeExportSoul` accept an optional
 * `labels` map (i18nKey/title-key -> resolved string) so the pure
 * `OntologyExport` data stays locale-agnostic while the UI (which already
 * has an async `resolveNodeLabel()` pipeline — see
 * `OntologyRelationOrbit.tsx`/`RecommendationCards.tsx`) supplies localized
 * text. Missing labels fall back to the raw key/id rather than throwing.
 */

import { getNode } from "./graph/nodes";
import type { GraphSnapshotEntry, OntologyExport } from "./export";

export type ExportLabels = Record<string, string>;

function label(labels: ExportLabels | undefined, key: string): string {
  return labels?.[key] ?? key;
}

/**
 * Every i18nKey/title-key `serializeExportMarkdown`/`serializeExportSoul`
 * might render, so callers can resolve them all (via
 * `resolveNodeLabel`, same as `RecommendationCards`/`OntologyRelationOrbit`)
 * before building the `labels` map those serializers accept.
 */
export function collectExportLabelKeys(data: OntologyExport): string[] {
  const keys = new Set<string>();
  if (data.signals.zodiac) {
    const key = getNode(data.signals.zodiac.toLowerCase())?.i18nKey;
    if (key) keys.add(key);
  }
  if (data.signals.saju) {
    const key = getNode(data.signals.saju.element.toLowerCase())?.i18nKey;
    if (key) keys.add(key);
  }
  for (const node of data.graphSnapshot) keys.add(node.i18nKey);
  for (const rec of data.recommendations) keys.add(rec.title);
  return [...keys];
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

// ─── json ───────────────────────────────────────────────────────────────

export function serializeExportJson(data: OntologyExport): string {
  return JSON.stringify(data, null, 2);
}

// ─── csv (flat table) ───────────────────────────────────────────────────

export function serializeExportCsv(data: OntologyExport): string {
  const rows: string[] = [csvRow(["section", "key", "value"])];

  const s = data.signals;
  if (s.mbti) {
    rows.push(csvRow(["signal", "mbti.type", s.mbti.type]));
    rows.push(csvRow(["signal", "mbti.traits", s.mbti.traits.join("|")]));
  }
  if (s.big5) {
    for (const dim of ["O", "C", "E", "A", "N"] as const) {
      rows.push(csvRow(["signal", `big5.${dim}`, s.big5[dim]]));
    }
  }
  if (s.riasec) {
    rows.push(csvRow(["signal", "riasec.code", s.riasec.code]));
    if (s.riasec.scoreScale) rows.push(csvRow(["signal", "riasec.scoreScale", s.riasec.scoreScale]));
    for (const [letter, score] of Object.entries(s.riasec.scores)) {
      rows.push(csvRow(["signal", `riasec.scores.${letter}`, score]));
    }
  }
  if (s.enneagram) rows.push(csvRow(["signal", "enneagram", s.enneagram]));
  if (s.zodiac) rows.push(csvRow(["signal", "zodiac", s.zodiac]));
  if (s.saju) {
    rows.push(csvRow(["signal", "saju.element", s.saju.element]));
    rows.push(csvRow(["signal", "saju.tenGods", s.saju.tenGods.join("|")]));
  }

  for (const result of data.testResults) {
    rows.push(csvRow(["testResult", result.id, `${result.testId}|${result.resultLabel}|${result.createdAt}`]));
  }

  for (const result of data.assessmentResults) {
    rows.push(csvRow(["assessmentResult", result.resultId, `${result.assessmentId}|${result.evidenceTier}|${result.versions.instrument}|${result.versions.scoring}|${result.completedAt}`]));
    for (const [dimension, score] of Object.entries(result.scores.normalized)) {
      rows.push(csvRow(["assessmentScore", `${result.resultId}.${dimension}`, score]));
    }
  }

  for (const rec of data.recommendations) {
    rows.push(csvRow(["recommendation", rec.id, `${rec.category}|${rec.matchScore}|${rec.title}`]));
  }

  for (const node of data.graphSnapshot) {
    rows.push(csvRow(["graphSnapshot", node.nodeId, `${node.kind}|hop${node.hop}|${node.edgeKind}|${node.weight}`]));
  }

  return rows.join("\n");
}

// ─── md (human report) ──────────────────────────────────────────────────

function signalsTable(data: OntologyExport, labels: ExportLabels | undefined): string {
  const s = data.signals;
  const lines: string[] = [];
  if (s.mbti) lines.push(`- MBTI: **${s.mbti.type}**`);
  if (s.big5) lines.push(`- Big5: O ${s.big5.O} · C ${s.big5.C} · E ${s.big5.E} · A ${s.big5.A} · N ${s.big5.N}`);
  if (s.riasec) lines.push(`- RIASEC: **${s.riasec.code}**`);
  if (s.enneagram) lines.push(`- Enneagram: Type ${s.enneagram}`);
  if (s.zodiac) {
    const key = getNode(s.zodiac.toLowerCase())?.i18nKey;
    lines.push(`- Zodiac: ${key ? label(labels, key) : s.zodiac}`);
  }
  if (s.saju) {
    const key = getNode(s.saju.element.toLowerCase())?.i18nKey;
    const elementLabel = key ? label(labels, key) : s.saju.element;
    lines.push(`- Saju: dominant element **${elementLabel}**, ten gods: ${s.saju.tenGods.join(", ") || "-"}`);
  }
  return lines.join("\n") || "- (no signals recorded yet)";
}

function testHistoryTable(data: OntologyExport): string {
  if (data.testResults.length === 0) return "| - | - | - |";
  return data.testResults
    .map((r) => `| ${r.title} | ${r.resultLabel} | ${r.createdAt.slice(0, 10)} |`)
    .join("\n");
}

function assessmentHistoryTable(data: OntologyExport): string {
  if (data.assessmentResults.length === 0) return "| - | - | - | - |";
  return data.assessmentResults
    .map((r) => `| ${r.assessmentId} | ${r.evidenceTier} | ${r.versions.instrument} | ${r.completedAt.slice(0, 10)} |`)
    .join("\n");
}

function assessmentProvenance(data: OntologyExport): string {
  if (data.assessmentResults.length === 0) return "- (no versioned assessment results yet)";
  return data.assessmentResults
    .map((r) => `- ${r.assessmentId}: evidence ${r.evidenceTier}; instrument ${r.versions.instrument}; scoring ${r.versions.scoring}; observed ${r.completedAt.slice(0, 10)}`)
    .join("\n");
}

function recommendationsSection(data: OntologyExport, labels: ExportLabels | undefined): string {
  if (data.recommendations.length === 0) return "- (no recommendations yet — take a test or fill in your profile)";
  const byCategory = new Map<string, typeof data.recommendations>();
  for (const rec of data.recommendations) {
    const list = byCategory.get(rec.category) ?? [];
    list.push(rec);
    byCategory.set(rec.category, list);
  }
  const blocks: string[] = [];
  for (const [category, recs] of byCategory) {
    blocks.push(`### ${category}\n`);
    blocks.push(recs.map((r) => `- **${label(labels, r.title)}** (match ${r.matchScore}/100)`).join("\n"));
  }
  return blocks.join("\n\n");
}

function graphSnapshotTable(nodes: GraphSnapshotEntry[], labels: ExportLabels | undefined): string {
  if (nodes.length === 0) return "| - | - | - | - |";
  return nodes
    .map((n) => `| ${label(labels, n.i18nKey)} | ${n.kind} | ${n.hop} | ${n.edgeKind} |`)
    .join("\n");
}

export function serializeExportMarkdown(data: OntologyExport, labels?: ExportLabels): string {
  return `# OIYO Ontology Export

> Exported from oiyo.net on ${data.exportedAt.slice(0, 10)}. This is a local-only snapshot — nothing was sent to a server.

## Identity Signals

${signalsTable(data, labels)}

## Test History

| Test | Result | Date |
|---|---|---|
${testHistoryTable(data)}

## Versioned Assessment Results

Raw item responses are excluded from this export by default.

| Assessment | Evidence | Instrument | Date |
|---|---|---|---|
${assessmentHistoryTable(data)}

## Recommendations

${recommendationsSection(data, labels)}

## Relationship Graph Snapshot

2 hops out from your signals, via the ontology relationship graph.

| Node | Kind | Hop | Relation |
|---|---|---|---|
${graphSnapshotTable(data.graphSnapshot, labels)}
`;
}

// ─── soul.md (AI persona spec) ──────────────────────────────────────────

const BIG5_HIGH = 60;
const BIG5_LOW = 40;

const MBTI_TONE_HINTS: Record<string, string> = {
  E: "I recharge and think out loud in conversation — feel free to respond in real time.",
  I: "I process internally before speaking — give me a beat before expecting a reaction.",
  S: "I prefer concrete, step-by-step explanations over abstractions.",
  N: "Lead with the big picture and the core idea before the details.",
  T: "I'm comfortable with direct, unpadded feedback.",
  F: "I respond better to a warm, empathetic tone, especially with criticism.",
  J: "I like clear plans and firm deadlines.",
  P: "I like options kept open and flexible.",
};

const ENNEAGRAM_TONE_HINTS: Record<string, string> = {
  "1": "I hold myself to high standards — acknowledging effort, not just outcomes, helps.",
  "2": "I value being genuinely appreciated, not just thanked out of habit.",
  "3": "I'm motivated by visible progress — frame things in terms of goals and momentum.",
  "4": "I want to feel understood as an individual, not generalized.",
  "5": "Give me space and information before asking me to commit or decide.",
  "6": "Clear, consistent expectations help me trust the process.",
  "7": "Keep things upbeat and give me room to explore options.",
  "8": "Be direct with me — I respect people who say what they mean.",
  "9": "Ask for my actual preference explicitly — I'll default to agreeing otherwise.",
};

const SAJU_ELEMENT_HINTS: Record<string, string> = {
  wood: "My dominant element is Wood — I tend to grow through new starts and gentle structure, not force.",
  fire: "My dominant element is Fire — I move fast and respond well to energy and encouragement.",
  earth: "My dominant element is Earth — I value stability and steady, dependable follow-through.",
  metal: "My dominant element is Metal — I like precision and clear standards.",
  water: "My dominant element is Water — I adapt easily but need quiet time to reflect.",
};

function preferencesSection(data: OntologyExport, labels: ExportLabels | undefined): string {
  const byCategory = new Map<string, typeof data.recommendations>();
  for (const rec of data.recommendations) {
    const list = byCategory.get(rec.category) ?? [];
    list.push(rec);
    byCategory.set(rec.category, list);
  }
  const hobbies = byCategory.get("hobby") ?? [];
  const careers = byCategory.get("career") ?? [];
  const diverge = data.graphSnapshot.filter((n) => n.edgeKind === "divergent");
  const relief = data.graphSnapshot.filter((n) => n.edgeKind === "stress-relief");

  const lines: string[] = [];
  lines.push(`- Hobbies I gravitate toward: ${hobbies.length ? hobbies.map((r) => label(labels, r.title)).join(", ") : "(none recorded yet)"}`);
  lines.push(`- Careers that fit my profile: ${careers.length ? careers.map((r) => label(labels, r.title)).join(", ") : "(none recorded yet)"}`);
  lines.push(`- What helps me diverge/explore: ${diverge.length ? diverge.map((n) => label(labels, n.i18nKey)).join(", ") : "(none recorded yet)"}`);
  lines.push(`- What helps me unwind: ${relief.length ? relief.map((n) => label(labels, n.i18nKey)).join(", ") : "(none recorded yet)"}`);
  return lines.join("\n");
}

function howToTreatMe(data: OntologyExport): string {
  const s = data.signals;
  const lines: string[] = [];

  if (s.mbti) {
    for (const letter of s.mbti.type) {
      const hint = MBTI_TONE_HINTS[letter];
      if (hint) lines.push(`- ${hint}`);
    }
  }
  if (s.big5) {
    if (s.big5.O >= BIG5_HIGH) lines.push("- I'm high in Openness — I welcome novel ideas and experimental suggestions.");
    if (s.big5.N >= BIG5_HIGH) lines.push("- I'm high in Neuroticism — a calm, reassuring tone helps when discussing setbacks.");
    if (s.big5.N <= BIG5_LOW) lines.push("- I'm low in Neuroticism — I stay steady under pressure, no need to soften bad news much.");
    if (s.big5.E >= BIG5_HIGH) lines.push("- I'm high in Extraversion — thinking out loud together works well for me.");
  }
  if (s.enneagram) {
    const hint = ENNEAGRAM_TONE_HINTS[s.enneagram];
    if (hint) lines.push(`- ${hint}`);
  }
  if (s.saju) {
    const hint = SAJU_ELEMENT_HINTS[s.saju.element.toLowerCase()];
    if (hint) lines.push(`- ${hint}`);
  }

  return lines.join("\n") || "- No signals recorded yet — treat me as a blank slate and ask rather than assume.";
}

export function serializeExportSoul(data: OntologyExport, labels?: ExportLabels): string {
  return `# SOUL.md

> Generated by oiyo.net on ${data.exportedAt.slice(0, 10)} — a local-only self-definition snapshot for AI assistants. Paste this into an assistant's context to personalize how it treats me. This is a point-in-time snapshot, not a fixed identity.

## Identity signals

${signalsTable(data, labels)}

## Preferences

${preferencesSection(data, labels)}

## How to treat me

${howToTreatMe(data)}

## Assessment provenance

Raw item responses are excluded from this file by default.

${assessmentProvenance(data)}
`;
}

// ─── html2canvas (DOM -> PNG) ───────────────────────────────────────────

/**
 * Captures `elementId` as a PNG blob. Client-only (throws if called on the
 * server — callers must gate this the same way other client-only ontology
 * code does, e.g. a `hydrated` guard). Returns `null` if the element isn't
 * found or capture fails, rather than throwing, so the UI can fall back to
 * "PNG unavailable" instead of crashing the export panel.
 */
export async function captureExportPng(elementId: string): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const element = document.getElementById(elementId);
  if (!element) return null;
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(element, { backgroundColor: "#f6fff8", logging: false, scale: 2, useCORS: true });
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
  } catch {
    return null;
  }
}
