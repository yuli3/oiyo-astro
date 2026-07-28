import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PLATFORM_ROOT = resolve(ROOT, "config/ontology-platform/v1");
const DIMENSIONS = ["timeCommitment", "budget", "space", "physicalDemand", "socialMode", "setting", "entryDifficulty", "continuity", "outcomeModes"];
const readJson = (name) => readFile(resolve(PLATFORM_ROOT, name), "utf8").then(JSON.parse);
const fail = (message) => { throw new Error(message); };
const HOBBY_VOCABULARY_III_IDS = { card_games: "traditional_card_games", candle_making: "beeswax_candle_making", soap_making: "cold_process_soap_making", beadwork: "seed_beadwork", miniature_making: "miniature_scene_making", map_reading: "transit_map_reading", bird_identification: "backyard_bird_identification", mahjong: "mahjong_strategy", music_listening: "active_music_listening" };

function validProfile(profile, dimensions) {
  for (const dimension of DIMENSIONS) {
    const allowed = dimensions[dimension];
    const value = profile?.[dimension];
    if (!Array.isArray(allowed) || allowed.length === 0) return false;
    if (dimension === "outcomeModes") {
      if (!Array.isArray(value) || value.length === 0 || new Set(value).size !== value.length || value.some((item) => !allowed.includes(item))) return false;
    } else if (!allowed.includes(value)) return false;
  }
  return true;
}

async function main() {
  const [catalog, expansion, expansionII, expansionIII, conceptsDocument] = await Promise.all([
    readJson("curated-hobby-activity-facets-v1.json"),
    readFile(resolve(ROOT, "config/ontology-platform/v2/hobby-catalog-i-v1.json"), "utf8").then(JSON.parse),
    readFile(resolve(ROOT, "config/ontology-platform/v2/hobby-catalog-ii-v1.json"), "utf8").then(JSON.parse),
    readFile(resolve(ROOT, "config/ontology-platform/v2/hobby-catalog-iii-v1.json"), "utf8").then(JSON.parse),
    readJson("concepts.json")
  ]);
  if (catalog.schema !== "oiyo.ontology-curated-hobby-activity-facets" || catalog.schemaVersion !== 1 || !catalog.source?.id || !catalog.profiles || !catalog.hobbyProfiles) fail("hobby activity facet catalog contract mismatch");
  if (expansion.schema !== "oiyo.ontology-hobby-catalog" || expansion.batch !== 4 || expansion.hobbies?.length !== 149) fail("hobby catalog I source contract mismatch");
  if (expansionII.schema !== "oiyo.ontology-hobby-catalog" || expansionII.schemaVersion !== 2 || expansionII.batch !== 5 || !Array.isArray(expansionII.hobbyGroups)) fail("hobby catalog II source contract mismatch");
  if (expansionIII.schema !== "oiyo.ontology-hobby-catalog" || expansionIII.schemaVersion !== 3 || expansionIII.batch !== 6 || !Array.isArray(expansionIII.hobbyGroups)) fail("hobby catalog III source contract mismatch");
  const expansionIIHobbies = expansionII.hobbyGroups.flatMap(({ profile, riasec, items }) => (items ?? []).map((id) => ({ id, profile, riasec })));
  if (expansionIIHobbies.length !== 150 || new Set(expansionIIHobbies.map(({ id }) => id)).size !== 150 || expansionIIHobbies.some(({ id, profile, riasec }) => !/^[a-z][a-z0-9_]{1,63}$/.test(id) || typeof profile !== "string" || !Array.isArray(riasec) || riasec.length === 0)) fail("hobby catalog II entry contract mismatch");
  const expansionIIIHobbies = expansionIII.hobbyGroups.flatMap(({ profile, riasec, items }) => (items ?? []).map((sourceId) => ({ id: HOBBY_VOCABULARY_III_IDS[sourceId] ?? sourceId, profile, riasec })));
  if (expansionIIIHobbies.length !== 250 || new Set(expansionIIIHobbies.map(({ id }) => id)).size !== 250 || expansionIIIHobbies.some(({ id, profile, riasec }) => !/^[a-z][a-z0-9_]{1,63}$/.test(id) || typeof profile !== "string" || !Array.isArray(riasec) || riasec.length === 0)) fail("hobby catalog III entry contract mismatch");
  const hobbies = conceptsDocument.concepts.filter((concept) => concept.kind === "hobby").sort((left, right) => left.id.localeCompare(right.id, "en"));
  if (hobbies.length < 600) fail("hobby catalog III coverage regressed");
  const profileMap = { ...catalog.hobbyProfiles, ...Object.fromEntries([...expansion.hobbies, ...expansionIIHobbies, ...expansionIIIHobbies].map(({ id, profile }) => [id, profile])) };
  const sourceIds = Object.keys(profileMap).sort();
  const canonicalIds = hobbies.map((hobby) => hobby.id.replace("hobby.", ""));
  if (JSON.stringify(sourceIds) !== JSON.stringify(canonicalIds)) fail("hobby activity facet coverage mismatch");
  const profileUse = new Map();
  for (const hobby of hobbies) {
    const id = hobby.id.replace("hobby.", "");
    const profileId = profileMap[id];
    const profile = catalog.profiles[profileId];
    if (!/^[a-z][a-z_]{1,63}$/.test(profileId ?? "") || !validProfile(profile, catalog.dimensions)) fail(`invalid source profile: ${id}`);
    const expected = { profile: profileId, ...profile };
    if (JSON.stringify(hobby.activityFacets) !== JSON.stringify(expected)) fail(`canonical activity facet mismatch: ${id}`);
    profileUse.set(profileId, (profileUse.get(profileId) ?? 0) + 1);
  }
  if (profileUse.size < 8) fail("hobby activity profile diversity regressed");
  console.log(`Hobby activity facet audit PASS: ${hobbies.length} hobbies, ${profileUse.size} reusable profiles, ${DIMENSIONS.length} constraint dimensions`);
}

main().catch((error) => {
  console.error(`Hobby activity facet audit failed: ${error.message}`);
  process.exit(1);
});
