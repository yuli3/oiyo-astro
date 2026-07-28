import { describe, expect, it } from "vitest";

import { OntologyPlatformArtifactLoader } from "./read-only-pilot";

const data: Record<string, unknown> = {
  "/ontology-platform-v1/manifest.json": {
    locales: ["ko", "en", "ja", "zh", "fr", "es"],
    shardRanges: {
      hobby: [{ firstId: "hobby.guitar", lastId: "hobby.woodworking", corePath: "core/hobby-000.json", adjacencyPath: "adjacency/hobby-000.json" }],
      action: [{ firstId: "action.create", lastId: "action.run_physical", corePath: "core/action-000.json", adjacencyPath: "adjacency/action-000.json" }],
      work_context: [{ firstId: "work_context.creative_production", lastId: "work_context.transport_navigation", corePath: "core/work_context-000.json", adjacencyPath: "adjacency/work_context-000.json" }],
      occupation: [{ firstId: "occupation.writer", lastId: "occupation.writer", corePath: "core/occupation-000.json", adjacencyPath: "adjacency/occupation-000.json" }],
    },
  },
  "/ontology-platform-v1/core/hobby-000.json": [{ id: "hobby.guitar", kind: "hobby" }, { id: "hobby.running", kind: "hobby" }, { id: "hobby.woodworking", kind: "hobby" }],
  "/ontology-platform-v1/copy/en/hobby-000.json": [{ id: "hobby.guitar", label: "Guitar" }, { id: "hobby.running", label: "Running" }, { id: "hobby.woodworking", label: "Woodworking" }],
  "/ontology-platform-v1/copy/ko/hobby-000.json": [{ id: "hobby.guitar", label: "기타 연주" }, { id: "hobby.running", label: "러닝" }, { id: "hobby.woodworking", label: "목공" }],
  "/ontology-platform-v1/adjacency/hobby-000.json": {
    "hobby.guitar": [{ from: "hobby.guitar", to: "action.create", kind: "supports", confidence: 0.8, provenance: "curated" }, { from: "hobby.guitar", to: "work_context.creative_production", kind: "transfers_to", confidence: 0.57, provenance: "derived" }],
    "hobby.running": [{ from: "hobby.running", to: "action.run_physical", kind: "supports", confidence: 0.8, provenance: "curated" }],
    "hobby.woodworking": [{ from: "hobby.woodworking", to: "action.create", kind: "supports", confidence: 0.7, provenance: "curated" }],
  },
  "/ontology-platform-v1/core/action-000.json": [{ id: "action.create", kind: "action" }, { id: "action.run_physical", kind: "action" }],
  "/ontology-platform-v1/copy/en/action-000.json": [{ id: "action.create", label: "Create" }, { id: "action.run_physical", label: "Run" }],
  "/ontology-platform-v1/copy/ko/action-000.json": [{ id: "action.create", label: "만들다" }, { id: "action.run_physical", label: "달리다" }],
  "/ontology-platform-v1/adjacency/action-000.json": {
    "action.create": [{ from: "action.create", to: "work_context.creative_production", kind: "used_in", confidence: 0.57, provenance: "derived" }, { from: "action.create", to: "occupation.writer", kind: "example_occupation", confidence: 0.9, provenance: "curated" }],
    "action.run_physical": [{ from: "action.run_physical", to: "work_context.transport_navigation", kind: "used_in", confidence: 0.49, provenance: "derived" }],
  },
  "/ontology-platform-v1/core/work_context-000.json": [{ id: "work_context.creative_production", kind: "work_context" }, { id: "work_context.transport_navigation", kind: "work_context" }],
  "/ontology-platform-v1/copy/en/work_context-000.json": [{ id: "work_context.creative_production", label: "Creative production" }, { id: "work_context.transport_navigation", label: "Transport" }],
  "/ontology-platform-v1/copy/ko/work_context-000.json": [{ id: "work_context.creative_production", label: "창작 환경" }, { id: "work_context.transport_navigation", label: "운송 환경" }],
  "/ontology-platform-v1/adjacency/work_context-000.json": {
    "work_context.creative_production": [{ from: "work_context.creative_production", to: "occupation.writer", kind: "example_occupation", confidence: 0.85, provenance: "imported", evidenceClass: "catalog_derived", sourceIds: ["catalog:careers.writer"], rationaleKey: "relations.creative.writer" }],
    "work_context.transport_navigation": [],
  },
  "/ontology-platform-v1/core/occupation-000.json": [{ id: "occupation.writer", kind: "occupation" }],
  "/ontology-platform-v1/copy/en/occupation-000.json": [{ id: "occupation.writer", label: "Writer" }],
  "/ontology-platform-v1/copy/ko/occupation-000.json": [{ id: "occupation.writer", label: "작가" }],
  "/ontology-platform-v1/adjacency/occupation-000.json": { "occupation.writer": [] },
};

function fixtureLoader() {
  const calls: string[] = [];
  return {
    calls,
    loader: new OntologyPlatformArtifactLoader(async (path) => {
      calls.push(path);
      if (!(path in data)) throw new Error(`Missing fixture: ${path}`);
      return data[path];
    }),
  };
}

describe("OntologyPlatformArtifactLoader", () => {
  it("reads only the manifest-selected shards with direct locale copy", async () => {
    const { loader, calls } = fixtureLoader();
    const view = await loader.readOnlyPilotView("ko", "hobby.guitar");

    expect(view?.seed.label).toBe("기타 연주");
    expect(view?.actions).toEqual(expect.arrayContaining([expect.objectContaining({ targetId: "action.create", label: "만들다", provenance: "curated" })]));
    expect(view?.occupationExamplesByContext["work_context.creative_production"]).toEqual([expect.objectContaining({ targetId: "occupation.writer", label: "작가", sourceIds: ["catalog:careers.writer"] })]);
    expect(calls).not.toContain("/ontology-platform-v1/copy/en/hobby-000.json");
    expect(calls).toContain("/ontology-platform-v1/core/occupation-000.json");
  });

  it("fails closed for unsupported locale and only follows occupation examples from a work context", async () => {
    const { loader, calls } = fixtureLoader();
    expect(await loader.readOnlyPilotView("de", "hobby.guitar")).toBeNull();
    expect(calls).toEqual([]);
    const view = await loader.readOnlyPilotView("en", "hobby.guitar");
    expect([...view!.actions, ...view!.contexts].every(({ targetId }) => !targetId.startsWith("occupation."))).toBe(true);
    expect(view!.occupationExamplesByContext["work_context.creative_production"]?.map(({ targetId }) => targetId)).toEqual(["occupation.writer"]);
    expect(calls).toContain("/ontology-platform-v1/core/occupation-000.json");
  });
});
