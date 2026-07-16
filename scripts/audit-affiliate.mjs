// C3 Wave 0 gate: affiliate foundation must keep YMYL categories blocked,
// data sharing at none, disclosure adjacent, and click payloads minimal.
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const contract = JSON.parse(await readFile(new URL("config/affiliate-v1.contract.json", root), "utf8"));
const source = await readFile(new URL("src/monetization/affiliate.ts", root), "utf8");
const component = await readFile(new URL("src/components/shared/AffiliateDisclosure.tsx", root), "utf8");
const errors = [];

if (contract.schema !== "oiyo.affiliate-contract" || contract.schemaVersion !== 1) errors.push("contract schema/version mismatch");
if (JSON.stringify(contract.pilot?.allowedCategories) !== JSON.stringify(["books-courses", "hobby-tools"])) errors.push("pilot categories drifted");
if (!contract.pilot?.blockedCategories?.includes("tax-legal-leads") || !contract.pilot?.blockedCategories?.includes("finance-products") || !contract.pilot?.blockedCategories?.includes("health-services")) errors.push("YMYL categories must stay blocked");
if (contract.dueDiligence?.dataSharedWithPartner !== "none") errors.push("data sharing contract mismatch");
if (contract.disclosure?.placement !== "adjacent-to-link" || contract.disclosure?.linkRel !== "sponsored nofollow") errors.push("disclosure contract mismatch");
if (contract.disclosure?.locales?.length !== 6) errors.push("disclosure must cover 6 locales");
if (!Array.isArray(contract.humanGates) || contract.humanGates.length < 3) errors.push("human gates missing");

for (const token of [
  "isPartnerLive",
  "approved-by-human",
  "dataSharedWithPartner",
  "adjacent-to-link",
  "CLICK_EVENT_FORBIDDEN_KEYS",
  "AFFILIATE_DISCLOSURE_COPY",
  "sponsored nofollow",
]) {
  if (!source.includes(token)) errors.push(`implementation token missing: ${token}`);
}
if (/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage/.test(source)) errors.push("contracts module must not use network or storage");
if (!component.includes("AFFILIATE_DISCLOSURE_COPY") || !component.includes('role="note"')) errors.push("disclosure component must render canonical copy as a note");

// The component must stay unwired until the human gate opens.
const wiring = spawnSync("grep", ["-rl", "AffiliateDisclosure", "src/pages", "src/layouts"], {
  cwd: fileURLToPath(root),
  encoding: "utf8",
});
if (wiring.status === 0 && wiring.stdout.trim()) errors.push(`AffiliateDisclosure is wired into routes before the human gate:\n${wiring.stdout}`);

// Behavioral gate: the named vitest suite must actually pass in this process.
const vitest = fileURLToPath(new URL("node_modules/vitest/vitest.mjs", root));
const run = spawnSync(process.execPath, [vitest, "run", "src/monetization/affiliate.test.ts"], {
  cwd: fileURLToPath(root),
  encoding: "utf8",
});
if (run.status !== 0) errors.push(`vitest suite failed:\n${(run.stdout || "") + (run.stderr || "")}`);

if (errors.length) {
  console.error("affiliate audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log("affiliate audit: PASS (contract + gates + vitest)");
