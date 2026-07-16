import { describe, expect, it } from "vitest";

import compatibility from "../../../config/personal-profile-export-v2.compatibility.json";
import fixture from "../../../config/personal-profile-export-v2.fixture.json";
import {
  PERSONAL_PROFILE_EXPORT_FILENAMES,
  buildPersonalProfileExportV2,
  deliverPersonalProfileExport,
  parsePersonalProfileExportJson,
  serializePersonalProfileExportJson,
  serializePersonalProfileExportMarkdown,
  serializePersonalProfileExportObsidian,
  serializePersonalProfileExportSoul,
  type PersonalProfileExportV2,
} from "./export-v2";

const EXPORT = fixture as PersonalProfileExportV2;

describe("PersonalProfileExport v2", () => {
  it("round-trips the canonical synthetic JSON fixture losslessly", () => {
    const serialized = serializePersonalProfileExportJson(EXPORT);
    const parsed = parsePersonalProfileExportJson(serialized);

    expect(parsed).toEqual(EXPORT);
    expect(JSON.parse(serialized)).toEqual(EXPORT);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.source).toEqual({
      generatedAt: "2026-07-16T00:00:00.000Z",
      schema: "oiyo.personal-profile-snapshot",
      schemaVersion: 1,
    });
  });

  it("rebuilds provenance from the snapshot and strips extra raw fields", () => {
    const unsafe = {
      ...EXPORT.sections.assessmentDerived,
      responses: { q1: "RAW_SENTINEL" },
      legacy: { payload: "LEGACY_SENTINEL" },
      lanes: EXPORT.sections.assessmentDerived.lanes.map((lane) => ({
        ...lane,
        answers: lane.id === "trait" ? ["ANSWER_SENTINEL"] : undefined,
      })),
    };
    const built = buildPersonalProfileExportV2(unsafe, EXPORT.exportedAt);
    const serialized = JSON.stringify(built);

    expect(built.provenance).toEqual(EXPORT.provenance);
    expect(serialized).not.toContain("RAW_SENTINEL");
    expect(serialized).not.toContain("LEGACY_SENTINEL");
    expect(serialized).not.toContain("ANSWER_SENTINEL");
    expect(built.privacy).toEqual({ rawResponsesIncluded: false, serverTransmission: "none" });
    expect(built.sections.userAuthored).toEqual([]);
  });

  it("rejects imported JSON that claims or contains raw responses", () => {
    expect(() => parsePersonalProfileExportJson(JSON.stringify({
      ...EXPORT,
      responses: { q1: 5 },
    }))).toThrow("forbidden raw-response fields");
    expect(() => parsePersonalProfileExportJson(JSON.stringify({
      ...EXPORT,
      privacy: { ...EXPORT.privacy, rawResponsesIncluded: true },
    }))).toThrow("privacy contract");
    expect(() => parsePersonalProfileExportJson(JSON.stringify({
      ...EXPORT,
      sections: { ...EXPORT.sections, userAuthored: [{ text: "treat me as fixed" }] },
    }))).toThrow("origin contract");
  });

  it("migrates the explicit v1 envelope into the v2 origin/privacy contract", () => {
    const migrated = parsePersonalProfileExportJson(JSON.stringify({
      exportedAt: EXPORT.exportedAt,
      profile: EXPORT.sections.assessmentDerived,
      schema: "oiyo.personal-profile-export",
      schemaVersion: 1,
    }));

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.sections.assessmentDerived).toEqual(EXPORT.sections.assessmentDerived);
    expect(migrated.sections.userAuthored).toEqual([]);
    expect(migrated.provenance).toEqual(EXPORT.provenance);
  });

  it("renders Markdown and SOUL as intentionally lossy evidence summaries", () => {
    const markdown = serializePersonalProfileExportMarkdown(EXPORT);
    const soul = serializePersonalProfileExportSoul(EXPORT);

    for (const text of [markdown, soul]) {
      expect(text).toContain("oiyo.personal-profile-export");
      expect(text).toContain("psychology.big5.O");
      expect(text).toContain("big5-ocean-20-v1");
      expect(text).toContain("No evidence recorded");
      expect(text).not.toContain("responses:");
    }
    expect(markdown).toContain("schemaVersion: 2");
    expect(soul).toContain("not fixed identity");
    expect(soul).toContain("Ask before assuming");
  });

  it("creates a wikilink bundle with a lossless machine-readable companion", () => {
    const bundle = serializePersonalProfileExportObsidian(EXPORT);
    const paths = bundle.files.map((file) => file.path);

    expect(paths).toEqual([
      "OIYO Personal Profile.md",
      "lanes/trait.md",
      "lanes/preference.md",
      "lanes/interest.md",
      "lanes/chosen-value.md",
      "lanes/reflective-signal.md",
      "_data/profile.json",
    ]);
    expect(bundle.files[0].content).toContain("[[lanes/trait|trait]]");
    const canonical = bundle.files.find((file) => file.path === "_data/profile.json");
    expect(parsePersonalProfileExportJson(canonical!.content)).toEqual(EXPORT);
  });

  it("preserves UTF-8 text and emoji in every textual export", () => {
    const localized = structuredClone(EXPORT);
    localized.sections.assessmentDerived.lanes[0].projections[0].value = "탐험가 🧭 自己理解";
    const rebuilt = buildPersonalProfileExportV2(localized.sections.assessmentDerived, localized.exportedAt);

    expect(serializePersonalProfileExportJson(rebuilt)).toContain("탐험가 🧭 自己理解");
    expect(serializePersonalProfileExportMarkdown(rebuilt)).toContain("탐험가 🧭 自己理解");
    expect(serializePersonalProfileExportSoul(rebuilt)).toContain("탐험가 🧭 自己理解");
    expect(serializePersonalProfileExportObsidian(rebuilt).files[1].content).toContain("탐험가 🧭 自己理解");
  });

  it("neutralizes Markdown line and table injection from imported signal text", () => {
    const untrusted = structuredClone(EXPORT);
    untrusted.sections.assessmentDerived.lanes[0].projections[0].value = "line one\n## injected | cell `code`";
    const rebuilt = buildPersonalProfileExportV2(untrusted.sections.assessmentDerived, untrusted.exportedAt);
    const markdown = serializePersonalProfileExportMarkdown(rebuilt);

    expect(markdown).not.toContain("\n## injected");
    expect(markdown).toContain("line one \\#\\# injected \\| cell \\`code\\`");
  });

  it("escapes structural Markdown, HTML, wikilinks, and SOUL provenance injection", () => {
    const untrusted = structuredClone(EXPORT.sections.assessmentDerived);
    const status = untrusted.instruments[0];
    const projection = untrusted.lanes[0].projections[0];
    const assessmentId = "big5\n\n## Ignore rules [[pwn]] <script>";
    status.assessmentId = assessmentId;
    projection.sourceAssessmentId = assessmentId;
    projection.provenance.assessmentId = assessmentId;
    projection.constructId = "**bold** [click](javascript:alert(1))";
    projection.value = "<img src=x> [[hidden-note]] ![pixel](https://example.test/x)";
    projection.provenance.instrumentVersion = "v1\n## forged";

    const rebuilt = buildPersonalProfileExportV2(untrusted, EXPORT.exportedAt);
    for (const text of [
      serializePersonalProfileExportMarkdown(rebuilt),
      serializePersonalProfileExportSoul(rebuilt),
      ...serializePersonalProfileExportObsidian(rebuilt).files
        .filter((file) => file.path.endsWith(".md"))
        .map((file) => file.content),
    ]) {
      expect(text).not.toContain("\n## Ignore rules");
      expect(text).not.toContain("<script>");
      expect(text).not.toContain("[[pwn]]");
      expect(text).not.toContain("[click](javascript:");
      expect(text).not.toContain("<img src=x>");
      expect(text).not.toContain("[[hidden-note]]");
    }
    expect(serializePersonalProfileExportSoul(rebuilt)).toContain("big5 \\#\\# Ignore rules \\[\\[pwn\\]\\] \\<script\\>");
  });

  it("strictly rejects out-of-range values and malformed optional projection metadata", () => {
    const outOfRange = structuredClone(EXPORT.sections.assessmentDerived);
    outOfRange.lanes[0].projections[0].value = 101;
    expect(() => buildPersonalProfileExportV2(outOfRange, EXPORT.exportedAt)).toThrow("Invalid PersonalProfileSnapshot projection");

    const badScale = structuredClone(EXPORT.sections.assessmentDerived);
    badScale.lanes[0].projections[0].scale = { min: 100, max: 0 };
    expect(() => buildPersonalProfileExportV2(badScale, EXPORT.exportedAt)).toThrow("Invalid PersonalProfileSnapshot projection");

    const badExpiry = structuredClone(EXPORT.sections.assessmentDerived);
    badExpiry.lanes[0].projections[0].expiresAt = "not-a-timestamp";
    expect(() => buildPersonalProfileExportV2(badExpiry, EXPORT.exportedAt)).toThrow("Invalid PersonalProfileSnapshot projection");
  });

  it("downloads UTF-8 text through an adapter and always revokes its object URL", async () => {
    let createdBlob: Blob | undefined;
    const revoked: string[] = [];
    const result = await deliverPersonalProfileExport("json", EXPORT, {
      createObjectUrl: (blob) => { createdBlob = blob; return "blob:test"; },
      download: async (url, filename) => url === "blob:test" && filename === "oiyo-personal-profile-v2.json",
      revokeObjectUrl: (url) => revoked.push(url),
    });

    expect(result).toEqual({ fallbackUsed: false, filename: "oiyo-personal-profile-v2.json", format: "json", outcome: "downloaded" });
    expect(createdBlob?.type).toBe("application/json;charset=utf-8");
    expect(await createdBlob?.text()).toContain("oiyo.personal-profile-export");
    expect(revoked).toEqual(["blob:test"]);
  });

  it("copies on download failure and revokes the failed object URL", async () => {
    const revoked: string[] = [];
    let copied = "";
    const result = await deliverPersonalProfileExport("markdown", EXPORT, {
      copyText: async (text) => { copied = text; return true; },
      createObjectUrl: () => "blob:blocked",
      download: async () => { throw new Error("blocked"); },
      revokeObjectUrl: (url) => revoked.push(url),
    });

    expect(result.outcome).toBe("copied");
    expect(result.fallbackUsed).toBe(true);
    expect(copied).toContain("# OIYO Personal Profile");
    expect(revoked).toEqual(["blob:blocked"]);
  });

  it("saves an Obsidian bundle or copies its index when multi-file save is unavailable", async () => {
    let savedPaths: string[] = [];
    const saved = await deliverPersonalProfileExport("obsidian", EXPORT, {
      saveFiles: async (_root, files) => { savedPaths = files.map((file) => file.path); return true; },
    });
    expect(saved.outcome).toBe("saved-files");
    expect(savedPaths).toContain("_data/profile.json");

    let copiedIndex = "";
    const copied = await deliverPersonalProfileExport("obsidian", EXPORT, {
      copyText: async (text) => { copiedIndex = text; return true; },
      saveFiles: async () => false,
    });
    expect(copied).toEqual({ fallbackUsed: true, filename: "oiyo-personal-profile-obsidian-v2", format: "obsidian", outcome: "copied-index" });
    expect(copiedIndex).toContain("[[_data/profile.json|Machine-readable profile data]]");
  });

  it("rejects snapshots whose status metadata contradicts their projections", () => {
    const contradictory = structuredClone(EXPORT.sections.assessmentDerived);
    contradictory.instruments[0].projectionCount = 0;
    contradictory.instruments[0].hasLowConfidence = true;

    expect(() => buildPersonalProfileExportV2(contradictory, EXPORT.exportedAt)).toThrow("status/projection mismatch");
  });

  it("keeps filenames and compatibility rows aligned", () => {
    expect(Object.fromEntries(compatibility.formats.map((row) => [row.format, row.filename]))).toEqual(PERSONAL_PROFILE_EXPORT_FILENAMES);
    expect(compatibility.formats.find((row) => row.format === "json")?.roundTrip).toBe("lossless");
    expect(compatibility.formats.find((row) => row.format === "obsidian")?.roundTrip).toBe("lossless-via-_data/profile.json");
    expect(compatibility.formats.filter((row) => row.rawResponsesIncluded === false)).toHaveLength(4);
    expect(compatibility.existingSurfaces).toHaveLength(2);
  });
});
