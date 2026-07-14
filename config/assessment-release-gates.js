const attachmentLocaleStatuses = Object.freeze({
  ko: "draft",
  en: "draft",
  ja: "draft",
  zh: "draft",
  fr: "draft",
  es: "draft",
});

export const ADULT_ATTACHMENT_RELEASE_GATE = Object.freeze({
  assessmentId: "adult-attachment",
  assessmentStatus: "draft",
  canonicalPattern: "https://oiyo.net/{locale}/attachment-style/test/",
  executionRoutePattern: "/{locale}/attachment-style/test",
  indexable: false,
  localeStatuses: attachmentLocaleStatuses,
  locales: Object.freeze(Object.keys(attachmentLocaleStatuses)),
  ownershipId: "oiyo.attachment-style.test",
  sourcePath: "src/pages/[locale]/attachment-style/test.astro",
});

const lifeValuesLocaleStatuses = Object.freeze({
  ko: "draft",
  en: "draft",
  ja: "draft",
  zh: "draft",
  fr: "draft",
  es: "draft",
});

export const LIFE_VALUES_CARD_SORT_RELEASE_GATE = Object.freeze({
  assessmentId: "life-values-card-sort",
  assessmentStatus: "draft",
  canonicalPattern: "https://oiyo.net/{locale}/life-values-test/",
  executionRoutePattern: "/{locale}/life-values-test",
  indexable: false,
  localeStatuses: lifeValuesLocaleStatuses,
  locales: Object.freeze(Object.keys(lifeValuesLocaleStatuses)),
  ownershipId: "oiyo.life-values.card-sort",
  sourcePath: "src/pages/[locale]/life-values-test.astro",
});

const careerValuesLocaleStatuses = Object.freeze({
  ko: "draft",
  en: "draft",
  ja: "draft",
  zh: "draft",
  fr: "draft",
  es: "draft",
});

export const CAREER_VALUES_RELEASE_GATE = Object.freeze({
  assessmentId: "career-values",
  assessmentStatus: "draft",
  canonicalPattern: "https://oiyo.net/{locale}/career-values-test/",
  executionRoutePattern: "/{locale}/career-values-test",
  indexable: false,
  localeStatuses: careerValuesLocaleStatuses,
  locales: Object.freeze(Object.keys(careerValuesLocaleStatuses)),
  ownershipId: "oiyo.career-values.test",
  sourcePath: "src/pages/[locale]/career-values-test.astro",
});

const valueCompassBridgeLocaleStatuses = Object.freeze({
  ko: "bridge",
  en: "bridge",
  ja: "bridge",
  zh: "bridge",
  fr: "bridge",
  es: "bridge",
});

export const VALUE_COMPASS_BRIDGE_RELEASE_GATE = Object.freeze({
  assessmentId: "value-compass-legacy-bridge",
  assessmentStatus: "bridge",
  canonicalPattern: "https://oiyo.net/{locale}/political/test/",
  executionRoutePattern: "/{locale}/value-compass-test",
  indexable: false,
  localeStatuses: valueCompassBridgeLocaleStatuses,
  locales: Object.freeze(Object.keys(valueCompassBridgeLocaleStatuses)),
  ownershipId: "oiyo.value-compass.bridge",
  routeType: "bridge",
  sourcePath: "src/pages/[locale]/value-compass-test.astro",
});

export const ASSESSMENT_RELEASE_GATES = Object.freeze([
  ADULT_ATTACHMENT_RELEASE_GATE,
  LIFE_VALUES_CARD_SORT_RELEASE_GATE,
  CAREER_VALUES_RELEASE_GATE,
  VALUE_COMPASS_BRIDGE_RELEASE_GATE,
]);

export function assertAssessmentReleaseGate(gate = ADULT_ATTACHMENT_RELEASE_GATE) {
  if (gate.indexable && gate.assessmentStatus !== "production") {
    throw new Error("indexable assessment must have production status");
  }
  if (gate.indexable && Object.values(gate.localeStatuses).some((status) => status !== "reviewed")) {
    throw new Error("indexable assessment requires every released locale to be reviewed");
  }
  if (new Set(gate.locales).size !== gate.locales.length) throw new Error("release gate locales must be unique");
  if (gate.locales.some((locale) => !(locale in gate.localeStatuses))) throw new Error("release gate locale status is missing");
  if (Object.keys(gate.localeStatuses).some((locale) => !gate.locales.includes(locale))) throw new Error("release gate has an unlisted locale status");
  return true;
}

export function localizedAssessmentPath(locale, gate = ADULT_ATTACHMENT_RELEASE_GATE) {
  return gate.executionRoutePattern.replace("{locale}", locale).replace(/\/$/, "");
}

export function isAssessmentRouteExcludedFromSitemap(pathname) {
  const normalized = pathname.replace(/\/$/, "");
  return ASSESSMENT_RELEASE_GATES.some(
    (gate) => !gate.indexable && gate.locales.some(
      (locale) => normalized === localizedAssessmentPath(locale, gate),
    ),
  );
}

for (const gate of ASSESSMENT_RELEASE_GATES) assertAssessmentReleaseGate(gate);
