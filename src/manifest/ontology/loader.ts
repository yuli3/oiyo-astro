import type { Birthflower, Birthstone, Hobby } from "./core/schemas";
import type { Faction } from "./shards/lifestyle/factions";

export const OntologyShardMap = {
  BIRTHFLOWERS: () =>
    import("./shards/biography/flowers").then((m) => m.default),
  BIRTHSTONES: () => import("./shards/biography/stones").then((m) => m.default),
  ECONOMIC_SCHOOLS: () =>
    import("./shards/lifestyle/factions").then((m) => m.ECONOMIC_SCHOOLS),
  HOBBIES: () => import("./shards/lifestyle/hobbies").then((m) => m.default),
  POLITICAL_TENDENCIES: () =>
    import("./shards/lifestyle/factions").then((m) => m.POLITICAL_TENDENCIES),
} as const;

export type ShardData<T extends ShardKey> = T extends "BIRTHSTONES"
  ? Birthstone[]
  : T extends "BIRTHFLOWERS"
    ? Birthflower[]
    : T extends "HOBBIES"
      ? Hobby[]
      : T extends "ECONOMIC_SCHOOLS" | "POLITICAL_TENDENCIES"
        ? Faction[]
        : never;

export type ShardKey = keyof typeof OntologyShardMap;

/**
 * Just-In-Time Loader for Ontology Shards.
 * Usage: const stones = await loadOntologyShard('BIRTHSTONES');
 */
export async function loadOntologyShard<K extends ShardKey>(
  shardKey: K,
): Promise<ShardData<K>> {
  const loader = OntologyShardMap[shardKey];
  if (!loader)
    throw new Error(`Shard ${shardKey} not found in OntologyShardMap`);

  // @ts-ignore - Dynamic import type inference is tricky here, but safe due to ShardMap
  return loader() as Promise<ShardData<K>>;
}
