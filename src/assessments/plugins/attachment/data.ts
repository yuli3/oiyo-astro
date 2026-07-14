import type { AssessmentLocale, AssessmentLocaleBundle, InstrumentDefinition } from "../../core";
import { ADULT_ATTACHMENT_RELEASE_GATE } from "../../../../config/assessment-release-gates.js";

export const ATTACHMENT_DIMENSIONS = ["anxiety", "avoidance"] as const;
export type AttachmentDimension = (typeof ATTACHMENT_DIMENSIONS)[number];

export const ATTACHMENT_ITEM_IDS = ATTACHMENT_DIMENSIONS.flatMap((dimension) =>
  Array.from({ length: 6 }, (_, index) => `${dimension}-${index + 1}`),
);

const REVERSE_ITEMS = new Set(["anxiety-5", "anxiety-6", "avoidance-5", "avoidance-6"]);

export const ATTACHMENT_INSTRUMENT: InstrumentDefinition = {
  items: ATTACHMENT_ITEM_IDS.map((id) => ({
    constructId: `relationship.attachment.${id.split("-")[0]}`,
    id,
    promptKey: `items.${id}`,
    required: true,
    responseScaleId: "likert-5",
    reverse: REVERSE_ITEMS.has(id),
  })),
  responseScales: [{ id: "likert-5", kind: "likert", min: 1, max: 5 }],
  version: "attachment-oiyo-anxiety-avoidance-12-v1",
};

const COPY: Record<AssessmentLocale, { name: string; description: string; disclaimer: string }> = {
  ko: { name: "성인 애착 경향 검사", description: "가까운 관계에서 나타나는 애착 불안과 회피 경향을 두 연속축으로 살펴봅니다.", disclaimer: "OIYO 자체 문항으로 만든 자기이해 도구이며 임상 진단, 관계 안전성 또는 학대 여부를 판별하지 않습니다." },
  en: { name: "Adult Attachment Tendencies", description: "Explore attachment anxiety and avoidance as two continuous tendencies in close relationships.", disclaimer: "An OIYO-authored reflection tool, not a clinical diagnosis or an assessment of relationship safety or abuse." },
  ja: { name: "成人の愛着傾向チェック", description: "親しい関係における愛着不安と回避傾向を二つの連続軸で見ます。", disclaimer: "OIYO独自項目による自己理解ツールで、臨床診断や関係の安全性・虐待の判定ではありません。" },
  zh: { name: "成人依恋倾向测验", description: "以两个连续维度观察亲密关系中的依恋焦虑与回避倾向。", disclaimer: "这是由OIYO原创题目组成的自我理解工具，不用于临床诊断，也不判断关系安全或虐待。" },
  fr: { name: "Tendances d’attachement adulte", description: "Explorez l’anxiété et l’évitement d’attachement comme deux tendances continues dans les relations proches.", disclaimer: "Outil de réflexion composé par OIYO, sans valeur de diagnostic ni d’évaluation de la sécurité ou de la violence relationnelle." },
  es: { name: "Tendencias de apego adulto", description: "Explora la ansiedad y la evitación del apego como dos tendencias continuas en relaciones cercanas.", disclaimer: "Herramienta de reflexión con ítems originales de OIYO; no diagnostica ni evalúa la seguridad o el abuso en una relación." },
};

export function attachmentLocaleBundle(): AssessmentLocaleBundle {
  return Object.fromEntries(
    Object.entries(COPY).map(([locale, content]) => [locale, {
      content: { ...content, seoDescription: content.description, seoTitle: content.name, strings: {} },
      status: ADULT_ATTACHMENT_RELEASE_GATE.localeStatuses[locale as AssessmentLocale],
    }]),
  ) as AssessmentLocaleBundle;
}

export const ATTACHMENT_ITEM_PROVENANCE = "All 12 prompts are draft OIYO-authored behavioral reflection items. They were rewritten away from ECR-family wording and structure, but still require independent item-similarity, content-validity, and cognitive-interview review before any promotion beyond educational/draft. They must never be represented as ECR, ECR-R, or ECR-RS instruments.";
