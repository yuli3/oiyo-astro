import type { EpisodeId } from "../lib/past-life-1426";

export const TIMESLIP_UI_ROOT = "/images/timeslip-ui-v2/";
// 2026-11-06: retain the generated 3:4 card ratio in the preview and export.
// Florence and wax are reserved; neither implies a shipped episode or seal.
export const TIMESLIP_CARD_ART: Partial<Record<EpisodeId, string>> = {
  // 2026-11-14: code-rendered family-tree sheet (no AI art).
  "ancestors-1426": "cards/ancestors-blank.webp",
  "joseon-1426": "cards/joseon-blank.webp",
  "silla-golpum": "cards/silla-blank.webp",
  "europe-1426": "cards/europe-blank.webp",
  // 2026-11-14: code-rendered hanji register sheet (no AI art), replaces the borrowed 1426 paper.
  "joseon-1789": "cards/joseon1789-blank.webp",
  "france-1789": "cards/france-blank.webp",
  "us-birth-state": "cards/us-blank.webp",
};
/**
 * /joseon-1789/ result scenes by status and sex, relative to TIMESLIP_UI_ROOT.
 * Empty until the AI scenes from company-brain image-goals (goal "/joseon-1789" scene slots) are
 * generated; the installer only adds a line here. A missing sex falls back to the other one.
 */
export const JOSEON1789_SCENES: Partial<Record<"yangban" | "sangmin" | "nobi", Partial<Record<"f" | "m", string>>>> = {};

export const TIMESLIP_ART_NOTE = {
  ko: "AI 창작 삽화 · 복식의 정확한 복원도나 실제 증명서가 아닙니다.",
  en: "AI-created illustration · not an exact costume reconstruction or a real certificate.",
  ja: "AIによる創作挿絵。衣装の正確な復元や実際の証明書ではありません。",
  zh: "AI创作插画，并非服饰的精确复原或真实证件。",
  fr: "Illustration créée par IA, sans reconstitution exacte des costumes ni certificat réel.",
  es: "Ilustración creada con IA; no es una reconstrucción exacta del vestuario ni un certificado real.",
} as const;
