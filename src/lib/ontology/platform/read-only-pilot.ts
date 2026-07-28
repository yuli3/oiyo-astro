export const ONTOLOGY_PLATFORM_LOCALES = ["ko", "en", "ja", "zh", "fr", "es"] as const;
export type OntologyPlatformLocale = typeof ONTOLOGY_PLATFORM_LOCALES[number];
type ConceptKind = "action" | "hobby" | "work_context" | "occupation";
type ArtifactPath = { firstId: string; lastId: string; corePath: string; adjacencyPath: string };
type Manifest = { locales: OntologyPlatformLocale[]; shardRanges: Partial<Record<ConceptKind, ArtifactPath[]>> };
type CoreConcept = { id: string; kind: ConceptKind };
type CopyConcept = { id: string; label: string };
type Edge = { from: string; to: string; kind: "supports" | "used_in" | "transfers_to" | "example_occupation" | "expressed_by" | "related_to"; confidence: number; provenance: "curated" | "derived" | "imported"; evidenceClass: string; sourceIds: string[]; rationaleKey: string };
type AdjacencyShard = Record<string, Edge[]>;

export const READ_ONLY_PILOT_SEEDS = ["hobby.running", "hobby.guitar", "hobby.woodworking"] as const;
export type ReadOnlyPilotRelation = { targetId: string; targetKind: "action" | "work_context"; label: string; kind: "supports" | "used_in" | "transfers_to"; provenance: "curated" | "derived"; confidence: number };
export type ReadOnlyPilotOccupationExample = { targetId: string; label: string; confidence: number; evidenceClass: string; sourceIds: string[]; rationaleKey: string };
export type ReadOnlyPilotView = { seed: { id: string; label: string }; actions: ReadOnlyPilotRelation[]; contexts: ReadOnlyPilotRelation[]; occupationExamplesByContext: Record<string, ReadOnlyPilotOccupationExample[]> };
export type JsonFetcher = (path: string) => Promise<unknown>;

function conceptKind(id: string): ConceptKind | null {
  const kind = id.split(".")[0];
  return kind === "action" || kind === "hobby" || kind === "work_context" || kind === "occupation" ? kind : null;
}
function isLocale(locale: string): locale is OntologyPlatformLocale { return (ONTOLOGY_PLATFORM_LOCALES as readonly string[]).includes(locale); }
function isArtifactPath(value: unknown): value is ArtifactPath { return !!value && typeof value === "object" && "firstId" in value && "lastId" in value && "corePath" in value && "adjacencyPath" in value; }
function asManifest(value: unknown): Manifest {
  if (!value || typeof value !== "object") throw new Error("Ontology platform manifest is unavailable");
  const raw = value as Partial<Manifest>;
  if (!Array.isArray(raw.locales) || !raw.shardRanges) throw new Error("Ontology platform manifest is invalid");
  return raw as Manifest;
}
function sortRelations(left: ReadOnlyPilotRelation, right: ReadOnlyPilotRelation) { return right.confidence - left.confidence || left.targetId.localeCompare(right.targetId); }

/** Lazy reader for generated static artifacts. It never imports canonical source JSON into a browser bundle. */
export class OntologyPlatformArtifactLoader {
  private readonly cache = new Map<string, Promise<unknown>>();
  private manifestPromise?: Promise<Manifest>;
  constructor(private readonly fetchJson: JsonFetcher, private readonly basePath = "/ontology-platform-v1") {}

  private json(path: string) {
    const normalized = `${this.basePath.replace(/\/$/, "")}/${path}`;
    const existing = this.cache.get(normalized);
    if (existing) return existing;
    const request = this.fetchJson(normalized);
    this.cache.set(normalized, request);
    return request;
  }
  private manifest() { return this.manifestPromise ??= this.json("manifest.json").then(asManifest); }
  private async artifactFor(id: string) {
    const kind = conceptKind(id);
    if (!kind) throw new Error(`Unsupported ontology concept: ${id}`);
    const ranges = (await this.manifest()).shardRanges[kind] ?? [];
    const artifact = ranges.find((range) => isArtifactPath(range) && range.firstId <= id && id <= range.lastId);
    if (!artifact) throw new Error(`Ontology shard is unavailable: ${id}`);
    return artifact;
  }
  private async concept(locale: OntologyPlatformLocale, id: string) {
    const kind = conceptKind(id);
    if (!kind) return null;
    const artifact = await this.artifactFor(id);
    const [core, copy] = await Promise.all([
      this.json(artifact.corePath) as Promise<CoreConcept[]>,
      this.json(`copy/${locale}/${artifact.corePath.split("/").at(-1)}`) as Promise<CopyConcept[]>,
    ]);
    const source = core.find((entry) => entry.id === id);
    const localized = copy.find((entry) => entry.id === id);
    if (!source || !localized || source.kind !== kind || !localized.label) throw new Error(`Ontology concept is invalid: ${id}`);
    return { id, kind, label: localized.label };
  }
  private async edgesFor(id: string) {
    const artifact = await this.artifactFor(id);
    const adjacency = await this.json(artifact.adjacencyPath) as AdjacencyShard;
    const edges = adjacency[id];
    if (!Array.isArray(edges)) throw new Error(`Ontology adjacency is invalid: ${id}`);
    return edges;
  }
  private async relation(locale: OntologyPlatformLocale, edge: Edge): Promise<ReadOnlyPilotRelation | null> {
    if (edge.kind !== "supports" && edge.kind !== "used_in" && edge.kind !== "transfers_to") return null;
    const target = await this.concept(locale, edge.to);
    if (!target || (target.kind !== "action" && target.kind !== "work_context")) return null;
    return { targetId: target.id, targetKind: target.kind, label: target.label, kind: edge.kind, provenance: edge.provenance, confidence: edge.confidence };
  }
  private async occupationExample(locale: OntologyPlatformLocale, edge: Edge): Promise<ReadOnlyPilotOccupationExample | null> {
    if (edge.kind !== "example_occupation" || !edge.from.startsWith("work_context.") || !edge.to.startsWith("occupation.")) return null;
    const target = await this.concept(locale, edge.to);
    if (!target || target.kind !== "occupation" || !Array.isArray(edge.sourceIds) || !edge.sourceIds.length || !edge.rationaleKey || !edge.evidenceClass) return null;
    return { targetId: target.id, label: target.label, confidence: edge.confidence, evidenceClass: edge.evidenceClass, sourceIds: edge.sourceIds, rationaleKey: edge.rationaleKey };
  }

  async readOnlyPilotView(locale: string, seedId: string): Promise<ReadOnlyPilotView | null> {
    if (!isLocale(locale) || !READ_ONLY_PILOT_SEEDS.includes(seedId as typeof READ_ONLY_PILOT_SEEDS[number])) return null;
    const seed = await this.concept(locale, seedId);
    if (!seed || seed.kind !== "hobby") return null;
    const outgoing = await this.edgesFor(seedId);
    const actions = (await Promise.all(outgoing.map((edge) => this.relation(locale, edge))))
      .filter((relation): relation is ReadOnlyPilotRelation => relation?.targetKind === "action").sort(sortRelations);
    const contextEdges = [...outgoing, ...(await Promise.all(actions.map((action) => this.edgesFor(action.targetId)))).flat()];
    const contexts = (await Promise.all(contextEdges.map((edge) => this.relation(locale, edge))))
      .filter((relation): relation is ReadOnlyPilotRelation => relation?.targetKind === "work_context")
      .filter((relation, index, all) => all.findIndex(({ targetId }) => targetId === relation.targetId) === index)
      .sort(sortRelations).slice(0, 3);
    const entries = await Promise.all(contexts.map(async (context) => {
      const examples = (await Promise.all((await this.edgesFor(context.targetId)).map((edge) => this.occupationExample(locale, edge))))
        .filter((example): example is ReadOnlyPilotOccupationExample => !!example)
        .sort((left, right) => right.confidence - left.confidence || left.targetId.localeCompare(right.targetId, "en"))
        .slice(0, 2);
      return [context.targetId, examples] as const;
    }));
    return { seed: { id: seed.id, label: seed.label }, actions, contexts, occupationExamplesByContext: Object.fromEntries(entries) };
  }
}

export function browserJsonFetcher(path: string): Promise<unknown> {
  return fetch(path, { headers: { Accept: "application/json" } }).then(async (response) => {
    if (!response.ok) throw new Error(`Ontology artifact request failed: ${response.status}`);
    return response.json();
  });
}
