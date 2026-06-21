import type { APIRoute } from "astro";

import { ELEMENTS, ELEMENT_CYCLES } from "../../../manifest/data/saju/elements";
import { STEMS, STEM_ORDER } from "../../../manifest/data/saju/stems";
import { BRANCHES, BRANCH_ORDER } from "../../../manifest/data/saju/branches";

/**
 * 사주(Four Pillars / BaZi) reference dataset — language-neutral codes + i18n
 * short names. The refined data layer behind the saju engine, served statically
 * (the seed of api.oiyo.net). schema.org Dataset framing + CORS for reuse.
 *
 * Output: /api/saju/index.json
 */

export const prerender = true;

const BASE = "https://oiyo.net";

// Ten Gods (十神): relation to the Day Master + polarity (same/different yin-yang).
const TEN_GODS = [
  { id: "BI_GYEON", relation: "peer", polarity: "same", aka: "比肩" },
  { id: "GEOP_JAE", relation: "peer", polarity: "diff", aka: "劫財" },
  { id: "SIK_SIN", relation: "output", polarity: "same", aka: "食神" },
  { id: "SANG_GWAN", relation: "output", polarity: "diff", aka: "傷官" },
  { id: "PYEON_JAE", relation: "wealth", polarity: "same", aka: "偏財" },
  { id: "JEONG_JAE", relation: "wealth", polarity: "diff", aka: "正財" },
  { id: "PYEON_GWAN", relation: "authority", polarity: "same", aka: "偏官" },
  { id: "JEONG_GWAN", relation: "authority", polarity: "diff", aka: "正官" },
  { id: "PYEON_IN", relation: "resource", polarity: "same", aka: "偏印" },
  { id: "JEONG_IN", relation: "resource", polarity: "diff", aka: "正印" },
];

export const GET: APIRoute = async () => {
  const stems = STEM_ORDER.map((id, i) => {
    const s = STEMS[id];
    return {
      id,
      order: i + 1,
      element: s.element,
      yinYang: s.yinYang,
      label: s.short,
    };
  });

  const branches = BRANCH_ORDER.map((id, i) => {
    const b: any = BRANCHES[id];
    return {
      id,
      order: i + 1,
      element: b.element,
      yinYang: b.yinYang,
      animal: b.animal ?? undefined,
      hiddenStems: b.hiddenStems ?? undefined,
      season: b.seasonKey ?? b.season ?? undefined,
      label: b.short,
    };
  });

  const elements = (Object.keys(ELEMENTS) as (keyof typeof ELEMENTS)[]).map(
    (id) => {
      const e = ELEMENTS[id];
      return {
        id,
        generates: ELEMENT_CYCLES.productive[id],
        controls: ELEMENT_CYCLES.destructive[id],
        color: e.color,
        yinYang: e.yinYang,
        label: e.short,
      };
    },
  );

  const body = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Oiyo Saju (Four Pillars / BaZi) Reference Dataset",
    description:
      "Language-neutral reference data for Korean Saju / Chinese BaZi: ten heavenly stems, twelve earthly branches, five elements with productive/destructive cycles, and the ten gods — with multilingual short labels. Powers the oiyo.net saju engine.",
    url: `${BASE}/api/saju/index.json`,
    creator: {
      "@type": "Organization",
      name: "Oiyo",
      url: BASE,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    inLanguage: ["ko", "en", "ja", "zh", "fr", "es"],
    keywords: ["saju", "bazi", "four pillars", "five elements", "ten gods", "yongsin"],
    measurementTechnique:
      "Curated SSOT (heavenly stems / earthly branches / five elements) + classical 부억용신 method for favorable-element derivation.",
    citation: "Attribution: Oiyo (oiyo.net).",
    data: {
      stems,
      branches,
      elements,
      tenGods: TEN_GODS,
      cycles: {
        productive: ELEMENT_CYCLES.productive,
        destructive: ELEMENT_CYCLES.destructive,
      },
      yongsinMethod: {
        id: "buyok",
        name: "扶抑用神 (support-suppress)",
        rules: {
          strong: ["output", "wealth", "authority"],
          weak: ["resource", "peer"],
        },
        note: "If the Day Master is strong, favor draining/controlling roles; if weak, favor supporting roles. One of several classical schools.",
      },
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
