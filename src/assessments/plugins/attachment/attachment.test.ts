import { describe, expect, it } from "vitest";

import { ontologySignalsFromResults } from "../../core";
import {
  ATTACHMENT_INSTRUMENT,
  attachmentPlugin,
  attachmentResponsesFromAnswers,
  buildAttachmentResult,
} from ".";

describe("adult attachment V2 plugin", () => {
  it("registers 12 original items across anxiety and avoidance", () => {
    expect(ATTACHMENT_INSTRUMENT.items).toHaveLength(12);
    expect(new Set(ATTACHMENT_INSTRUMENT.items.map((item) => item.constructId))).toEqual(new Set([
      "relationship.attachment.anxiety",
      "relationship.attachment.avoidance",
    ]));
    expect(attachmentPlugin.sources.license.status).toBe("original");
    expect(attachmentPlugin.manifest.evidenceTier).toBe("educational");
    expect(Object.values(attachmentPlugin.locale).every((entry) => entry.status === "draft")).toBe(true);
    expect(attachmentPlugin.exportPolicy.permalinkConstructs).toEqual([]);
    expect(attachmentPlugin.exportPolicy.sensitiveConstructs).toHaveLength(2);
  });

  it("scores both dimensions from 0 to 100 including reverse-keyed items", () => {
    const low = buildAttachmentResult(attachmentResponsesFromAnswers([
      1, 1, 1, 1, 5, 5,
      1, 1, 1, 1, 5, 5,
    ]));
    const high = buildAttachmentResult(attachmentResponsesFromAnswers([
      5, 5, 5, 5, 1, 1,
      5, 5, 5, 5, 1, 1,
    ]));
    expect(low.scores.normalized).toEqual({ anxiety: 0, avoidance: 0 });
    expect(high.scores.normalized).toEqual({ anxiety: 100, avoidance: 100 });
    expect(high.classifications).toEqual([]);
    expect(high.quality.responseWarnings.join(" ")).toContain("not norms");
  });

  it("rejects missing, out-of-range, and unknown responses", () => {
    expect(() => buildAttachmentResult({})).toThrow("Cannot build incomplete");
    const invalid = attachmentResponsesFromAnswers(Array(12).fill(3));
    invalid["anxiety-1"] = 9;
    invalid.extra = 3;
    expect(() => buildAttachmentResult(invalid)).toThrow("anxiety-1 must be an integer from 1 to 5");
  });

  it("emits contextual, expiring ontology signals without category labels", () => {
    const result = buildAttachmentResult(
      attachmentResponsesFromAnswers(Array(12).fill(3)),
      { completedAt: "2099-01-01T00:00:00.000Z", resultId: "attachment:test" },
    );
    const signals = attachmentPlugin.ontology.toSignals(result);
    expect(signals.map((signal) => signal.constructId)).toEqual([
      "relationship.attachment.anxiety",
      "relationship.attachment.avoidance",
    ]);
    expect(signals.every((signal) => signal.confidence === 0.25)).toBe(true);
    expect(signals.every((signal) => signal.expiresAt === "2099-04-01T00:00:00.000Z")).toBe(true);
    expect(ontologySignalsFromResults([result], (id) => id === attachmentPlugin.id ? attachmentPlugin : undefined)).toHaveLength(2);
  });
});
