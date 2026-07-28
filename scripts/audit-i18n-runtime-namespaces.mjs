import { readFile, readdir } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = resolve(ROOT, "src");
const REGISTRY = resolve(SRC, "lib/i18n/registry.ts");
const CONTRACT = resolve(ROOT, "config/i18n-runtime-namespace-audit-v1.json");
const RUNTIME_EXTENSION = /\.(?:astro|[cm]?[jt]sx?)$/;
const EXCLUDED_PREFIXES = ["i18n", "types", "lib/i18n"];

async function runtimeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    const fromSrc = relative(SRC, path).split(sep).join("/");
    if (entry.isDirectory()) {
      if (!EXCLUDED_PREFIXES.some((prefix) => fromSrc === prefix || fromSrc.startsWith(`${prefix}/`))) files.push(...await runtimeFiles(path));
    } else if (RUNTIME_EXTENSION.test(entry.name)) files.push(path);
  }
  return files;
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

const [registrySource, contract, files] = await Promise.all([
  readFile(REGISTRY, "utf8"),
  readFile(CONTRACT, "utf8").then(JSON.parse),
  runtimeFiles(SRC),
]);
const namespaces = [...registrySource.matchAll(/^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9_-]*)): \(locale:/gm)].map((match) => match[1] ?? match[2]).sort();
const runtimeSource = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
const unwired = namespaces.filter((namespace) => !new RegExp(`\\b${escapeRegex(namespace)}\\b`).test(runtimeSource)).sort();
const expected = [...contract.knownUnwiredNamespaces].sort();
const equal = JSON.stringify(unwired) === JSON.stringify(expected);

if (contract.schema !== "oiyo.i18n-runtime-namespace-audit" || contract.schemaVersion !== 1 || !Array.isArray(contract.knownUnwiredNamespaces)) throw new Error("i18n runtime namespace audit contract envelope is invalid");
if (!equal) {
  const missing = expected.filter((namespace) => !unwired.includes(namespace));
  const unexpected = unwired.filter((namespace) => !expected.includes(namespace));
  throw new Error(`i18n runtime namespace audit drift: newly unwired=[${unexpected.join(", ") || "none"}], now wired=[${missing.join(", ") || "none"}]`);
}
console.log(`I18n runtime namespace audit PASS: ${namespaces.length} registry namespaces, ${files.length} runtime files, ${unwired.length} explicitly review-required unwired namespaces; no automatic routes created.`);
