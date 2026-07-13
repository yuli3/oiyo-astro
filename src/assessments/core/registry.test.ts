import { describe, expect, it } from "vitest";

import { ASSESSMENT_LOCALES } from "./common";
import type { AssessmentLocaleBundle } from "./locale";
import type { AssessmentPlugin } from "./plugin";
import { createAssessmentRegistry } from "./registry";

function localeBundle(): AssessmentLocaleBundle {
  return Object.fromEntries(
    ASSESSMENT_LOCALES.map((locale) => [
      locale,
      {
        content: {
          description: "Description",
          disclaimer: "Disclaimer",
          name: "Example",
          seoDescription: "SEO description",
          seoTitle: "SEO title",
          strings: {},
        },
        status: "reviewed",
      },
    ]),
  ) as AssessmentLocaleBundle;
}

function plugin(id = "example"): AssessmentPlugin {
  return {
    exportPolicy: {
      allowedFormats: ["json"],
      includeResponsesByDefault: false,
      sensitiveConstructs: [],
    },
    id,
    instrument: { items: [], responseScales: [], version: "1.0.0" },
    interpreter: { compose: () => [], version: "1.0.0" },
    locale: localeBundle(),
    manifest: {
      analyticsId: id,
      category: "personality",
      clinical: false,
      evidenceTier: "educational",
      estimatedMinutes: 1,
      id,
      indexable: true,
      kind: "psychometric",
      routes: { execution: `/${id}/test` },
      status: "draft",
      tags: [],
    },
    migrations: [],
    ontology: { edges: [], nodes: [], toSignals: () => [] },
    schemaVersion: 2,
    scorer: {
      score: () => ({ normalized: {}, raw: {} }),
      validateResponses: (responses) => ({
        complete: true,
        errors: [],
        responses,
        warnings: [],
      }),
      version: "1.0.0",
    },
    sources: {
      itemRefs: [],
      license: { note: "Original example", status: "original" },
      normRefs: [],
      records: [],
      scoringRefs: [],
      theoryRefs: [],
    },
  };
}

describe("assessment registry", () => {
  it("registers, gets, and lists a plugin", () => {
    const registry = createAssessmentRegistry();
    const value = plugin();
    registry.register(value);
    expect(registry.get("example")).toBe(value);
    expect(registry.list()).toEqual([value]);
  });

  it("rejects duplicate ids", () => {
    const registry = createAssessmentRegistry();
    registry.register(plugin());
    expect(() => registry.register(plugin())).toThrow(
      "Duplicate assessment plugin id: example",
    );
  });

  it("rejects a manifest id mismatch", () => {
    const registry = createAssessmentRegistry();
    const value = plugin();
    value.manifest.id = "different";
    expect(() => registry.register(value)).toThrow("id mismatch");
  });
});
